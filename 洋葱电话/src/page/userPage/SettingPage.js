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
	ImageBackground, SectionList, FlatList
} from 'react-native';
import {strings} from "../../../locales";
import {inject, observer} from "mobx-react";


import AppStyle, {font} from '../../Style';
import NavBar from "../../components/NavBar";
import Line from "../../components/Line";
import URLS from "../../value/URLS";
import Req from "../../global/req";
import Util from "../../global/Util";
import Button from "../../components/Button";
import {observable, toJS} from "mobx";
import SafeView from "../../components/SafeView";
import TextEx from "../../components/TextEx";
import Icon from "../../value/Svg";
import BaseComponents from "../../BaseComponents";
import AutoSave from "../../TModal/AutoSave";
import MessageService from "../../service/MessageService";

var {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
export default class SettingPage extends BaseComponents {

	@AutoSave
	messageService: MessageService;

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	render() {

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={strings('SettingPage.title')}
							bottom_line={true}
							leftRender={(
								<Button style={{paddingLeft: 6, paddingRight: 12}} onPress={() => this.navigation.pop()}>
									<Image
										style={{width: 22, height: 22}}
										source={require('../../assets/img/util/ic_back_black.png')}
									/>
								</Button>
							)}
					/>
					<ScrollView>

						{/*账户和安全*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]}
								onPress={()=>this.navigation.push('AccountAndSafePage')}>
							<Icon icon={'personal_icon_account_security'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('SettingPage.accountAndSafe')}
							</TextEx>
						</Button>
						<Line style={{marginLeft: 68}}/>

						{/*通话*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]}
								onPress={() => this.navigation.push('PhoneSettingPage')}>
							<Icon icon={'personal_icon_conversation'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('SettingPage.callPhone')}
							</TextEx>

						</Button>
						<Line style={{marginLeft: 68}}/>

						{/*通知和提示音*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]} onPress={()=>{
							this.navigation.push('VoiceAndNotificationPage')
						}}>
							<Icon icon={'personal_icon_notice'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('SettingPage.voice')}
							</TextEx>
						</Button>
						<Line style={{marginLeft: 68}}/>

						{/*外观*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]}>
							<Icon icon={'personal_icon_appearance'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('SettingPage.soll')}
							</TextEx>
						</Button>
						<Line style={{marginLeft: 68}}/>

						{/*联系人*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]} onPress={()=>{
							this.navigation.push('ContractSettingPage')
						}}>
							<Icon icon={'personal_icon_contact'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('SettingPage.account')}
							</TextEx>

						</Button>
						<Line style={{marginLeft: 68}}/>

						{/*语言*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]} onPress={() => {
							this.navigation.push('LaunagePage')
						}}>
							<Icon icon={'personal_icon_language'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('SettingPage.launage')}
							</TextEx>
						</Button>
						<Line style={{marginLeft: 68}}/>

						{/*/!*广告设置*!/*/}
						{/*<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]} onPress={() => {*/}
						{/*	this.global.developing()*/}
						{/*}}>*/}
						{/*	<Icon icon={'personal_icon_ad'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>*/}
						{/*	<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>*/}
						{/*		{strings('SettingPage.ads')}*/}
						{/*	</TextEx>*/}
						{/*</Button>*/}
						{/*<Line style={{marginLeft: 68}}/>*/}

						{/*清除缓存*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]} onPress={async () => {
							// this.global.developing()
							this.global.showLoading();
							await this.messageService.deleteAllMessage();
							this.global.dismissLoading();
							this.global.presentMessage("清理成功");
						}}>
							<Icon icon={'personal_icon_clear'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('SettingPage.cache')}
							</TextEx>
						</Button>


					</ScrollView>
				</SafeView>

			</Fragment>
		)
	}
}

const styles = StyleSheet.create({
	logoRow: {
		paddingHorizontal: 12,
		paddingVertical: 18,
	},
	name: {
		fontSize: 17,
		color: "#333",
		lineHeight: 24,
		fontWeight: '500',
	},
	phone: {
		fontSize: 14,
		color: "#666"
	},
	blueR: {
		backgroundColor: "#7ED321",
		width: 10,
		height: 10,
		borderRadius: 5,
	},
	line: {
		padding: 12,
	},
	rowline: {
		minHeight: 66,
		paddingHorizontal: 16,
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
