'use strict';
import React, {Fragment, Component} from 'react';
import {
	Text, View,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	TextInput, Image,
	Animated,
	Dimensions,
	ScrollView,
	TouchableWithoutFeedback, FlatList, NativeModules, Alert, NativeEventEmitter
} from 'react-native';
import NavBar from "../../components/NavBar";
import {strings} from "../../../locales";
import {inject, observer} from "mobx-react";
import CallNumView from "../../components/CallNumView";
import Modal from "react-native-modal";
import AppStyle from "../../Style";
import Line from "../../components/Line";
import Button from "../../components/Button";
import {observable, toJS} from "mobx";
import Req from "../../global/req";
import URLS from "../../value/URLS";
import Util from "../../global/Util";
import SafeView from "../../components/SafeView";
import TextEx from "../../components/TextEx";
import AutoSave from "../../TModal/AutoSave";
import CountryIcon from "../../value/CountryIcon";
import Icon from "../../value/Svg";
import BaseComponents from "../../BaseComponents";

const CallKitCallModule = NativeModules.CallKitCallModule;

@inject('store', 'global')
@observer
export default class CallPhonePage extends BaseComponents {

	@AutoSave
	phoneService;
	@AutoSave
	dbAction;

	@observable
	phone_no = '';
	@observable
	country_no = '';
	@observable
	form_country = '';
	@observable
	form_no = '';
	@observable
	country_name = strings('CallPhonePage.title');
	@observable
	counrty_img = null;

