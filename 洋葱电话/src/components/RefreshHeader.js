import React,{ Component } from "react";
import {TouchableOpacity, View, Keyboard, Animated, Text, StyleSheet} from "react-native";
import TextEx from "./TextEx";
import BaseComponents from "../BaseComponents";

export default class RefreshHeader extends BaseComponents {
	constructor(props) {
		super(props);
		this.state = {
			pullDistance: props.pullDistance,
			percent: props.percent,
			refreshEnd: props.refreshEnd,
		};
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	setProgress({ pullDistance, percent }) {
		this.setState({
			pullDistance,
			percent,
		});
	}

	UNSAFE_componentWillReceiveProps(nextProps) {
		this.setState({
			pullDistance: nextProps.pullDistance,
			percent: nextProps.percent,
			refreshEnd: nextProps.refreshEnd,
		});
	}

	render() {
		if (this.state.refreshEnd){
			return (
				<View style={[headerStyle.con, { opacity: 1 }]}>
					<TextEx style={headerStyle.title}>{'加载完毕'}</TextEx>
				</View>
			)
		}

		const { percentAnimatedValue, percent, refreshing } = this.props;
		const { percent: statePercent, pullDistance } = this.state;
		let text = '下拉刷新';
		if (statePercent >= 1) {
			if (refreshing) {
				text = '正在加载...';
			} else {
				text = '释放刷新';
			}
		}
		return (
			<Animated.View style={[headerStyle.con, { opacity: percentAnimatedValue }]}>
				<TextEx style={headerStyle.title}>{text}</TextEx>
			</Animated.View>
		);
	}
}

const headerStyle = StyleSheet.create({
	con: {
		height: 50,
		justifyContent: 'center',
	} ,
	title: {
		lineHeight: 50,
		justifyContent: 'center',
		alignSelf: 'center',
		fontSize: 14,
		color: '#333',
		flex: 1,
		textAlign: 'center'
	},
});

