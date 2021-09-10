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
	ImageBackground, SectionList, FlatList, Switch, Clipboard, TextInput
} from 'react-native';
import {inject, observer} from "mobx-react";
import {strings} from "../../../../locales";
import SafeView from "../../../components/SafeView";
import NavBar from "../../../components/NavBar";
import Button from "../../../components/Button";
import AppStyle from "../../../Style";
import TextEx from "../../../components/TextEx";
import TextExTitle from "../../../components/TextExTitle";
import {observable, toJS} from "mobx";
import URLS from "../../../value/URLS";
import Req from "../../../global/req";
import CustomStorage from "../../../global/CustomStorage";
import BaseComponents from "../../../BaseComponents";

var {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
export default class NewPasswordPage extends BaseComponents {

	@observable
	password = "";
	@observable
	rePassword = "";
	@observable
	oldPassword = "";
	@observable
	error = "";

	@observable
	cvisible = false;
	@observable
	chvisible = false;

	@observable
	type = "";

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;

	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	componentDidMount(): void {

		if (this.global.userData.issetpwd == 1) {
			this.type = "change";
			console.log(toJS(this.global.userData), "change")
		} else {
			this.type = "create";
			console.log(toJS(this.global.userData), "create")
		}
	}

	async createNewPassword() {
		if (this.password != this.rePassword) {
			this.global.presentMessage(strings("NewPasswordPage.password_error"));
		} else {
			this.global.showLoading();
			try {
				await Req.post(URLS.CREATE_PASSWORD, {password: this.password, repassword: this.rePassword});
				this.global.dismissLoading();
				this.global.presentMessage(strings("NewPasswordPage.create_success"));
				this.navigation.pop()
			}catch (e) {
				this.global.dismissLoading();
				this.global.presentMessage(e.message);
			}
		}
	}


	async resetPassword() {
		if (this.password != this.rePassword) {
			this.global.presentMessage(strings("NewPasswordPage.password_error"));
		} else {
			this.global.showLoading();
			try {
				await Req.post(URLS.RESET_PASSWORD, {oldpassword: this.oldPassword, password: this.password, repassword: this.rePassword});
				this.global.dismissLoading();
				this.global.presentMessage(strings("NewPasswordPage.change_success"));
				this.navigation.pop()
			}catch (e) {
				this.global.dismissLoading();
				this.global.presentMessage(e.message);
			}
		}

	}


	resetPasswordRender() {

		let chvisible = !this.changeBtnVisible();

		return (
			<ScrollView>

				<View>
					<TextEx style={[styles.title, styles.t10, {paddingHorizontal: 16}]}>{strings("NewPasswordPage.old_password")}</TextEx>
					<TextInput
						style={[styles.onetextArea, {marginHorizontal: 16}]}
						secureTextEntry={true}
						underlineColorAndroid="transparent"
						placeholder={strings("NewPasswordPage.password_placeholder")}
						placeholderTextColor="grey"
						numberOfLines={1}
						maxLength={32}
						multiline={false}
						value={this.oldPassword}
						onChangeText={(text)=>{
							this.oldPassword = text;
						}}
					/>
				</View>

				<View>
					<TextEx style={[styles.title, styles.t10, {paddingHorizontal: 16}]}>{strings("NewPasswordPage.password_new_title")}</TextEx>
					<TextInput
						style={[styles.onetextArea, {marginHorizontal: 16}]}
						secureTextEntry={true}
						underlineColorAndroid="transparent"
						placeholder={strings("NewPasswordPage.password_placeholder")}
						placeholderTextColor="grey"
						numberOfLines={1}
						maxLength={32}
						multiline={false}
						value={this.password}
						onChangeText={(text)=>{
							this.password = text;
							if (this.password != "" && this.rePassword != "" &&this.password != this.rePassword) {
								this.error = strings("NewPasswordPage.password_error");
							} else {
								this.error = "";
							}
						}}
					/>
				</View>

				<View>
					<TextEx style={[styles.title, styles.t10, {paddingHorizontal: 16}]}>{strings("NewPasswordPage.password_title")}</TextEx>
					<TextInput
						style={[styles.onetextArea, {marginHorizontal: 16}]}
						secureTextEntry={true}
						underlineColorAndroid="transparent"
						placeholder={strings("NewPasswordPage.password_placeholder")}
						placeholderTextColor="grey"
						numberOfLines={1}
						maxLength={32}
						multiline={false}
						value={this.rePassword}
						onChangeText={(text)=>{
							this.rePassword = text;
							if (this.password != "" && this.rePassword != "" &&this.password != this.rePassword) {
								this.error = strings("NewPasswordPage.password_error");
							} else {
								this.error = "";
							}
						}}
					/>
					<TextEx style={[styles.red, {paddingHorizontal: 16}]}>{this.error}</TextEx>
				</View>

				<Button style={[styles.saveBtn, {marginBottom: 50}]} onPress={()=>this.resetPassword()} disabled={chvisible}>
					<TextEx style={{color: 'white', fontSize: 16,}}>{strings("other.sure")}</TextEx>
				</Button>



			</ScrollView>
		)
	}

	createPasswordRender() {

		let cvisible = !this.createBtnVisible();

		return (
			<ScrollView>

				<View>
					<TextEx style={[styles.title, styles.t10, {paddingHorizontal: 16}]}>{strings("NewPasswordPage.password_title")}</TextEx>
					<TextInput
						style={[styles.onetextArea, {marginHorizontal: 16}]}
						secureTextEntry={true}
						underlineColorAndroid="transparent"
						placeholder={strings("NewPasswordPage.password_placeholder")}
						placeholderTextColor="grey"
						numberOfLines={1}
						maxLength={32}
						multiline={false}
						value={this.password}
						onChangeText={(text)=>{
							this.password = text;
							if (this.password != "" && this.rePassword != "" &&this.password != this.rePassword) {
								this.error = strings("NewPasswordPage.password_error");
							} else {
								this.error = "";
							}
						}}
					/>
				</View>

				<View>
					<TextEx style={[styles.title, styles.t10, {paddingHorizontal: 16}]}>{strings("NewPasswordPage.password_title")}</TextEx>
					<TextInput
						style={[styles.onetextArea, {marginHorizontal: 16}]}
						secureTextEntry={true}
						underlineColorAndroid="transparent"
						placeholder={strings("NewPasswordPage.password_title_again")}
						placeholderTextColor="grey"
						numberOfLines={1}
						maxLength={32}
						multiline={false}
						value={this.rePassword}
						onChangeText={(text)=>{
							this.rePassword = text;
							if (this.password != "" && this.rePassword != "" &&this.password != this.rePassword) {
								this.error = strings("NewPasswordPage.password_error");
							} else {
								this.error = "";
							}
						}}
					/>
					<TextEx style={[styles.red, {paddingHorizontal: 16}]}>{this.error}</TextEx>
				</View>

				<Button style={[styles.saveBtn, {marginBottom: 50}]} disabled={cvisible} onPress={()=>this.createNewPassword()}>
					<TextEx style={{color: 'white', fontSize: 16,}}>{strings("other.sure")}</TextEx>
				</Button>



			</ScrollView>
		)
	}

	createBtnVisible() {
		if (this.password.length > 6 && this.rePassword.length > 6 && this.password == this.rePassword) {
			return true;
		} else {
			return false;
		}
	}

	changeBtnVisible() {
		if (this.oldPassword.length > 6 && this.password.length > 6 && this.rePassword.length > 6 && this.password == this.rePassword) {
			return true;
		} else {
			return false;
		}
	}

	render() {

		let re = null;
		let title = "";
		if (this.type == "create") {
			title = strings("NewPasswordPage.title_new");
			re = this.createPasswordRender();
		} else {
			title = strings("NewPasswordPage.title_change");
			re = this.resetPasswordRender();
		}

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={title}
							bottom_line={true}
							leftRender={(
								<Button style={{paddingLeft: 6, paddingRight: 12}} onPress={() => this.navigation.pop()}>
									<Image
										style={{width: 26, height: 26}}
										source={require('../../../assets/img/util/ic_back_black.png')}
									/>
								</Button>
							)}
					/>

					{re}

				</SafeView>

			</Fragment>
		)



	}
}

const styles = StyleSheet.create({

	title: {
		fontSize: 16,
		color: '#333',
		lineHeight: 20,
		fontWeight: '400',
	},
	t10: {
		marginTop: 32,
	},
	onetextArea: {
		height: 44,
		justifyContent: "flex-start",
		borderColor: '#E5E5E5',
		borderBottomWidth: 1,
		alignItems: 'center',
		color: "#333",
		fontSize: 15,
		marginTop: 12,
	},
	red: {
		fontSize: 12,
		color: 'red',
		lineHeight: 20,
		fontWeight: '300',
		marginTop: 5,
		minHeight: 22,
	},
	saveBtn: {
		marginVertical: 32,
		marginHorizontal: 32,
		height: 44,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#4A90E2',
		borderRadius: 22.5
	},
	saveBtnBg: {
		width: '100%',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center'
	}
});
