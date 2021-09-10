'use strict';
import {
	StyleSheet,
	Text,
	View,
} from "react-native";
import React, {Fragment} from "react";
import SafeView from "./SafeView";
import TextEx from "./TextEx";
import TextExTitle from "./TextExTitle";

export default class NavBar extends React.Component {

	constructor(props) {
		super(props);
		this.title = this.props.title || "";
		this.bottom_line = true;
		this.barHeight = this.props.barHeight || 44;
		if (this.props.bottom_line != undefined) {
			this.bottom_line = this.props.bottom_line;
		}
		this.hasTitle = false;
		if (this.title.length>0 || this.props.centerRender) {
			this.hasTitle = true;
		}
	}

	render() {

		let center = <TextExTitle style={[styles.navbar_title, {lineHeight: this.barHeight}]}>{this.title}</TextExTitle>;

		if (this.props.centerRender) {
			center = this.props.centerRender
		}


		return (
			<View style={[styles.navbar, {borderBottomWidth: this.bottom_line ? 1 : 0, height: this.barHeight}]} >
				<View style={[styles.lmbtn, {height: this.barHeight}]}>
					{this.props.leftRender}
				</View>
				<View style={{flex: 1}} onTouchStart={this.props.onTouchStart}>
					{center}
				</View>
				<View style={[styles.rmbtn, {height: this.barHeight}]}>
					{this.props.rightRender}
				</View>
			</View>
		)
	}
}


const styles = StyleSheet.create({
	navbar: {
		borderBottomColor: '#E6E6E6',
		flexDirection: 'row',
		backgroundColor: 'white',
		zIndex: 200,
	},
	navbar_title: {
		fontSize: 18,
		textAlign: 'center',
		lineHeight: 25,
		fontWeight: '500',
	},
	lmbtn: {
		justifyContent: "center",
		alignItems: "center",
		paddingLeft: 5,
		position: 'absolute',
		left: 0,
		zIndex: 88,
		paddingTop: 5,
		paddingBottom: 5
	},
	rmbtn: {
		justifyContent: "center",
		alignItems: "center",
		paddingRight: 5,
		position: 'absolute',
		right: 0,
		zIndex: 88,
		paddingTop: 5,
	}
});
