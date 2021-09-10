import React, {Fragment, Component} from 'react';
import {
	ScrollView, StatusBar, Dimensions, Text, Image, ImageBackground, View,
	NativeModules, TextInput, TouchableOpacity, StyleSheet, SectionList,
} from 'react-native';
var {height, width} = Dimensions.get('window');
const CallModule = NativeModules.CallModule;

import {inject, observer} from "mobx-react";
import NavBar from "../../components/NavBar";
import {strings} from "../../../locales";
import moment from "moment"
import SearchBar from "../../components/SearchBar";
import Line from "../../components/Line";
import AppStyle from "../../Style";
import Button from "../../components/Button";
import {observable, toJS} from "mobx";
import Util from "../../global/Util";
import SafeView from "../../components/SafeView";
import TextEx from "../../components/TextEx";
import Icon from "../../value/Svg";
import BaseComponents from "../../BaseComponents";

@inject('store', 'global')
@observer
export default class NewPhonePage extends BaseComponents {

	@observable
	selectIndex = -1;
	@observable
	searchText = '';

	selectItem = null;

	constructor(props) {
		super(props);
		this.store = props.store;
		this.global = props.global;
		this.navigation = props.navigation;
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	componentDidMount() {
	}

	_showClientActionSheet() {

		if (!this.selectItem){
			return;
		}

		let item = this.selectItem;
		if (!item.phones) {
			item = this.store.findAllContentWithName(item.name);
		}
		let name = item.name;
		let data = item.phones;
		if (data.length === 1) {
			let d = data[0];
			return this.navigation.push('CallPhonePage', {
				country_no: d.country_no,
				phone_no: d.phone_no,
				contract_id: item.id,
			});
		}
		let btns = data.map((kk, index) => {
			return (
				<Fragment key={index}>
					<Button style={[styles.bottomUpPhoneBtn, AppStyle.row]}
							onPress={() => {
								this.global.modalRef.handlehide();
								this.navigation.push('CallPhonePage', {
									country_no: kk.country_no,
									phone_no: kk.phone_no,
									contract_id: item.id,
								})
							}
							}>
						<Image
							style={{width: 20, height: 20}}
							source={require('../../assets/img/message/ic_bohao.png')}
						/>
						<TextEx style={styles.bottomUpPhoneTitle}>+{kk.country_no} {kk.phone_no}</TextEx>
						<TextEx style={styles.bottomUpPhoneStyle}>{kk.label}</TextEx>
					</Button>
					<Line style={{marginHorizontal: 12}}/>
				</Fragment>
			)
		});

		this.global.modalRef.showModal((
			<View style={{backgroundColor: "#FFF", borderTopLeftRadius: 10, borderTopRightRadius: 10}}>
				<View style={[{backgroundColor: "#fff", alignItems: 'center'}, AppStyle.row]}>
					<TextEx style={{position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: 17}}>{name}</TextEx>
					<Button style={{padding: 12}} onPress={()=>{
						this.global.modalRef.handlehide();
					}}>
						<Image
							style={{width: 20, height: 20}}
							source={require('../../assets/img/util/ic_close.png')}
						/>
					</Button>
				</View>
				<View style={{height: 230}}>
					{btns}
				</View>
			</View>))
	}

	// 分组列表的头部
	_renderSectionHeader(sectionItem) {
		const {section} = sectionItem;

		if (section.title == strings('NewPhonePage.nealy_phone')){
			return (
				<Fragment>
					<View style={styles.section}>
						<TextEx style={styles.section_title}>{section.title.toUpperCase()}</TextEx>
					</View>
				</Fragment>
			)
		}else {
			return (
				<Fragment>
					<View style={styles.section}>
						<TextEx style={styles.section_title}>{section.title.toUpperCase()}</TextEx>
					</View>
				</Fragment>
			);
		}

	}

	toggle(item){
		if (this.selectIndex == item.name){
			this.selectIndex = -1;
			this.selectItem = null;
		}else {
			this.selectIndex = item.name;
			this.selectItem = item;
		}
	}

	// _typeCheck(item) {
	// 	let contractType = 0;
	// 	let contract = item;
	// 	if (item.cname) {
	// 		contract = this.store.findAllContentWithName(item.cname);
	// 		if (!contract){
	// 			// 陌生号码
	// 			contractType = 2;
	// 			return {contractType, contract: item};
	// 		}
	// 	}
	// 	if (contract.cname){
	// 		contractType = 0; // 网络通讯录
	// 	} else {
	// 		contractType = 1; // 本地通讯录
	// 	}
	// 	return {contractType, contract};
	// }

	// 分组列表的renderItem
	_renderItem(item, index) {
		let name = item.name;
		let date = item.date?moment(item.date).format('MM-DD HH:mm'): '';
		let logo = Util.logoFix(name, item.contractType);
		let icon  = this.global._callIcon(item, 20);
		return (
			<Button style={styles.row} onPress={()=>{ this.toggle({...item}) }}>
				<View style={{flexDirection: "row", alignItems: "center", minHeight: 66,}}>
					{logo}
					<View style={styles.row_content}>
						<TextEx style={styles.row_title}>{name}</TextEx>
						<View style={{alignItems: "center", flexDirection: "row"}}>
							{item.date?(
								<Fragment>
									{icon}
									<TextEx style={[styles.row_title, {
										color: '#999999',
										fontSize: 12,
										lineHeight: 20,
										marginLeft: 4
									}]}>{date}</TextEx>
								</Fragment>
							): null}
						</View>
					</View>
					<View style={{paddingRight: 0}} >
						{
							this.selectIndex == name ?
								<Icon icon={'call_icon_chose24_select'} size={25} color={'#4A90E2'} /> :
								<Icon icon={'call_icon_chose24_normal'} size={25} color={'#4A90E2'} />
						}
					</View>
				</View>

			</Button>
		);
	}

	render() {

		let nearlyPhones = [...this.store.nearlyPhones];
		let sections = [];

		let allData = [...this.store.intelContent, ...this.store.localContent,];
		if (nearlyPhones.length <= 0) {
			sections = [
				{
					title: strings('phone_tab.connect'),
					data: allData
				}
			];
		} else {
			sections = [
				{
					title: strings('phone_tab.last_call'),
					data: nearlyPhones
				},
				{
					title: strings('phone_tab.connect'),
					data: allData
				}
			];
		}
		if (nearlyPhones.length <= 0 && allData.length <= 0) {
			sections = [];
		}

		let hasSelect = this.selectIndex != -1;

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={''}
							bottom_line={true}
							leftRender={(
								<Button style={[{padding: 6, paddingRight: 12}, AppStyle.row]} onPress={() => {
									this.navigation.pop()
								}}>
									<Image
										style={{width: 22, height: 22}}
										source={require('../../assets/img/util/ic_back_black.png')}
									/>
									<TextEx style={{fontSize: 17, lineHeight: 22}}>
										{strings('NewPhonePage.new_phone')}
									</TextEx>
								</Button>
							)}
							rightRender={(
								<Button
									onPress={()=>this._showClientActionSheet()}
									disabled={!hasSelect}
									style={[{backgroundColor: hasSelect?'#937FFF':'#E4E4E4',  paddingHorizontal: 6,
										paddingVertical: 2, marginRight: 6, borderRadius: 4}, AppStyle.row]}>
									<Image
										style={{width: 24, height: 24,marginHorizontal: 2}}
										source={hasSelect?
											require('../../assets/img/call/ic_phone_call_white.png'):
											require('../../assets/img/call/ic_phone_call_gray.png')}
									/>
									<TextEx style={{fontSize: 14, lineHeight: 22, color: hasSelect?'#FFF':'#999'}}>
										{strings('NewPhonePage.call')}
									</TextEx>
								</Button>
							)}
					/>
					<SearchBar touchSearchBar={() => this.navigation.push('SearchPage', {
						rowTap: (item) => {
								let re = this.store.findAllContentWithName(item.name);
								this.navigation.pop();
								this.toggle(re);
							},
						}
					)}
						placeholder={strings("connect_tab.search_placeholder")} />

					<SectionList
						style={{flex: 1}}
						keyboardDismissMode={'on-drag'}
						contentContainerStyle={styles.contentContainer}
						renderItem={({item, index}) => this._renderItem(item, index)}
						renderSectionHeader={(section) => this._renderSectionHeader(section)}
						renderSectionFooter={() => {}}
						sections={sections}
						keyExtractor={(item, index) => item + index}
						stickySectionHeadersEnabled={false}
						ItemSeparatorComponent={() => <Line />}
					/>
				</SafeView>
			</Fragment>
		)
	}
}

const styles = StyleSheet.create({
	contentContainer: {
		paddingBottom: 48,
	},
	section: {
		height: 30,
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
		minHeight: 66,
		paddingHorizontal: 16,
	},
	row_title: {
		fontSize: 16,
		lineHeight: 22,
		minHeight: 22,
	},
	row_content: {
		flex: 1,
		height: "100%",
		justifyContent: "center",
		marginLeft: 12,
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
		paddingRight: 7,
		paddingHorizontal: 12,
		paddingVertical: 28,
		backgroundColor: "#FFF",
	},
	searchBtn: {
		width: 48,
		height: 48,
		justifyContent: "center",
		alignItems: "center",
	}
});
