'use strict';
import React, {Fragment, Component} from 'react';
import {
	ScrollView, StatusBar, Dimensions, Text, Image, ImageBackground, View, PermissionsAndroid,
	NativeModules, TextInput, TouchableOpacity, StyleSheet, FlatList, SectionList
} from 'react-native';
import pinyin from 'pinyin';

import {inject, observer} from "mobx-react";
import Colors from "../../../Color";
import {strings} from "../../../../locales";
import Line from "../../../components/Line";
import {connectActionSheet} from "@expo/react-native-action-sheet";
import SearchBar from "../../../components/SearchBar";
import Button from "../../../components/Button";
import Req from "../../../global/req";
import URLS from "../../../value/URLS";
import Contacts from "react-native-contacts";
import SafeView from "../../../components/SafeView";
import {toJS} from "mobx";
import ContractService from "../../../service/ContractService";
import TextEx from "../../../components/TextEx";
import AppStyle from "../../../Style";
import Util from "../../../global/Util";
import Global from "../../../mobx/Global";
import Icon from "../../../value/Svg";
import BaseComponents from "../../../BaseComponents";

var {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
class ContactList extends BaseComponents {

	global: Global

	constructor(props) {
		super(props);
		this.state = {
			searchText: ''
		};
		this.store = props.store;
		this.global = props.global;
		this.navigation = props.navigation;
	}

	componentWillUnmount() {
		super.componentWillUnmount();
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
		} catch (e) {}
	};

	// 分组列表的头部
	_renderSectionHeader(sectionItem) {
		const {section} = sectionItem;
		return (
			<View style={styles.section}>
				<TextEx style={styles.section_title}>{section.title.toUpperCase()}</TextEx>
			</View>
		);
	}

	rowTap(item) {
		let country_no = '';
		let phone_no = '';
		item.phones.map((i) => {
			country_no = i.country_no;
			phone_no = i.phone_no;
		});
		this.navigation.push('MessagePage', {country_no, phone_no, contract_id: item.id})
	}

	rowTap2(item) {
		let re = this.store.findContentWithName(item.name);
		this.rowLongPress(re)
	}

	rowLongPress(item) {
		const options = [
			this.store.isContance(item)?strings('message_tab.sas_disable'):strings('message_tab.sas'),
			strings("connect_tab.person_detail"),
			strings("connect_tab.person_edit"),
			strings("other.cancel"),
		];
		const cancelButtonIndex = 3;

		this.props.showActionSheetWithOptions({
				title: item.name,
				options,
				cancelButtonIndex,
			},
			buttonIndex => {
				switch (buttonIndex) {
					case 0: {
						if(this.store.isContance(item)){
							this.store.deleteFocusContract(item.name);
						} else {
							this.store.addFocusContract(item);
						}
						break;
					}
					case 1: {
						this.navigation.push('ClientDetail', {contract: item});
						break;
					}
					case 2: {
						this.navigation.push('EditContactPage', {contract: item});
						break;
					}
				}
			},
		);
	}

	// 分组列表的renderItem
	_renderItem(item, index) {
		let logo = Util.logoFix(item.name, item.contractType);
		return (
			<Button style={styles.row}
					onPress={() => this.rowTap(item)}
					onLongPress={() => this.rowTap2(item)}>
				<View style={{flexDirection: "row", alignItems: "center", minHeight: 66,}}>
					{logo}
					<View style={{flex: 1}}>
						<TextEx style={styles.row_title}>{item.name}</TextEx>
					</View>
				</View>
			</Button>
		);
	}


	renderNoContent = () => {
		return (
			<View style={{flex: 1, paddingTop: 105, alignItems: 'center'}}>
				<View style={[AppStyle.row, {
					justifyContent: 'flex-start',
					alignItems: 'center', width: 224,
				}]}>
					<TextEx style={{fontSize: 16, color: '#333',}}>
						{strings("ContactList.empty_tip1")}
					</TextEx>
					<Icon icon={'chat_icon_add_user'} size={24} color={'#4A90E2'} style={{marginHorizontal: 4}} />
					<TextEx style={{fontSize: 16, color: '#333',}}>
						{strings("ContactList.empty_tip2")}
					</TextEx>
				</View>
				<TouchableOpacity onPress={()=>this.global.shareAction()}>
					<TextEx style={{
						marginTop: 38,
						justifyContent: 'flex-start', width: 224, color: '#4A90E2',
						marginVertical: 8,
					}}>
						{strings("ContactList.empty_tip3")}
					</TextEx>
					<Line style={{width: 224, backgroundColor: '#E6E6E6'}}/>
				</TouchableOpacity >
				<TouchableOpacity>
					<Text style={{
						justifyContent: 'flex-start', color: '#4A90E2',
						width: 224, marginVertical: 8, marginTop: 24
					}}>
						{strings("ContactList.empty_tip4")}
					</Text>
					<Line style={{width: 224, backgroundColor: '#E6E6E6'}} />
				</TouchableOpacity>
			</View>
		)
	};

	render() {
		let {letterArr, sections} = this.store.sectionSecList;
		return (
			<Fragment>
				<View style={{flex: 1}}>
					<SectionList
						keyboardShouldPersistTaps={'always'}
						keyboardDismissMode={'on-drag'}
						contentContainerStyle={sections.length == 0 ? styles.contentContainerEmpty : styles.contentContainer}
						ref={(sectionList)=>{this.sectionList = sectionList}}
						renderItem={({item, index}) => this._renderItem(item, index)}
						renderSectionHeader={this._renderSectionHeader}
						sections={sections}
						keyExtractor={(item, index) => item + index}
						stickySectionHeadersEnabled={true}
						ItemSeparatorComponent={() =>
							<Line style={{marginLeft: 60, marginRight: 12}}/>
						}
						ListEmptyComponent={this.renderNoContent}
					/>
					{/*右侧字母栏*/}
					<View style={styles.flex_Left}>
						<FlatList
							contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}
							style={{width: 30}}
							scrollEnabled={false}
							data={letterArr}
							keyExtractor={(item, index) => index.toString()}
							renderItem={({item, index}) =>{
								let text = <TextEx style={{textAlign: "center"}}>{item.toUpperCase()}</TextEx>;
								if (item == '关'){
									text = (
										<Image
											style={{width: 14, height: 18,}}
											resizeMode={'contain'}
											source={require('../../../assets/newimg/png/icon/common/follow.png')}
										/>
									)
								}
								return (
									<Button style={{justifyContent: 'center', alignItems: 'center'}} onPress={() => {
										this._onSectionselect(index)
									}}>
										{text}
									</Button>
								)
							}}
						/>
					</View>
				</View>
			</Fragment>
		)
	}
}

const styles = StyleSheet.create({
	contentContainerEmpty: {
		paddingBottom: 37,
		flex: 1
	},
	contentContainer: {},
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
		paddingHorizontal: 12,
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
		paddingLeft: 12,
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

export default connectActionSheet(ContactList)
