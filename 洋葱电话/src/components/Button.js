import React, {Component} from "react";
import {TouchableOpacity, View, Keyboard, StyleSheet} from "react-native";

class Button extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			disabled: true
		};
		this.lastClickTime = 0;
	}

	onPress() {
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
			if (this.props.onPress) {
				this.props.onPress()
			} else {
				return ''
			}
		}
	}

	onLongPress() {
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
			if (this.props.onLongPress) {
				this.props.onLongPress()
			} else {
				return ''
			}
		}
	}

	render() {
		return (
			<TouchableOpacity
				onPress={() => {
					this.onPress();
					Keyboard.dismiss();
				}}
				onLongPress={() => {
					this.onLongPress();
					Keyboard.dismiss();
				}}
				delayLongPress={300}
				onPressOut={this.props.onPressOut}
				activeOpacity={this.props.activeOpacity || 0.85}
				style={[this.props.style, this.props.disabled ? styles.unUserFully : styles.userFully]}
				disabled={this.props.disabled}
			>
				{this.props.children}
			</TouchableOpacity>)
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

export default Button
