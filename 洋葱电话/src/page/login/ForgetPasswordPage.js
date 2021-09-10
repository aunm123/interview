'use strict';
import React, {Fragment, Component} from 'react';
import {inject, observer} from "mobx-react/index";
import {
	Text, View,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	TextInput, Image,
	Animated,
	Dimensions,
	ScrollView, Easing, Platform, Keyboard, ImageBackground, KeyboardAvoidingView
} from 'react-native';
import {strings} from "../../../locales";
import Req from "../../global/req";
import URLS from "../../value/URLS";
import Button from "../../components/Button";
import {observable} from "mobx/lib/mobx";
import SafeView from "../../components/SafeView";
import Util from "../../global/Util";
import CustomStorage from "../../global/CustomStorage";
import TextEx from "../../components/TextEx";
import KeyboardView from "../../components/KeyboardView";
import AutoSave from "../../TModal/AutoSave";
import SendMSService from "../../service/SendMSService";
import BaseComponents from "../../BaseComponents";

let width = Dimensions.get('window').width;
let height = Dimensions.get('window').height;

@inject('store', 'global')
@observer
export default class ForgetPasswordPage extends BaseComponents {

	@AutoSave
	sendMSService: SendMSService;

	@observable
	timer = '60s';

	@observable
	canSendSMS = false;
	@observable
	checkPhoneCode = '';
	@observable
	password = '';
	@observable
	rePassword = '';
	@observable
	showPhoneError = "";

	timerHandle = null;

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;

		let phonecode = this.navigation.getParam('phonecode');
		let {country_no, phone_no} = Util.fixNumber(phonecode);
		this.country_no = country_no;
		this.phone_no = phone_no;

		this.isFirst = true;
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	componentDidMount() {
		this.timerSetUp()
	}

