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
	Keyboard, ImageBackground, Platform
} from 'react-native';
import {strings} from "../../../locales";
import Button from "../../components/Button";
import SafeView from "../../components/SafeView";
import TextEx from "../../components/TextEx";
import Req from "../../global/req";
import URLS from "../../value/URLS";
import Util from "../../global/Util";
import md5 from "md5";
import BaseComponents from "../../BaseComponents";

let width = Dimensions.get('window').width;
let height = Dimensions.get('window').height;

@inject('store', 'global')
@observer
export default class PasswordSuccess extends BaseComponents {

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;

		let phonecode = this.navigation.getParam('phonecode');
		let {country_no, phone_no} = Util.fixNumber(phonecode);
		this.country_no = country_no;
		this.phone_no = phone_no;
		this.password = this.navigation.getParam("password");
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	async finish() {
		this.global.showLoading();
		let res = await Req.post(URLS.LOGIN, {
			country_no: this.country_no,
			phone_no: this.phone_no,
			password: md5(this.password).toString(),
			type: 2, //1:验证码 2：密码
			platform: Platform.OS,
		});
		await this.global.login(res);
		this.global.dismissLoading();
		this.navigation.push('TabPage')
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
						<Fragment>
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
											{strings('PasswordSuccess.title')}
										</TextEx>
									</View>

									<View style={{justifyContent: 'center', alignSelf: 'center'}}>
										<Image
											style={{width: 87, height: 93, marginTop: 35}}
											source={require('../../assets/newimg/png/icon/buy/buy_icon_recommend.png')}
										/>
									</View>

									<View style={{flexDirection: 'row', flex: 1, marginTop: 39, marginHorizontal: 28}}>
										<Button
											style={[styles.downBtn_no, {flex: 1}]}
											onPress={() => {
												this.finish()
											}}>
											<Text style={{
												color: '#FFF',
												fontSize: 16,
												alignSelf: 'center'
											}}> {strings('PasswordSuccess.finish')} </Text>
										</Button>
									</View>

								</Fragment>
							</TouchableOpacity>
						</Fragment>
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
