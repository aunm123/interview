'use strict';

import React, {Fragment} from "react";
import {
	ActivityIndicator,
	StyleSheet,
	TouchableOpacity,
	Text, TouchableWithoutFeedback,
	View,
	Dimensions, Image, TextInput, Animated, Easing
} from "react-native";

let sc_width = Dimensions.get('window').width;
let sc_height = Dimensions.get('window').height;
import {inject, observer} from "mobx-react";
import {strings} from "../../../locales";
import Button from "../Button";
import {observable} from "mobx";

const An = {
	topLeft: 1,
	topRight: 2,
	bottomLeft: 3,
	bottomRight: 4
};

class ThreeAngular extends React.Component {

	constructor(props) {
		super(props);

		this.color = props.color;
		this.an = props.an || An.topLeft;
		this.h = props.h;
		this.w = props.w;
	}

	render() {

		let rotateZ;
		let top;
		let left;
		if (this.an === An.topLeft) {
			rotateZ = '90deg';
			top = -17;
			left = 15;
		}
		if (this.an === An.topRight) {
			rotateZ = '90deg';
			top = -17;
			left = this.w - 40;
		}
		if (this.an === An.bottomLeft) {
			rotateZ = '270deg';
			top = this.h - 3;
			left = 15;
		}
		if (this.an === An.bottomRight) {
			rotateZ = '270deg';
			top = this.h - 3;
			left = this.w - 40;
		}

		return (
			<View style={{
				width: 0,
				height: 0,
				borderTopWidth: 10,
				borderTopColor: 'transparent',
				borderRightWidth: 10,
				borderRightColor: this.color,
				borderLeftWidth: 5,
				borderLeftColor: 'transparent',
				borderBottomWidth: 10,
				borderBottomColor: 'transparent',
				transform: [{rotateZ: rotateZ}],
				position: 'absolute',
				top: top,
				left: left,
				zIndex: 99
			}}/>
		)
	}
}

@inject('global')
@observer
export default class TipModal extends React.Component {

	x = 0;
	y = 0;
	w = 0;
	h = 0;
	an = An.topLeft;
	color;
	comRef = null;
	@observable
	isShowing = false;

	constructor(props) {
		super(props);
		let {global} = props;
		this.optionValue = new Animated.Value(0) // 初始值
		global.tip_modal_ref = this;
	}

	initModalPosition({x, y, width, height, pageX, pageY}, {w, h}) {
		let xoff = 0;
		let yoff = pageY + height + 10;
		let isLeft = true;
		let isTop = true;
		let an;
		if (pageX < sc_width / 2) {
			// 锚点在左边
			xoff = pageX - 15 + width/2;
			isLeft = true;
		} else {
			// 锚点在右边
			xoff = pageX - w + 30 + width/2;
			isLeft = false;
		}

		if (pageY < sc_height / 2) {
			// 锚点在上面
			yoff = pageY + height + 15;
			isTop = true;
		} else {
			// 锚点在下面
			yoff = pageY + height - 15 - h;
			isTop = false;
		}

		if (isLeft) {
			if (isTop) {
				an = An.topLeft;
			} else {
				an = An.bottomLeft;
			}
		} else {
			if (isTop) {
				an = An.topRight;
			} else {
				an = An.bottomRight;
			}
		}

		this.x = xoff;
		this.y = yoff;
		this.w = w;
		this.h = h;
		this.an = an;

	}

	showModal(comRef = null, position, {w, h}, color) {

		this.initModalPosition(position, {w, h});

		Animated.timing(this.optionValue, {
			toValue: 1, // 目标值
			duration: 200, // 动画时间
			easing: Easing.linear, // 缓动函数
			useNativeDriver: true,
		}).start(() => {
		});
		this.color = color;
		this.comRef = comRef;
		this.isShowing = true;

	}

	handlehide() {
		Animated.timing(this.optionValue, {
			toValue: 0, // 目标值
			duration: 200, // 动画时间
			easing: Easing.ease, // 缓动函数
			useNativeDriver: true,
		}).start(() => {
			this.isShowing = false;
			this.comRef = null;
		});
	};


	render() {

		const opacity = this.optionValue.interpolate({
			inputRange: [0, 1],
			outputRange: [0, 1],
			extrapolate: 'clamp',
		});


		if (this.isShowing) {
			return (
				<View style={{width: sc_width, height: sc_height, position: 'absolute'}}>
					<Animated.View style={[styles.containerView, {opacity: opacity}]}>
						<TouchableOpacity activeOpacity={1}
										  style={{width: '100%', height: '100%', backgroundColor: 'transparent'}}
										  onPress={() => {
											  this.handlehide()
										  }}
						/>

						<View style={{position: 'absolute', top: this.y, left: this.x}}>
							<View style={{position: 'relative'}}>
								<ThreeAngular an={this.an} w={this.w} h={this.h} color={this.color}/>
								{this.comRef}
							</View>
						</View>
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
		width: sc_width,
		height: sc_height,
		left: 0, top: 0,
		position: 'absolute'
	},
	containerView: {
		backgroundColor: 'rgba(0,0,0,0)',
		width: sc_width,
		height: sc_height,
		position: 'absolute',

	}
});

