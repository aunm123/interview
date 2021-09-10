'use strict';
import React, {Fragment, Component} from 'react';
import {
	ScrollView, StatusBar, Dimensions, Text, Image, ImageBackground, View, PixelRatio,
	NativeModules, TextInput, TouchableOpacity, StyleSheet, FlatList, SectionList
} from 'react-native';
import pinyin from 'pinyin';
import {inject, observer} from "mobx-react";
import Colors from "../../Color";
import {strings} from "../../../locales";
import Line from "../../components/Line";
import AppStyle from "../../Style";
import NavBar from "../../components/NavBar";
import {CountryZoneRow, CountryZoneHeaderRow} from "../../components/row/CountryZoneRow";
import Button from "../../components/Button";

let {height, width} = Dimensions.get('window');
import sectionListGetItemLayout from 'react-native-section-list-get-item-layout'
import SafeView from "../../components/SafeView";
import AutoSave from "../../TModal/AutoSave";
import BaseComponents from "../../BaseComponents";

@inject('store', 'global')
@observer
export default class CountryZone extends BaseComponents {

	@AutoSave
	countryService

	constructor(props) {
		super(props);
		this.state = {
			sections: [],       //section数组
			letterArr: [],      //首字母数组
			searchText: ''
		};
		this.navigation = props.navigation;
		this.callback =  this.navigation.getParam('callback') || null;

		this.getAllData().then();

		this.getItemLayout = sectionListGetItemLayout({
			getItemHeight: (rowData, sectionIndex, rowIndex) => 49,
			getSeparatorHeight: () => 1 , // The height of your separators
			getSectionHeaderHeight: () => 28.5, // The height of your section headers
			getSectionFooterHeight: () => 0, // The height of your section footers
			listHeaderHeight: 0, // The height of your list header
		})
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	componentDidMount() {

	}

	async getAllData(){
		console.log('debug', this.countryService);
		let data = await this.countryService.getCountryData();
		if (data.length > 0) {
		}
		this.initData(data);
	}

	initData(datalist) {
		let list = datalist;
		let sections = [], letterArr = [];
		// 右侧字母栏数据处理
		list.map((item, index) => {
			letterArr.push(pinyin(item['country_cn'].substring(0, 1), {
				style: pinyin.STYLE_FIRST_LETTER,
			})[0][0].toUpperCase());
		});
		letterArr = [...new Set(letterArr)].sort();
		this.setState({letterArr: letterArr});
		// 分组数据处理
		letterArr.map((item, index) => {
			sections.push({
				title: item,
				data: []
			})
		});
		list.map(item => {
			let listItem = item;
			let first = listItem['country_cn'].substring(0, 1);
			let test = pinyin(first, {style: pinyin.STYLE_FIRST_LETTER})[0][0].toUpperCase();
			sections.map(item => {
				if (item.title == test) {
					item.data.push(listItem);
				}
			})
		});
		this.setState({sections: sections})
	}

	async searchCountZone(text){

		this.setState({searchText: text});
		if (text.length > 0){
			let data = await this.countryService.findCountryWithKey(text);
			this.initData(data);
		}else {
			this.getAllData().then();
		}

	}

	// 字母关联分组跳转
	_onSectionselect = (key) => {
		try {
			this.sectionList.scrollToLocation({
				animated: true,
				itemIndex: 0,
				viewOffset: 30,
				sectionIndex: key
			})
		}catch (e) {}
	};

	renderNoContent = () => {
		return (<View style={{flex: 1}}>
			<Text style={{flex: 1, textAlign: 'center'}}>没有找到信息</Text>
		</View>)
	};


	render() {
		const {letterArr, sections} = this.state;
		return (
			<SafeView>
				<NavBar title={'国家和地区'}
						bottom_line={true}
						leftRender={(
							<Button style={[{padding: 6, paddingRight: 12}, AppStyle.row]}
											  onPress={() => {this.navigation.pop()}}>
								<Image
									style={{width: 22, height: 22}}
									source={require('../../assets/img/util/ic_back_black.png')}
								/>
							</Button>
						)}
				/>
				<View style={styles.searchRow}>
					<TextInput style={styles.searchRow_input}
							   blurOnSubmit={true}
							   clearButtonMode={'while-editing'}
							   value={this.state.searchText}
							   onChangeText={this.searchCountZone.bind(this)}
							   placeholder={strings("connect_tab.search_placeholder")}>
					</TextInput>
					<Image
						style={{width: 24, height: 24, position: "absolute", left: 20, top: 12}}
						source={require('../../assets/img/util/ic_search.png')}
					/>
				</View>
				<View style={{flex: 1}}>
					<SectionList
						style={{flex: 1}}
						keyboardShouldPersistTaps={'always'}
						keyboardDismissMode={'on-drag'}
						contentContainerStyle={styles.contentContainer}
						ref={(sectionList)=>{this.sectionList = sectionList}}
						renderItem={({item, index}) => <CountryZoneRow country_cn={item.country_cn} country_no={item.country_no}
																	   callback={()=>{
																	   	this.callback(item);
																	   	this.navigation.pop();
																	   }} />}
						renderSectionHeader={({section}) => <CountryZoneHeaderRow title={section.title}/>}
						ListEmptyComponent={this.renderNoContent}
						sections={sections}
						keyExtractor={(item, index) => item + index}
						stickySectionHeadersEnabled={true}
						ItemSeparatorComponent={() =>
							<Line style={{marginLeft: 12,marginRight: 12}}/>
						}
						// onScrollToIndexFailed={()=>{}}
						getItemLayout = {this.getItemLayout}
					/>

					{/*右侧字母栏*/}
					<View style={styles.flex_Left}>
						<FlatList
							contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}
							scrollEnabled={false}
							data={letterArr}
							keyExtractor={(item, index) => index.toString()}
							renderItem={({item, index}) =>
								<Button onPress={() => { this._onSectionselect(index) }}>
									<Text style={{textAlign: "center", marginHorizontal: 9, color: "#333", fontSize: 14}}>
										{item.toUpperCase()}
									</Text>
								</Button>
							}
						/>
					</View>
				</View>

			</SafeView>
		)
	}
}

const styles = StyleSheet.create({
	contentContainer: {
		paddingBottom: 48
	},
	flex_Left: {
		position: "absolute",
		right: 0,
		top: 0,
		bottom: 48,
		justifyContent: "center",
		alignItems: "center",
	},
	searchRow: {
		height: 48,
		flexDirection: "row",
		paddingHorizontal: 12,
	},
	searchRow_input: {
		height: 28,
		backgroundColor: "#f5f5f5",
		flex: 1,
		borderRadius: 14,
		paddingLeft: 40,
		marginVertical: 10,
		fontSize: 12,
		paddingVertical: 0,
	},
	searchBtn: {
		width: 48,
		height: 48,
		justifyContent: "center",
		alignItems: "center",
	}
});
