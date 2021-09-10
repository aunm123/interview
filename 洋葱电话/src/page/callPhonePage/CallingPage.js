'use strict';
import React, {Fragment, Component} from 'react';
import {
	Text, View,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	Animated,
	Dimensions,
	Image,
	ImageBackground, NativeModules, NativeEventEmitter, ScrollView, LayoutAnimation, Easing
} from 'react-native';
import {strings} from "../../../locales";
import {inject, observer} from "mobx-react";
import AppStyle, {font} from '../../Style';
import Button from "../../components/Button";
import {observable} from "mobx";
import SafeView from "../../components/SafeView";
import Util from "../../global/Util";
import ERRORS from "../../value/ERROR";
import Req from "../../global/req";
import URLS from "../../value/URLS";
import TextEx from "../../components/TextEx";
import AutoSave from "../../TModal/AutoSave";
import Icon from "../../value/Svg";
import BaseComponents from "../../BaseComponents";
import {RecordingDiagle} from "../../components/configDiagle/recordingDiagle";
import fs from "rn-fetch-blob/fs";

var {height, width} = Dimensions.get('window');
const CallKitCallModule = NativeModules.CallKitCallModule;
const ProximityModule = NativeModules.ProximityModule;

let btn = parseInt(width / 375.0 * 64, 10);

@inject('store', 'global')
@observer
export default class CallingPage extends BaseComponents {

	@AutoSave
	phoneService;

	// 正在录音
	saveing = false;

	// 静音
	@observable
	mute = true;
	// 扩音
	@observable
	audioRoute = null;
	// 录音
	@observable
	saveVoice = false;

	@observable
	timeLabel = 0;

	@observable
	name = '';
	@observable
	country_no = '';
	@observable
	phone_no = '';

	@observable
	keyboardShow = false;
	@observable
	keyboardInput = "";
	@observable
	fSize = 30;
	@observable
	scrollHeight = 0;
	@observable
	rotateYValue = new Animated.Value(0)

	@observable
	status = 0;
	// state
	// 0 : 正在拨打
	// 1 : 正在通话
	// 2 : 通话结束
	// 3 : 重新连接
	// 4 : 没有音频权限
	// 5 : inComing接听

	history_id = null;
	timer = null;
	call_sid = '';

	constructor(props) {
		super(props);
		this.store = props.store;
		this.global = props.global;
		this.navigation = props.navigation;


		this.form_country = this.navigation.getParam('form_country') || '';
		this.form_no = this.navigation.getParam('form_no') || '';

		this.to_country = this.navigation.getParam('to_country') || '';
		this.to_no = this.navigation.getParam('to_no') || '';

		this.history_id = this.navigation.getParam('history_id');

		this.uuid = this.navigation.getParam('uuid');
	}

	// form_country: this.form_country,
	// form_no: this.form_no,
	// to_userid: "",
	// to_country: this.country_no,
	// to_no: this.phone_no,

