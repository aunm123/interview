import React, {Component, Fragment} from 'react';
import LoginHome from "./page/login/LoginHome";
import Loading from "./components/animate/Loading";
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import {RouteConfigs, StackNavigatorConfig} from './route/index'

const Navigator = createAppContainer(createStackNavigator(RouteConfigs, StackNavigatorConfig));
import {ActionSheetProvider} from '@expo/react-native-action-sheet'
import {
	Animated, DeviceEventEmitter,
	Dimensions,
	Easing,
	ImageBackground,
} from "react-native";
import Modal from "./components/animate/Modal";
import {inject, observer} from "mobx-react";
import {
	Platform, AppState
} from 'react-native';
import Toast, {DURATION} from 'react-native-easy-toast'
import Req from "./global/req";
import {observable} from "mobx";
import Util from "./global/Util";
import {CacheHelper} from "react-native-rn-cacheimage";
import URLS from "./value/URLS";
import NotificationService from "./global/NotificationService";
import CallPageModal from "./page/callPhonePage/CallPageModal";
import TipModal from "./components/animate/TipModal";
import {TimerTodoList, TodoAction} from "./global/TimerTodoList";
import CustomStorage from "./global/CustomStorage";
import AutoSave from "./TModal/AutoSave";
import {ReplaceClass} from "./TModal/GlobalSpace";
import CallService from "./global/CallService";
import DBACtion from "./global/DBAction";
import {WebSocketService} from "./global/webSocket/WebSocketService";
import Global from "./mobx/Global";
import {DownloadList} from "./global/DownloadList";
import BaseComponents from "./BaseComponents";

let {height, width} = Dimensions.get('window');

@inject('store', 'global', 'download')
@observer
export default class App extends BaseComponents {

	@observable
	showCallModal = false;
	@observable
	hasLogin = false;
	@observable
	needRemove = false;
	flage = false;

	animateValue: Animated.Value;
	@AutoSave
	callService: CallService;
	@AutoSave
	dbAction : DBACtion;
	@AutoSave
	timerTodoList : TimerTodoList;
	@AutoSave
	WebSocketService: WebSocketService;
	@AutoSave
	DownloadList: DownloadList;

	global: Global;

	toast: Toast | null | undefined;

	constructor(props: any) {
		super(props);
		this.global = props.global;
		this.store = props.store;
		this.download = props.download;

		Req.initGlobal(this.global, this.store);
		this.animateValue = new Animated.Value(1);

		CustomStorage.getItem('countryList')
			.then(countryList=>{
				if (countryList && countryList != undefined && countryList != null) {
					console.log('用缓存')
					Util.CountryList = JSON.parse(countryList);
				}
			});
	}

	async CheckIpToCountry() {
		let date = new Date().getTime()/1000;
		let res = await Req.post(URLS.IP_CHECK_COUNTRY, {timestamp: parseInt(date.toString())});
		this.global.currentIp_Country = res.data.country_no;
		this.global.currentIp_Country_Code = res.data.country_code;
		this.global.currentIp = res.data.ip;
	}

	componentDidMount() {
		CacheHelper.register({overwrite:false}).catch((e: any) => console.log(e));

		this.CheckIpToCountry().then();
		this.global.callingPageShowAction = this.showCallModalAction.bind(this);

		// function get_filesize(url, callback) {
		// 	var xhr = new XMLHttpRequest();
		// 	xhr.open("HEAD", url, true);
		// 	xhr.setRequestHeader('User-Agent', 'node-XMLHttpRequest');
		// 	xhr.setRequestHeader('Accept', '*/*');
		//
		// 	xhr.onreadystatechange = function() {
		// 		if (this.readyState == this.DONE) {
		// 			debugger
		// 			callback(parseInt(xhr.getResponseHeader("Content-Length")));
		// 		}
		// 	};
		// 	xhr.send();
		// }
		//
		// get_filesize("http://fdl.test.4lk30p.com/ui/upload/201910/09/177f7eed98528ae9c3d71a5a4d63db16pjysbx5f.jpeg", function(size) {
		// 	console.log("The size of foo.exe is: " + size + " bytes.")
		// });

		this.initApp().then();
		AppState.addEventListener('change', this._handleAppStateChange);
		this.callService.startListen();
		NotificationService.initJPUSH();

	}

	componentWillUnmount() {
		super.componentWillUnmount();

		AppState.removeEventListener('change', this._handleAppStateChange);
		this.callService.stopListen();
		CacheHelper.unregister().catch((e: any)=>console.log(e))
	}


	_handleAppStateChange = (nextAppState: string | null) => {
		if (nextAppState != null && nextAppState === 'active') {
			//如果是true ，表示从后台进入了前台 ，请求数据，刷新页面。或者做其他的逻辑
			if (this.flage) {
				//这里的逻辑表示 ，第一次进入前台的时候 ，不会进入这个判断语句中。
				// 因为初始化的时候是false ，当进入后台的时候 ，flag才是true ，
				// 当第二次进入前台的时候 ，这里就是true ，就走进来了。
				//测试通过
				// alert("从后台进入前台");
				// 这个地方进行网络请求等其他逻辑。

				this.store.updateLocalContractNoPremisser();


				if (this.global.hasLogin){
					this.WebSocketService.initWebSocketService();
					this.WebSocketService.openWebSocket(this.global.websocketUrl);
					console.log('WebSocketService 进入前台 开启成功');
				}
			}
			this.flage = false;
		} else if (nextAppState != null && nextAppState === 'background') {
			this.flage = true;

			if (this.global.hasLogin){
				this.WebSocketService.closeWebSocket();
				console.log('WebSocketService 进入后台 关闭成功');
			}
		}
	};




