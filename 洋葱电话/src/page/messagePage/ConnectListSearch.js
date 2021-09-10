'use strict';
import React, {Fragment, Component} from 'react';
import {
	ScrollView, StatusBar, Dimensions, Text, Image, ImageBackground, View,
	NativeModules, TextInput, TouchableOpacity, StyleSheet, FlatList, SectionList
} from 'react-native';
import pinyin from 'pinyin';
import {inject, observer} from "mobx-react";
import Colors from "../../Color";
import {strings} from "../../../locales";
import Contacts from "react-native-contacts";
import Line from "../../components/Line";
import AppStyle from "../../Style";
import NavBar from "../../components/NavBar";
import SafeView from "../../components/SafeView";
import TextEx from "../../components/TextEx";
import BaseComponents from "../../BaseComponents";

var {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
export default class ConnectListSearch extends BaseComponents {
	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.store = props.store;
		this.state = {
			sections: [],       //section数组
			showIndex: -1,
			searchText: ''
		};
		console.log(props)
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	componentDidMount() {
		this.initData(this.store.localContent);
	}

	initData(listData) {
		let list = listData;
		let sections = [{
			title: "最近通话",
			data: []
		},{
			title: '联系人',
			data: []
		}];

		list.map(item => {
			sections[1].data.push(item)
		});
		this.setState({sections: sections})
	}

	// 字母关联分组跳转
	_onSectionselect = (key) => {
		this.refs._sectionList.scrollToLocation({
			animated: true,
			itemIndex: 0,
			viewOffset: 30,
			sectionIndex: key
		})
	};

	// 分组列表的头部
	_renderSectionHeader(sectionItem) {
		const {section} = sectionItem;
		if (section.data.length<=0) return  null;
		return (
			<View style={styles.section}>
				<TextEx style={styles.section_title}>{section.title.toUpperCase()}</TextEx>
			</View>
		);
	}

	// 分组列表的renderItem
	_renderItem(item, index) {
		const { navigation } = this.props;
		const selectrow = navigation.getParam('selectrow', ()=>{});
		return (
			<TouchableOpacity style={styles.row}
							  onPress={() => {selectrow(item);this.navigation.pop();}}
			>
				<View style={{flexDirection: "row", alignItems: "center", minHeight: 66,}}>
					<Image
						style={{width: 40, height: 40}}
						source={require('../../assets/img/bg/timg.png')}
					/>
					<View style={{flex: 1}}>
						<TextEx style={styles.row_title}>{item.givenName + " " + item.familyName}</TextEx>
					</View>
				</View>
			</TouchableOpacity>
		);
	}

	searchContacts(text){
		this.setState({searchText: text});
		if (text.length > 0){
			Contacts.getContactsMatchingString(text, (err, contacts) => {
				if(err === 'denied'){
				} else {
					this.initData(contacts);
				}
			})
		}else {
			this.initData(this.store.localContent);
		}

	}

	render() {
		const {sections} = this.state;
		return (
			<SafeView>
				<NavBar title={''}
						bottom_line={false}
						leftRender={(
							<TouchableOpacity style={[{padding: 6, paddingRight: 12}, AppStyle.row]} onPress={() => {
								this.navigation.pop()
							}}>
								<Image
									style={{width: 22, height: 22}}
									source={require('../../assets/img/util/ic_back_black.png')}
								/>
								<TextEx style={{fontSize: 17, lineHeight: 22}}>
									联系人
								</TextEx>
							</TouchableOpacity>
						)}
				/>
				<View style={styles.searchRow}>
					<TextInput style={styles.searchRow_input}
							   value={this.state.searchText}
							   onChangeText={this.searchContacts.bind(this)}
							   placeholder={strings("connect_tab.search_placeholder")}>
					</TextInput>
					<Image
						style={{width: 24, height: 24, position: "absolute", left: 20, top: 12}}
						source={require('../../assets/img/util/ic_search.png')}
					/>
				</View>
				<View style={{flex: 1}}>
					<SectionList
						keyboardDismissMode={'on-drag'}
						contentContainerStyle={styles.contentContainer}
						ref="_sectionList"
						renderItem={({item, index}) => this._renderItem(item, index)}
						renderSectionHeader={this._renderSectionHeader}
						sections={sections}
						keyExtractor={(item, index) => item + index}
						stickySectionHeadersEnabled={true}
						ItemSeparatorComponent={() =>
							<Line style={{marginLeft: 60,marginRight: 12}}/>
						}
					/>
				</View>
			</SafeView>
		)
	}
}

const styles = StyleSheet.create({
	contentContainer: {
		paddingBottom: 48
	},
	section: {
		height: 28,
		backgroundColor: "#F5F5F5",
	},
	section_title: {
		lineHeight: 28,
		fontSize: 12,
		color: "#999999",
		marginHorizontal: 12,
	},
	row: {
		height: 66,
		backgroundColor: "#fff",
		paddingHorizontal: 10,
		minHeight: 66,
	},
	row_title: {
		lineHeight: 66,
		fontSize: 16,
		marginLeft: 10,
	},
	flex_Left: {
		position: "absolute",
		right: 0,
		top: 0,
		bottom: 48,
		width: 30,
		justifyContent: "center",
		alignItems: "center",
	},
	searchRow: {
		height: 48,
		flexDirection: "row",
		paddingHorizontal: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#E6E6E6",
	},
	searchRow_input: {
		height: 28,
		backgroundColor: "#f5f5f5",
		flex: 1,
		borderRadius: 14,
		paddingLeft: 40,
		marginVertical: 10,
		fontSize: 12,
		paddingTop: 4,
	},
	searchBtn: {
		width: 48,
		height: 48,
		justifyContent: "center",
		alignItems: "center",
	}
});
