'use strict';
import {
	StyleSheet,
	Text,
	View,Platform,
	Animated,
	Easing
} from "react-native";
import React, {Fragment} from "react";
import SafeView from "../SafeView";

export default class BottomUp extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			bottomUpAnimate: new Animated.Value(0), // 初始值
			update: true,
			height: 0,
		}
	}

	componentDidMount() {
	}

	show(height, duration = 300){
		if(Platform.OS === "ios") {
			this.setState({update: false});
			Animated.timing(this.state.bottomUpAnimate, {
				toValue: height, // 目标值
				duration: duration, // 动画时间
				easing: Easing.linear, // 缓动函数
			}).start(()=>{
				this.setState({update: true})
			});
		} else {
			this.setState({update: false, height: height});
			Animated.timing(this.state.bottomUpAnimate, {
				toValue: 1, // 目标值
				duration: duration, // 动画时间
				easing: Easing.linear, // 缓动函数
				useNativeDriver: true,
			}).start(()=>{
				this.setState({update: true})
			});
		}
	}

	hide(duration = 300){
		console.log('hide');
		if(Platform.OS === "ios") {
			this.setState({update: false});
			Animated.timing(this.state.bottomUpAnimate, {
				toValue: 0, // 目标值
				duration: duration, // 动画时间
				easing: Easing.linear, // 缓动函数
			}).start(()=>{
				this.setState({update: true})
			});
		} else {
			this.setState({update: false,height: 0})
			Animated.timing(this.state.bottomUpAnimate, {
				toValue: 0, // 目标值
				duration: duration, // 动画时间
				easing: Easing.linear, // 缓动函数
				useNativeDriver: true,
			}).start(()=>{
				this.setState({update: true})
			});
		}


	}

	render() {
		if(Platform.OS === "ios") {
			return (
				<Animated.View style={[{height: this.state.bottomUpAnimate, overflow: 'hidden'}]}>
					<ContentView update={this.state.update}>
						{this.props.children}
					</ContentView>
				</Animated.View>
			)
		} else {
			return (
				<Animated.View style={[{height: this.state.height , overflow: 'hidden', transform: [{
						translateY: this.state.bottomUpAnimate.interpolate({
							inputRange: [0, 1],
							outputRange: [this.state.height, 0]
						}),
					}]}]}>
					<ContentView update={this.state.update}>
						{this.props.children}
					</ContentView>
				</Animated.View>
			)
		}

	}
}

class ContentView extends React.Component{
	constructor(props){
		super(props)
	}
	shouldComponentUpdate(nextProps, nextState, nextContext) {
		if (nextProps.update){
			return true
		}
		return false;
	}
	render() {
		return (
			<Fragment>
				{this.props.children}
			</Fragment>
		)
	}
}
