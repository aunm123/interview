'use strict';
import {observable, action, computed, toJS} from 'mobx'
import {
	PermissionsAndroid, Platform, Alert, Image, View, Text, ScrollView, TouchableOpacity, Keyboard
} from 'react-native'
import Req from "../global/req";
import URLS from "../value/URLS";
import React, {Fragment} from "react";
import Button from "../components/Button";
import AppStyle from "../Style";
import TextEx from "../components/TextEx";
import Line from "../components/Line";
import {strings} from "../../locales";
import TipModal from "../components/animate/TipModal";
import CallPageModal from "../page/callPhonePage/CallPageModal";
import CustomStorage from "../global/CustomStorage";

import AutoSave from "../TModal/AutoSave";
import Loading from "../components/animate/Loading";
import {TimerTodoList} from "../global/TimerTodoList";
import CacheImageView from "../components/CacheImageView";
import {CacheImage} from "react-native-rn-cacheimage";
import Icon from "../value/Svg";
import RNShare from "react-native-share";
import Modal from "../components/animate/Modal";


class Global {

	@AutoSave
	dbAction;
	@AutoSave
	timerTodoList: TimerTodoList;

	@observable
	Voice = false;
	@observable
	Shake = false;
	// 聊天通知提示音
	@observable
	messageNotice_Voice = true;
	// 电话通知提示音
	@observable
	callingNotice_Voice = true;

	currentIp_Country = '';
	currentIp_Country_Code = '';
	currentIp = '';
	hasLogin = false;

	@observable
	initFinish = false;

	smsPriceList = {};

	token = null;
	userid = null;

	@observable
	userData = {
		avatar: null,
		balance: "0.00",
		birthday: "",
		city: "",
		country_name: "",
		country_no: "",
		nickname: "",
		phone_no: "",
		province: "",
		remark: "",
		sex: 1,
		phonelist: [],
		// 邀请好友连接
		invite_url: "",
		// ios 商店地址
		ios_shop_url: "",
		// 安卓 商店地址
		android_shop_url: "",
		// 是否已经设置密码 1.已经设置密码 0.未设置密码
		issetpwd: "",
		online: 1,              //1：在线  2：离开 3：请勿打扰 4：隐身
		email: "",
		isactive: 1,            //邮箱激活状态 0:默认未激活  1：已激活
		one_record_coins: "电话录音1~10分钟消耗2个洋葱币",
		two_record_coins: "10~30分钟消耗5个洋葱币",
		three_record_coins: "30分钟以上消耗18个洋葱币",
		caller_phone_no: "",       	//设置的来电显示号码
		caller_country_no: "",          //设置的来电显示国家区号
		caller_status: 1				//0:默认关闭  1：开启
	};

	nav = null;
	currentPageName = '';
	routeList = [];
	rootToast = null;

	websocketUrl = null;


	async initToast(rootToast, nav) {
		this.rootToast = rootToast;
		this.token = await CustomStorage.getItem('token');
		this.userid = await CustomStorage.getItem('userid');
		this.websocketUrl = await CustomStorage.getItem('websocketUrl');
		this.nav = nav;

		this.timerTodoList.initTimer();

		// setTimeout(()=>{
		// 	console.log(this.nav.state.routeName)
		// }, 5000)
	}


	@observable
	isLoading = false;
	@observable
	loadingRef: Loading = undefined;
	@observable
	modalRef: Modal = null;
	@observable
	photoRef = null;
	@observable
	loginSuccess = false;
	@observable
	call_modal_ref: CallPageModal = null;
	@observable
	tip_modal_ref: TipModal = null;

	callingPageShowAction = (() => {
	});

	async initGlobalDate() {
		this.Voice = await CustomStorage.getItem('SettingVoice', true);
		this.Shake = await CustomStorage.getItem('SettingShake', true);
		// 聊天通知提示音
		this.messageNotice_Voice = await CustomStorage.getItem('SettingMessageNoticeVoice', true);
		// 电话通知提示音
		this.callingNotice_Voice = await CustomStorage.getItem('SettingCallingNoticeVoice', true);
	}