	componentDidMount() {

		// 距离感应器
		ProximityModule.proximityEnabled(true);
		const ProximityModuleEmitter = new NativeEventEmitter(ProximityModule);

		if (this.uuid) {
			this.uuid = this.navigation.getParam('uuid');
			this.setPhoneStatus(5);
		}

		this.ProximityStateDidChange = ProximityModuleEmitter.addListener('ProximityStateDidChange', (reminder) => {
			if (reminder.proximity) {
				console.log('true');
				// this.setAudioRoute(false);
			} else {
				console.log('false');
				// this.setAudioRoute(true);
			}
		});

		const CallKitCallModuleEmitter = new NativeEventEmitter(CallKitCallModule);

		this.EventCallDidStartRinging = CallKitCallModuleEmitter.addListener('EventCallDidStartRinging',
			(reminder) => {
				console.log("拨打电话, 开始响铃");
				this.call_sid = reminder.callSid;
				this.setPhoneStatus(0);
			});
		this.EventCallDidConnect = CallKitCallModuleEmitter.addListener('EventCallDidConnect',
			(reminder) => {

				this.timer = setInterval(() => {
					this.timeLabel += 1;
				}, 1000);

				if (this.history_id) {
					this.phoneService.updateCallHistoryState({state: 1, id: this.history_id})
				}
				this.call_sid = reminder.callSid;
				this.setPhoneStatus(1);
			});
		this.EventCallReconnecting = CallKitCallModuleEmitter.addListener('EventCallReconnecting',
			(reminder) => {
				console.log('RN收到OC发来 EventCallReconnecting---->' + reminder.name);
				this.setPhoneStatus(3);
			});
		this.EventCallReconnected = CallKitCallModuleEmitter.addListener('EventCallReconnected',
			(reminder) => {
				console.log('RN收到OC发来 EventCallReconnected---->' + reminder.name);
				this.setPhoneStatus(1);
			});
		this.EventCallDidFailed = CallKitCallModuleEmitter.addListener('EventCallDidFailed',
			(reminder) => {
				console.log("通话失败，返回", reminder.error);
				this.setPhoneStatus(2);
				if (parseInt(reminder.error)) {
					this.global.presentMessage(ERRORS(reminder.error));
				}
				this.backinit();
			});
		this.EventCallDisconnected = CallKitCallModuleEmitter.addListener('EventCallDisconnected',
			(reminder) => {
				console.log("连接失败 ", reminder.error);
				this.setPhoneStatus(2);
				if (parseInt(reminder.error)) {
					console.log("连接失败 ");
					this.global.presentMessage(ERRORS(reminder.error));
				} else {
					console.log("对方挂断 ");
				}
				this.backinit();
			});
		this.EventNoPermission = CallKitCallModuleEmitter.addListener('EventNoPermission',
			(reminder) => {
				this.setPhoneStatus(4);
				this.global.presentMessage('没有音频权限');
				this.backinit();
			});
	}

	setPhoneStatus(status) {
		this.status = status;
		switch (status) {
			case 0: {
				// 正在拨打
				break;
			}
			case 1: {
				// 正在通话
				setTimeout(() => {
					this.startSaveVoice();
				}, 2000);
				this.startPhoneSetting();
				break;
			}
			case 2: {
				// 通话结束
				this.stopSaveVoice();
				break;
			}
			case 3: {
				// 重新连接
				setTimeout(() => {
					this.startSaveVoice();
				}, 2000);
				this.startPhoneSetting();
				break;
			}
			case 4: {
				// 没有音频权限
				break;
			}
			case 5: {
				// 正在来电
				break;
			}
		}
	}

	endCall() {
		CallKitCallModule.endCallPhone();
	}

	setMute(value) {
		if (this.mute != value) {
			this.mute = value
		}
		if (this.status == 1) {
			CallKitCallModule.setSwitch(this.mute);
		}
	}

	setAudioRoute(value) {
		if (this.audioRoute != value) {
			this.audioRoute = value;
		}
		if (this.status == 1) {
			CallKitCallModule.setAudioRoute(this.audioRoute);
		}
	}

	setSaveVoice(value) {
		if (value == true) {
			this.global.modalRef.showModal((
				<RecordingDiagle onSuccess={() => {
					if (this.saveVoice != value) {
						this.saveVoice = value;
						this.startSaveVoice();
					}
				}}/>
			), 'middle', false);
		} else {
			this.saveVoice = false;
			this.stopSaveVoice();
		}
	}

	startSaveVoice() {
		if (this.saveVoice && this.call_sid && this.saveing == false) {
			this.saveing = true;
			console.log('开始录音');
			Req.post(URLS.START_SAVE_VOICE, {CallSid: this.call_sid}, true)
				.then()
		}
	}

