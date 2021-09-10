import React, {Fragment, Component} from 'react';
import {
	ScrollView, StatusBar, Dimensions, Text, Image, ImageBackground, View,
	NativeModules, TextInput, TouchableOpacity, StyleSheet, SectionList,
} from 'react-native';

var {height, width} = Dimensions.get('window');
const CallModule = NativeModules.CallModule;

import Colors from '../../Color';
import Req from '../../global/req';
import URLS from '../../value/URLS';
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
import Icon from "../../value/Svg";
import TextEx from "../../components/TextEx";
import BaseComponents from "../../BaseComponents";

@inject('store', 'global')
@observer
export default class PhoneTab extends BaseComponents {

	constructor(props) {
		super(props);
		this.store = props.store;
		this.global = props.global;
		this.navigation = props.navigation;
	}

	_listHeader() {
		return (<Button onPress={() => this.navigation.push('BuyListPage')}>
			<View style={[AppStyle.row, {padding: 9, alignItems: 'center'}]}>
				<Image
					style={{width: 40, height: 40}}
					source={require('../../assets/newimg/png/icon/chat/chat_icon_onion_coin_40.png')}
				/>
				<View style={{marginLeft: 12, justifyContent: 'center', flex: 1}}>
					<TextEx style={{fontSize: 16, color: '#333', lineHeight: 22}}>
						{strings('phone_tab.tip1_1')}
					</TextEx>
					<TextEx style={{fontSize: 12, color: '#4A90E2', lineHeight: 20}}>
						{strings('phone_tab.tip1_2')}
					</TextEx>
				</View>
				<View style={{
					backgroundColor: '#FFF', borderRadius: 17, height: 33,
					borderWidth: 1, borderColor: '#4A90E2', paddingVertical: 7,
					alignItems: 'center', justifyContent: 'center', paddingHorizontal: 7
				}}>
					<TextEx style={{fontSize: 14, color: '#4A90E2'}}>
						{strings('phone_tab.tip1_3')}
					</TextEx>
				</View>
			</View>
			<Line/>
		</Button>);
	}

	componentWillUnmount(): void {
		super.componentWillUnmount();

		try {
			this.global.modalRef.handlehide();
		} catch (e) {}
	}