	@computed get rootPhone() {
		let form_no = '';
		let form_country = '';
		let bug_no = '';
		for (let item of this.userData.phonelist) {
			if (item.ismain == '1') {
				form_no = item.phone_no;
				form_country = item.country_no;
				bug_no = item.bug_no;
			}
		}
		return {form_no, form_country, bug_no};
	}

	@action
	async login(res) {
		this.loginSuccess = true;
		await CustomStorage.setItem('token', res.data.token);
		await CustomStorage.setItem('userid', res.data.userid);
		await CustomStorage.setItem('websocketUrl', res.data.websocket);

		this.token = res.data.token;
		this.userid = res.data.userid;
		this.websocketUrl = res.data.websocket
	}

	@action
	async logout() {
		this.showLoading();
		this.loginSuccess = false;
		await CustomStorage.removeItem('token');
		await CustomStorage.removeItem('userid');
		await Req.post(URLS.LOG_OUT, {});

		// 清空数据库
		// await this.dbAction.cleanTable();

		this.token = undefined;
		this.userid = undefined;
		this.websocketUrl = undefined;
		this.dismissLoading()
	}

	showLoading() {
		if (!this.isLoading) {
			this.loadingRef.showLoading();
			this.isLoading = true;
		}
	}

	showProgress(message) {
		if (!this.isLoading) {
			this.isLoading = true;
		}
		this.loadingRef.showProgress(message);
	}

	dismissLoading() {
		if (this.isLoading) {
			this.loadingRef.dismissLoading();
			this.isLoading = false;
		}
	}

	developing() {
		Alert.alert('该功能正在开发中', '', [{
			text: '确定', onPress: () => {
			}
		},], {cancelable: false});
	}

	avatarIcon(size = 40, style = {}) {
		let avatar = this.userData.avatar ? (
				<CacheImage
					source={{uri: this.userData.avatar}}
					style={{width: size, height: size, ...style}}
				/>

			) :
			<Icon icon={'system'} size={size} color={'#4A90E2'} style={{...style}}/>;


		return avatar;
	}

	async updateUserData() {
		// 先用旧的代替
		let res_old = await CustomStorage.getItem('userdata');
		try {
			res_old = JSON.parse(res_old);
			this.userData.avatar = res_old.avatar;
			this.userData.balance = res_old.balance;
			this.userData.birthday = res_old.birthday;
			this.userData.city = res_old.city;
			this.userData.country_name = res_old.country_name;
			this.userData.country_no = res_old.country_no;
			this.userData.nickname = res_old.nickname;
			this.userData.phone_no = res_old.phone_no;
			this.userData.province = res_old.province;
			this.userData.remark = res_old.remark; // 自我介绍
			this.userData.sex = res_old.sex;
			this.userData.invite_url = res_old.invite_url;
			this.userData.ios_shop_url = res_old.ios_shop_url;
			this.userData.android_shop_url = res_old.android_shop_url;
			this.userData.website_url = res_old.website_url;
			this.userData.issetpwd = res_old.issetpwd;
			this.userData.online = res_old.online;
			this.userData.email = res_old.email;
			this.userData.isactive = res_old.isactive;
			this.userData.one_record_coins = res_old.one_record_coins;
			this.userData.two_record_coins = res_old.two_record_coins;
			this.userData.three_record_coins = res_old.three_record_coins;
			this.userData.caller_phone_no = res_old.caller_phone_no;
			this.userData.caller_country_no = res_old.caller_country_no;
			this.userData.caller_status = res_old.caller_status;
		} catch (e) {
		}

		let res = await Req.post(URLS.GET_USER_DETAIL);
		console.log("用户信息：", res);
		this.userData.avatar = res.data.avatar;
		this.userData.balance = res.data.balance;
		this.userData.birthday = res.data.birthday;
		this.userData.city = res.data.city;
		this.userData.country_name = res.data.country_name;
		this.userData.country_no = res.data.country_no;
		this.userData.nickname = res.data.nickname;
		this.userData.phone_no = res.data.phone_no;
		this.userData.province = res.data.province;
		this.userData.remark = res.data.remark; // 自我介绍
		this.userData.sex = parseInt(res.data.sex);
		this.userData.invite_url = res.data.invite_url;
		this.userData.ios_shop_url = res.data.ios_shop_url;
		this.userData.android_shop_url = res.data.android_shop_url;
		this.userData.website_url = res.data.website_url;
		this.userData.issetpwd = parseInt(res.data.issetpwd);
		this.userData.online = parseInt(res.data.online);
		this.userData.email = res.data.email;
		this.userData.isactive = parseInt(res.data.isactive);
		this.userData.one_record_coins = res.data.one_record_coins;
		this.userData.two_record_coins = res.data.two_record_coins;
		this.userData.three_record_coins = res.data.three_record_coins;
		this.userData.caller_phone_no = res.data.caller_phone_no;
		this.userData.caller_country_no = res.data.caller_country_no;
		this.userData.caller_status = parseInt(res.data.caller_status);

		await CustomStorage.setItem('userdata', JSON.stringify(res.data));

		this.hasLogin = true;
	}

