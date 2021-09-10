'use strict';
import React, {Fragment, Component} from 'react';
import {
	ActivityIndicator,
	StyleSheet,
	TouchableOpacity,
	Text, Animated,
	View, findNodeHandle,
	Dimensions, Image, TextInput,
	ScrollView, Keyboard, TouchableWithoutFeedback, Easing
} from "react-native";
import CameraRoll from "@react-native-community/cameraroll";

import {inject, observer} from "mobx-react";
import {strings} from "../../locales";
import AppStyle from "../Style";
import BottomUp from "./animate/BottomUp";
import Button from "./Button";
import {action, observable} from "mobx";
import SelectImageView from "./inputBottomView/SelectImageView";
import CustomInputView from "./CustomKeyboard/CustomInputView";
import {KeyboardHeight, KeyboardType} from "../value/KeyBoardType";
import Icon from "../value/Svg";

let {height, width} = Dimensions.get('window');

function InputWidthBtnWithCount(count) {
	let btnWidth = 40 * count + 60;
	let InputWidth = width - btnWidth;
	return InputWidth;
}

@inject('global')
@observer
export default class InputBar extends Component {

	@observable
	photos = [];
	@observable
	step = 2;
	@observable
	inputValue = '';
	@observable
	inputWidthAnimate = null;
	@observable
	isInputStartVisible = false;

	@observable
	keyboardType = 'normal';
	@observable
	bottomUpShowing = -1;

	constructor(props) {
		super(props);
		this.global = props.global;
		this.navigation = props.navigation;

		this.inputWidthAnimate = new Animated.Value(InputWidthBtnWithCount(2)),
			this.resize = this.props.onResize || (() => {
			});
		this.onSendPress = this.props.onSendPress || (() => {
		});

		this.onSendFilePress = this.props.onSendFilePress || (() => {
		});

		this.imageScrollRef = null;

		this.props.onRef(this);
		return this;
	}

	componentDidMount() {
		this.imageScrollRef = this.bottomUp;
	}

	setKeyBoardType(type) {
		this.keyboardType = type;
		let selecti = 1;
		switch (type) {
			case KeyboardType.normal : {
				selecti = 1;
				break;
			}
			case KeyboardType.emoji : {
				selecti = 3;
				break;
			}
		}
	}

	onKeyboardHeightChange(height, animated = true) {

		if (height == 0) {
			this.imageScrollRef.hide(190);
			return;
		}
		if (animated) {
			this.imageScrollRef.show(height, 190);
		} else {
			this.imageScrollRef.show(height, 0);
		}
		this.resize();
	}

	@action
	showBottomUpWithModal(modal) {

		if (this.imageScrollRef) {
			// bottom 已经初始化
			if (modal == 2) {
				this.inputBarImageBottomUp.showModal(modal);
				this.bottomUpShowing = modal;
				this.textinput.blur();
			} else {
				if (this.textinput.isFocused()) {
					// 键盘为打开状态，先放下键盘，直接切换到键盘状态，无动画
					if (modal == 1 || modal == 3) {
						// 为打开键盘状态时，无需关闭键盘，有动画
						this.inputBarImageBottomUp.showModal(modal);
					} else {
						this.textinput.blur();
						this.inputBarImageBottomUp.showModal(modal);
					}
					this.bottomUpShowing = modal;
				} else {
					// 键盘为关闭状态，直接切换到modal状态，有动画
					this.inputBarImageBottomUp.showModal(modal);
					this.bottomUpShowing = modal;
				}
			}


		}
	}


	hideBottomUp() {
		if (this.imageScrollRef) {
			this.imageScrollRef.hide();
			this.bottomUpShowing = -1;
			this.resize()
		}
	}

	scrollHidenImageScroll() {
		if (this.imageScrollRef && this.bottomUpShowing >= 0) {
			this.textinput.blur();
			this.imageScrollRef.hide();
			this.bottomUpShowing = -1;
		}
	}

	onChangeText(text) {
		this.changeStep1();
		this.inputValue = text;
	}

	changeStep1() {
		// 合并状态
		if (this.step != 1) {
			this.step = 1;
			Animated.timing(this.inputWidthAnimate, {
				toValue: InputWidthBtnWithCount(1), // 目标值
				duration: 300, // 动画时间
				easing: Easing.ease, // 缓动函数
			}).start();
		}
	}

