'use strict';
import {inject, observer} from "mobx-react";
import React, {Component, Fragment} from "react";
import {
	Dimensions,
	Image,
	ImageBackground,
	Keyboard,
	StatusBar,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from "react-native";
import {strings} from "../../../locales";
import SafeView from "../../components/SafeView";
import Button from "../../components/Button";
import URLS from "../../value/URLS";
import Req from "../../global/req";
import Util from "../../global/Util";
import CustomStorage from "../../global/CustomStorage";
import TextEx from "../../components/TextEx";
import BaseComponents from "../../BaseComponents";
let {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
export default class HasRegPage extends BaseComponents {


	constructor(props) {
		super(props);
		this.store = props.store;
		this.global = props.global;
		this.navigation = props.navigation;

		let phonecode = this.navigation.getParam('phonecode');
		let {country_no, phone_no} = Util.fixNumber(phonecode);
		this.country_no = country_no;
		this.phone_no = phone_no;
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	async sendSMS() {
		let lastsendmessage = await CustomStorage.getItem('lastsendmessage');
		if (lastsendmessage) {
			let lastDate = new Date(0);
			try {
				lastDate = new Date(parseFloat(lastsendmessage));
			} catch (e) {
			} finally {

				let currentDate = new Date();
				let total = parseInt((currentDate.getTime() - lastDate.getTime()) / 1000, 10);
				if (total >= 60) {
					await this.postCode()
				} else {
					this.global.presentMessage(strings('login.send_sms_to_fast')+' ' + (60-total)+'s');
					return ;
				}
			}

		} else {
			await this.postCode()
		}
		let country_no = this.country_no.replace('+', '');
		this.navigation.push('CheckSMSCode', {phonecode: country_no + ' ' + this.phone_no, isLogin: true})
	}

	async postCode() {
		this.global.showLoading();
		let country_no = this.country_no.replace('+', '');
		let URL = URLS.GET_Login_VERIFY;
		await Req.post(URL, {country_no: country_no, phone_no: this.phone_no});
		this.global.dismissLoading();
		let currentDate = new Date().getTime().toString();
		await CustomStorage.setItem('lastsendmessage', currentDate);
	}

	render() {

		return (
			<Fragment>
				<ImageBackground
					resizeMode={'cover'}
					overlayColor={'white'}
					source={require('../../assets/newimg/png/bg/bglogin/bg_login_input_img.png')}
					style={{width: width, height: height, backgroundColor: 'transparent'}}>
					<StatusBar barStyle="dark-content"/>
					<SafeView>
						<TouchableOpacity activeOpacity={1}
										  style={{flex: 1}}
										  onPress={() => {
											  Keyboard.dismiss()
										  }}>
							<Fragment>
								<Image
									style={{width: 87, height: 93, marginTop: 70, alignSelf: 'center'}}
									source={require('../../assets/newimg/png/login/logo.png')}
								/>
								<View style={{justifyContent: 'center', alignSelf: 'center'}}>
									<View style={{
										height: 10, backgroundColor: "#FFE998",
										position: 'absolute', bottom: 0, width: 50, alignSelf: 'center'
									}}/>
									<TextEx style={{
										fontSize: 24,
										color: '#4A90E2',
										alignSelf: 'center',
										marginTop: 20,
										lineHeight: 33,
										fontWeight: '600'
									}}>
										{strings('HasRegPage.title')}
									</TextEx>
								</View>
								<Text style={{fontSize: 14,lineHeight: 20,
									color: '#666', alignSelf: 'center', marginTop: 43}}>
									+{this.country_no} {this.phone_no}
								</Text>
								<Text style={{
									fontSize: 14, color: '#666',
									alignSelf: 'center', marginTop: 29,
									marginHorizontal: 48, textAlign: 'center', lineHeight: 20
								}}>
									{strings('HasRegPage.detail')}
								</Text>
								<Button style={[styles.upBtn, {marginTop: 56}]} onPress={() => {
									this.sendSMS()
								}}>
									<Text style={{
										color: '#4A90E2',
										fontSize: 16,
										flex: 1,
										alignSelf: 'center',
										lineHeight: 44
									}}>
										{strings('HasRegPage.going_login')}
									</Text>
								</Button>
								<Button style={styles.upBtn} onPress={() => {
									this.navigation.pop()
								}}>
									<Text style={{
										color: '#4A90E2',
										fontSize: 16,
										flex: 1,
										alignSelf: 'center',
										lineHeight: 44
									}}>
										{strings('HasRegPage.change_phone')}
									</Text>
								</Button>

							</Fragment>
						</TouchableOpacity>
					</SafeView>
				</ImageBackground>
			</Fragment>
		)
	}
}

const styles = StyleSheet.create({
	errorMessage: {
		fontSize: 12,
		color: '#E44343',
		minHeight: 17,
		alignSelf: 'center',
		marginTop: 8,
	},
	upBtn: {
		backgroundColor: '#FFF',
		borderRadius: 24,
		marginHorizontal: 28,
		height: 44,
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: '#4A90E2',
		marginBottom: 20,
	},
});