	presentMessage(message) {
		try {
			this.rootToast.show(message, 2000);
		} catch (e) {
		}
	}

	requestCameraPromisser() {
		return new Promise((resolve, reject) => {

			if (Platform.OS == 'android') {
				PermissionsAndroid.request(
					PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
						'title': '需要要读写权限',
						'message': ''
					}
				).then((granted) => {
					if (granted === PermissionsAndroid.RESULTS.GRANTED) {
						resolve();
					} else {
						reject();
					}
				});
			} else {
				resolve();
			}
		})
	}

	requestContactsPromisser() {
		return new Promise((resolve, reject) => {

			if (Platform.OS == 'android') {
				const permissions = [
					PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
					PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS,
				];

				PermissionsAndroid.requestMultiple(
					permissions
				).then((granteds) => {
					if (granteds["android.permission.READ_CONTACTS"] === "granted") {
						resolve();
					} else {
						reject();
					}
				});
			} else {
				resolve();
			}
		})
	}

	requestCameraCCPromisser() {
		return new Promise((resolve, reject) => {

			if (Platform.OS == 'android') {
				PermissionsAndroid.request(
					PermissionsAndroid.PERMISSIONS.CAMERA, {
						'title': '需要要摄像头权限',
						'message': ''
					}
				).then((granted) => {
					if (granted === PermissionsAndroid.RESULTS.CAMERA) {
						resolve();
					} else {
						reject();
					}
				});
			} else {
				resolve();
			}
		})
	}

	async requestPromisser() {
		try {
			const permissions = [
				PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
				PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
				PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
				PermissionsAndroid.PERMISSIONS.CAMERA,
				PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
				PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS,
			];
			//返回得是对象类型
			const granteds = await PermissionsAndroid.requestMultiple(permissions)
			if (granteds["android.permission.ACCESS_FINE_LOCATION"] === "granted") {

			}
			if (granteds["android.permission.CAMERA"] === "granted") {

			}
			if (granteds["android.permission.WRITE_EXTERNAL_STORAGE"] === "granted") {

			}
		} catch (err) {
			console.log(err)
		}
	}


	selectCallOutPhone(callback, navigation) {

		let titleList = this.userData.balance <= 100 ? [
			'获取洋葱币',
			'邀请好友免费获取洋葱币',
			'低廉话费，畅拨全球',
		] : [
			'邀请好友加入洋葱',
			'领取免费洋葱币',
			'低廉话费，畅拨全球',
		];

		let phoneListView = [];
		phoneListView.push((
			<Fragment key={-1}>
				<Button style={{flexDirection: "row", paddingVertical: 12}} onPress={() => {
					this.modalRef.handlehide();
					callback({phone_no: '', country_no: ''})
				}}>
					<Icon icon={'chat_icon_onion_phone'} size={40} color={'#4A90E2'} style={{marginHorizontal: 15}}/>
					<View style={[{flex: 1, paddingRight: 10, alignItems: 'center'}, AppStyle.row]}>
						<View>
							<TextEx style={{fontSize: 17, fontWeight: "400", color: "#333"}}>
								{strings('selectPhone.ycPhoneNo')}
							</TextEx>
							<TextEx
								style={{
									fontSize: 14,
									color: "#999",
									flexWrap: 'wrap',
									lineHeight: 18,
									marginTop: 2
								}}>{strings('selectPhone.nickName')}</TextEx>
						</View>

					</View>

				</Button>
				<Line style={{marginHorizontal: 10}}/>
			</Fragment>
		));
		this.userData.phonelist.map((item, index) => {
			phoneListView.push((
				<Fragment key={index}>
					<Button style={{flexDirection: "row", paddingVertical: 12}} onPress={() => {
						this.modalRef.handlehide();
						callback({phone_no: item.phone_no, country_no: item.country_no})
					}}>
						<Icon icon={'chat_icon_onion_phone2'} size={40} color={'#4A90E2'}
							  style={{marginHorizontal: 15}}/>
						<View style={[{flex: 1, paddingRight: 10, alignItems: 'center'}, AppStyle.row]}>
							<View style={{flex: 1, paddingRight: 10, alignItems: 'flex-start'}}>
								<Text
									style={[{fontSize: 17, fontWeight: "400", color: "#333"}]}>
									+{item.country_no} {item.phone_no}
								</Text>
								<TextEx style={{
									fontSize: 14,
									color: "#999",
									flexWrap: 'wrap',
									lineHeight: 18,
									marginTop: 2,
									minHeight: 18,
								}}>{titleList[index]}</TextEx>
							</View>
							{item.ismain == '1' ? <TextEx style={{
								fontSize: 14,
								color: "#999",
								flexWrap: 'wrap',
								lineHeight: 18,
								marginTop: 2
							}}>{strings('selectPhone.mainPhone')}</TextEx> : null}
						</View>
					</Button>
					<Line style={{marginHorizontal: 10}}/>
				</Fragment>
			))
		});

		if (this.userData.phonelist.length <= 0) {
			let pus = (
				<Button onPress={() => {
					this.modalRef.handlehide();
					navigation.push('CountrySelect')
				}} key={-2}>
					<View style={[AppStyle.row, {padding: 9, marginVertical: 12, alignItems: 'center'}]}>
						<View style={{marginLeft: 12, justifyContent: 'center', flex: 1}}>
							<TextEx style={{fontSize: 14, color: '#333', lineHeight: 20}}>
								{strings('selectPhone.getNativePhone')}
							</TextEx>
							<TextEx style={{fontSize: 12, color: '#999', lineHeight: 20}}>
								{strings('selectPhone.getNativePhoneTitle')}
							</TextEx>
						</View>
						<View style={{
							backgroundColor: '#999', borderRadius: 4, height: 32,
							alignItems: 'center', justifyContent: 'center', paddingHorizontal: 9
						}}>
							<TextEx style={{fontSize: 15, color: '#FFF'}}>{strings('selectPhone.getnorePhone')}</TextEx>
						</View>
					</View>
				</Button>
			)
			phoneListView.push(pus);
		}

		this.modalRef.showModal((
			<View style={{backgroundColor: "#FFF", borderTopLeftRadius: 10, borderTopRightRadius: 10}}>
				<View style={{height: 48}}>
					<TextEx style={{lineHeight: 48, textAlign: "center", fontSize: 17}}>
						{strings('selectPhone.title')}
					</TextEx>
				</View>
				<ScrollView style={{marginBottom: 4, maxHeight: 240}}>
					{phoneListView}
				</ScrollView>
			</View>
		))
	}

	_callIcon(item, size, kstyle = {}) {
		if (item.fromphone == 'me') {
			// 打出去
			if (!item.state) {
				// 成功
				return <Icon icon={'msg_list_answered_out'} size={size} color={'#4A90E2'} style={{...kstyle}}/>
			} else {
				// 失败
				return <Icon icon={'msg_list_unanswered_out'} size={size} color={'#999'} style={{...kstyle}}/>
			}
		} else {
			// 打进来
			if (!item.state) {
				// 成功
				return <Icon icon={'msg_list_answered_in'} size={size} color={'#4A90E2'} style={{...kstyle}}/>
			} else {
				// 失败
				return <Icon icon={'msg_list_unanswered_in'} size={size} color={'#999'} style={{...kstyle}}/>
			}
		}
	}

	_callStatus(item) {
		if (item.fromphone == 'me') {
			// 打出去
			if (item.time > 0) {
				// 成功
				return '通话成功'
			} else {
				// 失败
				return '无人接听'
			}
		} else {
			// 打进来
			if (item.time > 0) {
				// 成功
				return '通话成功'
			} else {
				// 失败
				return '未接电话'
			}
		}
	}

	shareAction() {
		const shareOptions = {
			title: '邀请加入',
			url: 'http://www.onioncall.com',
			social: RNShare.Social.EMAIL
		};

		// RNShare.shareSingle(shareOptions)
		// 	.then((res) => { console.log(res) })
		// 	.catch((err) => { err && console.log(err); });

		RNShare.open(shareOptions)
			.then((res) => {
				console.log(res)
			})
			.catch((err) => {
				err && console.log(err);
			});
	}

	noMoneyAction(navigation) {
		Keyboard.dismiss();
		let kkk = this.modalRef;
		this.modalRef.showModal((
			<View style={{backgroundColor: "#FFF", borderRadius: 10}}>
				<TextEx style={{fontSize: 18, color: '#333', width: 275, marginTop: 23, textAlign: 'center'}}>
					余额不足
				</TextEx>
				<TextEx style={{width: 275, textAlign: 'center', fontSize: 14, color: '#333', marginVertical: 12}}>
					很抱歉，您的洋葱余额不足, 你可以
				</TextEx>
				<Line/>
				{/*<TouchableOpacity style={{height: 44,justifyContent: 'center', alignSelf: 'center'}} onPress={()=>{*/}
				{/*	try {*/}
				{/*		kkk.handlehide()*/}
				{/*		this.shareAction();*/}
				{/*	} catch (e) {*/}
				{/*	}*/}
				{/*}}>*/}
				{/*	<TextEx style={{fontSize: 16, color: '#4A90E2'}}>邀请好友免费发短信</TextEx>*/}
				{/*</TouchableOpacity>*/}
				{/*<Line />*/}
				<TouchableOpacity style={{height: 44, justifyContent: 'center', alignSelf: 'center'}} onPress={() => {
					try {
						kkk.handlehide()
						navigation.push('BuyListPage');
					} catch (e) {

					}
				}}>
					<TextEx style={{fontSize: 16, color: '#4A90E2'}}>充值得洋葱币</TextEx>
				</TouchableOpacity>
				<Line/>
				<TouchableOpacity style={{height: 44, justifyContent: 'center', alignSelf: 'center'}} onPress={() => {
					try {
						kkk.handlehide()
					} catch (e) {

					}
				}}>
					<TextEx style={{fontSize: 16, color: '#999'}}>知道了</TextEx>
				</TouchableOpacity>

			</View>), 'middle')
	}


}

export default Global
