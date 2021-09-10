'use strict';
import React, {Fragment, Component} from 'react';
import {
	StyleSheet,
	StatusBar,
	Dimensions,
	Image, ScrollView, View, FlatList, TouchableOpacity, Alert,
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
import AppStore from "../../../../mobx/AppStore";
import Global from "../../../../mobx/Global";
import Req from "../../../../global/req";
import URLS from "../../../../value/URLS";
import Icon from "../../../../value/Svg";
import {connectActionSheet} from "@expo/react-native-action-sheet";
import AutoSave from "../../../../TModal/AutoSave";
import ConfigService from "../../../../service/ConfigService";

const {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
class WhiteListPage extends BaseComponents {

	@observable
	dataList = [];
	@observable
	whiteList = [];

	@AutoSave
	configService: ConfigService;

	store: AppStore;
	global: Global;

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.store = props.store;
		this.global = props.global;
	}

	async onStart() {
		super.onStart();
		await this.init();
	}

	async init() {
		let res = await Req.post(URLS.FILTER_CONFIG, {});
		let temp = res.data.white;
		this.whiteList = temp;

		let result = new Map();
		for (let item of temp) {
			let contract = this.store.finListAllContent4({
				country_no: item.country_no,
				phone_no: item.phone_no
			});
			result.set(contract.id, contract);
		}
		this.dataList = [...result.values()];
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	async actionSheetShow(item) {

		const options = [
			"移出白名单",
			"删除联系人",
			"取消"
		];
		const cancelButtonIndex = 2;

		let blackListContent = [];
		for (let {country_no, phone_no} of item.phones) {
			blackListContent.push({country_no: country_no, phone_no: phone_no})
		}

		this.props.showActionSheetWithOptions({
				title: item.name,
				options,
				cancelButtonIndex,
			},
			buttonIndex => {
				switch (buttonIndex) {
					case 0: {
						Alert.alert('确定需要把该联系人移出白名单？', '', [{
							text: '确定', onPress: async () => {
								this.global.showLoading();
								// 移除白名单
								await Req.post(URLS.REMOVE_WHITE_LIST, {
									content: blackListContent
								});
								await this.init();
								this.global.dismissLoading();
							},
						}, {
							text: '取消', onPress: () => {
							},
						}], {cancelable: false});
						break;
					}
					case 1: {
						Alert.alert('确定需要完全删除该联系人？', '', [{
							text: '确定', onPress: async () => {
								this.global.showLoading();
								// 移除白名单
								await Req.post(URLS.REMOVE_WHITE_LIST, {
									content: blackListContent
								});
								await this.store.deleteContractAndHistory(item);
								await this.init();
								this.global.dismissLoading();
							},
						}, {
							text: '取消', onPress: () => {
							},
						}], {cancelable: false});
						break;
					}
				}
			},
		);
	}

	renderNoContent = () => {
		return (
			<Fragment>
				<TextEx style={{
					fontSize: 12, color: '#999', lineHeight: 29, paddingLeft: 16,
					backgroundColor: '#F5F5F5'
				}}>
					{strings('connect_tab.title')}
				</TextEx>
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
			<Button style={styles.row} onPress={()=>{this.actionSheetShow(item)}}>
				<View style={{flexDirection: "row", alignItems: "center", minHeight: 74,}}>
					{icon}
					<View style={{flex: 1}}>
						<TextEx style={styles.row_title}>{item.name}</TextEx>
						{from}
					</View>
					<View >
						<Image style={{width: 24, height: 40, marginRight: 10}}
							   resizeMode={'contain'}
							   source={require('../../../../assets/newimg/png/icon/personal/personal_icon_more_horiz.png')}/>
					</View>
				</View>
			</Button>
		);
	}

	render() {

		let dataList = [...this.dataList];

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={'白名单'}
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
							rightRender={(
								<Button style={{paddingRight: 6}} onPress={()=>{
									this.navigation.push("AddWhiteListPage", {whiteList: this.whiteList})
								}}>
									<TextEx style={{fontSize: 14, color: '#4A90E2'}}>
										添加
									</TextEx>
								</Button>
							)}
					/>
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
						ListEmptyComponent={this.renderNoContent}
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

export default connectActionSheet(WhiteListPage)
