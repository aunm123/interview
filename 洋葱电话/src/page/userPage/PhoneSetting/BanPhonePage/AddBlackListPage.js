'use strict';
import React, {Fragment, Component} from 'react';
import {
	StyleSheet,
	StatusBar,
	Dimensions,
	Image, ScrollView, View, FlatList, TouchableOpacity, TextInput,
} from 'react-native';

import {inject, observer} from "mobx-react";
import SafeView from "../../../../components/SafeView";
import NavBar from "../../../../components/NavBar";
import Button from "../../../../components/Button";
import TextEx from "../../../../components/TextEx";
import AppStyle from "../../../../Style";
import {strings} from "../../../../../locales";
import Line from "../../../../components/Line";
import {observable, toJS} from "mobx";
import BaseComponents from "../../../../BaseComponents";
import Util from "../../../../global/Util";
import Global from "../../../../mobx/Global";
import AppStore from "../../../../mobx/AppStore";
import Req from "../../../../global/req";
import URLS from "../../../../value/URLS";
import AutoSave from "../../../../TModal/AutoSave";
import ConfigService from "../../../../service/ConfigService";

const {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
export default class AddBlackListPage extends BaseComponents {

	@observable
	dataList = [];
	@observable
	searchText = '';

	@AutoSave
	configService: ConfigService;

	global: Global;
	store: AppStore;

	@observable
	blackList = [];

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;
		this.store = props.store;

		this.isAll = true;
		this.blackList = this.navigation.getParam('blackList');

		this.search();
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	search() {
		// if (this.searchText.length == 0) {
		// 	this.dataList = [];
		// 	return ;
		// }
		let dataList = [];
		if (this.isAll) {
			dataList = this.store.finListAllContentPhoneWithOutunKonows(this.searchText);
		} else {
			dataList = this.store.finListContentPhone(this.searchText);
		}

		let result = [];
		for (let item of dataList) {
			let phone_no = item.country_no + " " + item.phone_no;
			let needAdd = true;
			for (let jtem of this.blackList) {
				let temp_phone_no = jtem.country_no + " " + jtem.phone_no;
				if (phone_no == temp_phone_no) {
					needAdd = false;
					break;
				}
			}
			if (needAdd) {
				result.push(item);
			}
		}
		this.dataList = [...result];
	}

	async addBlackList(item) {

		let contract = this.store.finListAllContent4({country_no: item.country_no, phone_no: item.phone_no});
		this.global.showLoading();
		try {
			await this.configService.insertOrSaveConfig(contract, null, 1);
			let res = await Req.post(URLS.FILTER_CONFIG, {});
			this.blackList = res.data.black;

			this.search();
			this.global.dismissLoading();
		} catch (e) {
			this.global.dismissLoading();
		}
	}

	renderNoContent = () => {
		return (
			<Fragment>
				<View style={{alignItems: 'center'}}>
					<Image style={{width: 200, height: 200, marginTop: 26}}
						   resizeMode={'contain'}
						   source={require('../../../../assets/newimg/png/empty_img.png')}/>
					<TextEx style={{fontSize: 14, color: "#999", lineHeight: 20}}>
						{strings('SearchPage.no_contract')}
					</TextEx>
				</View>
			</Fragment>
		)
	};

	_renderHeader() {
		return (
			<Fragment>
				<TextEx style={{
					fontSize: 12, color: '#999', lineHeight: 29, paddingLeft: 16,
					backgroundColor: '#F5F5F5'
				}}>
					{strings('connect_tab.title')}
				</TextEx>
			</Fragment>
		)
	}

	_renderItem(item, index) {
		// type
		// 0 网络通讯录
		// 1 本地通讯录
		// 2 未知电话

		let icon = Util.logoFix(item.name, item.contractType);
		let from = null;
		if (item.contractType === 1) {
			from = (<TextEx style={[styles.row_title, {color: '#999', fontSize: 13,}]}>来自通讯录</TextEx>);
		}

		return (
			<View style={styles.row}>
				<View style={{flexDirection: "row", alignItems: "center", minHeight: 74,}}>
					{icon}
					<View style={{flex: 1}}>
						<TextEx style={styles.row_title}>{item.name}</TextEx>
						{from}
					</View>
					<TextEx>+{item.country_no} {item.phone_no}</TextEx>
					<Button activeOpacity={0.6} style={{
						width: 64, height: 32, justifyContent: 'center', alignItems: 'center',
						borderRadius: 16, borderWidth: 1, borderColor: "#4A90E2", marginLeft: 8
					}} onPress={() => {
						this.addBlackList(item)
					}}>
						<TextEx style={{color: "#4A90E2"}}>添加</TextEx>
					</Button>
				</View>
			</View>
		);
	}

	render() {

		let dataList = [...this.dataList];

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={'添加黑名单'}
							bottom_line={true}
							leftRender={(
								<Button style={{paddingLeft: 6, paddingRight: 12}}
										onPress={() => this.navigation.pop()}>
									<Image
										style={{width: 22, height: 22}}
										source={require('../../../../assets/img/util/ic_back_black.png')}
									/>
								</Button>
							)}
					/>
					<View>
						<TextEx style={{fontSize: 16, color: "#333", padding: 16}}>
							请输入电话号码或联系人名
						</TextEx>
						<View style={{height: 36, marginBottom: 12}}>
							<TextInput style={styles.searchRow_input}
									   value={this.searchText}
									   ref={(input) => {
										   this.input = input
									   }}
									   onChangeText={(text) => {
										   this.searchText = text;
										   console.log(this.searchText);
										   this.search();
									   }}
									   onSubmitEditing={() => {
										   this.input.blur();
										   this.search();
									   }}
									   clearButtonMode='always'
									   placeholder={strings("connect_tab.search_placeholder")}>
							</TextInput>
							<Image
								style={{width: 24, height: 24, position: "absolute", left: 25, top: 5}}
								source={require('../../../../assets/newimg/png/icon/common/common_icon_search.png')}
							/>
						</View>
					</View>
					<FlatList
						ref={'flatlist'}
						style={{backgroundColor: 'white', height: '100%'}}
						keyboardDismissMode={'on-drag'}
						renderItem={({item, index}) => this._renderItem(item, index)}
						data={dataList}
						keyExtractor={(item, index) => item + index}
						stickySectionHeadersEnabled={false}
						ItemSeparatorComponent={() =>
							<Line style={{marginLeft: 60, marginRight: 12}}/>
						}
						ListEmptyComponent={() => this.renderNoContent()}
						ListHeaderComponent={() => this._renderHeader()}
					/>
				</SafeView>

			</Fragment>
		)
	}
}

const styles = StyleSheet.create({
	contentContainer: {
		paddingBottom: 48
	},
	section: {
		height: 28,
		backgroundColor: "#F5F5F5",
	},
	section_title: {
		lineHeight: 28,
		fontSize: 12,
		color: "#999999",
		marginHorizontal: 12,
	},
	row: {
		backgroundColor: "#fff",
		paddingHorizontal: 10,
	},
	row_title: {
		fontSize: 16,
		marginLeft: 10,
		lineHeight: 23,
	},
	flex_Left: {
		position: "absolute",
		right: 0,
		top: 0,
		bottom: 48,
		width: 30,
		justifyContent: "center",
		alignItems: "center",
	},
	searchRow: {
		height: 48,
		flexDirection: "row",
		paddingVertical: 6,
		width: width,
	},
	searchRow_input: {
		height: 36,
		flex: 1,
		paddingLeft: 40,
		fontSize: 14,
		backgroundColor: '#F5F5F5',
		marginHorizontal: 16,
		borderRadius: 18,
	},
	searchBtn: {
		width: 48,
		height: 48,
		justifyContent: "center",
		alignItems: "center",
	}

});