	startPhoneSetting() {
		try {
			CallKitCallModule.setSwitch(this.mute);
			CallKitCallModule.setAudioRoute(this.audioRoute);
		} catch (e) {
		}
	}

	stopSaveVoice() {
		if (this.call_sid && this.saveing == true) {
			this.saveing = false;
			console.log('停止录音');
			Req.post(URLS.STOP_SAVE_VOICE, {CallSid: this.call_sid}, true)
				.then()
		}
	}

	async backinit() {
		if (this.ProximityStateDidChange) {
			this.ProximityStateDidChange.remove();
			ProximityModule.proximityEnabled(false);
			this.ProximityStateDidChange = null
			this.endCall();
			if (this.history_id) {
				await this.phoneService.updateCallHistoryTime({time: this.timeLabel, id: this.history_id});
			}
			if (parseInt(this.timeLabel) > 0) {
				await this.global.updateUserData();
			}
		}
		if (this.global.currentPageName == 'CallingPage') {
			this.global.nav.pop();
		}
	}

	componentWillUnmount() {
		super.componentWillUnmount();

		try {
			this.global.modalRef.handlehide();
			this.EventCallDidStartRinging.remove();
			this.EventCallDidConnect.remove();
			this.EventCallReconnecting.remove();
			this.EventCallReconnected.remove();
			this.EventCallDidFailed.remove();
			this.EventCallDisconnected.remove();
			this.EventNoPermission.remove();
			clearInterval(this.timer);
		} catch (e) {

		}
	}

	showActionSheet() {
		this.global.modalRef.showPanResponder((
			<View style={{
				backgroundColor: 'rgba(1,55,83,1)',
				borderTopLeftRadius: 25, borderTopRightRadius: 25,
				shadowColor: "#FFF",
				shadowOffset: {
					width: 0,
					height: -1,
				},
				shadowOpacity: 0.7,
				shadowRadius: 1
			}}>
				<View style={{height: 20, width: width, justifyContent: 'center', alignItems: 'center',}}>
					<View style={{backgroundColor: '#B6B6B6', width: 42, height: 3, borderRadius: 4}}/>
				</View>
				<View style={{height: 246, flex: 1, flexWrap: 'wrap', paddingVertical: 23}}>
					<View style={[AppStyle.row, {justifyContent: 'space-around'}]}>

						<TouchableOpacity disabled={true}
										  style={[styles.bottomBtn, {justifyContent: 'flex-start', opacity: 0.5}]}>
							<Icon icon={'call_icon_voice'} size={60} color={'#4A90E2'} style={styles.bottomBtnImg}/>
							<TextEx style={{alignSelf: 'center', color: 'white'}}>通讯录</TextEx>
						</TouchableOpacity>
						<TouchableOpacity disabled={true}
										  style={[styles.bottomBtn, {justifyContent: 'flex-start', opacity: 0.5}]}>
							<Icon icon={'call_icon_short_msg'} size={60} color={'#4A90E2'} style={styles.bottomBtnImg}/>
							<TextEx style={{alignSelf: 'center', color: 'white'}}>短信</TextEx>
						</TouchableOpacity>
						<TouchableOpacity style={[styles.bottomBtn, {justifyContent: 'flex-start'}]}>
							{/*<Icon icon={'call_icon_mic_close'} size={72} color={'#4A90E2'} style={styles.bottomBtnImg}/>*/}
							{/*<TextEx style={{alignSelf: 'center', color: 'white'}}>录音</TextEx>*/}
						</TouchableOpacity>
					</View>

				</View>
			</View>))
	}

	setKeyBoardValue(value) {
		if (value) {
			Animated.timing(this.rotateYValue, {
				toValue: 1, // 目标值
				duration: 400, // 动画时间
				easing: Easing.ease, // 缓动函数
				useNativeDriver: true,
			}).start(() => {
			});
			setTimeout(()=>{
				this.keyboardShow = true;
			}, 200)
		} else {
			Animated.timing(this.rotateYValue, {
				toValue: 0, // 目标值
				duration: 400, // 动画时间
				easing: Easing.ease, // 缓动函数
				useNativeDriver: true,
			}).start(() => {
			});
			setTimeout(()=>{
				this.keyboardShow = false;
			}, 200)
		}
	}