	timerSetUp() {
		if (this.timerHandle) {
			clearTimeout(this.timerHandle);
		}
		this.timerHandle = setTimeout(async () => {
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
						this.canSendSMS = true;
						this.timer = strings('CheckSMSCode.re_send');
					} else {
						this.canSendSMS = false;
						this.timer = (60 - total) + 's';
						setTimeout(() => {
							this.timerSetUp()
						}, 1000)
					}
				}

			}
		})
	}

	async postCode() {
		try {
			this.global.showLoading();
			let res = await this.sendMSService.sendSMS(URLS.FORGET_PASSWORD_CODE, {
				country_no: this.country_no,
				phone_no: this.phone_no,
			});
			this.global.dismissLoading();
			console.log(res);

			if (res != null) {
				this.timerSetUp();
			}
		}catch (e) {}
	}

	async visibleLogin() {
		try {
			this.global.showLoading();
			await Req.post(URLS.RESET_PASSWORD, {
				country_no: this.country_no,
				phone_no: this.phone_no,
				password: this.password,
				repassword: this.rePassword,
				verify_code: this.checkPhoneCode
			});
			this.global.dismissLoading();
			let phonecode = this.navigation.getParam('phonecode');
			this.navigation.push('PasswordSuccess', {phonecode: phonecode, password: this.password});
		}catch (e) {

		}
	}

	passwordIsVisible() {
		this.isFirst = false;
		if (this.password != this.rePassword) {
			this.showPhoneError = true;
		} else {
			this.showPhoneError = false;
		}
	}

	btnVisible() {
		if (this.showPhoneError== false && this.checkPhoneCode.length > 3 && !this.isFirst) {
			return true;
		} else {
			return false;
		}
	}

	render() {

		let PasswordError = this.showPhoneError ?
			(<TextEx style={styles.errorMessage}>{strings('ForgetPasswordPage.pawword_error')}</TextEx>) :
			(<TextEx style={styles.errorMessage}/>);

		let self = this;
		let btnVisible = !this.btnVisible();

		return (
			<Fragment>
				<ImageBackground
					resizeMode={'cover'}
					overlayColor={'white'}
					source={require('../../assets/newimg/png/bg/bglogin/bg_login_input_img.png')}
					style={{width: width, height: height, backgroundColor: 'transparent'}}>
					<StatusBar barStyle="dark-content"/>
					<SafeView>
						<KeyboardView style={{flexDirection: 'column', flex: 1}}>
							<ScrollView>
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
												{strings('ForgetPasswordPage.title')}
											</TextEx>
										</View>
										<Text style={{
											fontSize: 14,
											color: '#666',
											alignSelf: 'center',
											textAlign: 'center',
											marginTop: 20,
											lineHeight: 20,
										}}>
											{strings('CheckSMSCode.check_account_title1')}
											{this.country_no} {this.phone_no}
											{strings('CheckSMSCode.check_account_title2')}
										</Text>
										<View style={{
											flexDirection: 'row', marginHorizontal: 28, borderColor: '#E6E6E6',
											borderWidth: 1, borderRadius: 28, marginTop: 20
										}}>
											<View style={[styles.fk, {marginLeft: 15, flex: 1}]}>
												<TextInput style={[styles.input, {flex: 1, height: '100%'}]}
														   onChangeText={(text) => {
															   this.checkPhoneCode = text;
														   }}
														   keyboardType={'phone-pad'}
														   maxLength={20}
														   placeholder={strings('CheckSMSCode.check_account_code')}
														   value={this.checkPhoneCode}/>
												<Button  onPress={() => {
													if (!this.canSendSMS) return;
													this.postCode()
												}}>
													<Text style={{color: this.canSendSMS?'#4A90E2':'#ccc', fontSize: 14, marginHorizontal: 20}}>
														{this.canSendSMS ? strings('CheckSMSCode.re_send') : this.timer}
													</Text>
												</Button>
											</View>
										</View>
										<View style={{
											flexDirection: 'row', marginHorizontal: 28, borderColor: '#E6E6E6',
											borderWidth: 1, borderRadius: 28, marginTop: 10
										}}>
											<View style={[styles.fk, {marginLeft: 15, flex: 1}]}>
												<TextInput style={[styles.input, {flex: 1, height: '100%'}]}
														   secureTextEntry={true}
														   clearTextOnFocus={true}
														   onChangeText={(text) => {
															   self.password = text;
															   self.passwordIsVisible();
														   }}
														   maxLength={20}
														   placeholder={strings('PassWordLogin.please_input_password')}
														   value={this.password}/>
											</View>
										</View>
										<View style={{
											flexDirection: 'row', marginHorizontal: 28, borderColor: '#E6E6E6',
											borderWidth: 1, borderRadius: 28, marginTop: 10
										}}>
											<View style={[styles.fk, {marginLeft: 15, flex: 1}]}>
												<TextInput style={[styles.input, {flex: 1, height: '100%'}]}
														   secureTextEntry={true}
														   clearTextOnFocus={true}
														   onChangeText={(text) => {
															   self.rePassword = text;
															   self.passwordIsVisible();
														   }}
														   maxLength={20}
														   placeholder={strings('PassWordLogin.please_input_password_again')}
														   value={this.rePassword}/>
											</View>
										</View>
										{PasswordError}
										<View style={{flexDirection: 'row', flex: 1, marginTop: 39, marginHorizontal: 28}}>
											<Button style={styles.upBtn} onPress={() => {
												this.navigation.pop()
											}}>
												<Text style={{color: '#4A90E2', fontSize: 16}}> {strings('other.cancel')} </Text>
											</Button>
											<Button
												style={[btnVisible ? styles.downBtn : styles.downBtn_no, {flex: 1}]}
												disabled={btnVisible}
												onPress={() => {
													this.visibleLogin()
												}}>
												<Text style={{
													color: btnVisible ? '#CCC' : '#FFF',
													fontSize: 16,
													alignSelf: 'center'
												}}> {strings('CheckSMSCode.next')} </Text>
											</Button>
										</View>

									</Fragment>
								</TouchableOpacity>
							</ScrollView>
						</KeyboardView>
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
