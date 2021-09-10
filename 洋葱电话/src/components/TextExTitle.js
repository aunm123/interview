'use strict';
import {
	Text,
} from "react-native";
import React, {Fragment} from "react";
import AppStyle from "../Style";

export default class TextExTitle extends React.Component {
	render() {
		return (
			<Text style={[AppStyle.titleFontFamily, {...this.props.style, fontWeight: 500}]} {...this.props}>
				{this.props.children}
			</Text>
		)
	}
}
