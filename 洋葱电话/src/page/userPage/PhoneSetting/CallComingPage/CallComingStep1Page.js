'use strict';
import React, {Fragment, Component} from 'react';
import {
	StyleSheet,
	StatusBar,
	Dimensions,
	Image, ScrollView, View, Text, TextInput, Alert, DeviceEventEmitter,
} from 'react-native';

import {inject, observer} from "mobx-react";
import SafeView from "../../../../components/SafeView";
import NavBar from "../../../../components/NavBar";
import Button from "../../../../components/Button";
import TextEx from "../../../../components/TextEx";
import {observable} from "mobx";
import BaseComponents from "../../../../BaseComponents";
import {CallerComingDiagle} from "../../../../components/configDiagle/CallerComingDiagle";
import AutoSave from "../../../../TModal/AutoSave";
import OtherService from "../../../../service/OtherService";
import Util from "../../../../global/Util";

const {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
export default class CallComingStep1Page extends BaseComponents {

	@AutoSave
	otherService: OtherService;

	@observable
	phone = '';
	@observable
	code = '';

	@observable
	timeNumber = 60;

	timeUp = null;
	listener = null;

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;

		this.phone = this.navigation.getParam("phone");
		this.code = this.navigation.getParam("code");
	}

	componentDidMount(): void {
		this.listener = DeviceEventEmitter.addListener('verifyCaller', (res) => {
			if (res.status == 1){
				this.successSetting();
			} else {
				this.faileSetting();
			}
		});
		this.startTimeUp();
	}

	componentWillUnmount() {
		//移除监听
		if (this.listener) {
			this.listener.remove();
		}
		super.componentWillUnmount();
	}

	startTimeUp() {
		this.timeNumber = 60;
		this.timeUp = setInterval(() => {
			this.timeNumber--;
			if (this.timeNumber <= 0 && this.timeUp) {
				clearInterval(this.timeUp);
				this.timeUp = null;
			}
		}, 1000)
	}
	
	successSetting() {
		// await this.global.updateUserData();
		let {country_no, phone_no} = Util.fixNumber(this.phone);
		this.global.userData.caller_country_no = country_no;
		this.global.userData.caller_phone_no = phone_no;

		this.navigation.push('CallComingSuccessPage', {phone: this.phone})
	}

	async reGetCode() {
		this.global.showLoading();
		try {
			let {country_no, phone_no} = Util.fixNumber(this.phone);
			let code = await this.otherService.getCallComingVerifyCode(country_no, phone_no);
			code = code.split("").join(" ");
			this.code = code;

			this.global.dismissLoading();
			this.startTimeUp();

		}catch (e) {
			this.global.dismissLoading();
		}
	}

	faileSetting() {
		this.global.modalRef.showModal((
			<CallerComingDiagle timeNumber={this.timeNumber}
								onChangePhoneCode={()=>{
									this.navigation.pop();
								}}
								onReGetCode={() => {
									this.reGetCode();
								}}/>
		), 'middle', false);
	}

	render() {

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={"来电显示"}
							bottom_line={true}
							leftRender={(
								<Button style={{paddingLeft: 6, paddingRight: 12}}
										onPress={() => this.navigation.pop()}>
									<Image
										style={{width: 22, height: 22}}
										source={require('../../../../assets/img/util/ic_back_black.png')}
									/>
								</Button>
							)}
					/>
					<ScrollView>
						<View style={{justifyContent: 'center', alignItems: 'center'}}>
							<TextEx style={{
								fontSize: 16, color: '#333', marginTop: 28,
								marginBottom: 8, paddingHorizontal: 16, lineHeight: 20
							}}>
								我们已经拨打电话给
							</TextEx>
							<TextEx style={{
								fontSize: 16, color: 'rgba(0,0,0,0.5)', marginBottom: 20,
								paddingHorizontal: 16, lineHeight: 20
							}}>
								{this.phone}
							</TextEx>

							<TextEx style={{
								fontSize: 16, color: '#333', paddingHorizontal: 16, lineHeight: 20
							}}>
								请注意接听电话并在接听后填写下方验证码
							</TextEx>
							<TextEx style={{
								fontSize: 32, color: '#F7B500', paddingHorizontal: 16,
								lineHeight: 45, marginVertical: 12, fontWeight: '300',
							}}>
								{this.code}
							</TextEx>

							<View style={{flexDirection: 'row', marginVertical: 18}}>
								<TextEx style={{color: '#999'}}>
									没接到电话？没听清？
								</TextEx>
								{
									this.timeNumber > 0 ? (
										<TextEx style={{color: "#4A90E2", fontSize: 12}}>
											重新获取（{this.timeNumber}）
										</TextEx>
									) : (
										<Button onPress={()=>{
											this.reGetCode();
										}}>
											<TextEx style={{color: "#4A90E2", fontSize: 12}}>
												重新获取
											</TextEx>
										</Button>
									)
								}
							</View>
							<View style={{flexDirection: 'row', marginVertical: 18}}>
								<TextEx style={{color: '#999'}}>
									电话有误？
								</TextEx>
								<Button onPress={()=>{
									this.navigation.pop();
								}}>
									<TextEx style={{color: "#4A90E2", fontSize: 12}}>
										重新填写
									</TextEx>
								</Button>
							</View>

						</View>
					</ScrollView>
				</SafeView>

			</Fragment>
		)
	}
}

const styles = StyleSheet.create({});

