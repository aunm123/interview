'use strict';
import React, {Fragment, Component} from 'react';
import {
	StyleSheet,
	StatusBar,
	Dimensions,
	Image, ScrollView, View, Text, TextInput,
} from 'react-native';

import {inject, observer} from "mobx-react";
import SafeView from "../../../../components/SafeView";
import NavBar from "../../../../components/NavBar";
import Button from "../../../../components/Button";
import TextEx from "../../../../components/TextEx";
import AppStyle from "../../../../Style";
import {strings} from "../../../../../locales";
import {observable} from "mobx";
import BaseComponents from "../../../../BaseComponents";
import AutoSave from "../../../../TModal/AutoSave";
import OtherService from "../../../../service/OtherService";
import Switch from 'react-native-switch-pro'

const {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
export default class CallForwardingPage extends BaseComponents {

	@AutoSave
	otherService: OtherService;

	@observable
	mode = 1;				// 0：已经开通	1：填写电话	2：关闭

	@observable
	country_no = "";
	@observable
	phone_no = "";

	phone = "";

	@observable
	callTransferSwitch = false;

	@observable
	nextBtnEnable = false;

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;
		this.store = props.store;

		this.data = props.navigation.getParam("data");
		this.phone = this.data.phone;
		this.callTransferSwitch = this.data.transfer_status == 1;

		this.mode = this.callTransferSwitch ? (this.data.transfer_country.length > 0 ? 0 : 1) : 2;

		console.log(this.mode);
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	onStart() {
		super.onStart();
	}

	fitPhoneCode() {
		if (this.country_no.length > 0 && this.phone_no.length > 0) {
			this.nextBtnEnable = true;
		} else {
			this.nextBtnEnable = false;
		}
	}

	renderCloseView() {
		return (
			<View style={{justifyContent: 'center', alignItems: 'center'}}>
				<TextEx style={{
					fontSize: 16, color: '#333', marginTop: 28,
					marginBottom: 20, paddingHorizontal: 16, lineHeight: 20
				}}>
					呼叫转移未开启
				</TextEx>
				<Image style={{marginTop: 24}} source={require('../../../../assets/newimg/empty_img1.png')}/>
			</View>
		)
	}

	renderFinishView() {
		return (
			<View style={{justifyContent: 'center', alignItems: 'center'}}>
				<TextEx style={{
					fontSize: 16, color: '#333', marginTop: 28,
					marginBottom: 20, paddingHorizontal: 16, lineHeight: 20
				}}>
					您已成功开通呼叫转移：
				</TextEx>

				<View style={{
					flexDirection: 'row',
					marginHorizontal: 16,
					borderBottomWidth: 1,
					borderBottomColor: "#E6E6E6"
				}}>
					<TextEx style={{
						lineHeight: 50, fontSize: 16, paddingLeft: 16,
						color: '#B9B9B9', flex: 1, textAlign: 'left'
					}}>
						{'+' + this.data.transfer_country + " " + this.data.transfer_no}
					</TextEx>
					<Button onPress={()=>{
						this.mode = 1
					}}>
						<TextEx style={{
							lineHeight: 50, fontSize: 12, color: '#0091FF', paddingRight: 7
						}}>
							修改号码
						</TextEx>
					</Button>
				</View>
			</View>
		)
	}

	async nextBtnPress() {
		this.global.showLoading();
		try {
			await this.otherService.getCallTransferVerifyCode(this.country_no, this.phone_no, this.data.phone);
			this.global.dismissLoading();
			this.navigation.pop()
		} catch (e) {
			this.global.dismissLoading();
		}
	}

	renderStep1() {
		let nBtnEnable = !this.nextBtnEnable;

		return (
			<View style={{justifyContent: 'center', alignItems: 'center'}}>
				<TextEx style={{
					fontSize: 16, color: '#333', marginTop: 28,
					marginBottom: 20, paddingHorizontal: 16, lineHeight: 20
				}}>
					输入从洋葱onioncall转接电话到您设定的一个电话号码
				</TextEx>

				<View style={{flexDirection: 'row', marginHorizontal: 16}}>
					<Button style={{borderBottomWidth: 1, borderColor: '#E6E6E6'}}
							onPress={() => this.navigation.push('CountryZone', {
								callback: (item) => {
									this.country_no = item.country_no;
									this.fitPhoneCode();
								}
							})}>
						<View style={[styles.fk, AppStyle.row,]}>
							<View style={{flex: 1, height: 16}}>
								<Text
									style={this.country_no.length > 0 ? styles.input : styles.input_placeholder}>
									{this.country_no.length > 0 ? '+' + this.country_no : strings('CreateAccount.areaCode_title')}
								</Text>
							</View>
							<Image
								style={[styles.inputDown]}
								source={require('../../../../assets/newimg/png/icon/common/common_icon_unfold24.png')}
							/>
						</View>

					</Button>
					<View style={[styles.fk, {
						marginLeft: 15,
						flex: 1,
						borderBottomWidth: 1,
						borderColor: '#E6E6E6'
					}]}>
						<TextInput style={[styles.input, {flex: 1, height: '100%'}]}
								   onChangeText={(text) => {
									   this.phone_no = text;
									   this.fitPhoneCode();
								   }}
								   keyboardType={'phone-pad'}
								   maxLength={20}
								   placeholder={strings('CreateAccount.input_phone_placeholder')}
								   value={this.phone_no}/>
					</View>
				</View>

				<View style={{width: '100%'}}>
					<Button
						disabled={nBtnEnable}
						onPress={() => {
							this.nextBtnPress();
						}}
						style={{
							marginVertical: 24,
							marginHorizontal: 16,
							backgroundColor: nBtnEnable ? '#999' : '#4A90E2',
							flex: 1,
							paddingVertical: 11,
							height: 44,
							borderRadius: 22,
							justifyContent: 'center',
							alignItems: 'center',
							marginBottom: 20
						}}>
						<TextEx style={{fontSize: 16, fontWeight: '400', color: '#fff'}}>
							下一步
						</TextEx>
					</Button>
				</View>
			</View>
		)
	}

	render() {

		// mode = 1;				// 0：已经开通	1：填写电话	2：关闭

		let view = null;
		switch (this.mode) {
			case 0: {
				view = this.renderFinishView();
				break;
			}
			case 1: {
				view = this.renderStep1();
				break;
			}
			case 2: {
				view = this.renderCloseView();
				break;
			}
		}

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={"呼叫转移"}
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
							rightRender={(
								<View style={{marginRight: 8, marginBottom: 5}}>
									<Switch
										width={50}
										height={27}
										backgroundInactive={'#DDD'}
										backgroundActive={'#4A90E2'}
										value={this.callTransferSwitch}
										onSyncPress={(value) => {
											this.callTransferSwitch = value;
											try {
												this.otherService.callTransferSwitch(value ? "1" : "0", this.phone);
												this.mode = value ? (this.data.transfer_country.length > 0 ? 0 : 1) : 2;
												console.log(this.mode);
											} catch (e) {
												this.callTransferSwitch = !value;
											}
										}}
									/>
								</View>
							)}
					/>
					<ScrollView>
						{view}
					</ScrollView>
				</SafeView>

			</Fragment>
		)
	}
}

const styles = StyleSheet.create({
	fk: {
		flexDirection: 'row',
		lineHeight: 50,
		height: 50,
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
		fontSize: 14,
		fontWeight: '300',
		color: '#999',
		alignSelf: 'center',
		textAlign: 'center',
		flex: 1,
	},
	inputDown: {
		width: 16,
		height: 16,
	},
});

