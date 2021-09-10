'use strict';
import React, {Fragment, Component} from 'react';
import {
	Text, View,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	Animated,
	Dimensions,
	Image, TouchableHighlight,
} from 'react-native';
import AppStyle from "../../Style";
import moment from "moment";
import Icon from "../../value/Svg";
import {toJS} from "mobx";
import Util from "../../global/Util";
import {strings} from "../../../locales";

export default class PhoneRow extends Component {
	constructor(props) {
		super(props)
		this.time = props.time || "0";
		this.date = props.date || "";
		this.isLeft = props.isLeft || false;
		this.time = parseInt(this.time);
		this.phone = props.phone || "";
	}

	render() {

		let date = this.date ? moment(this.date).format('HH:mm') : '';

		let title = "";
		let icon = "";
		let phone = "";
		if (this.isLeft) {
			if (this.time > 0) {
				title = "通话成功";
				icon = 'msg_list_answered_in';
				phone = strings("other.call_in") + this.phone;
			} else {
				title = "未接电话";
				icon = 'msg_list_unanswered_in';
				phone = strings("other.call_in") + this.phone;
			}
		} else {
			if (this.time > 0) {
				title = "通话成功";
				icon = 'msg_list_answered_out';
				phone = strings("other.call_out") + this.phone;
			} else {
				title = "无人接听";
				icon = 'msg_list_unanswered_out';
				phone = strings("other.call_out") + this.phone;
			}
		}

		return (
			<View style={[styles.dateView]}>
				<TouchableOpacity activeOpacity={0.6} onPress={() => {
					if (this.props.onPress) {
						this.props.onPress();
					}
				}}>
					<View>
						<Text style={[this.isLeft ? styles.ldateText : styles.rdateText]}>{date}</Text>
						<View style={[AppStyle.row, {alignSelf: 'center', alignItems: 'center'}]}>
							<Text
								style={[this.isLeft ? styles.ldateTitle : styles.rdateTitle, {lineHeight: 25}]}>{title}</Text>
							<Icon icon={icon} size={20} color={'#4A90E2'}/>
						</View>
						<Text style={[this.isLeft ? styles.ldateText : styles.rdateText]}>{phone}</Text>
					</View>
				</TouchableOpacity>

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
		maxWidth: "80%",
	},
	rdateTitle: {
		color: "#333",
		fontSize: 14,
		paddingHorizontal: 5,
		paddingVertical: 3,
		maxWidth: "80%",
	},
	dateView: {
		paddingHorizontal: 12,
		backgroundColor: "#FFF",
		justifyContent: "center",
		alignItems: 'center',
		marginVertical: 6,
	},
	left: {
		alignSelf: "flex-start",
		backgroundColor: "#999",
		borderTopLeftRadius: 0,
		overflow: "hidden",
		borderBottomLeftRadius: 8,
		borderTopRightRadius: 8,
		borderBottomRightRadius: 8,
		padding: 8
	},
	right: {
		alignSelf: "flex-end",
		backgroundColor: "#F7F5FA",
		borderTopLeftRadius: 8,
		overflow: "hidden",
		borderBottomLeftRadius: 8,
		borderTopRightRadius: 0,
		borderBottomRightRadius: 8,
		padding: 8
	},
	ldateText: {
		color: "#999",
		fontSize: 12,
		alignSelf: "center",
		marginTop: 3,
	},
	rdateText: {
		color: "#999",
		fontSize: 12,
		alignSelf: "center",
		marginTop: 3,
	}
});

