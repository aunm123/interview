import React, {Fragment, Component} from 'react';
import {
	KeyboardAvoidingView, Platform
} from "react-native";


export default class KeyboardView extends Component {
	constructor(props){
		super(props);
		this.style = props.style;

		this.pro = {}
		if(Platform.OS === "ios") {
			this.pro = {
				behavior: 'padding'
			}
		}
	}

	render() {
		return (
			<KeyboardAvoidingView style={this.style} {...this.pro} >
				{this.props.children}
			</KeyboardAvoidingView>
		)
	}
}