	renderCallView() {
		return (<View>
			<View style={[AppStyle.row, {justifyContent: 'space-around', alignItems: 'center', flex: 1, width: width}]}>
				<TouchableOpacity style={styles.bottomBtn} onPress={() => {
					this.setMute(!this.mute)
				}}>
					{
						this.mute ?
							<Icon icon={'call_icon_mic_close'} size={60} style={styles.bottomBtnImg}/> :
							<Icon icon={'call_icon_mic_open'} size={60} color={'#4A90E2'}
								  style={styles.bottomBtnImg}/>
					}
					<TextEx style={{
						fontSize: 16, lineHeight: 22, minHeight: 22, width: '100%',
						textAlign: 'center', color: this.mute ? '#FFF' : "#4A90E2"
					}}>
						{strings('CallingPage.mute')}
					</TextEx>
				</TouchableOpacity>
				<Button style={styles.bottomBtn} onPress={() => {
					this.setKeyBoardValue(true);
				}}>
					<Icon icon={'call_icon_keyboard'} size={60} style={styles.bottomBtnImg}/>

					<TextEx style={{
						fontSize: 16, color: '#FFF', lineHeight: 22, minHeight: 22, width: '100%',
						textAlign: 'center',
					}}>
						{strings('CallingPage.keyboard')}
					</TextEx>
				</Button>
				<TouchableOpacity style={styles.bottomBtn} onPress={() => {
					this.setAudioRoute(!this.audioRoute)
				}}>
					{
						this.audioRoute ?
							<Icon icon={'call_icon_sound_select'} size={60} color={'#4A90E2'}
								  style={styles.bottomBtnImg}/> :
							<Icon icon={'call_icon_sound_normal'} size={60} style={styles.bottomBtnImg}/>
					}
					<TextEx style={{
						fontSize: 16, lineHeight: 22, minHeight: 22, width: '100%',
						textAlign: 'center', color: this.audioRoute ? "#4A90E2" : '#FFF'
					}}>
						{strings('CallingPage.audioRoute')}
					</TextEx>
				</TouchableOpacity>
				{/*缩小*/}
				{/*<Button style={styles.bottomBtn} onPress={() => {*/}
				{/*	this.props.hiddenPhone();*/}
				{/*}}>*/}
				{/*	<Image style={styles.bottomBtnImg}*/}
				{/*		   source={require('../../assets/img/phone/btn_phone_red.png')}/>*/}
				{/*</Button>*/}
			</View>
			<View style={[AppStyle.row, {justifyContent: 'space-around', alignItems: 'center', flex: 1, width: width}]}>
				<TouchableOpacity style={styles.bottomBtn} onPress={() => {
					this.setSaveVoice(!this.saveVoice)
				}}>
					{
						this.saveVoice ?
							<Icon icon={'call_icon_voice_open'} size={60} style={styles.bottomBtnImg}/> :
							<Icon icon={'call_icon_voice'} size={60} style={styles.bottomBtnImg}/>
					}
					<TextEx style={{
						fontSize: 16, lineHeight: 22, minHeight: 22, width: '100%',
						textAlign: 'center', color: this.saveVoice ? "#4A90E2" : '#FFF'
					}}>
						{strings('CallingPage.saveVoice')}
					</TextEx>
				</TouchableOpacity>
				<Button style={styles.bottomBtn} onPress={() => {
					if (this.call_sid.length > 0) {

						Req.post(URLS.HAND_UP_PHONE, {"CallSid": this.call_sid}, true);
					}
					this.backinit();
				}}>
					<Image style={styles.bottomBtnImg}
						   source={require('../../assets/newimg/png/icon/call/call_icon_btn_phone_red.png')}/>
				</Button>
				<TouchableOpacity style={[styles.bottomBtn]} onPress={() => {
					this.showActionSheet()
				}}>
					<Image style={[styles.bottomBtnImg, {width: 30, height: 15}]}
						   source={require('../../assets/newimg/png/icon/call/call_icon_more40.png')}/>
				</TouchableOpacity>
			</View>
		</View>)
	}

