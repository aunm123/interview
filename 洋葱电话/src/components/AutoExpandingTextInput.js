import React, {Component} from 'react';
import {
	AppRegistry,
	StyleSheet,
	TextInput,
	View,
	Text
} from 'react-native';
import {CustomTextInput} from "./CustomKeyboard";

//自定义的高度动态调整组件
class AutoExpandingTextInput extends Component {
	constructor(props) {
		super(props);
		this.state = {height: 0};
	}

	_onContentSizeChange(event) {
		this.setState({
			height: event.nativeEvent.contentSize.height,
		});
	}

	focus() {
		this.textinput.focus();
	}

	isFocused() {
		return this.textinput.isFocused()
	}

	blur() {
		return this.textinput.blur()
	}

	render() {
		return (
			<TextInput {...this.props} //将自定义组件的所有属性交给TextInput
					   ref={(textinput) => {
						   this.textinput = textinput
					   }}
					   multiline={true}
					   onContentSizeChange={this._onContentSizeChange.bind(this)}
					   style={[...this.props.style, {height: Math.min(Math.max(36, this.state.height), 80)}]}
			/>
		);
	}
}


export default AutoExpandingTextInput;
