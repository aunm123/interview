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
	ImageBackground, SectionList, FlatList, Switch, TextInput
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
export default class EmailPage extends BaseComponents {

	global: Global;

	@observable
	emailText = "";

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;
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
		let content = `激活码将以邮件的新手发送到您的邮箱\n${this.emailText}\n请确认您的邮箱地址是否正确`;
		Alert.alert('验证邮箱地址', content, [
			{
				text: "否", onPress: ()=>{

				}
			},
			{
				text: '是', onPress: () => {
					Req.post(URLS.EMAIL_SEND, {
						email: this.emailText,
					}).then(()=>{
						// 发送成功
						this.navigation.push("EmailVerificationPage", {emailText: this.emailText})
					})
				}
			}
		], {cancelable: false});
	}

	render() {

		let gv = !this.goonBtnVisible();

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={'邮箱地址'}
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
							请输入您的邮箱地址, 我们会向您的邮箱发送一个激活码
						</TextEx>

						<View style={styles.inputRow}>
							<TextEx style={[styles.title, styles.t10]}>邮箱</TextEx>
							<TextInput
								style={styles.onetextArea}
								underlineColorAndroid="transparent"
								placeholder="请输入邮箱地址"
								placeholderTextColor="grey"
								numberOfLines={1}
								maxLength={32}
								autoCapitalize={"none"}
								multiline={false}
								value={this.emailText}
								onChangeText={(text) => {
									this.emailText = text
								}}
							/>
						</View>

					</ScrollView>


				</SafeView>

			</Fragment>
		)
	}
}

const styles = StyleSheet.create({
	inputRow: {
		paddingHorizontal: 16,
		width: "100%",
		flexDirection: "row",
		justifyContent: 'center',
		alignItems: "center"
	},
	onetextArea: {
		height: 44,
		justifyContent: "flex-start",
		borderColor: '#E5E5E5',
		borderBottomWidth: 1,
		alignItems: 'center',
		color: "#333",
		fontSize: 15,
		flex: 1,
		marginLeft: 10,
	},
});

