'use strict';
import React, {Fragment, Component} from 'react';
import {
	Text, View,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	Animated,
	Dimensions,
	Image, Alert, Easing,
} from 'react-native';
import AppStyle from "../../Style";
import {observable, toJS} from "mobx";
import Util from "../../global/Util";
import moment from "moment";
import Button from "../Button";
import BaseComponents from "../../BaseComponents";

export default class MessageRow extends BaseComponents {

	// content={item.content} date={item.date} phone={item.tophone} isLeft={false} state={item.state}
	constructor(props) {
		super(props);

		this.data = props.data || {};
		this.date = this.data.date || "";
		this.isLeft = this.data.fromphone == 'me' ? false : true;
		this.messageState = this.data.state;
		this.content = this.data.content;
		this.phone = !this.isLeft ? this.data.tophone : this.data.fromphone;
		// this.maxWidth = Plant

	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	retryBtnPress() {
		Alert.alert('是否确定重发这条信息', '', [
			{
				text: '确定', onPress: () => {
					this.props.retryBtnPress();
				}
			},
			{
				text: '取消', onPress: () => {}
			},
		], {cancelable: false});
	}

	render() {

		let {country_no, phone_no} = Util.fixNumber(this.phone);
		let date = this.date ? moment(this.date).format('HH:mm') : '';

		let retryBtn = null;
		let stateMessage = '';
		let color = 'blue';
		if (this.messageState == 0) {
			stateMessage = '发送中';
			color = 'blue';
		} else if (this.messageState == 1) {
			stateMessage = '';
			color = 'red';
			retryBtn = (
				<Button style={{height: 40, justifyContent: 'center', alignItems: 'center', marginHorizontal: 12}}
						onPress={()=>this.retryBtnPress()}>
					<Image
						style={{width: 20, height: 20}}
						source={require('../../assets/img/util/ic_error_outline.png')}
					/>
					<Text style={{fontSize: 10, color: '#FF001F'}}>重试</Text>
				</Button>)

		} else if (this.messageState == 2) {
			stateMessage = ''
		}

		let flex = (
			<View style={{padding: 10, flex: 1, alignItems: this.isLeft ? "flex-start" : "flex-end"}}>
				{stateMessage.length > 0 ? (<Text style={{color: color}}>{stateMessage}</Text>) : null}
				{retryBtn}
			</View>
		)

		let flexLeft = null;
		let flexRight = null;
		if (this.isLeft) {
			flexRight =flex
		} else {
			flexLeft = flex
		}


		return (
			<View style={[styles.dateView]}>
				{flexLeft}
				<View style={{alignSelf: this.isLeft ? "flex-start" : "flex-end",}}>
					<View style={[this.isLeft ? styles.left : styles.right, {flex: 1}]}>
						<Text style={[this.isLeft ? styles.ldateTitle : styles.rdateTitle]}>{this.content}</Text>
					</View>
					<View style={[AppStyle.row]}>
						<Text style={[this.isLeft ? styles.ldateText : styles.rdateText]}>
							{this.isLeft?'来自':'发给'} +{country_no} {phone_no}
						</Text>
						<View style={{flex: 1}}/>
						<Text style={[this.isLeft ? styles.ldateText : styles.rdateText, {marginLeft: 0,marginRight: 0, textAlign: 'right', minWidth: 33}]}>{date}</Text>
					</View>
				</View>
				{flexRight}
			</View>
		);
	}

}

const styles = StyleSheet.create({
	ldateTitle: {
		color: "#333",
		fontSize: 14,
		lineHeight: 18,
		paddingHorizontal: 5,
		paddingVertical: 3,
		minWidth: 200,
	},
	rdateTitle: {
		color: "#fff",
		fontSize: 14,
		lineHeight: 18,
		paddingHorizontal: 5,
		paddingVertical: 3,
	},
	dateView: {
		paddingHorizontal: 12,
		backgroundColor: "#FFF",
		justifyContent: "center",
		marginVertical: 6,
		flexDirection: 'row',
	},
	left: {
		backgroundColor: "#F3F3F3",
		borderTopLeftRadius: 0,
		overflow: "hidden",
		borderBottomLeftRadius: 8,
		borderTopRightRadius: 8,
		borderBottomRightRadius: 8,
		padding: 8
	},
	right: {
		backgroundColor: "#78B7FF",
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
		alignSelf: "flex-start",
		marginTop: 3,
		marginRight: 20
	},
	rdateText: {
		color: "#999",
		fontSize: 12,
		alignSelf: "flex-end",
		marginTop: 3,
		marginRight: 20
	}
});

