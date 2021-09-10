import React, {Fragment, Component} from 'react';
import {
	ScrollView,
	StatusBar,
	Dimensions,
	Text,
	Image,
	ImageBackground,
	View,
	NativeModules,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Animated,
	Easing,
	Platform,
	PermissionsAndroid,
} from 'react-native';
import {strings} from "../../../locales"

let FIRST_IMAGE = require('../../assets/newimg/png/bg/bgloading/bg_loading_page_img.png');
let GIF_IMAGE = require('../../assets/img/openLoading.gif');
let LAST_IMAGE = require('../../assets/newimg/png/bg/bglogin/bg_login_img.png');
let S_BG = require('../../assets/img/bg/bg.png');

let {height, width} = Dimensions.get('window');
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
import Colors from '../../Color';
import {inject, observer} from "mobx-react/index";
import Button from "../../components/Button";
import AppStyle from "../../Style";
import SafeView from "../../components/SafeView";
import TextEx from "../../components/TextEx";
import {observable, action, computed, toJS} from 'mobx'
import LottieView from 'lottie-react-native';
import BaseComponents from "../../BaseComponents";

@inject('store', 'global')
@observer
export default class LoginHome extends BaseComponents {

	@observable
	finish = false;

	constructor(props) {
		super(props);
		this.store = props.store;
		this.global = props.global;
		this.navigation = props.navigation;

		this.state = {
			progress: new Animated.Value(0),
			fadeOutOpacity: new Animated.Value(0),
			upAndOutOpacty: new Animated.Value(0),
		};

	}

	componentDidMount() {
		this.waiteDB().then();

		Animated.timing(this.state.progress, {
			toValue: 1,
			duration: 3000,
			easing: Easing.linear,
		}).start(() => {
			this.finish = true;
		});

		Animated.timing(this.state.fadeOutOpacity, {
			toValue: 1,
			duration: 400,
			easing: Easing.linear,
			delay: 600,
		}).start(() => {
			this.finish = true;
		});

		Animated.timing(this.state.upAndOutOpacty, {
			toValue: 1,
			duration: 400,
			easing: Easing.linear,
			delay: 600,
		}).start(() => {
			this.finish = true;
		});

	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	async waiteDB() {
		if (Platform.OS === "android") {
			await PermissionsAndroid.request(
				PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
					'title': strings('Permissions.contacts'),
					'message': strings('Permissions.read_contacts')
				}
			);
		}
	}

	render() {

		const transY = this.state.upAndOutOpacty.interpolate({
			inputRange: [0, 1],
			outputRange: [40, 0]
		});

		const opacity = this.state.upAndOutOpacty.interpolate({
			inputRange: [0, 1],
			outputRange: [0, 1]
		});


		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<View>
					<LottieView style={{width: width, height: height}}
								source={require('../../assets/open/YC.json')}
								progress={this.state.progress}/>

					<View style={{
						zIndex: 100, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
						justifyContent: 'center', alignItems: 'center'
					}}>
						<SafeView>
							<View style={{
								zIndex: 100, position: 'absolute', left: 0, right: 0, bottom: 100,
								justifyContent: 'center', alignItems: 'center'
							}}>
								<AnimatedTouchable
									style={[styles.loginBtn, {opacity: this.finish ? 1 : this.state.fadeOutOpacity}]}
									onPress={() => {
										this.navigation.push('Login', {islogin: 1})
									}}>
									<TextEx style={{color: '#FFF', textAlign: 'center', fontSize: 16, lineHeight: 44}}>
										{strings('login_home.login')}
									</TextEx>
								</AnimatedTouchable>
								<Animated.View style={[{
									margin: 16, height: 20, width: width, alignItems: 'center',
									justifyContent: 'center', opacity: opacity,
									transform: [{translateY: transY}]
								}, AppStyle.row]}>
									<TextEx style={{color: '#999', fontSize: 14, lineHeight: 22, marginRight: 5}}>
										{strings('login_home.no_account')}
									</TextEx>
									<Button onPress={() => {
										this.navigation.push('CreateAccount');
									}}>
										<TextEx style={{
											color: '#333',
											textDecorationLine: 'underline',
											fontSize: 14,
											lineHeight: 22
										}}>
											{strings('login_home.create_account')}
										</TextEx>
									</Button>
								</Animated.View>
							</View>
						</SafeView>
					</View>
				</View>

			</Fragment>
		)
	}
}

const styles = StyleSheet.create({
	scrollView: {
		backgroundColor: Colors.lighter,
		minHeight: height,
	},
	button: {
		alignItems: 'center',
		backgroundColor: '#DDDDDD',
		padding: 20,
		marginTop: 20,
	},
	title: {
		fontFamily: 'PingFangSC-Regular',
	},
	content: {
		justifyContent: 'flex-start',
		alignItems: 'center',
		height: height / 2.0,
		marginTop: height / 2.0,
		paddingTop: 55,
		zIndex: 100
	},
	content_title: {
		color: '#FFF',
		fontSize: 27,
		lineHeight: 29,
		marginTop: 50
	},
	loginBtn: {
		backgroundColor: '#4A90E2',
		borderRadius: 30,
		width: 243,
		minHeight: 44
	},
});
