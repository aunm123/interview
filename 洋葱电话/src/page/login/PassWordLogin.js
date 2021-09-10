import React, {Fragment, Component} from 'react';
import {
	ScrollView,
	StatusBar,
	Dimensions,
	Text,
	Image,
	ImageBackground,
	View,
	NativeModules,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Animated,
	Easing,
	Platform,
	PermissionsAndroid, Keyboard,
} from 'react-native';
import {strings} from "../../../locales"

let {height, width} = Dimensions.get('window');
import {inject, observer} from "mobx-react/index";
import Button from "../../components/Button";
import {observable} from "mobx/lib/mobx";
import SafeView from "../../components/SafeView";
import AppStyle from "../../Style";
import URLS from "../../value/URLS";
import Req from "../../global/req";
import TextEx from "../../components/TextEx";
import CustomStorage from "../../global/CustomStorage";
import Util from "../../global/Util";
import AutoSave from "../../TModal/AutoSave";
import SendMSService from "../../service/SendMSService";
import md5 from "md5";
import BaseComponents from "../../BaseComponents";

@inject('store', 'global')
@observer
export default class PassWordLogin extends BaseComponents {

	@AutoSave
	sendMSService: SendMSService;

	@observable
	password = "";
	@observable
	showPhoneError = false;

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

	async login() {
		try {
			let res = await Req.post(URLS.LOGIN, {
				country_no: this.country_no,
				phone_no: this.phone_no,
				password: md5(this.password).toString(),
				type: 2, //1:验证码 2：密码
				platform: Platform.OS,
			});
			await this.global.login(res);
			this.navigation.push('TabPage')
		} catch (e) {
			this.showPhoneError = true;
		}
	}

	async sendSMS() {
		try {
			let phonecode = this.navigation.getParam('phonecode');
			this.global.showLoading();
			let res = await this.sendMSService.sendSMS(URLS.GET_Login_VERIFY, {
				country_no: this.country_no,
				phone_no: this.phone_no,
				isforce: 1,
			});
			this.global.dismissLoading();
			console.log(res);

			try {
				this.navigation.push('CheckSMSCode', {phonecode: phonecode, isLogin: true})
			}catch (e) {}

		}catch (e) {
			this.global.presentMessage(e);
		}
	}

	async forgetBtnPress() {
		try {
			this.global.showLoading();
			let res = await this.sendMSService.sendSMS(URLS.FORGET_PASSWORD_CODE, {
				country_no: this.country_no,
				phone_no: this.phone_no,
			});
			this.global.dismissLoading();
			console.log(res);

			if (res != null) {
				let phonecode = this.navigation.getParam('phonecode');
				this.navigation.push('ForgetPasswordPage', {phonecode: phonecode});
			}

		}catch (e) {}
	}

	btnVisible() {
		if (this.password.length > 3 && this.showPhoneError == false) {
			return true;
		} else {
			return false;
		}
	}

	render() {

		let PasswordError = this.showPhoneError ?
			(<TextEx style={styles.errorMessage}>{strings('PassWordLogin.pawword_error')}</TextEx>) :
			(<TextEx style={styles.errorMessage}/>);

		let self = this;
		let btnVis = !this.btnVisible();

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
										{strings('PassWordLogin.title')}
									</TextEx>
								</View>
								<TextEx style={{
									fontSize: 14,
									color: '#666',
									alignSelf: 'center',
									textAlign: 'center',
									marginTop: 60,
									minHeight: 20
								}}>
									+{this.country_no} {this.phone_no}
								</TextEx>
								<View style={{
									flexDirection: 'row', marginHorizontal: 28, borderColor: '#E6E6E6',
									borderWidth: 1, borderRadius: 28, marginVertical: 8, marginTop: 20
								}}>
									<View style={[styles.fk, {marginLeft: 15, flex: 1}]}>
										<TextInput style={[styles.input, {flex: 1, height: '100%'}]}
												   secureTextEntry={true}
												   onChangeText={(text) => {
													   self.password = text;
													   self.showPhoneError = false;
												   }}
												   maxLength={20}
												   placeholder={strings('PassWordLogin.please_input_password')}
												   value={this.password}/>
									</View>
								</View>
								<View style={[AppStyle.row, {paddingHorizontal: 48, justifyContent: 'center'}]}>
									{PasswordError}
									<Button onPress={()=>{
										this.forgetBtnPress();
									}}>
										<TextEx style={{
											color: '#999',
											textDecorationLine: 'underline',
											fontSize: 12,
											lineHeight: 20
										}}>
											{strings('PassWordLogin.forget_password')}
										</TextEx>
									</Button>
								</View>
								<View style={{flexDirection: 'row', flex: 1, marginTop: 39, marginHorizontal: 28}}>
									<Button
										style={[btnVis ? styles.downBtn : styles.downBtn_no, {flex: 1}]}
										disabled={btnVis}
										onPress={() => {
											this.login()
										}}>
										<TextEx style={{
											color: btnVis ? '#CCC' : '#FFF',
											fontSize: 16,
											alignSelf: 'center'
										}}> {strings('login_home.login')} </TextEx>
									</Button>
								</View>
								<Button style={{position: 'absolute', bottom: 40, alignSelf: 'center'}} onPress={() => {
									this.sendSMS();
								}}>
									<TextEx style={{
										color: '#4A90E2',
										textDecorationLine: 'underline',
										fontSize: 14,
										lineHeight: 20
									}}>
										{strings('PassWordLogin.SMS_code_login')}
									</TextEx>
								</Button>
								<Button style={{position: 'absolute', left: 12, top: 8, alignSelf: 'center'}} onPress={()=>{
									this.navigation.pop()
								}}>
									<TextEx style={{
										color: '#4A90E2',
										fontSize: 14,
										lineHeight: 20
									}}>
										返回
									</TextEx>
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
		lineHeight: 20,
		alignSelf: 'center',
		flex: 1,
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
		height: 47,
		marginLeft: 8,
	},
	downBtn_no: {
		backgroundColor: '#4A90E2',
		padding: 12,
		paddingLeft: 20,
		paddingRight: 20,
		borderRadius: 24,
		height: 47,
		marginLeft: 8,
	},
	fk: {
		flexDirection: 'row',
		lineHeight: 49,
		height: 49,
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