	constructor(props) {
		super(props);
		this.global = props.global;
		this.store = props.store;
		this.navigation = props.navigation;

		// 优先查找的联系人ID
		this.contract_id = this.navigation.getParam("contract_id") || '';

		this.country_no = this.navigation.getParam('country_no') || '';
		this.phone_no = this.navigation.getParam('phone_no') || '';

		this.from_country_no = this.navigation.getParam('from_country_no');
		this.from_phone_no = this.navigation.getParam('from_phone_no');

		if (this.country_no.length > 0) {
			this.dbAction.selectCountryName(this.country_no)
				.then((data) => {
					if (data.country_cn) {
						this.country_name = data.country_cn;
						this.counrty_img = CountryIcon[data.country_code];
					} else {
						this.country_name = strings('CallPhonePage.title');
						this.counrty_img = null;
					}
				})
		}


		if (this.from_country_no != undefined && this.from_country_no != null) {
			this.form_no = this.from_phone_no;
			this.form_country = this.from_country_no;
		} else {
			let {form_no, form_country} = this.global.rootPhone;
			this.form_no = form_no;
			this.form_country = form_country;
		}

		console.log(this.contract_id, "asdijaosijdoiajsiodjojsai")
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	strChange({country_no, phone_no}) {
		this.phone_no = phone_no;
		this.country_no = country_no;
		if (this.country_no.length > 0) {
			this.dbAction.selectCountryName(this.country_no)
				.then((data) => {
					if (data.country_cn) {
						this.country_name = data.country_cn;
						this.counrty_img = CountryIcon[data.country_code];
					} else {
						this.country_name = strings('CallPhonePage.title');
						this.counrty_img = null
					}
				})
		} else {
			this.country_name = strings('CallPhonePage.title');
			this.counrty_img = null;
		}
	}

	isBlack() {
		if (this.phone_no.length == 0 && this.country_no.length == 0) {
			return false;
		} else {
			return true;
		}
	}


	async gotoCallingPage() {

		if (this.country_no.length <= 0) {
			Alert.alert('请选择国家区号', '', [{
					text: '确定', onPress: () => {
					}
				},],
				{cancelable: false}
			);
			return;
		}

		if (!Util.CheckPhone(this.country_no, this.phone_no)) {
			Alert.alert('请输入有效电话号码', '', [{
					text: '确定', onPress: () => {
					}
				},],
				{cancelable: false}
			);
			return;
		}

		this.global.showLoading();

		let params = {
			form_country: this.form_country,
			form_no: this.form_no,
			to_userid: "",
			to_country: this.country_no,
			to_no: this.phone_no,
		};


		// // 拨打电话前余额查询
		await Req.post(URLS.QUERYCALLBANCE, params, false, (responseData)=>{
			if (parseInt(responseData.status, 10) == 1002) {
				this.global.noMoneyAction(this.navigation);
			}
		});
		setTimeout(() => {
			let resParams = Req.mdk(params);
			let name = "+" + this.form_country + ' ' + this.form_no;
			CallKitCallModule.callPhone({...resParams, to: this.country_no+this.phone_no,}, name);
		}, 500);

		this.phoneService.insertCallHistory({
			toPhone: '+' + params.to_country + ' ' + params.to_no,
			fromPhone: 'me',
			isread: true,
		})
			.then((r) => {
				this.global.dismissLoading();
				this.navigation.push('CallingPage', {...params, history_id: r.insertId});
			})


		// this.global.modalRef.showModal((
		//    <View style={{backgroundColor: "#FFF"}}>
		//        <View style={styles.modalBar}>
		//            <TextEx style={styles.modalBarText}>选择拨打方式</Text>
		//        </View>
		//        <View style={{marginBottom: 24}}>
		//            <Button style={styles.ol} onPress={() => {
		//                this.navigation.push('CallingPage');
		//                this.global.modalRef.handlehide()
		//            }}>
		//                <Image
		//                    resizeMode={'contain'}
		//                    style={{width: 24, height: "100%", marginHorizontal: 15}}
		//                    source={require('../../assets/img/call/ic_onlinetelephone.png')}
		//                />
		//                <View style={{flex: 1, paddingRight: 10}}>
		//                    <TextEx style={styles.olTitle}>网络电话</Text>
		//                    <TextEx style={styles.olDetail}>VoIP通讯，低资费，通话质量取决网络质量</Text>
		//                </View>
		//            </Button>
		//            <Line style={{marginHorizontal: 10}}/>
		//            <Button style={styles.ol} onPress={() => {
		//                this.navigation.push('CallingPage');
		//                this.global.modalRef.handlehide()
		//            }}>
		//                <Image
		//                    resizeMode={'contain'}
		//                    style={{width: 24, height: "100%", marginHorizontal: 15}}
		//                    source={require('../../assets/img/call/ic_callback.png')}
		//                />
		//                <View style={{flex: 1, paddingRight: 10}}>
		//                    <TextEx style={styles.olTitle}>回拨电话</Text>
		//                    <TextEx style={styles.olDetail}>优质电话通讯，不适用网络流量，双向拨打并连通电话</Text>
		//                </View>
		//            </Button>
		//            <Line style={{marginHorizontal: 10}}/>
		//        </View>
		//    </View>
		// ))
	}

	selectPhoneNum() {
		this.global.selectCallOutPhone(({phone_no, country_no})=>{
			console.log(phone_no, country_no)
			this.form_no = phone_no;
			this.form_country = country_no;
		}, this.navigation)
	}


	saveBtnRender() {
		let searchData = this.store.finListAllContent2({country_no: this.country_no, phone_no: this.phone_no});
		let rt = [];
		for (let item of searchData) {
			if (item.country_no == this.country_no && item.phone_no == this.phone_no) {
				// 全等
			} else {
				rt.push(item);
			}
		}
		let money = parseFloat(this.global.userData.balance).toFixed(2);
		if ((this.phone_no.length == 0 && this.country_no.length == 0) || rt.length == 0) {
			return (
				<Fragment>
					<View style={{flex: 1}}/>
					<View style={styles.ycbar}>
						<Button style={[{alignItems: 'center'}, AppStyle.row]} onPress={() => {
							this.navigation.push('BuyListPage')
						}}>
							<TextEx style={styles.ycbarText}>洋葱币 {money}</TextEx>
							<Icon icon={'call_icon_add_cord'} size={22} color={'#4A90E2'} style={{marginLeft: 5}}/>
						</Button>
						<View style={{flex: 1}}/>
						<Button style={[styles.ycbarButton, AppStyle.row]} onPress={() => {
							this.selectPhoneNum();
						}}>
							<TextEx style={{lineHeight: 40, color: '#4A90E2', fontSize: 14, fontWeight: '500'}}>
								{this.form_no.length > 0 ? '+' + this.form_country + ' ' + this.form_no : '洋葱电话'}
							</TextEx>
							<Icon icon={'call_icon_arrow_down'} size={22} color={'#4A90E2'}/>
						</Button>
					</View>
				</Fragment>
			)
		} else {

			return (
				<View style={{flex: 1}}>
					<FlatList
						contentContainerStyle={{flexGrow: 1}}
						data={rt}
						keyExtractor={(item, index) => JSON.stringify(item) + index}
						stickySectionHeadersEnabled={false}
						renderItem={({item, index}) => {
							return (
								<Button style={[AppStyle.row, {
									paddingVertical: 8,
									justifyContent: 'center',
									alignItems: 'center'
								}]} onPress={() => {
									this.phone_no = item.phone_no;
									this.country_no = item.country_no;
									this.dbAction.selectCountryName(this.country_no)
										.then((data) => {
											this.country_name = data.country_cn;
											this.counrty_img = CountryIcon[data.country_code];
										})
								}}>
									<TextEx style={{flex: 1, fontSize: 14, color: '#666'}}>{item.name}</TextEx>
									<TextEx
										style={{fontSize: 14, color: '#666'}}>+{item.country_no} {item.phone_no}</TextEx>
									<Image
										style={{width: 22, height: 22}}
										source={require('../../assets/img/util/ic_arrow_right.png')}
									/>
								</Button>
							)
						}}
					/>
				</View>
			)
		}

	}

	rowTap(item) {
		this.phone_no = item.phone_no;
		this.country_no = item.country_no;
		this.dbAction.selectCountryName(this.country_no)
			.then((data) => {
				this.country_name = data.country_cn;
				this.counrty_img = CountryIcon[data.country_code];
			})
	}

	needSave() {
		if (this.phone_no <= 0 || this.country_no <= 0) {
			return false;
		}
		let r = this.store.finListAllContent3({country_no: this.country_no, phone_no: this.phone_no}, false);
		if (r) {
			return false;
		} else {
			return true;
		}
	}

	render() {

		let phone = '';

		if (this.phone_no.length == 0 && this.country_no.length == 0) {
			phone = strings("CallPhonePage.phoneInput");
		} else {
			if (this.country_no.length > 0) {
				phone += '+' + this.country_no;
			}
			phone += " " + this.phone_no;
		}
		let needSave = this.needSave();

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<View style={{flex: 1}}>

						<NavBar title={''}
								bottom_line={true}
								leftRender={(
									<Button style={{padding: 6, paddingRight: 12}} onPress={() => {
										this.navigation.pop()
									}}>
										<Image
											style={{width: 22, height: 22}}
											source={require('../../assets/img/util/ic_back_black.png')}
										/>
									</Button>
								)}
								centerRender={(
									<View style={{justifyContent: 'center', alignItems: 'center', height: 48}}>

										<Button style={[AppStyle.row, {alignItems: 'center', justifyContent: 'center'}]}
												onPress={() => this.navigation.push('CountryZone', {
													callback: (item) => {
														this.country_no = item.country_no;
														this.dbAction.selectCountryName(this.country_no)
															.then((data) => {
																this.country_name = data.country_cn;
																this.counrty_img = CountryIcon[data.country_code];
															})
													}
												})}>
											{this.counrty_img==null?null:<Image
												style={{width: 22, height: 22, marginRight: 7}}
												source={this.counrty_img}
											/>}
											<TextEx style={styles.navbar_title}>{this.country_name}</TextEx>
											<Image
												style={{width: 22, height: 22}}
												source={require('../../assets/img/util/ic_arrow_down_hui.png')}
											/>
										</Button>
									</View>
								)}
								rightRender={(
									<Button style={{padding: 10}}
											onPress={() => {
												this.navigation.push('SearchPage',
													{
														rowTap: (item) => {
															this.navigation.pop();
															this.rowTap(item);
														},
														isAll: true,
													})
											}}>
										<Icon icon={'chat_icon_contact'} size={22} color={'#4A90E2'}/>
									</Button>
								)}
						/>
						<View style={{flex: 1, paddingHorizontal: 12,}}>
							<TextEx style={[{
								fontSize: 28,
								lineHeight: 40,
								height: 40,
								color: this.isBlack() ? "#333" : "#CCC",
								textAlign: 'center',
								marginTop: 32,
								fontWeight: '500'
							}]}>
								{phone}
							</TextEx>
							{needSave ? (
								<Button style={[AppStyle.row, {paddingVertical: 12,
									justifyContent: 'center'}]} onPress={() => {
									let item = {
										name: '',
										contractType: 2,
										phones: [
											{
												label: '',
												number: '',
												type: 0,
												country_no: this.country_no,
												phone_no: this.phone_no
											}
										]
									};
									this.navigation.push('EditContactPage', {contract: item});
								}}>
									{/*<Image*/}
									{/*	style={{width: 22, height: 22}}*/}
									{/*	source={require('../../assets/img/phone/ic_contacts_save.png')}*/}
									{/*/>*/}
									<TextEx style={{lineHeight: 22, color: '#4A90E2', fontSize: 16,
										alignSelf: 'center', textAlign: 'center'}}>
										保存号码
									</TextEx>
								</Button>
							) : null}
							{this.saveBtnRender()}
						</View>

						<CallNumView phone_no={this.phone_no}
									 country_no={this.country_no}
									 messageIsUseful={Util.CheckPhone(this.country_no, this.phone_no)}
									 onNumberChange={(data) => this.strChange(data)}
									 messageClick={() => this.navigation.push('MessagePage', {
										 country_no: this.country_no,
										 phone_no: this.phone_no,
										 contract_id: this.contract_id,
									 })}
									 onCallBtnPress={() => this.gotoCallingPage()}/>
					</View>

				</SafeView>
			</Fragment>
		)
	}
}
const styles = StyleSheet.create({
	ol: {
		flexDirection: "row",
		paddingVertical: 12,
	},
	olTitle: {
		fontSize: 17,
		fontWeight: "400",
		color: "#333",
	},
	olDetail: {
		fontSize: 14,
		color: "#999",
		flexWrap: 'wrap',
		lineHeight: 18,
		marginTop: 2,
	},
	bottomModal: {
		justifyContent: 'flex-end',
		margin: 0,
	},
	modalBar: {
		height: 48,
	},
	modalBarText: {
		lineHeight: 48,
		textAlign: "center",
		fontSize: 17,
	},
	content: {
		backgroundColor: 'white',
	},
	ppColor: {},
	ycbar: {
		height: 44,
		flexDirection: "row",
	},
	ycbarText: {
		height: 40,
		lineHeight: 40,
		fontSize: 14,
		color: '#333'
	},
	ycbarButton: {
		alignSelf: 'flex-end',
		lineHeight: 44,
		alignItems: 'center'
	},
	navbar_title: {
		lineHeight: 22,
		fontSize: 18,
		textAlign: 'center',
		color: '#333',
		fontWeight: '500'
	},
});
