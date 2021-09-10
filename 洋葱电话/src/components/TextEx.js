'use strict';
import {
	Text,
} from "react-native";
import React, {Fragment} from "react";
import AppStyle from "../Style";

export default class TextEx extends React.Component {
	render() {
		return (
			<Text style={[AppStyle.mainFontFamily, this.props.style]} {...this.props}>
				{this.props.children}
			</Text>
		)
	}
}
