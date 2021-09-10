'use strict';
import React, {Fragment, Component} from 'react';
import {
	StyleSheet,
	StatusBar,
	Dimensions,
	Image, ScrollView, View,
} from 'react-native';

import {inject, observer} from "mobx-react";
import SafeView from "../../../components/SafeView";
import NavBar from "../../../components/NavBar";
import Button from "../../../components/Button";
import TextEx from "../../../components/TextEx";
import AppStyle from "../../../Style";
import {strings} from "../../../../locales";
import Line from "../../../components/Line";
import {observable, toJS} from "mobx";
import Icon from "../../../value/Svg";
import BaseComponents from "../../../BaseComponents";
import Req from "../../../global/req";
import URLS from "../../../value/URLS";
import CustomStorage from "../../../global/CustomStorage";
import Switch from 'react-native-switch-pro'

const {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
export default class PhoneSettingPage extends BaseComponents {

	@observable
	noName = false;

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;

		CustomStorage.getItem("noName", 0)
			.then((noName) => {
				this.noName = (noName == 1)
			})

		console.log(toJS(this.global.userData));
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	async setNoName(value) {
		if (value == true) {
			await Req.post(URLS.HIDE_PHONE_NO, {anonymous: 1});
			await CustomStorage.setItem("noName", 1)
		} else {
			await Req.post(URLS.HIDE_PHONE_NO, {anonymous: 0});
			await CustomStorage.setItem("noName", 0);
		}

		if (value != this.noName) {
			this.noName = value;
		}
	}

	render() {

		let caller_coming_text = this.global.userData.caller_status == 1 && this.global.userData.caller_country_no ?
			this.global.userData.caller_country_no + " " + this.global.userData.caller_phone_no : "未开启";

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={strings('PhoneSettingPage.title')}
							bottom_line={true}
							leftRender={(
								<Button style={{paddingLeft: 6, paddingRight: 12}}
										onPress={() => this.navigation.pop()}>
									<Image
										style={{width: 22, height: 22}}
										source={require('../../../assets/img/util/ic_back_black.png')}
									/>
								</Button>
							)}
					/>
					<ScrollView>

						{/*来电显示*/}
						<Button style={[AppStyle.row, styles.rowline]} onPress={() => {
							this.navigation.push("CallComingPage")
						}}>
							<Icon icon={'personal_icon_call_show'} size={40} color={'#4A90E2'}
								  style={{marginRight: 12}}/>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('PhoneSettingPage.phoneComing')}
							</TextEx>
							<TextEx style={[styles.rowDetail, {fontSize: 14}]}>
								{caller_coming_text}
							</TextEx>
							<Image style={{width: 24, height: 42}}
								   resizeMode={'contain'}
								   source={require('../../../assets/newimg/png/icon/common/common_icon_rightin.png')}/>
						</Button>
						<Line style={{marginLeft: 68}}/>

						{/*呼叫转移*/}
						<Button style={[AppStyle.row, styles.rowline]} onPress={() => {
							this.navigation.push("PhoneListPage")
						}}>
							<Icon icon={'personal_icon_call_transfer'} size={40} color={'#4A90E2'}
								  style={{marginRight: 12}}/>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('PhoneSettingPage.phoneComingChange')}
							</TextEx>
							<TextEx style={[styles.rowDetail, {fontSize: 14}]}>
							</TextEx>
							<Image style={{width: 24, height: 42}}
								   resizeMode={'contain'}
								   source={require('../../../assets/newimg/png/icon/common/common_icon_rightin.png')}/>
						</Button>
						<Line style={{marginLeft: 68}}/>

						{/*过滤陌生电话与短信*/}
						<Button style={[AppStyle.row, styles.rowline]} onPress={() => {
							this.navigation.push("BanPhonePage")
						}}>
							<Icon icon={'personal_icon_filter'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('PhoneSettingPage.flatePhone')}
							</TextEx>
						</Button>
						<Line style={{marginLeft: 68}}/>

						{/*匿名电话*/}
						<View style={[AppStyle.row, styles.rowline]}>
							<Icon icon={'personal_icon_anonymous'} size={40} color={'#4A90E2'}
								  style={{marginRight: 12}}/>
							<View style={{flex: 1}}>
								<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
									{strings('PhoneSettingPage.noName')}
								</TextEx>
								<TextEx style={styles.rowDetail}>
									{strings('PhoneSettingPage.all_No')}
								</TextEx>
							</View>
							<Switch value={this.noName}
									width={50}
									height={27}
									backgroundInactive={'#DDD'}
									backgroundActive={'#4A90E2'}
									onSyncPress={(value) => {
										this.setNoName(value);
									}}/>
						</View>
						<Line style={{marginLeft: 68}}/>

						{/*呼叫费率*/}
						<Button style={[AppStyle.row, styles.rowline]} onPress={() => {
							this.navigation.push('PhonePricePage')
						}}>
							<Icon icon={'personal_icon_call_rate'} size={40} color={'#4A90E2'}
								  style={{marginRight: 12}}/>
							<View style={{flex: 1}}>
								<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
									{strings('PhoneSettingPage.phonePrice')}
								</TextEx>
								<TextEx style={styles.rowDetail}>
									{strings('PhoneSettingPage.phonePriceDetail')}
								</TextEx>
							</View>
						</Button>
						<Line style={{marginLeft: 68}}/>


					</ScrollView>
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
