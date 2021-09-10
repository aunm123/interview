'use strict';
import React, {Fragment} from "react";
import { SafeAreaView } from "react-navigation";
import {StyleSheet, View} from "react-native";

export default class SafeView extends React.Component {

	constructor(props) {
		super(props);
		this.style = this.props.style?this.props.style:{}
	}

	render() {
		return (
			<SafeAreaView style={[this.style, styles.saf]}
						  forceInset={{ top: 'always' }}
						  onTouchStart={this.props.onTouchStart}>
				{this.props.children}
			</SafeAreaView>
		)
	}
}

const styles = StyleSheet.create({
	saf: {
		flex: 1,
	}
})
