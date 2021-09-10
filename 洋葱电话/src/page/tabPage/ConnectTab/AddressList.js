'use strict';
import React, {Fragment, Component} from 'react';
import {
	ScrollView, StatusBar, Dimensions, Text, Image, ImageBackground, View,
	NativeModules, TextInput, TouchableOpacity, StyleSheet, FlatList, SectionList, PermissionsAndroid
} from 'react-native';
import pinyin from 'pinyin';

import {inject, observer} from "mobx-react";
import Colors from "../../../Color";
import {strings} from "../../../../locales";
import Contacts from "react-native-contacts";
import Line from "../../../components/Line";
import SearchBar from "../../../components/SearchBar";
import Button from "../../../components/Button";
import {connectActionSheet} from "@expo/react-native-action-sheet";
import AppStyle from "../../../Style";
import {observable, toJS} from "mobx";
import SafeView from "../../../components/SafeView";
import Util from "../../../global/Util";
import TextEx from "../../../components/TextEx";
import Icon from "../../../value/Svg";
import Global from "../../../mobx/Global";
import BaseComponents from "../../../BaseComponents";

var {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
class AddressList extends BaseComponents {

	global: Global

	constructor(props) {
		super(props);
		this.global = props.global;
		this.store = props.store;
		this.navigation = props.navigation
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
		return (
			<View style={styles.section}>
				<TextEx style={styles.section_title}>{section.title.toUpperCase()}</TextEx>
			</View>
		);
	}

	componentWillUnmount(): void {
		try {
			this.global.modalRef.handlehide();
		} catch (e) {}
	}

	invited(item) {
		this.global.shareAction();
	}

	// 分组列表的renderItem
	_renderItem(item, index) {
		// contractType
		// 0 网络通讯录
		// 1 本地通讯录
		// 2 未知电话
		let icon = Util.logoFix(item.name, item.contractType);
		let from = null;
		let invited = null;
		if (item.contractType === 1) {
			from = (<TextEx style={[styles.row_title, {color: '#999', fontSize: 13,}]}>
				{strings('AddressList.from_local')}
			</TextEx>);
			invited = (<Button style={{marginRight: 20, borderWidth: 1, borderColor: '#4A90E2', borderRadius: 16}}
							   onPress={() => {
								   this.invited(item)
							   }}>
				<TextEx style={{color: '#4A90E2', lineHeight: 31, width: 64, textAlign: 'center'}}>
					{strings('AddressList.invated')}
				</TextEx>
			</Button>)
		}

		return (
			<Button style={styles.row}
					onPress={() => this.rowTap(item)}
					onLongPress={() => this.rowTap2(item)}>
				<View style={{flexDirection: "row", alignItems: "center", minHeight: 66,}}>
					{icon}
					<View style={{flex: 1}}>
						<TextEx style={styles.row_title}>{item.name}</TextEx>
						{from}
					</View>
					{invited}
				</View>
			</Button>
		);
	}

	rowTap(item) {

		let country_no = '';
		let phone_no = '';
		if (item.phones) {
			item.phones.map((i) => {
				country_no = i.country_no;
				phone_no = i.phone_no;
			});
		} else {
			country_no = item.country_no;
			phone_no = item.phone_no;
		}

		this.navigation.push('CallPhonePage', {
			country_no,
			phone_no,
			contract_id: item.id,
		});

		// switch (item.contractType) {
		// 	case 0 : {
		// 		this.rowLocalTap(item.name, item.phones);
		// 		break;
		// 	}
		// 	case 1 : {
		// 		this.rowLocalTap(item.name, item.phones);
		// 		break;
		// 	}
		// 	case 2 : {
		// 		this.navigation.push('MessagePage');
		// 		break;
		// 	}
		// }
	}

	rowTap2(item) {
		switch (item.contractType) {
			case 0 : {
				this.rowLongPress(item);
				break;
			}
			case 1 : {
				this.rowLocalLongPress(item.name, item);
				break;
			}
			case 2 : {
				this.rowLocalLongPress(item.name, item);
				break;
			}
		}
	}

	rowLongPress(item) {
		const options = [
			strings("connect_tab.sas"),
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

	rowLocalLongPress(name, item) {
		const options = [strings("connect_tab.add_contract"), strings("other.cancel"),];
		const cancelButtonIndex = 1;
		this.props.showActionSheetWithOptions({
				title: name,
				options,
				cancelButtonIndex,
			},
			buttonIndex => {
				switch (buttonIndex) {
					case 0: {
						this.navigation.push('EditContactPage', {contract: item});
						break;
					}
				}
			},
		);
	}

	UNSAFE_componentWillMount(): void {
		try {
			this.global.modalRef.handlehide();
		}catch (e) {}
	}

	rowLocalTap(name, phonelist) {
		let phoneBtn = phonelist.map((p, index) => {
			return (
				<Fragment key={index}>
					<Button style={[styles.bottomUpPhoneBtn, AppStyle.row]}
							onPress={() => {
								this.global.modalRef.handlehide();
								this.navigation.push('CallPhonePage', {
									country_no: p.country_no,
									phone_no: p.phone_no,
								})
							}}>
						<Image
							style={{width: 20, height: 20}}
							source={require('../../../assets/img/message/ic_bohao.png')}
						/>
						<TextEx style={styles.bottomUpPhoneTitle}>{p.number}</TextEx>
						<TextEx style={styles.bottomUpPhoneStyle}>{p.label}</TextEx>
					</Button>
					<Line style={{marginHorizontal: 10}}/>
				</Fragment>
			)
		});
		this.global.modalRef.showModal((
			<View style={{backgroundColor: "#FFF", borderTopLeftRadius: 10, borderTopRightRadius: 10}}>
				<View style={[{backgroundColor: "#fff", alignItems: 'center'}, AppStyle.row]}>
					<TextEx style={{
						position: 'absolute',
						left: 0,
						right: 0,
						textAlign: 'center',
						fontSize: 17
					}}>{name}</TextEx>
					<Button style={{padding: 12}} onPress={() => {
						this.global.modalRef.handlehide();
					}}>
						<Image
							style={{width: 20, height: 20}}
							source={require('../../../assets/img/util/ic_close.png')}
						/>
					</Button>
				</View>
				<View style={{height: 230}}>
					{phoneBtn}
				</View>
			</View>))
	}

	renderNoContent = () => {
		return (
			<View style={{flex: 1, alignItems: 'center', paddingTop: this.store.needContactsPromisser ? 55 : 95}}>
				<TextEx style={{fontSize: 16, color: '#333', width: 224, lineHeight: 20}}>
					{strings('AddressList.empty_tip1')}，</TextEx>
				<TextEx style={{fontSize: 16, color: '#333', width: 224, lineHeight: 20}}>
					{strings('AddressList.empty_tip2')}
				</TextEx>
				<TouchableOpacity onPress={()=>this.global.shareAction()}>
					<TextEx style={{
						marginTop: 38,
						justifyContent: 'flex-start', width: 224, color: '#4A90E2',
						marginVertical: 8,
					}}>
						{strings('AddressList.empty_tip3')}
					</TextEx>
					<Line style={{width: 224, backgroundColor: '#E6E6E6'}}/>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => { this.store.updateLocalContract() }}>
					<Text style={{
						justifyContent: 'flex-start', color: '#4A90E2',
						width: 224, marginVertical: 8, marginTop: 24
					}}>
						{strings('AddressList.empty_tip4')}
					</Text>
					<Line style={{width: 224, backgroundColor: '#E6E6E6'}}/>
				</TouchableOpacity>
			</View>
		)
	};

	render() {
		let {letterArr, sections} = this.store.sectionAllSecList2;
		return (
			<Fragment>
				{this.store.needContactsPromisser ? (
					<Fragment>
						<Line/>
						<Button style={[AppStyle.row, {
							paddingHorizontal: 12,
							justifyContent: 'center',
							alignItems: 'center'
						}]} onPress={() => {
							this.store.updateLocalContract()
						}}>
							<Icon icon={'call_icon_contacts'} size={24} color={'#4A90E2'} style={{marginRight: 4}}/>
							<TextEx style={{
								fontSize: 12,
								color: '#999',
								lineHeight: 24,
								backgroundColor: 'transparent',
								marginVertical: 8,
								flex: 1
							}}>
								{strings('AddressList.find_from_local')}
							</TextEx>
							<Button style={{marginVertical: 8}}>
								<Image
									style={{width: 24, height: 24}}
									source={require('../../../assets/newimg/png/icon/chat/chat_icon_close_small.png')}
								/>
							</Button>
						</Button>
					</Fragment>
				) : null}

				<View style={{flex: 1}}>
					<SectionList
						keyboardShouldPersistTaps={'always'}
						keyboardDismissMode={'on-drag'}
						contentContainerStyle={sections.length == 0 ? styles.contentContainerEmpty : styles.contentContainer}
						ref="_sectionList"
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
							renderItem={({item, index}) =>
								<TouchableOpacity onPress={() => {
									this._onSectionselect(index)
								}}>
									<TextEx style={{textAlign: "center"}}>{item.toUpperCase()}</TextEx>
								</TouchableOpacity>
							}
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
		backgroundColor: "#fff",
		paddingHorizontal: 12,
	},
	row_title: {
		fontSize: 16,
		marginLeft: 10,
		lineHeight: 23,
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
	},
	bottomUpPhoneTitle: {
		fontSize: 17,
		color: "#333",
		textAlign: "left",
		marginLeft: 10
	},
	bottomUpPhoneStyle: {
		flex: 1,
		fontSize: 14,
		color: "#999",
		textAlign: "right"
	},
	bottomUpPhoneBtn: {
		paddingHorizontal: 12,
		paddingVertical: 28,
		backgroundColor: "#FFF",
	}
});

export default connectActionSheet(AddressList)