	renderCalling() {
		return (<View>
			<View style={[AppStyle.row, {justifyContent: 'space-around', alignItems: 'center', flex: 1, width: width}]}>
				<TouchableOpacity style={styles.bottomBtn} onPress={() => {
					this.setMute(!this.mute)
				}}>
					{
						this.mute ?
							<Icon icon={'call_icon_mic_close'} size={60} style={styles.bottomBtnImg}/> :
							<Icon icon={'call_icon_mic_open'} size={60} color={'#4A90E2'}
								  style={styles.bottomBtnImg}/>
					}
					<TextEx style={{
						fontSize: 16, lineHeight: 22, minHeight: 22, width: '100%',
						textAlign: 'center', color: this.mute ? '#FFF' : "#4A90E2"
					}}>
						{strings('CallingPage.mute')}
					</TextEx>
				</TouchableOpacity>
				<Button style={styles.bottomBtn} onPress={() => {
					this.setKeyBoardValue(true);
				}}>
					<Icon icon={'call_icon_keyboard'} size={60} style={styles.bottomBtnImg}/>
					<TextEx style={{
						fontSize: 16, color: '#FFF', lineHeight: 22, minHeight: 22, width: '100%',
						textAlign: 'center',
					}}>
						{strings('CallingPage.keyboard')}
					</TextEx>
				</Button>
				<TouchableOpacity style={styles.bottomBtn} onPress={() => {
					this.setAudioRoute(!this.audioRoute)
				}}>
					{
						this.audioRoute ?
							<Icon icon={'call_icon_sound_select'} size={60} color={'#4A90E2'}
								  style={styles.bottomBtnImg}/> :
							<Icon icon={'call_icon_sound_normal'} size={60} style={styles.bottomBtnImg}/>
					}
					<TextEx style={{
						fontSize: 16, lineHeight: 22, minHeight: 22, width: '100%',
						textAlign: 'center', color: this.audioRoute ? "#4A90E2" : '#FFF'
					}}>
						{strings('CallingPage.audioRoute')}
					</TextEx>
				</TouchableOpacity>
				{/*缩小*/}
				{/*<Button style={styles.bottomBtn} onPress={() => {*/}
				{/*	this.props.hiddenPhone();*/}
				{/*}}>*/}
				{/*	<Image style={styles.bottomBtnImg}*/}
				{/*		   source={require('../../assets/img/phone/btn_phone_red.png')}/>*/}
				{/*</Button>*/}
			</View>
			<View style={[AppStyle.row, {justifyContent: 'space-around', alignItems: 'center', flex: 1, width: width}]}>
				<TouchableOpacity style={styles.bottomBtn} onPress={() => {
					this.setSaveVoice(!this.saveVoice)
				}}>
					{
						this.saveVoice ?
							<Icon icon={'call_icon_voice_open'} size={60} style={styles.bottomBtnImg}/> :
							<Icon icon={'call_icon_voice'} size={60} style={styles.bottomBtnImg}/>
					}
					<TextEx style={{
						fontSize: 16, lineHeight: 22, minHeight: 22, width: '100%',
						textAlign: 'center', color: this.saveVoice ? "#4A90E2" : '#FFF'
					}}>
						{strings('CallingPage.saveVoice')}
					</TextEx>
				</TouchableOpacity>
				<Button style={styles.bottomBtn} onPress={() => {
					if (this.call_sid.length > 0) {
						Req.post(URLS.HAND_UP_PHONE, {"CallSid": this.call_sid}, true);
					}
					this.backinit();
				}}>
					<Image style={styles.bottomBtnImg}
						   source={require('../../assets/newimg/png/icon/call/call_icon_btn_phone_red.png')}/>
				</Button>
				<TouchableOpacity style={[styles.bottomBtn]} onPress={() => {
					this.showActionSheet()
				}}>
					<Image style={[styles.bottomBtnImg, {width: 30, height: 15}]}
						   source={require('../../assets/newimg/png/icon/call/call_icon_more40.png')}/>
				</TouchableOpacity>
			</View>
		</View>)
	}

