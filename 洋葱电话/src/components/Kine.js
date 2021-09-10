'use strict';
import {
	StyleSheet,
	Text,
	View,
} from "react-native";
import React, {Fragment} from "react";

export default class Kine extends React.Component {

	constructor(props) {
		super(props);
		this.style = this.props.style?this.props.style:{}
	}

	render() {
		return (
			<View style={[{borderLeftWidth:1, borderLeftColor: "#E4E4E4", height: '100%'},this.style]} />
		)
	}
}
