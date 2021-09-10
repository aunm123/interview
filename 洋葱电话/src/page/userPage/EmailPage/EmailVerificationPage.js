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
	ImageBackground, SectionList, FlatList, Switch, TextInput, TouchableWithoutFeedback
} from 'react-native';
import {inject, observer} from "mobx-react";
import SafeView from "../../../components/SafeView";
import NavBar from "../../../components/NavBar";
import Button from "../../../components/Button";
import {strings} from "../../../../locales";
import AppStyle from "../../../Style";
import TextEx from "../../../components/TextEx";
import {observable} from "mobx";
import Line from "../../../components/Line";
import Global from "../../../mobx/Global";
import BaseComponents from "../../../BaseComponents";
import TextExTitle from "../../../components/TextExTitle";
import Req from "../../../global/req";
import URLS from "../../../value/URLS";

var {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
export default class EmailVerificationPage extends BaseComponents {

	global: Global;

	@observable
	emailText = "";
	@observable
	password = "";

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;

		this.emailText = this.navigation.getParam('emailText') || "";
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	goonBtnVisible() {
		let reg = /^\w+((.\w+)|(-\w+))@[A-Za-z0-9]+((.|-)[A-Za-z0-9]+).[A-Za-z0-9]+$/;
		if (this.emailText.length > 3) {
			if (reg.test(this.emailText)) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}

	goOnBtnPress() {
		Req.post(URLS.EMAIL_BIND, {
			email: this.emailText,
			verify_code: this.password
		}).then(()=>{
			// 验证成功
			this.global.presentMessage("验证成功");
			this.navigation.pop(2);
		})
	}

	_getInputItem = () => {
		let inputItem = [];
		for (let i = 0; i < 4; i++) {
			inputItem.push(
				<View key={i} style={styles.textInputView}>
					{i < this.password.length
						? <TextEx style={{fontSize: 20}}>
							{this.password[i]}
						</TextEx>
						: null}
				</View>)
		}
		return inputItem;
	};

	render() {

		let gv = !this.goonBtnVisible();

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={'激活码'}
							bottom_line={true}
							leftRender={(
								<Button style={{paddingLeft: 6, paddingRight: 12}}
										onPress={() => this.navigation.pop(2)}>
									<Image
										style={{width: 22, height: 22}}
										source={require('../../../assets/img/util/ic_back_black.png')}
									/>
								</Button>
							)}
							rightRender={(
								<Button style={{padding: 10}} disabled={gv} onPress={() => {
									this.goOnBtnPress();
								}}>
									<TextExTitle style={{fontSize: 16, color: '#4A90E2', fontWeight: '500'}}>
										继续
									</TextExTitle>
								</Button>
							)}
					/>
					<ScrollView
						contentContainerStyle={{flex: 1, alignItems: 'center'}}
						style={{flex: 1}}>

						<TextEx style={{fontSize: 15, fontWeight: "400", color: "#333", margin: 12}}>
							验证码已经通过邮件发送到您的邮箱里:{'\n'}
							<TextEx style={styles.blue}>{this.emailText}</TextEx> 请输入验证码并点击"继续"按钮
						</TextEx>

						<View style={styles.inputRow}>
							<TextInput
								ref={(ref)=>this.textInput = ref}
								style={styles.onetextArea}
								underlineColorAndroid="transparent"
								numberOfLines={1}
								maxLength={4}
								multiline={false}
								value={this.password}
								autoFocus={true}
								keyboardType="number-pad"
								onChangeText={(text) => {
									this.password = text
								}}
							/>
						</View>

						<TouchableWithoutFeedback onPress={()=>{
							try {
								this.textInput.focus();
							}catch (e) {}
						}}>
							<View style={styles.fv}>
								{
									this._getInputItem()
								}
							</View>
						</TouchableWithoutFeedback>

					</ScrollView>


				</SafeView>

			</Fragment>
		)
	}
}

const styles = StyleSheet.create({
	blue: {
		color: "#1864ff",
	},
	inputRow: {
		paddingHorizontal: 16,
		width: "100%",
		flexDirection: "row",
		justifyContent: 'center',
		alignItems: "center"
	},
	onetextArea: {
		zIndex: 99,
		position: 'absolute',
		opacity: 0,
	},
	fv: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center"
	},
	textInputView: {
		height: 85 / 2,
		width: 85 / 2,
		borderWidth: 1,
		borderColor: '#c9c7c7',
		justifyContent: 'center',
		alignItems: 'center',
		marginHorizontal: 10,
	},
});