	changeStep2() {
		this.textinput.setLastRange();
		// 展开状态
		if (this.step != 2) {
			this.step = 2;
			Animated.timing(this.inputWidthAnimate, {
				toValue: InputWidthBtnWithCount(2), // 目标值
				duration: 300, // 动画时间
				easing: Easing.ease, // 缓动函数
			}).start();
		}
	}

	sendBtnEnable(text) {
		if (text.replace(/(^\s*)|(\s*$)/g, "").length > 0) {
			return true;
		} else {
			return false;
		}
	}

	render() {

		let senable = this.sendBtnEnable(this.inputValue);

		let leftBtn = this.step == 2 ? (
			<Fragment>
				<View style={[{paddingLeft: 10}, AppStyle.row]}>
					<Button style={{paddingRight: 10}} onPress={() => {
						this.navigation.navigate('CameraPage', {
							sendBlock: (url) => {
								this.onSendFilePress(url);
							}
						});
					}}>
						{
							this.bottomUpShowing == 2 ? (
								<Icon icon={'chat_icon_camera_normal'} size={30} color={'#999'}/>
							) : (<Icon icon={'chat_icon_camera_normal'} size={30} color={'#4A90E2'}/>)
						}

					</Button>
					<TouchableOpacity style={[{paddingRight: 10}, AppStyle.row]}
									  onPress={() => {
										  this.showBottomUpWithModal(2)
									  }}>
						<Icon icon={'chat_icon_picture_normal'} size={30} color={'#4A90E2'}/>
					</TouchableOpacity>
				</View>
			</Fragment>
		) : (
			<TouchableOpacity style={[{paddingRight: 10, paddingLeft: 10}, AppStyle.row]}
							  onPress={() => {
								  this.changeStep2()
							  }}>
				<Icon icon={'chat_icon_recover'} size={30} color={'#4A90E2'}/>
			</TouchableOpacity>
		);

		let price = this.props.smsPrice + '洋葱币/条';
		return (
			<Fragment>
				<View style={[AppStyle.row, {alignSelf: 'flex-end', alignItems: 'center', paddingBottom: 6}]}>
					<View style={{flex: 1}}>
						{leftBtn}
					</View>
					<Animated.View style={{
						width: this.inputWidthAnimate,
						alignSelf: 'flex-end',
						alignItems: 'flex-end',
					}}>
						<TouchableOpacity style={{
							width: '100%', minHeight: 36, position: 'absolute',
							// zIndex: this.step == 1 ? -1 : 10
						}}
										  onPress={() => {
											  this.textinput.focus();
											  this.changeStep1()
											  this.setKeyBoardType(KeyboardType.normal);
										  }}/>

						<CustomInputView
							customKeyboardType={this.keyboardType}
							ref={(textinput) => {
								this.textinput = textinput
							}}
							style={[styles.inputView, {width: '100%', paddingRight: 40}]}
							returnKeyType="send"
							placeholder={price}
							value={this.inputValue}
							onFocus={() => {
								this.changeStep1();
								this.inputBarImageBottomUp.showModal(1);
							}}
							onBlur={() => {
								this.changeStep2();
								setTimeout(() => {
									if (this.bottomUpShowing != 2) {
										this.imageScrollRef.hide(190)
									}
								}, 100)
								this.setKeyBoardType(KeyboardType.normal);
							}}
							onChangeText={(text) => this.onChangeText(text)}
							onTapInputView={() => {
								this.changeStep1();
								this.setKeyBoardType((KeyboardType.normal))
							}}
							onEmojoBtnPress={() => {

								if (this.textinput.isFocused()) {
									if (this.keyboardType == KeyboardType.normal) {
										this.setKeyBoardType(KeyboardType.emoji);
										this.showBottomUpWithModal(3);
									} else {
										this.setKeyBoardType(KeyboardType.normal);
										this.showBottomUpWithModal(1);
									}
								} else {
									this.setKeyBoardType(KeyboardType.emoji);
									this.textinput.focus();
									this.showBottomUpWithModal(3);
								}
							}}
						/>

					</Animated.View>
					<TouchableOpacity style={[{paddingHorizontal: 10}, AppStyle.row]}
									  disabled={!senable}
									  onPress={() => {
										  if (parseFloat(this.global.userData.balance) < parseFloat(this.props.smsPrice)) {
											  this.global.noMoneyAction();
											  return;
										  }
										  this.onSendPress(this.inputValue);
										  this.inputValue = '';
									  }}>
						{
							senable ?
								<Icon icon={'chat_icon_send_click'} size={30} color={'#4A90E2'}/> :
								<Icon icon={'chat_icon_send_unclick'} size={30} color={'#4A90E2'}/>
						}
					</TouchableOpacity>
				</View>
				<BottomUp ref={(bottomUp) => {
					this.bottomUp = bottomUp
				}}>
					<InputBarImageBottomUp
						ref={(inputBarImageBottomUp) => {
							this.inputBarImageBottomUp = inputBarImageBottomUp
						}}
						onKeyboardHeightChange={(height, animated) => {
							this.onKeyboardHeightChange(height, animated)
						}}
						navigation={this.navigation}
						sendFile={(file) => {
							this.onSendFilePress(file);
							this.hideBottomUp();
						}}>
					</InputBarImageBottomUp>
				</BottomUp>
			</Fragment>

		)
	}
}

