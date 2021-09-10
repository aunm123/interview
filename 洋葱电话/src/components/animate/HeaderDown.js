'use strict';
import {
	StyleSheet,
	Text,
	View,
	Animated,
	Easing
} from "react-native";
import React, {Fragment} from "react";
import SafeView from "../SafeView";

export default class HeaderDown extends React.Component {
	constructor(props) {
		super(props);
		this.style = props.style|| {};
		this.state = {
			downAnimate: new Animated.Value(0), // 初始值
			viewHeight : 0,
			isShow: false,
		};
		this.heightAn = null;
	}

	componentDidMount() {
	}

	show(height, duration = 300){
		this.setState({viewHeight: height, isShow: true});
		Animated.timing(this.state.downAnimate, {
			toValue: 1, // 目标值
			duration: duration, // 动画时间
			easing: Easing.ease, // 缓动函数
			useNativeDriver: true,
		}).start();
	}

	hide(duration = 300){
		Animated.timing(this.state.downAnimate, {
			toValue: 0, // 目标值
			duration: duration, // 动画时间
			easing: Easing.ease, // 缓动函数
			useNativeDriver: true,
		}).start(()=>{
			this.setState({isShow: false});
		});
	}

	render() {
		return (
			<View style={[this.style, {zIndex: this.state.isShow?99:-1}]}>
				<Animated.View style={[{transform: [{
						translateY: this.state.downAnimate.interpolate({
							inputRange: [0, 1],
							outputRange: [-44,0]
						}),
					}], opacity: this.state.downAnimate.interpolate({
						inputRange: [0, 1],
						outputRange: [0, 1]
					}), overflow: 'hidden'}]}>
					{this.props.children}
				</Animated.View>
			</View>
		)
	}
}
