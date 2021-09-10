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
import BaseComponents from "../../BaseComponents";

export default class ActionPhotoMessageRow extends BaseComponents {

	// content={item.content} date={item.date} phone={item.tophone} isLeft={false} state={item.state}
	constructor(props) {
		super(props);

		this.data = props.data;

	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	render() {

		let actionStatusComponent = Util.activeTimerDepark(this.data['start_time'], this.data['end_time']);
		let actionColor = '#DD0D26';

		return (
			<Button onPress={()=>{
				if (this.props.click) {
					this.props.click();
				}
			}}>
				<View style={[styles.dateView]}>
					<View style={{width: 280, alignSelf: "flex-start" }}>
						<View style={[styles.left, {flex: 1}]}>
							<Image
								style={{width: 280, height: 98}}
								source={{uri: this.data.icon}} />

							<View style={{padding: 8}}>
								<Text style={[styles.ldateTitle]}>
									{this.data.desc}
								</Text>
								<View style={AppStyle.row}>
									<TextEx style={{fontSize:12, color:'#999', flex: 1}}>
										{this.data.start_time}
									</TextEx>
									{actionStatusComponent}
								</View>
							</View>
						</View>
					</View>
				</View>
			</Button>
		);
	}
}

const styles = StyleSheet.create({
	ldateTitle: {
		color: "#333",
		fontSize: 12,
		paddingVertical: 3,
		minWidth: 200,
		lineHeight: 17,
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
		overflow: "hidden",
		borderRadius: 8,
	},
	ldateText: {
		color: "#999",
		fontSize: 12,
		alignSelf: "flex-start",
		marginTop: 3,
		marginRight: 20
	},
});

