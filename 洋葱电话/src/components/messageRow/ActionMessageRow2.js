'use strict';
import React, {Fragment, Component} from 'react';
import {
	Text, View,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	Animated,
	Dimensions,
	Image, Alert,
} from 'react-native';
import AppStyle from "../../Style";
import {observable, toJS} from "mobx";
import Util from "../../global/Util";
import moment from "moment";
import Button from "../Button";
import TextEx from "../TextEx";
import HTML from "react-native-render-html";
import BaseComponents from "../../BaseComponents";

export default class ActionMessageRow2 extends BaseComponents {

	// content={item.content} date={item.date} phone={item.tophone} isLeft={false} state={item.state}
	constructor(props) {
		super(props);

		this.data = props.data;
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	render() {

		return (
			<View style={[styles.dateView]}>
				<View style={{maxWidth: "80%", alignSelf: "flex-start" }}>
					<View>
						<View style={[styles.left, {flex: 1}]}>
							<HTML baseFontStyle={styles.ldateTitle}
								  html={this.data.content} imagesMaxWidth={Dimensions.get('window').width} />
						</View>
					</View>
				</View>
				<View style={{flex: 1}} />
			</View>
		);
	}
}

const styles = StyleSheet.create({
	ldateTitle: {
		color: "#333",
		fontSize: 14,
		paddingHorizontal: 5,
		paddingVertical: 3,
		minWidth: 200,
		lineHeight: 18,
	},
	dateView: {
		paddingHorizontal: 12,
		backgroundColor: "#FFF",
		justifyContent: "center",
		marginVertical: 6,
		flexDirection: 'row',
	},
	left: {
		backgroundColor: "#bcd9fb",
		borderTopLeftRadius: 0,
		overflow: "hidden",
		borderBottomLeftRadius: 8,
		borderTopRightRadius: 8,
		borderBottomRightRadius: 8,
		padding: 8
	},
	ldateText: {
		color: "#333",
		fontSize: 12,
		alignSelf: "flex-start",
		marginTop: 3,
		marginRight: 20
	},
});

