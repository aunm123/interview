import React, { Component } from 'react';
import {
	TouchableOpacity,
	Text,
	View, Dimensions,
} from 'react-native';
import {register, insertText, doDelete, backSpace, getTextValue} from './index';
import EmojiView from "../inputBottomView/EmojiView";
import {KeyboardHeight, KeyboardType} from "../../value/KeyBoardType";
const {height, width} = Dimensions.get('window');

export default class MyKeyboard extends Component {


	addChart(chart) {
		insertText(this.props.tag, chart)
	}

	async removeChart() {
		let str = await getTextValue(this.props.tag);

		if (str.length>0) {
			let needRemoveChat = str.substr(str.length - 2, 2);
			if (/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g.test(needRemoveChat)) {
				// 是emoji
				backSpace(this.props.tag, 2)
			} else {
				// 不是是emoji
				backSpace(this.props.tag, 1)
			}
		}
	}

	render() {
		return (
			<View style={{ width: width, height: KeyboardHeight(KeyboardType.emoji)}}
				  onLayout={(event)=>{
				  	console.log(event.nativeEvent.layout.height)
				  }}>
				<EmojiView
					addChart={(chart)=>this.addChart(chart)}
					removeChart={()=>this.removeChart()}
				/>
			</View>
		);
	}
}