	renderComing() {
		return (
			<View style={[{
				paddingHorizontal: 60,
			}, AppStyle.row]}>
				<Button style={styles.bottomBtn} onPress={() => {
					CallKitCallModule.rejectCallWithUUID(this.uuid);
					if (this.call_sid.length > 0) {
						Req.post(URLS.HAND_UP_PHONE, {"CallSid": this.call_sid}, true);
					}
					this.backinit();
				}}>
					<Image style={styles.bottomBtnImg}
						   source={require('../../assets/newimg/png/icon/call/call_icon_btn_phone_red.png')}/>
				</Button>
				<View style={{flex: 1}}/>
				<TouchableOpacity style={styles.bottomBtn} onPress={() => {
					CallKitCallModule.acceptCallWithUUID(this.uuid)
				}}>
					<Image style={styles.bottomBtnImg}
						   source={require('../../assets/newimg/png/icon/call/call_icon_btn_phone_green.png')}/>
				</TouchableOpacity>

			</View>)
	}

	numberClick(value) {
		this.keyboardInput += value;
		try {
			this.refs.scroll.scrollToEnd();
		} catch (e) {
		}
	}

	renderKeyBoardNum() {
		return (
			<Fragment>
				<ScrollView ref={'scroll'} style={styles.keyboardInputView}
							onLayout={(event) => {
								let {x, y, width, height} = event.nativeEvent.layout;
								if (this.scrollHeight == 0) {
									this.scrollHeight = height;
								}
							}}
							contentContainerStyle={{
								justifyContent: 'center',
								alignItems: 'center',
								minHeight: this.scrollHeight
							}}>
					<TextEx
						style={[styles.keyboardInput, {fontSize: this.keyboardInput.length > parseInt(width / 18) ? 26 : 30}]}>
						{this.keyboardInput}
					</TextEx>
				</ScrollView>
				<View style={{alignItems: 'center', width: '100%'}}>
					<View style={styles.callView}>
						<View style={styles.row}>
							<TouchableOpacity style={styles.numBtn} onPress={() => this.numberClick("1")}>
								<Text style={styles.numBtnText}>1</Text>
								<Text style={styles.minNumBtnText}></Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.numBtn} onPress={() => this.numberClick("2")}>
								<Text style={styles.numBtnText}>2</Text>
								<Text style={styles.minNumBtnText}>A B C</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.numBtn} onPress={() => this.numberClick("3")}>
								<Text style={styles.numBtnText}>3</Text>
								<Text style={styles.minNumBtnText}>D E F</Text>
							</TouchableOpacity>
						</View>
						<View style={styles.row}>
							<TouchableOpacity style={styles.numBtn} onPress={() => this.numberClick("4")}>
								<Text style={styles.numBtnText}>4</Text>
								<Text style={styles.minNumBtnText}>G H I</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.numBtn} onPress={() => this.numberClick("5")}>
								<Text style={styles.numBtnText}>5</Text>
								<Text style={styles.minNumBtnText}>J K L</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.numBtn} onPress={() => this.numberClick("6")}>
								<Text style={styles.numBtnText}>6</Text>
								<Text style={styles.minNumBtnText}>N M O</Text>
							</TouchableOpacity>
						</View>
						<View style={styles.row}>
							<TouchableOpacity style={styles.numBtn} onPress={() => this.numberClick("7")}>
								<Text style={styles.numBtnText}>7</Text>
								<Text style={styles.minNumBtnText}>P Q R</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.numBtn} onPress={() => this.numberClick("8")}>
								<Text style={styles.numBtnText}>8</Text>
								<Text style={styles.minNumBtnText}>S T U</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.numBtn} onPress={() => this.numberClick("9")}>
								<Text style={styles.numBtnText}>9</Text>
								<Text style={styles.minNumBtnText}>V W Y</Text>
							</TouchableOpacity>
						</View>
						<View style={styles.row}>
							<TouchableOpacity style={styles.numBtn} onPress={() => this.numberClick("*")}>
								<Text style={styles.numBtnText}>*</Text>
								<Text style={styles.minNumBtnText}>Z</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.numBtn} onPress={() => this.numberClick("0")}>
								<Text style={styles.numBtnText}>0</Text>
								<Text style={styles.minNumBtnText}>+</Text>
							</TouchableOpacity>
							<TouchableOpacity style={styles.numBtn} onPress={() => this.numberClick("#")}>
								<Text style={styles.numBtnText}>#</Text>
								<Text style={styles.minNumBtnText}></Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Fragment>
		)
	}

	renderKeyBoardBottom() {
		return (
			<View style={[AppStyle.row, {justifyContent: 'space-around', alignItems: 'center', flex: 1, width: width}]}>
				<Button style={styles.bottomBtn}>
				</Button>
				<Button style={styles.bottomBtn} onPress={() => {
					if (this.call_sid.length > 0) {

						Req.post(URLS.HAND_UP_PHONE, {"CallSid": this.call_sid}, true);
					}
					this.backinit();
				}}>
					<Image style={styles.bottomBtnImg}
						   source={require('../../assets/newimg/png/icon/call/call_icon_btn_phone_red.png')}/>
				</Button>
				<Button style={[styles.bottomBtn]} onPress={() => {
					this.setKeyBoardValue(false);
				}}>
					<TextEx style={{fontSize: 18, color: 'white'}}>
						隐藏
					</TextEx>
				</Button>
			</View>
		)
	}


	render() {

		let nameLabel = this.name.length > 0 ? this.name : "+" + this.to_country + " " + this.to_no;
		let m = Util.prefix(2, parseInt(this.timeLabel / 60));
		let s = Util.prefix(2, parseInt(this.timeLabel % 60));

		let l = this.timeLabel > 0 ? (<TextEx style={styles.numCount}>{m}:{s}</TextEx>) : null;

		let keyboardBottomView = this.renderKeyBoardBottom();
		let keyboardNumView = this.renderKeyBoardNum();

		let status = '';
		let view = null;
		switch (this.status) {
			case 0: {
				status = '正在拨打';
				view = this.renderCalling();
				break
			}
			case 1: {
				status = '正在通话';
				view = this.renderCallView();
				break
			}
			case 2: {
				status = '通话结束';
				view = this.renderCallView();
				break
			}
			case 3: {
				status = '重新连接';
				view = this.renderCallView();
				break
			}
			case 4: {
				status = '没有音频权限';
				view = this.renderCallView();
				break
			}
			case 5: {
				status = '正在来电';
				view = this.renderComing();
				break
			}
		}

		const rotateY = this.rotateYValue.interpolate({
			inputRange: [0, 0.5,1],
			outputRange: ['0deg', '90deg','0deg']
		});

		return (
			<Fragment>
				<ImageBackground source={require('../../assets/newimg/png/callbg.png')}
								 resizeMode={'stretch'}
								 style={{width: width, height: height}}>
					<StatusBar barStyle="light-content"/>
					<SafeView>
						<View style={{margin: 12}}>
							<View style={AppStyle.row}>
								{
									this.status == 0 || this.status == 5 ? (
										<Image style={{width: 20, height: 20, marginRight: 7}}
											   source={require('../../assets/img/gif/calling.gif')}/>
									) : (
										<Image style={{width: 20, height: 20, marginRight: 7}}
											   source={require('../../assets/img/call/ic_dialing_big.png')}/>
									)
								}
								<TextEx style={[AppStyle.white, AppStyle.block, font(18)]}>{nameLabel}</TextEx>
							</View>
							<Text
								style={[AppStyle.white, AppStyle.light, AppStyle.row, font(14), styles.statusText]}>
								{status}
								{l}
							</Text>
						</View>

						<Animated.View style={{
							flex: 1,
							transform: [
								{rotateY: rotateY},
							]
						}}>
							{
								this.keyboardShow ? (
									<Fragment>
										<View style={[AppStyle.vcenter, {flex: 1}]}>
											{keyboardNumView}
										</View>
										<View style={[AppStyle.row, AppStyle.vcenter, {height: 124}]}>
											{keyboardBottomView}
										</View>
									</Fragment>
								) : (
									<Fragment>
										<View style={[AppStyle.vcenter, {flex: 1}]}>
											{
												this.status == 0 || this.status == 5 ? (
													<Image style={{width: 88, height: 88}}
														   source={require('../../assets/img/gif/calling.gif')}/>
												) : (
													<Image style={{width: 88, height: 88}}
														   source={require('../../assets/img/call/ic_dialing_big.png')}/>
												)
											}
										</View>
										{
											this.form_no.length > 0 ? (
												<TextEx style={{
													fontSize: 16,
													color: '#fff',
													width: '100%',
													textAlign: 'center'
												}}>
													呼叫号码：+ {this.form_country} {this.form_no}
												</TextEx>
											) : null
										}
										<View style={[AppStyle.row, AppStyle.vcenter, {height: 248}]}>
											{view}
										</View>
									</Fragment>
								)
							}
						</Animated.View>

					</SafeView>
				</ImageBackground>

			</Fragment>
		)
	}
}
const styles = StyleSheet.create({
	numCount: {
		width: '100%',
		fontSize: 16,
		textAlign: 'center',
		color: '#FFF'
	},
	ppColor: {},
	ycbar: {
		height: 44,
		flexDirection: "row",
		paddingHorizontal: 12,
	},
	ycbarText: {
		height: 44,
		flex: 1,
		lineHeight: 44,
	},
	ycbarButton: {
		alignSelf: 'flex-end',
		lineHeight: 44,
	},
	statusText: {
		marginTop: 8,
		marginLeft: 27,
	},
	bottomBtn: {
		marginHorizontal: 7,
		minWidth: 60,
		minHeight: 60,
		justifyContent: 'center',
		alignSelf: 'center'
	},
	bottomBtnImg: {
		width: 72,
		height: 72,
		justifyContent: 'center',
		alignSelf: 'center'
	},


	callView: {
		paddingTop: 0,
		marginTop: 8,
		paddingHorizontal: 44,
		width: '100%'
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	numBtn: {
		marginBottom: 8,
		padding: 5,
		width: btn,
		height: btn,
		borderRadius: 35,
		backgroundColor: '#F3F3F3'
	},
	numBtnText: {
		width: '100%',
		fontSize: btn / 70 * 34,
		color: '#333333',
		textAlign: 'center'
	},
	minNumBtnText: {
		width: '100%',
		fontSize: 10,
		color: '#333333',
		textAlign: 'center'
	},
	vBtn: {
		width: btn / 64 * 60,
		height: btn / 64 * 60,
		justifyContent: 'center',
		alignItems: 'center',
	},
	keyboardInputView: {
		flex: 1,
		width: (width - 40),
	},
	keyboardInput: {
		width: (width - 40),
		color: "white",
		flexWrap: 'wrap',
		textAlign: 'center'
	}
});