@observer
class InputBarImageBottomUp extends Component {

	@observable
	modal = 1;

	keyboardHeight = 0;

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.sendFile = props.sendFile;
		this.onKeyboardHeightChange = props.onKeyboardHeightChange;
	}

	componentDidMount(): void {
		this.keyboardWillShow = Keyboard.addListener(
			'keyboardWillShow',
			this.keyboardWillShow.bind(this),
		);
		this.keyboardDidHide = Keyboard.addListener(
			'keyboardWillHide',
			this.keyboardDidHide.bind(this),
		);
	}

	componentWillUnmount(): void {
		this.keyboardWillShow.remove();
		this.keyboardDidHide.remove();
	}

	keyboardDidHide() {
		this.keyboardHeight = 0;
		if (this.modal == 2) {

		} else {
			this.onKeyboardHeightChange(0, true);
		}
	}

	keyboardWillShow(keyboardEvent) {
		if (this.modal == 2) {
			this.modal = 1;
		}
		let keyboardHeight = keyboardEvent.endCoordinates.height;
		// if (keyboardHeight > 300) {
		// 	keyboardHeight -= 30;
		// }
		if (this.keyboardHeight > 0) {
			this.onKeyboardHeightChange(keyboardHeight, true);
		} else {
			this.onKeyboardHeightChange(keyboardHeight, true);
		}
		this.keyboardHeight = keyboardHeight;
	}

	showModal(modal) {
		this.modal = modal;
		let height = 0;
		switch (modal) {
			case 1: {
				height = 258;
				break;
			}
			case 2: {
				height = 258;
				this.onKeyboardHeightChange(height);
				break;
			}
			case 3: {
				height = KeyboardHeight(KeyboardType.emoji);
				break;
			}
		}
		return height;
	}

	imageModal() {
		return (
			<SelectImageView sendFile={this.sendFile} navigation={this.navigation}/>
		)
	}

	EmojectModal() {
		return (
			<View style={{width: width, height: 600}}/>
		)
	}

	render() {
		let view = null;
		switch (this.modal) {
			case 1: {
				view = this.EmojectModal();
				break;
			}
			case 2: {
				view = this.imageModal();
				break;
			}
			case 3: {
				view = this.EmojectModal();
			}
		}
		return (
			<View style={styles.container}>
				{view}
			</View>
		)
	}
}


const styles = StyleSheet.create({
	inputView: {
		lineHeight: 20,
		fontSize: 14,
		backgroundColor: "#F5F5F5",
		borderRadius: 18,
		padding: 0,
		paddingTop: 7,
		paddingHorizontal: 10,
		minHeight: 36
	},
	imageRow: {
		width: 144,
		height: 258,
	},
	container: {
		alignItems: 'center',
		height: 258,
		flexDirection: "row",
	},
	image: {
		width: "100%",
		height: "100%",
	},
	absolute: {
		position: "absolute",
		width: "100%",
		height: "100%",
		left: 0,
		top: 0
	},
	sendImageBtn: {
		justifyContent: "center",
		alignItems: "center",
		width: 38,
		height: 38,
		borderRadius: 19,
		backgroundColor: "rgba(0,0,0,0.4)"
	},
	moreImageBtn: {
		justifyContent: "center",
		alignItems: "center",
		width: 38,
		height: 38,
		borderRadius: 19,
	},
	sendImageBtnText: {
		color: "white",
		fontSize: 12
	}
});

