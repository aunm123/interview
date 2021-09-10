'use strict';
import {
	StyleSheet,
	Text,
	View,
} from "react-native";
import React, {Fragment} from "react";

export default class Line extends React.Component {

	constructor(props) {
		super(props);
		this.style = this.props.style?this.props.style:{}
	}

	render() {
		return (
			<View style={[{borderBottomWidth:1,borderBottomColor: "#E4E4E4"},this.style]} />
		)
	}
}