	async _showClientActionSheet(item) {
		if (!item.phones) {
			item = await this.store.findAllContentWithName(item.name);
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
							}}>
						<Icon icon={'chat_icon_onion_phone2'} size={40} color={'#4A90E2'}/>
						<TextEx style={styles.bottomUpPhoneTitle}>+{kk.country_no} {kk.phone_no}</TextEx>
						<TextEx style={styles.bottomUpPhoneStyle}>{kk.label}</TextEx>
					</Button>
					<Line style={{marginHorizontal: 12}}/>
				</Fragment>
			)
		});

		this.global.modalRef.showModal((
			<View style={{
				backgroundColor: "#FFF",
				borderTopLeftRadius: 10,
				borderTopRightRadius: 10,
				overflow: 'hidden'
			}}>
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
							source={require('../../assets/img/util/ic_close.png')}
						/>
					</Button>
				</View>
				<ScrollView style={{marginBottom: 4, maxHeight: 240}}>
					{btns}
				</ScrollView>
			</View>))
	}

	// 分组列表的头部
	_renderSectionHeader(sectionItem) {
		const {section} = sectionItem;
		return (
			<View style={styles.section}>
				<TextEx style={styles.section_title}>{section.title.toUpperCase()}</TextEx>
			</View>
		);

	}

	// 分组列表的renderItem
	_renderItem(item, index) {
		let date = item.date ? moment(item.date).format('MM-DD HH:mm') : '';
		let logo = Util.logoFix(item.name, item.contractType, 40);
		let from = null;
		if (item.contractType === 1) {
			from = (<TextEx style={[styles.row_title, {
				color: '#999999',
				fontSize: 12,
				lineHeight: 17,
			}]}>
				{strings('phone_tab.comeform')}
			</TextEx>);
		}
		let icon = this.global._callIcon(item, 20);
		return (
			<Fragment key={item.name + index}>
				<Button style={[styles.row, {minHeight: 66, height: 66}]} onPress={() => {
					this._showClientActionSheet(item)
				}}>
					<View style={{
						flexDirection: "row", alignItems: "center", minHeight: 66, height: 66
					}}>
						{logo}
						<View style={styles.row_content}>
							<TextEx style={styles.row_title}>{item.name}</TextEx>
							<View style={{alignItems: "center", flexDirection: "row"}}>
								{item.date ? (
									<Fragment>
										{icon}
										<TextEx style={[styles.row_title, {
											color: '#999999',
											fontSize: 14,
											lineHeight: 20,
											marginLeft: 4,
											marginTop: 3
										}]}>{date}</TextEx>
									</Fragment>
								) : (from ? from : null)}
							</View>
						</View>
						<View style={{padding: 15, paddingRight: 0,}}>
							<Icon icon={'call_icon_phone_call'} size={25} color={'#4A90E2'}/>
						</View>
					</View>

				</Button>
			</Fragment>
		);
	}

	rowTap(item) {
		this.navigation.push('CallPhonePage', {
			country_no: item.country_no,
			phone_no: item.phone_no,
			contract_id: item.id,
		})
	}

	EmptyComponent() {
		return (
			<View style={{flex: 1, justifyContent: 'flex-start',
				alignItems: 'center', height: '100%', paddingBottom: 52,
				backgroundColor: '#FFF'}}>
				<TextEx style={{
					fontSize: 16, color: '#333', width: 224, marginTop: 74, lineHeight: 22,
				}}>
					{strings('phone_tab.empty_tip1')}
				</TextEx>
				<View style={[AppStyle.row, {height: 22, justifyContent: 'flex-start', alignItems: 'center', width: 224}]}>
					<TextEx style={{fontSize: 16, color: '#333',}}>
						{strings('phone_tab.empty_tip2')}
					</TextEx>
					<Icon icon={'topbar_icon_addcall'} size={24} color={'#4A90E2'} style={{marginHorizontal: 8}}/>
					<TextEx style={{fontSize: 16, color: '#333',}}>
						{strings('phone_tab.empty_tip3')}
					</TextEx>
				</View>
				<View style={{flex: 1}}/>
				<TextEx style={{
					fontSize: 16, color: '#333',
					width: 224, justifyContent: 'flex-end'
				}}>
					{strings('phone_tab.empty_tip4')}
				</TextEx>
			</View>
		)
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
		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={''}
							barHeight={52}
							bottom_line={false}
							leftRender={(
								<View style={AppStyle.row}>
									<Button style={{paddingLeft: 6}}
											onPress={() => this.navigation.push('UserPage')}>
										{this.global.avatarIcon(40)}
									</Button>
									<TextEx style={{
										fontSize: 28, color: '#333',
										lineHeight: 40, marginLeft: 12, fontWeight: '500'
									}}>
										{strings('phone_tab.title')}
									</TextEx>
								</View>
							)}
							rightRender={(
								<Fragment>
									<View style={AppStyle.row}>
										{/*<Button onPress={() => this.navigation.push('NewPhonePage')}>*/}
										{/*	<Icon icon={'arrow-left'} size={24} color={'#BBB'}/>*/}
										{/*</Button>*/}
										<Button onPress={() => this.navigation.push('PhoneList')}>
											<Icon icon={'topbar_icon_phonebook'} size={24} color={'#4A90E2'}/>
										</Button>
										<Button onPress={() => this.navigation.push('NewPhonePage')}>
											<Icon icon={'topbar_icon_addcall'} size={24} color={'#4A90E2'}
												  style={{marginHorizontal: 16}}/>
										</Button>
									</View>
								</Fragment>
							)}
					/>
					<SearchBar placeholder={strings("connect_tab.search_placeholder")}
							   touchSearchBar={() => this.navigation.push('SearchPage',
								   {
									   rowTap: (item) => {
										   this.rowTap(item);
									   },
								   }
							   )}/>

					<SectionList
						style={{backgroundColor: "#FFF", flex: 1}}
						contentContainerStyle={[
							sections.length == 0 ? styles.contentContainerEmpty :
								styles.contentContainer,
						]}
						ListHeaderComponent={() => this._listHeader()}
						keyboardShouldPersistTaps={'always'}
						keyboardDismissMode={'on-drag'}
						renderItem={({item, index}) => this._renderItem(item, index)}
						renderSectionHeader={(section) => this._renderSectionHeader(section)}
						renderSectionFooter={() => {
						}}
						sections={sections}
						keyExtractor={(item, index) => item + index}
						stickySectionHeadersEnabled={false}
						ItemSeparatorComponent={() => <Line/>}
						ListEmptyComponent={() => this.EmptyComponent()}
					/>
					<Button style={{position: "absolute", right: 6, bottom: 6, width: 88, height: 88,}}
							onPress={() => {
								this.navigation.navigate('CallPhonePage');
							}}>
						<Icon icon={'call_icon_btn_number'} size={88}/>
					</Button>
				</SafeView>
			</Fragment>
		)
	}
}

const styles = StyleSheet.create({
	contentContainerEmpty: {
		flex: 1,
	},
	contentContainer: {},
	section: {
		height: 30,
		backgroundColor: "#F5F5F5",
	},
	section_title: {
		lineHeight: 30,
		fontSize: 12,
		color: "#999999",
		marginHorizontal: 12,
	},
	row: {
		backgroundColor: "#fff",
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
		marginLeft: 10,
		lineHeight: 22
	},
	bottomUpPhoneStyle: {
		flex: 1,
		fontSize: 14,
		color: "#999",
		textAlign: "right",
		lineHeight: 44
	},
	bottomUpPhoneBtn: {
		paddingHorizontal: 12,
		backgroundColor: "#FFF",
		height: 66,
		alignItems: 'center',
		justifyContent: 'center'
	}
});
