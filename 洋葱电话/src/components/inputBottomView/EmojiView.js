'use strict';
import React, {Component, Fragment} from "react";
import CameraRoll from "@react-native-community/cameraroll";
import {observable} from "mobx";
import {
	FlatList,
	Image,
	ScrollView,
	SectionList,
	StyleSheet,
	Text,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View
} from "react-native";
import Button from "../Button";
import {inject, observer} from "mobx-react";
import Line from "../Line";
import AppStyle from "../../Style";
import Emoji from "../../value/Emoji";
import {KeyboardHeight, KeyboardType} from "../../value/KeyBoardType";

@inject()
@observer
class EmojiView extends Component {

	constructor(props) {
		super(props);
		this.global = props.global;

		this.addChart = props.addChart;
		this.removeChart = props.removeChart;


		this.sections = [
			...Emoji
		]
	}

	renderHeader() {
		return (
			<Fragment>
				<Text style={{fontSize: 12, color: '#999', padding: 12, paddingLeft: 18}}>常用</Text>
			</Fragment>
		)
	}

	// 分组列表的renderItem
	renderItem(item, index) {
		return (
			<TouchableOpacity
				style={[AppStyle.row, {width: '12.5%', justifyContent: 'center'}]}
				onPress={() => {
					this.addChart(item)
				}}>
				<Text style={{fontSize: 24}}>{item}</Text>
			</TouchableOpacity>
		);
	}

	render() {

		let data = [...this.sections];

		return (
			<View style={{height: KeyboardHeight(KeyboardType.emoji), width: '100%'}}>
				<FlatList
					ref={'flatlist'}
					columnWrapperStyle={{padding: 5}}
					style={{backgroundColor: "white", flex: 1}}
					numColumns={8}
					keyboardDismissMode={'none'}
					keyboardShouldPersistTaps={'always'}
					renderItem={({item, index}) => this.renderItem(item, index)}
					ListHeaderComponent={() => this.renderHeader()}
					data={data}
					keyExtractor={(item, index) => item + index}
					stickySectionHeadersEnabled={false}
					ItemSeparatorComponent={() => null}
				/>
				<Line />
				<View style={[{width: '100%', height: 30, paddingHorizontal: 18}, AppStyle.row]}>
					<TouchableOpacity style={{padding: 4, backgroundColor: "#ededed",}}>
						<Image
							style={{width: 22, height: 22}}
							source={require('../../assets/img/bg/emoji.png')}
						/>
					</TouchableOpacity>
					<View style={{flex: 1}}/>
					<TouchableOpacity style={{padding: 4}} onPress={() => {
						this.removeChart()
					}}>
						<Image
							style={{width: 22, height: 22}}
							source={require('../../assets/img/bg/delete.png')}
						/>
					</TouchableOpacity>
				</View>
			</View>
		)
	}


}


const styles = StyleSheet.create({});

export default EmojiView
