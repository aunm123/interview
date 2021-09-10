'use strict';
import React, {Fragment, Component} from 'react';
import {
	Easing,
	Text, View,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	Animated,
	Dimensions,
	Image,
	ImageBackground, NativeModules, NativeEventEmitter
} from 'react-native';
import {inject, observer} from "mobx-react";
import SafeView from "../../components/SafeView";
import Draggable from "../../components/animate/Draggable";
import {observable} from "mobx";
import LoginHome from "../login/LoginHome";
import CallingPage from "./CallingPage";
import BaseComponents from "../../BaseComponents";

var {height, width} = Dimensions.get('window');


@inject('store', 'global')
@observer
export default class CallPageModal extends BaseComponents {

	@observable
	animatedValue = new Animated.Value(0);
	@observable
	animatedYValue = new Animated.Value(0);
	@observable
	top = 0;
	@observable
	left = 0;
	@observable
	display = false;

	constructor(props) {
		super(props);
		this.store = props.store;
		this.global = props.global;
		this.navigation = props.navigation;

		this.global.call_modal_ref = this;

	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	showModal(){
		Animated.timing(this.animatedYValue, {
			toValue: 1, // 目标值
			duration: 200, // 动画时间
			easing: Easing.ease, // 缓动函数
			// useNativeDriver: true,
		}).start(()=>{});
	}

	handlehide() {
		Animated.timing(this.animatedYValue, {
			toValue: 0, // 目标值
			duration: 200, // 动画时间
			easing: Easing.ease, // 缓动函数
			// useNativeDriver: true,
		}).start(()=>{});
	};

	_startAnimated() {
		this.animatedValue.setValue(0);
		Animated.timing(
			this.animatedValue,
			{
				toValue: 1,
				duration: 200,
				easing: Easing.in,
			}
		).start(()=>{
			this.display = true;
		});
	}

	_rebackAnimated() {
		this.animatedValue.setValue(1);
		Animated.timing(
			this.animatedValue,
			{
				toValue: 0,
				duration: 200,
				easing: Easing.in,
			}
		).start(()=>{

		});
	}

	toggleAnimated() {
		if (this.animatedValue._value == 0) {
			this._startAnimated();
		} else {
			this.display = false;
			this._rebackAnimated();
		}
	}


	render() {

		const translateY = this.animatedYValue.interpolate({
			inputRange: [0, 1],
			outputRange: [height, 0],
		});

		const widthAnimated = this.animatedValue.interpolate({
			inputRange: [0, 1],
			outputRange: [width, 80]
		});

		const heightAnimated = this.animatedValue.interpolate({
			inputRange: [0, 0.1, 1],
			outputRange: [height, width, 80]
		});

		const topAnimated = this.animatedValue.interpolate({
			inputRange: [0, 1],
			outputRange: [0, this.top]
		});

		const stopAnimated = this.animatedValue.interpolate({
			inputRange: [0, 1],
			outputRange: [0, this.top * -1]
		});

		const sleftAnimated = this.animatedValue.interpolate({
			inputRange: [0, 1],
			outputRange: [0, this.left * -1]
		});

		const leftAnimated = this.animatedValue.interpolate({
			inputRange: [0, 1],
			outputRange: [0, this.left]
		});

		const borderRadiusAnimated = this.animatedValue.interpolate({
			inputRange: [0, 0.1, 1],
			outputRange: [0, width, width]
		});

		return (
			<Fragment>
				<Animated.View
					style={{
						position: 'absolute',
						left: leftAnimated,
						top: topAnimated,
						width: widthAnimated,
						height: heightAnimated,
						backgroundColor: 'rgba(0,0,0,0.5)',
						borderRadius: borderRadiusAnimated,
						overflow: 'hidden',
						display: !this.display ? 'flex' : 'none',
						transform: [{translateY}]
					}}>
					<Animated.View style={{width: width, height: height, position: 'absolute', top: stopAnimated, left: sleftAnimated}}>
						<CallingPage navigation={this.navigation} hiddenPhone={()=>{
							this.toggleAnimated();
						}}/>
					</Animated.View>
				</Animated.View>

				<Draggable style={{display: this.display ? 'flex' : 'none'}}
						   onPositionChange={(top, letf) => {
							   this.top = top;
							   this.left = letf;
						   }} onPress={() => {
					this.toggleAnimated();
				}}/>
			</Fragment>
		)
	}
}
const styles = StyleSheet.create({});
