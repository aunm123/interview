'use strict';
import React, {Fragment, Component} from 'react';
import {
	Text, View,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	Animated,
	Dimensions,
	Image,
} from 'react-native';
import moment from "moment";
import TextEx from "../TextEx";

export default class DataRow extends Component {
	constructor(props){
		super(props)
		this.date = props.date;
	}

	render() {

		let dateTitle = this.date?moment(this.date).format('DD/MM/YYYY'): '';

		return (
			<View style={styles.dateView}>
				<TextEx style={[styles.dateTitle]}>{dateTitle}</TextEx>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	dateTitle: {
		backgroundColor: "#F3F3F3",
		color: "#999999",
		fontSize: 12,
		paddingHorizontal: 7,
		paddingVertical: 3,
		borderRadius: 4,
	},
	dateView: {
		backgroundColor: "#FFF",
		justifyContent: "center",
		alignItems: "center",
		marginVertical: 6,
	}
});