	async initApp() {
		await CustomStorage.setItem('lastTouchTime', (new Date().getTime()).toString())
		console.log('lastTouchTime finish');
		// // @ts-ignore
		await this.global.initToast(this.toast, this.refs.nav._navigation);
		console.log('initToast finish');
		//
		await this.dbAction.initLocalDB();
		console.log('dbAction finish');
		//
		await this.initPasswordLockList();
		console.log('initPasswordLockList finish');

		await this.DownloadList.initData();
		console.log('initDownloadList finish');

		let countryList = await CustomStorage.getItem('countryList');
		if (countryList && countryList != undefined && countryList != null) {
			Util.CountryList = JSON.parse(countryList);
		} else {
			let countryList = await this.dbAction.getAllCountry();
			let temp = {};
			for (let country of countryList) {
				temp[country.country_no] = country;
			}
			await CustomStorage.setItem('countryList', JSON.stringify(temp));
			Util.CountryList = temp;
		}

		this.store.updateLocalContract({alert: false});
		console.log('updateLocalContract finish');


		let token = await CustomStorage.getItem('token');
		console.log('CustomStorage token finish');

		if (token && token != undefined && token != null) {
			this.hasLogin = true;
			// @ts-ignore
			this.refs.nav._navigation.push('TabPage');
			Animated.timing(this.animateValue, {
				toValue: 0, // 目标值
				duration: 300, // 动画时间
				easing: Easing.ease, // 缓动函数
				useNativeDriver: true,
			}).start(() => {
				this.needRemove = true;
				this.global.initFinish = true;
			});
		} else {
			Animated.timing(this.animateValue, {
				toValue: 0, // 目标值
				duration: 300, // 动画时间
				easing: Easing.ease, // 缓动函数
				useNativeDriver: true,
			}).start(() => {
				this.needRemove = true;
				this.global.initFinish = true;
			});
		}
		console.log("=========================", token);
	}

	/**
	 * 设置锁屏定时器
	 * @returns {Promise<void>}
	 */
	async initPasswordLockList() {

		this.CustomeViewTouch = DeviceEventEmitter.addListener('CustomeViewTouch',
			() => {
				// 用户触摸了屏幕，最后一次触摸从新计时
				CustomStorage.setItem('lastTouchTime', (new Date().getTime()).toString())
			});
		// todoList 初始化
		let action = new TodoAction('timerup', async ()=>{
			let password = await CustomStorage.getItem('lockPassword');
			if (!password){
				return
			}

			let time = await CustomStorage.getItem('lastTouchTime');
			let type = await CustomStorage.getItem('leaveToLock');
			let lockTime = 0;
			// 0: 5分钟 1: 30分钟 2: 1小时 3: 5小时
			switch (parseInt(type)) {
				case 0 : {
					lockTime = 5 * 60  * 1000;
					break;
				}
				case 1: {
					lockTime = 30 * 60 * 1000;
					break;
				}
				case 2: {
					lockTime = 60 * 60 * 1000;
					break;
				}
				case 3: {
					lockTime = 5 * 60 * 60 * 1000;
					break;
				}
			}

			let coumt = new Date().getTime() - time;
			if (coumt > lockTime) {
				// console.log("要锁屏", coumt, lockTime, time, type)
				if (this.global.currentPageName != 'ChangeLockPasswordPage') {
					this.refs.nav._navigation.push('ChangeLockPasswordPage', {type: 4});
				}
			} else {
				// console.log("不要锁屏", coumt, lockTime, time)
			}
		});
		this.timerTodoList.addTodoAction(action);
	}


	handleNavigationChange(prevState, newState, action) {
		function getCurrentRoute(newState) {
			let route = newState;
			while(route.routes) {
				route = route.routes[route.index]
			}
			return route.routeName;
		}
		this.global.currentPageName = getCurrentRoute(newState);
		this.global.routeList = newState.routes;
	}

	showCallModalAction(acation) {
		this.showCallModal = acation;
		setTimeout(()=>{
			this.global.call_modal_ref.showModal();
		})
	}

	render() {

		const opacity = this.animateValue.interpolate({
			inputRange: [0, 1],
			outputRange: [0, 1],
			extrapolate: 'clamp',
		});

		let removeView = this.needRemove ? null : (
			<Animated.View style={{opacity: opacity, backgroundColor: 'transparent', position: 'absolute', zIndex: 20}}>
				<ImageBackground
					resizeMode={'cover'}
					style={{width: width, height: height, backgroundColor: 'transparent'}}
					source={require('./assets/newimg/png/bg/bglogin/bg_login_img.png')}
				/>
			</Animated.View>
		);

		return (
			<ActionSheetProvider>
				<Fragment>
					{removeView}
					<Navigator ref="nav" onNavigationStateChange={this.handleNavigationChange.bind(this)}/>
					<Loading/>
					<Toast
						position='top'
						positionValue={50}
						fadeInDuration={750}
						fadeOutDuration={1000}
						ref={(toast)=>{this.toast = toast}}/>
					<Modal/>
					{this.showCallModal?<CallPageModal />: null}
					<TipModal />

				</Fragment>
			</ActionSheetProvider>
		);
	}
}
