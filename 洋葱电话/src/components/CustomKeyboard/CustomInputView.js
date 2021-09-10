'use strict';
import MyKeyboard from './MyKeyboard'
import React, {Component, Fragment} from "react";
import {
	findNodeHandle,
	NativeModules,
	PanResponder,
	TextInput,
	View,
	NativeEventEmitter,
	Image,
	TouchableOpacity
} from "react-native";
import {string} from "prop-types";
import {install, register, setSelectLast, switchSystemKeyboard, uninstall} from "./index";
import {KeyboardType, KeyboardHeight} from "../../value/KeyBoardType";
import AppStyle from "../../Style";
import Icon from "../../value/Svg";
const {CustomKeyboard} = NativeModules;

register(KeyboardType.emoji, () => MyKeyboard);

export default class CustomInputView extends Component {
	static propTypes = {
		...TextInput.propTypes,
		customKeyboardType: string,
	};

	constructor(props) {
		super(props);
		this.state = {height: 0};
		this.onTapInputView = props.onTapInputView;
	}

	componentDidMount() {
		const CustomKeyboardEmitter = new NativeEventEmitter(CustomKeyboard);
		this.UIInputViewTouchEvent = CustomKeyboardEmitter.addListener('UIInputViewTouchEvent',
			() => {
			if (this.props.customKeyboardType != KeyboardType.normal) {
				this.onTapInputView();
			}
		});
		setTimeout(() => {
			if (this.props.customKeyboardType == KeyboardType.normal) {
				switchSystemKeyboard(findNodeHandle(this.input));
			} else {
				install(
					findNodeHandle(this.input),
					this.props.customKeyboardType,
					KeyboardHeight(this.props.customKeyboardType),
				);
				setSelectLast(findNodeHandle(this.input))
			}
		}, 500)
	}

	componentWillReceiveProps(newProps) {
		if (newProps.customKeyboardType !== this.props.customKeyboardType) {
			if (newProps.customKeyboardType == 'normal') {
				switchSystemKeyboard(findNodeHandle(this.input));
			} else {
				install(findNodeHandle(this.input),
					newProps.customKeyboardType,
					KeyboardHeight(this.props.customKeyboardType),
				);
				setSelectLast(findNodeHandle(this.input))
			}
		}
	}


	componentWillUnmount(): void {
		this.UIInputViewTouchEvent.remove();
		uninstall(findNodeHandle(this.input))
	}

	_onContentSizeChange(event) {
		this.setState({
			height: event.nativeEvent.contentSize.height,
		});
	}

	focus() {
		this.input.focus();
		setSelectLast(findNodeHandle(this.input))
	}

	setLastRange() {
		setSelectLast(findNodeHandle(this.input))
	}

	isFocused() {
		return this.input.isFocused()
	}

	blur() {
		return this.input.blur()
	}

	onRef = ref => {
		this.input = ref;
	};

	render() {
		// const {customKeyboardType, ...others} = this.props;
		// return <TextInput {...others} ref={this.onRef}/>;

		return (
			<Fragment>
				<TextInput
					{...this.props} //将自定义组件的所有属性交给TextInput
					ref={this.onRef}
					multiline={true}
					onContentSizeChange={this._onContentSizeChange.bind(this)}
					style={[...this.props.style, {height: Math.min(Math.max(36, this.state.height), 80)}]}
				/>
				<TouchableOpacity style={[{paddingRight: 10, position: 'absolute', right: 0, top: 4, bottom: 4,
					justifyContent: 'center', alignItems: 'center',
				}]}
								  onPress={() => {
								  	this.props.onEmojoBtnPress();
								  }}>
					<Icon icon={'chat_icon_expression'} size={24} color={'#4A90E2'}/>
				</TouchableOpacity>
			</Fragment>


		)
	}
}
