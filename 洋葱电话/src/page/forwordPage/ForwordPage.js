'use strict';
import React, {Fragment, Component} from 'react';
import {
	Text, View,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	Animated,
	Dimensions,
	Image, ScrollView, Alert,
	ImageBackground, SectionList, FlatList, TextInput
} from 'react-native';
import {strings} from "../../../locales";
import {inject, observer} from "mobx-react";


import AppStyle, {font} from '../../Style';
import NavBar from "../../components/NavBar";
import Button from "../../components/Button";
import SafeView from "../../components/SafeView";
import TextEx from "../../components/TextEx";
import BaseComponents from "../../BaseComponents";
import TextExTitle from "../../components/TextExTitle";
import Line from "../../components/Line";
import Util from "../../global/Util";
import AppStore from "../../mobx/AppStore";
import Global from "../../mobx/Global";
import {observable, toJS} from "mobx";
import Icon from "../../value/Svg";
import {ForwordRow} from "../../components/forwordRow/ForwordRow";

var {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
export default class ForwordPage extends BaseComponents {

	store: AppStore;
	global: Global;

	@observable
	searchText = '';

	@observable
	datasource = [];
	@observable
	selectCount = 0;

	selectList = new Map();

	constructor(props) {
		super(props);

		this.global = props.global;
		this.store = props.store;
		this.navigation = props.navigation;

		this.isAll = true;
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	componentDidMount(): void {
		this.search();
	}

	search() {
		let dataList = [];
		if (this.isAll) {
			dataList = this.store.finListAllContentPhone(this.searchText);
		} else {
			dataList = this.store.finListContentPhone(this.searchText)
		}
		this.datasource = [...dataList]
	}

	_renderHeader() {
		if (this.datasource.length == 0) return null;
		return (
			<TextEx style={{
				fontSize: 12, color: '#999', lineHeight: 29, paddingLeft: 16,
				backgroundColor: '#F5F5F5'
			}}>
				{strings('connect_tab.title')}
			</TextEx>
		)
	}

	renderNoContent = () => {
		if (this.datasource.length == 0) {
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
							   source={require('../../assets/newimg/png/empty_img.png')}/>
						<TextEx style={{fontSize: 14, color: "#999", lineHeight: 20}}>
							{strings('SearchPage.no_contract')}
						</TextEx>
					</View>
				</Fragment>
			)
		}
	};

	// 分组列表的renderItem
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
		let key = item.country_no + " " + item.phone_no;
		let hasSelect = this.selectList.has(key);

		return (
			<ForwordRow data={item}
						hasSelect={hasSelect}
						from={from}
						icon={icon}
						key={key}
						onPress={(rowSelect)=>{
							try {
								this.input.blur();
								if (rowSelect) {
									// 选中
									this.selectList.set(key, item);
									this.selectCount++;
								} else {
									// 取消选中
									this.selectList.delete(key);
									this.selectCount--;
								}
							} catch (e) {}
						}}/>
		);
	}

	render() {

		let dataList = [...this.datasource];

		let sendEnable = this.selectCount<=0;

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={"转发"}
							bottom_line={true}
							leftRender={(
								<Button style={{paddingLeft: 6, paddingRight: 12}}
										onPress={() => this.navigation.pop()}>
									<TextExTitle style={{fontSize: 16, color: '#4A90E2'}}>取消</TextExTitle>
								</Button>
							)}
							rightRender={(
								<Button style={{paddingRight: 6}} disabled={sendEnable} onPress={() => {
									try {
										let callback = this.navigation.getParam('callback');
										let tempArray = [...this.selectList.values()];
										callback(tempArray);
										this.navigation.pop();
									}catch (e) {}
								}}>
									<TextExTitle style={{fontSize: 16, color: '#4A90E2'}}>发送</TextExTitle>
								</Button>
							)}
					/>
					<View style={{flex: 1}}>
						<View style={[styles.searchRow]}>
							<View style={{flex: 1}}>
								<TextInput style={styles.searchRow_input}
										   value={this.searchText}
										   ref={(input) => {
											   this.input = input
										   }}
										   onChangeText={(text) => {
											   this.searchText = text;
											   this.search();
										   }}
										   onSubmitEditing={() => {
											   this.input.blur();
											   this.search();
										   }}
										   clearButtonMode={'always'}
										   autoCapitalize={'none'}
										   autoCompleteType={'off'}
										   placeholder={strings("connect_tab.search_placeholder")}>
								</TextInput>
								<Image
									style={{width: 24, height: 24, position: "absolute", left: 25, top: 5}}
									source={require('../../assets/newimg/png/icon/common/common_icon_search.png')}
								/>
							</View>
							<TouchableOpacity onPress={() => this.searchText = ""}>
								<TextEx style={{
									color: '#4A90E2', fontSize: 16, lineHeight: 36,
									paddingRight: 16, fontWeight: '400'
								}}>
									{strings('other.cancel')}
								</TextEx>
							</TouchableOpacity>
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
							ListEmptyComponent={this.renderNoContent}
							ListHeaderComponent={() => this._renderHeader()}
						/>
					</View>
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
