'use strict';

import React, {Fragment} from "react";
import {
	ActivityIndicator,
	StyleSheet,
	TouchableOpacity,
	Text, TouchableWithoutFeedback,
	View,
	Dimensions, Image, TextInput, Animated, Easing, PanResponder
} from "react-native";

var {height, width} = Dimensions.get('window');
import {inject, observer} from "mobx-react";
import {strings} from "../../../locales";
import Button from "../Button";

@inject('global')
@observer
export default class Modal extends React.Component {

	constructor(props) {
		super(props);
		let {global} = props;
		this.state = {
			isShowing: false,
			comRef: null,
			optionValue: new Animated.Value(0), // 初始值
			mode: 'bottom',
			bottom: 0,
			bgHide: true,
		};
		global.modalRef = this;
	}

	showModal(comRef = null, mode = 'bottom', bgHide = true) {
		if (!this.state.isShowing){
			Animated.timing(this.state.optionValue, {
				toValue: 1, // 目标值
				duration: 200, // 动画时间
				easing: Easing.ease, // 缓动函数
				useNativeDriver: true,
			}).start(() => {
			});
			this._panResponder = {};
			this.setState({isShowing: true, comRef, mode: mode, bgHide: bgHide});
		}
	}

	showPanResponder(comRef = null, mode = 'bottom', bgHide = true) {
		if (!this.state.isShowing){
			Animated.timing(this.state.optionValue, {
				toValue: 1, // 目标值
				duration: 200, // 动画时间
				easing: Easing.ease, // 缓动函数
				useNativeDriver: true,
			}).start(() => {
			});

			this.setState({isShowing: true, comRef, mode: mode, bottom: 0, bgHide: bgHide});

			this._panResponder = PanResponder.create({
				onStartShouldSetPanResponder: () => true,
				onMoveShouldSetPanResponder: () => true,
				onPanResponderGrant: () => {
					this._bottom = this.state.bottom;
				},
				onPanResponderMove: (evt, gs) => {
					let resultBottom = this._bottom - gs.dy;
					this.setState({
						bottom: Math.min(resultBottom, 0),
					})
				},
				onPanResponderRelease: (evt, gs) => {
					let resultBottom = Math.min(this._bottom - gs.dy, 0);
					this.setState({bottom: resultBottom});
					if (resultBottom < -50) {
						this.handlehide()
					} else {
						this.setState({bottom: 0});
					}
				}
			})
		}

	}

	handlehide() {
		if (this.state.bgHide){
			this.realyHide();
		}
	};

	realyHide() {
		if (this.state.isShowing) {
			Animated.timing(this.state.optionValue, {
				toValue: 0, // 目标值
				duration: 200, // 动画时间
				easing: Easing.ease, // 缓动函数
				useNativeDriver: true,
			}).start(() => {
				this.setState({isShowing: false, comRef: null, bottom: 0,});
			});
		}
	}


	render() {
		const {isShowing, comRef, optionValue} = this.state;

		// const height = layout.initHeight;
		const translateY = optionValue.interpolate({
			inputRange: [0, 1],
			outputRange: [200, 0],
			extrapolate: 'clamp',
		});

		const opacity = optionValue.interpolate({
			inputRange: [0, 1],
			outputRange: [0, 1],
			extrapolate: 'clamp',
		});

		let st;
		let v;
		switch (this.state.mode) {
			case 'top': {
				st = {top: 0};
				v = {left: 0, right: 0, position: 'absolute', bottom: this.state.bottom};
				break;
			}
			case 'middle': {
				st = {alignItems: 'center', justifyContent: 'center'};
				v = {};
				break;
			}
			case 'bottom': {
				st = {alignItems: 'center', justifyContent: 'flex-end',};
				v = {left: 0, right: 0, position: 'absolute', bottom: this.state.bottom};
				break;
			}
		}


		if (isShowing) {
			return (
				<View style={[{
					width: width,
					height: height,
					position: 'absolute',
					...st
				}]}>
					<Animated.View style={[styles.containerView, {opacity: opacity}]}>
						<TouchableOpacity activeOpacity={1}
										  style={{width: width, height: height, backgroundColor: 'transparent'}}
										  onPress={() => {
											  this.handlehide()
										  }}
						/>
					</Animated.View>
					<Animated.View {...this._panResponder.panHandlers}
								   style={[{transform: [{translateY}], ...v}]}>
						{comRef}
					</Animated.View>
				</View>

			)
		} else {
			return null;
		}


	}
}

const styles = StyleSheet.create({
	container: {
		width: width,
		height: height,
		left: 0, top: 0,
		position: 'absolute'
	},
	containerView: {
		backgroundColor: 'rgba(0,0,0,0.4)',
		width: width,
		height: height,
		position: 'absolute',

	}
});

