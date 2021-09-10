'use strict';
import React, {Fragment, Component} from 'react';
import {
	StyleSheet,
	StatusBar,
	Dimensions,
	Image, ScrollView, View,
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
import Icon from "../../../../value/Svg";
import BaseComponents from "../../../../BaseComponents";
import Req from "../../../../global/req";
import URLS from "../../../../value/URLS";
import CustomStorage from "../../../../global/CustomStorage";
import Switch from 'react-native-switch-pro'
import AppStore from "../../../../mobx/AppStore";
import Global from "../../../../mobx/Global";

const {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
export default class BanPhonePage extends BaseComponents {

	@observable
	banAll = false;
	@observable
	banSome = false;
	@observable
	allowMessage = false;
	@observable
	banNotInLocal = false;
	@observable
	banNoName = false;

	@observable
	loadingFinish = false;

	@observable
	blackListData = [];
	@observable
	whiteListData = [];

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

		let res = await Req.post(URLS.FILTER_CONFIG, {});
		this.banAll = res.data.mainSwitch == 1;
		this.banSome = res.data.strangerSwitch == 1;
		this.banNotInLocal = res.data.maillistSwitch == 1;
		this.banNoName = res.data.anonymousSwitch == 1;

		let blackTemp = res.data.black;
		let whiteTemp = res.data.white;

		let result = new Map();
		for (let item of blackTemp) {
			let contract = this.store.finListAllContent4({
				country_no: item.country_no,
				phone_no: item.phone_no
			});
			result.set(contract.id, contract);
		}
		this.blackListData = [...result.values()];

		result = new Map();
		for (let item of whiteTemp) {
			let contract = this.store.finListAllContent4({
				country_no: item.country_no,
				phone_no: item.phone_no
			});
			result.set(contract.id, contract);
		}
		this.whiteListData = [...result.values()];

		setTimeout(() => {
			this.loadingFinish = true;
		}, 200)

	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	async ChangeSwitch(need) {
		this.global.showLoading();

		if (need) {
			if (this.banNotInLocal || this.banNoName) {
				this.banSome = true;
			}
		}
		if (!this.banSome) {
			this.banNotInLocal = false;
			this.banNoName = false;
		}

		await Req.post(URLS.SWITCH_FILTER, {
			mainSwitch: this.banAll ? "1" : "0",                           		 	//过滤所有电话与短信总开关     1：开启 0：默认关闭
			strangerSwitch: this.banSome ? "1" : "0",                         		//过滤以下号码的总开关         1：开启 0：默认关闭
			maillistSwitch: this.banNotInLocal ? "1" : "0",                        	//过滤通讯录开关               1：开启 0：默认关闭
			anonymousSwitch: this.banNoName ? "1" : "0",                        		//过滤匿名电话开关             1：开启 0：默认关闭
		});
		this.global.dismissLoading();
	}

	render() {

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={'过滤电话与短信'}
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
					{
						this.loadingFinish ? (
							<ScrollView>

								{/*拦截所有电话与短信*/}
								<View style={[AppStyle.row, styles.rowline]}>
									<Icon icon={'personal_icon_blockall'} size={40} color={'#4A90E2'}
										  style={{marginRight: 12}}/>
									<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
										拦截所有电话与短信
									</TextEx>
									<TextEx style={[styles.rowDetail, {fontSize: 14}]}>
									</TextEx>
									<Switch value={this.banAll}
											width={50}
											height={27}
											backgroundInactive={'#DDD'}
											backgroundActive={'#4A90E2'}
											onSyncPress={(value) => {
												this.banAll = value;
												this.ChangeSwitch();
											}}/>
								</View>
								<Line style={{marginLeft: 68}}/>

								{/*白名单*/}
								<Button style={[AppStyle.row, styles.rowline]} onPress={() => {
									this.navigation.push("WhiteListPage")
								}}>
									<View style={{marginRight: 12, width: 40, height: 40}}/>
									<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
										白名单
									</TextEx>
									<TextEx style={[styles.rowDetail, {fontSize: 14}]}>
										({this.whiteListData.length})
									</TextEx>
									<Image style={{width: 24, height: 42}}
										   resizeMode={'contain'}
										   source={require('../../../../assets/newimg/png/icon/common/common_icon_rightin.png')}/>
								</Button>
								<Line style={{marginLeft: 68}}/>

								{/*拦截以下电话号码的电话与短信*/}
								<View style={[AppStyle.row, styles.rowline]}>
									<Icon icon={'personal_icon_blockpart'} size={40} color={'#4A90E2'}
										  style={{marginRight: 12}}/>
									<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
										拦截以下电话号码的电话与短信
									</TextEx>
									<Switch value={this.banSome}
											width={50}
											height={27}
											backgroundInactive={'#DDD'}
											backgroundActive={'#4A90E2'}
											onSyncPress={(value) => {
												this.banSome = value;
												this.ChangeSwitch();
											}}/>
								</View>
								<Line style={{marginLeft: 68}}/>

								{/*匿名电话号码*/}
								<Button style={[AppStyle.row, styles.rowline]} onPress={() => {
									this.banNoName = !this.banNoName;
									this.ChangeSwitch(true);
								}}>
									<View style={{marginRight: 12, width: 40, height: 40}}/>
									{
										this.banNoName ?
											<Icon icon={'call_icon_chose24_select'} size={25} color={'#4A90E2'}/> :
											<Icon icon={'call_icon_chose24_normal'} size={25} color={'#4A90E2'}/>
									}
									<TextEx style={[{flex: 1, lineHeight: 24, marginLeft: 16}, styles.rowTitle]}>
										匿名电话号码
									</TextEx>
								</Button>
								<Line style={{marginLeft: 68}}/>

								{/*不在通讯录中的电话号码*/}
								<Button style={[AppStyle.row, styles.rowline]} onPress={() => {
									this.banNotInLocal = !this.banNotInLocal;
									this.ChangeSwitch(true);
								}}>
									<View style={{marginRight: 12, width: 40, height: 40}}/>
									{
										this.banNotInLocal ?
											<Icon icon={'call_icon_chose24_select'} size={25} color={'#4A90E2'}/> :
											<Icon icon={'call_icon_chose24_normal'} size={25} color={'#4A90E2'}/>
									}
									<TextEx style={[{flex: 1, lineHeight: 24, marginLeft: 16}, styles.rowTitle]}>
										不在通讯录中的电话号码
									</TextEx>
								</Button>
								<Line style={{marginLeft: 68}}/>

								{/*黑名单*/}
								<Button style={[AppStyle.row, styles.rowline]} onPress={() => {
									this.navigation.push("BlackListPage")
								}}>
									<View style={{marginRight: 12, width: 40, height: 40}}/>
									<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
										黑名单
									</TextEx>
									<TextEx style={[styles.rowDetail, {fontSize: 14}]}>
										({this.blackListData.length})
									</TextEx>
									<Image style={{width: 24, height: 42}}
										   resizeMode={'contain'}
										   source={require('../../../../assets/newimg/png/icon/common/common_icon_rightin.png')}/>
								</Button>
								<Line style={{marginLeft: 68}}/>

								{/*/!*允许接受短信*!/*/}
								{/*<Button style={[AppStyle.row, styles.rowline]}>*/}
								{/*	<Icon icon={'personal_icon_receivesms'} size={40} color={'#4A90E2'}*/}
								{/*		  style={{marginRight: 12}}/>*/}
								{/*	<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>*/}
								{/*		允许接受短信*/}
								{/*	</TextEx>*/}
								{/*	<Switch value={this.allowMessage}*/}
								{/*			width={50}*/}
								{/*			height={27}*/}
								{/*			backgroundInactive={'#DDD'}*/}
								{/*			backgroundActive={'#4A90E2'}*/}
								{/*			onSyncPress={(value) => {}}/>*/}
								{/*</Button>*/}
								{/*<Line style={{marginLeft: 68}}/>*/}


							</ScrollView>
						) : null
					}
				</SafeView>

			</Fragment>
		)
	}
}

const styles = StyleSheet.create({
	rowline: {
		minHeight: 66,
		paddingHorizontal: 16,
		paddingVertical: 12,
		justifyContent: 'center',
		alignItems: 'center'
	},
	rowTitle: {
		fontSize: 16,
		color: '#333',
		lineHeight: 22
	},
	rowDetail: {
		fontSize: 12,
		color: '#999',
		lineHeight: 20
	}
});
