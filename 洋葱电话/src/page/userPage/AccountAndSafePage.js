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

var {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
export default class AccountAndSafePage extends BaseComponents {

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
					<NavBar title={strings('AccountAndSafePage.title')}
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

						{/*绑定邮箱地址*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]} onPress={()=>{
							this.navigation.push('EmailPage')
						}}>
							<Icon icon={'personal_icon_bind_mail'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('AccountAndSafePage.bind_email')}
							</TextEx>
						</Button>
						<Line style={{marginLeft: 68}}/>

						{/*登录密码管理*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]}
								onPress={() => this.navigation.push('NewPasswordPage')}>
							<Icon icon={'personal_icon_password'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<View style={{flex: 1}}>
								<TextEx style={styles.rowTitle}>{strings('AccountAndSafePage.login_password_manage')}</TextEx>
								<TextEx style={styles.rowDetail}>{strings('AccountAndSafePage.login_password_manage_detil')}</TextEx>
							</View>

						</Button>
						<Line style={{marginLeft: 68}}/>

						{/*应用密码锁*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]}
								onPress={()=>this.navigation.push('PasswordLockPage')}>
							<Icon icon={'personal_icon_password_app'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<View style={{flex: 1}}>
								<TextEx style={styles.rowTitle}>{strings('AccountAndSafePage.password_lock')}</TextEx>
								<TextEx style={styles.rowDetail}>{strings('AccountAndSafePage.password_lock_detail')}</TextEx>
							</View>
						</Button>
						<Line style={{marginLeft: 68}}/>

						{/*隐身保护*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]}
								onPress={()=>this.navigation.push('PrivacyPage')}>
							<Icon icon={'personal_icon_secret'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('AccountAndSafePage.hide_modal')}
							</TextEx>
						</Button>
						<Line style={{marginLeft: 68}}/>

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
