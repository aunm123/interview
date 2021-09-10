import React, {Component} from 'react';
import {string} from 'prop-types'
import {
	NativeModules,
	TextInput,
	findNodeHandle,
	AppRegistry,
} from 'react-native';
const {CustomKeyboard} = NativeModules;

const {
	install, uninstall,
	insertText, backSpace, doDelete,
	moveLeft, moveRight,
	switchSystemKeyboard,
	rangLastTextValue,
	setSelectLast,
} = CustomKeyboard;

const getTextValue = (tag) => {
	return new Promise((resolve => {
		rangLastTextValue(tag, (error,str)=>{
			if(error){
				resolve('')
			}  else{
				resolve(str);
			}
		})
	}))
}

const keyboardTypeRegistry = {};

export function register(type, factory) {
	keyboardTypeRegistry[type] = factory;
}

class CustomKeyboardContainer extends Component {
	render() {
		const {tag, type} = this.props;
		const factory = keyboardTypeRegistry[type];
		if (!factory) {
			console.warn(`Custom keyboard type ${type} not registered.`);
			return null;
		} else {
			console.log(factory)
		}
		const Comp = factory();
		return <Comp tag={tag}/>;
	}
}

AppRegistry.registerComponent("CustomKeyboard", () => CustomKeyboardContainer);


export {
	install, uninstall,
	insertText, backSpace, doDelete,
	moveLeft, moveRight,
	switchSystemKeyboard,
	getTextValue,
	setSelectLast,
};

