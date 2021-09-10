'use strict';

import {inject, observer} from "mobx-react/index";
import React, {Component, Fragment} from "react";
import {
	Animated, Dimensions,
	Image, ImageBackground, Keyboard,
	StatusBar,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View
} from "react-native";
import Button from "../../components/Button";
import AppStyle from "../../Style";
import {observable} from "mobx/lib/mobx";
import {strings} from "../../../locales";
import SafeView from "../../components/SafeView";
import Kine from "../../components/Kine";
import Util from "../../global/Util";
import URLS from "../../value/URLS";
import Req from "../../global/req";
import CustomStorage from "../../global/CustomStorage";
import CountryIcon from "../../value/CountryIcon";
import TextEx from "../../components/TextEx";
import BaseComponents from "../../BaseComponents";

let {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
class CreateAccount extends BaseComponents {

	@observable
	areaCode = '';
	@observable
	country_code = '';
	@observable
	isFirst = true;
	@observable
	showPhoneError = false;
	@observable
	phoneCode = '';

	constructor(props) {
		super(props);
		this.store = props.store;
		this.global = props.global;
		this.navigation = props.navigation;

		this.areaCode = this.global.currentIp_Country;
		this.country_code = this.global.currentIp_Country_Code;
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	fitPhoneCode() {
		this.isFirst = false;
		this.showPhoneError = !Util.CheckPhone(this.areaCode, this.phoneCode);
	}

	async sendSMS() {
		let lastsendmessage = await CustomStorage.getItem('lastsendmessage');
		let res = null
		if (lastsendmessage) {

			console.log(lastsendmessage);

			let lastDate = new Date(0);
			try {
				lastDate = new Date(parseFloat(lastsendmessage));
			} catch (e) {
			} finally {

				let currentDate = new Date();
				let total = parseInt((currentDate.getTime() - lastDate.getTime()) / 1000, 10);
				if (total >= 60) {
					res = await this.postCode()
				} else {
					this.global.presentMessage(strings('login.send_sms_to_fast') + ' ' + (60-total) + 's');
					return;
				}
			}

		} else {
			res = await this.postCode()
		}
		if (res.data.isexist == 1) {
			let area = this.areaCode.replace('+', '');
			await CustomStorage.removeItem('lastsendmessage');
			this.navigation.push('HasRegPage', {phonecode: area + ' ' + this.phoneCode})
		} else {
			let area = this.areaCode.replace('+', '');
			this.navigation.push('CheckSMSCode', {phonecode: area + ' ' + this.phoneCode, isLogin: false})
		}
	}

	async postCode() {
		this.global.showLoading();
		let area = this.areaCode.replace('+', '');
		let URL = URLS.GET_REG_VERIFY;
		let res = await Req.post(URL, {country_no: area, phone_no: this.phoneCode});
		this.global.dismissLoading();
		let currentDate = new Date().getTime().toString();
		await CustomStorage.setItem('lastsendmessage', currentDate);
		return res;
	}

	render() {

		let PhoneError = this.showPhoneError ?
			(<Text style={styles.errorMessage}>{strings('CreateAccount.input_phone_error')}</Text>) :
			(<Text style={styles.errorMessage}/>);


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
										{strings('CreateAccount.title')}
									</TextEx>
								</View>

								<Text style={{
									fontSize: 14, color: '#666', alignSelf: 'center',
									lineHeight: 20, marginTop: 60
								}}>
									{strings('CreateAccount.placeString')}
								</Text>
								<View style={{
									flexDirection: 'row', marginHorizontal: 28, borderColor: '#E6E6E6',
									borderWidth: 1, borderRadius: 28, marginTop: 20
								}}>
									<Button onPress={() => this.navigation.push('CountryZone', {
										callback: (item) => {
											this.areaCode = item.country_no;
											this.country_code = item.country_code;
											this.fitPhoneCode();
										}
									})}>
										<View style={[styles.fk, AppStyle.row,]}>
											<View style={[AppStyle.row, {
												flex: 1, height: 20, alignItems: 'center',
												justifyContent: 'center', paddingLeft: 10
											}]}>
												{
													this.country_code?(
														<Image
															resizeMode={'contain'}
															style={{width: 20, height: 20, marginRight: 3}}
															source={CountryIcon[this.country_code]}
														/>
													): null
												}
												<Text
													style={this.areaCode.length > 0 ? styles.input : styles.input_placeholder}>
													{this.areaCode.length > 0 ? '+' + this.areaCode : strings('CreateAccount.areaCode_title')}
												</Text>
											</View>
											<Image
												style={[styles.inputDown]}
												source={require('../../assets/newimg/png/icon/common/common_icon_unfold24.png')}
											/>
											<Kine style={{height: 16, marginLeft: 8}}/>
										</View>

									</Button>
									<View style={[styles.fk, {marginLeft: 15, flex: 1}]}>
										<TextInput style={[styles.input, {flex: 1, height: '100%'}]}
												   onChangeText={(text) => {
													   this.phoneCode = text;
													   this.fitPhoneCode();
												   }}
												   clearButtonMode={'always'}
												   keyboardType={'phone-pad'}
												   maxLength={20}
												   placeholder={strings('CreateAccount.input_phone_placeholder')}
												   value={this.phoneCode}/>
									</View>
								</View>
								{PhoneError}
								<View style={{flexDirection: 'row', flex: 1, marginTop: 39, marginHorizontal: 28}}>
									<Button style={styles.upBtn} onPress={() => {
										this.navigation.pop()
									}}>
										<Text style={{color: '#4A90E2', fontSize: 16}}> 上一步 </Text>
									</Button>
									<Button
										style={[(this.showPhoneError || this.isFirst) ? styles.downBtn : styles.downBtn_no, {flex: 1}]}
										disabled={this.showPhoneError || this.isFirst}
										onPress={() => {
											this.sendSMS().then()
										}}>
										<Text style={{
											color: (this.showPhoneError || this.isFirst) ? '#CCC' : '#FFF',
											fontSize: 16,
											alignSelf: 'center'
										}}> 下一步 </Text>
									</Button>
								</View>

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
		padding: 12,
		paddingLeft: 20,
		paddingRight: 20,
		borderRadius: 24,
		height: 44,
		borderWidth: 1,
		borderColor: '#4A90E2'
	},
	downBtn: {
		backgroundColor: '#F5F5F5',
		padding: 12,
		paddingLeft: 20,
		paddingRight: 20,
		borderRadius: 24,
		height: 44,
		marginLeft: 8,
	},
	downBtn_no: {
		backgroundColor: '#4A90E2',
		padding: 12,
		paddingLeft: 20,
		paddingRight: 20,
		borderRadius: 24,
		height: 44,
		marginLeft: 8,
	},
	fk: {
		flexDirection: 'row',
		lineHeight: 44,
		height: 44,
		alignItems: 'center',
		width: 100
	},
	input: {
		fontSize: 14,
		color: '#333',
		fontWeight: '300',
		alignSelf: 'center'
	},
	input_placeholder: {
		paddingVertical: 0,
		fontSize: 15,
		fontWeight: '300',
		color: '#b9b8bd',
		alignSelf: 'center',
		textAlign: 'center',
		flex: 1,
	},
	inputDown: {
		width: 16,
		height: 16,
	},
});
export default CreateAccount;
