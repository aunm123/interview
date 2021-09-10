import React,{ Component } from "react";
import {TouchableOpacity, View, Keyboard, StyleSheet, TouchableHighlight} from "react-native";

class ButtonEx extends React.Component{
	constructor(props) {
		super(props);
		this.state = {
			disabled: true
		};
		this.lastClickTime = 0;
	}

	onPress () {
		const clickTime = Date.now();

		let enabled = false;
		if (this.lastClickTime == 0) {
			// 第一次点击
			enabled = true;
		} else {
			if (clickTime - this.lastClickTime > 350) {
				// 可点击
				enabled = true;
			} else {
				// 不可点击
				enabled = false;
			}
		}

		if (enabled) {
			this.lastClickTime = clickTime;
			if(this.props.onPress){
				this.props.onPress()
			}else{
				return ''
			}
		}
	}

	render() {
		return (
			<TouchableHighlight
				activeOpacity={1}
				underlayColor='#EEE'
				onPress={()=>{
					this.onPress();
					Keyboard.dismiss();
				}}
				onLongPress = {this.props.onLongPress}
				onPressOut = {this.props.onPressOut}
				// activeOpacity={this.props.activeOpacity || 0.85}
				style={[this.props.style, this.props.disabled? styles.unUserFully: styles.userFully]}
				disabled={this.props.disabled}
			>
				{this.props.children}
			</TouchableHighlight>)
	}
}

const styles = StyleSheet.create({
	userFully: {
		opacity: 1,
	},
	unUserFully: {
		opacity: 0.5,
	}
});

export default ButtonEx
