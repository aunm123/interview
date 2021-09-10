'use strict';
import React, {Fragment, Component} from 'react';
import {
	Text, View,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	Animated,
	Dimensions,
	Image, ScrollView, Alert,
	ImageBackground, SectionList, FlatList, Switch
} from 'react-native';
import {strings} from "../../../locales";
import {inject, observer} from "mobx-react";


import AppStyle, {font} from '../../Style';
import NavBar from "../../components/NavBar";
import Line from "../../components/Line";
import URLS from "../../value/URLS";
import Req from "../../global/req";
import Util from "../../global/Util";
import Button from "../../components/Button";
import {observable, toJS} from "mobx";
import SafeView from "../../components/SafeView";
import TextEx from "../../components/TextEx";
import CustomStorage from "../../global/CustomStorage";
import CustomActionSheet from "../../components/CustomActionSheet";
import TextExTitle from "../../components/TextExTitle";
import BaseComponents from "../../BaseComponents";

var {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
export default class PrivacyPage extends BaseComponents {

	@observable
	phoneNumber = false;
	@observable
	nameSearch = false;
	@observable
	searchResult = false;
	@observable
	personDetailType = 0;
	@observable
	personDetailShowTitle = '';

	actionOptioms = [];

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;

		this.initData().then();
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	chooseLeaveToLock(type) {
		let title_detail = '';
		switch (parseInt(type)) {
			case 0 : {
				title_detail = strings('PrivacyPage.all');
				break;
			}
			case 1: {
				title_detail = strings('PrivacyPage.friend');
				break;
			}
			case 2: {
				title_detail = strings('PrivacyPage.friendAndContract');
				break;
			}
		}
		this.personDetailShowTitle = title_detail;
	}

	async initData() {
		const options = [
			<TextEx>{strings('PrivacyPage.all')}</TextEx>,
			<TextEx>{strings('PrivacyPage.friend')}</TextEx>,
			<TextEx>{strings('PrivacyPage.friendAndContract')}</TextEx>,
			<TextEx style={{color: '#999'}}>{strings('other.cancel')}</TextEx>];

		this.actionOptioms = options;

		let personDetailShow = await CustomStorage.getItem('personDetailShow');
		if (personDetailShow == null || personDetailShow == undefined) {
			personDetailShow = 0;
		}
		this.chooseLeaveToLock(personDetailShow);
	}

	actionSheetShow() {

		this.global.modalRef.showModal((
			<CustomActionSheet title={strings('PrivacyPage.personDetailShow')}
							   options={this.actionOptioms}
							   click={async (index) => {
								   this.chooseLeaveToLock(index);
								   await CustomStorage.setItem('personDetailShow', index);
							   }}
							   cancelIndex={3}/>
		), 'bottom')
	}

	render() {

		let rootPhone = this.global.rootPhone;

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={strings('PrivacyPage.title')}
							bottom_line={true}
							leftRender={(
								<Button style={{paddingLeft: 6, paddingRight: 12}} onPress={() => this.navigation.pop()}>
									<Image
										style={{width: 22, height: 22}}
										source={require('../../assets/img/util/ic_back_black.png')}
									/>
								</Button>
							)}
							rightRender={(
								<Button style={{paddingRight: 6}} >
									<TextExTitle style={{color: '#4A90E2', fontSize: 16, fontWeight: '500'}}>
										{strings('PrivacyPage.saveSure')}
									</TextExTitle>
								</Button>
							)}
					/>
					<ScrollView>

						{/*电话号码*/}
						<Button style={[AppStyle.row, styles.roowline]} onPress={() => {
							this.phoneNumber = !this.phoneNumber;
						}}>
							<View style={{flex: 1}}>
								<TextEx style={styles.rowTitle}>
									{strings('PrivacyPage.phoneNum')}
										(+{rootPhone.form_country} {rootPhone.form_no})
								</TextEx>
								<TextEx style={styles.rowDetail}>
									{strings('PrivacyPage.phoneNumDetail')}
								</TextEx>
							</View>
							<Switch value={this.phoneNumber}
									onValueChange={(value) => {
										this.phoneNumber = value;
									}}/>
						</Button>
						<Line style={{marginLeft: 16}} />

						{/*洋葱名查询*/}
						<Button style={[AppStyle.row, styles.roowline]} onPress={() => {
							this.nameSearch = !this.nameSearch;
						}}>
							<View style={{flex: 1}}>
								<TextEx style={styles.rowTitle}>
									{strings('PrivacyPage.nameSearch')}
								</TextEx>
								<TextEx style={styles.rowDetail}>
									{strings('PrivacyPage.nameSearchDetail')}
								</TextEx>
							</View>
							<Switch value={this.nameSearch}
									onValueChange={(value) => {
										this.nameSearch = value;
									}}/>
						</Button>
						<Line style={{marginLeft: 16}} />

						{/*显示在搜索结果中*/}
						<Button style={[AppStyle.row, styles.roowline]} onPress={() => {
							this.searchResult = !this.searchResult;
						}}>
							<View style={{flex: 1}}>
								<TextEx style={styles.rowTitle}>
									{strings('PrivacyPage.searchResult')}
								</TextEx>
								<TextEx style={styles.rowDetail}>
									{strings('PrivacyPage.searchResultDetail')}
								</TextEx>
							</View>
							<Switch value={this.searchResult}
									onValueChange={(value) => {
										this.searchResult = value;
									}}/>
						</Button>
						<Line style={{marginLeft: 16}} />

						{/*个人资料展示*/}
						<Button style={[AppStyle.row, styles.roowline]} onPress={() => {
							this.actionSheetShow()
						}}>
							<View style={{flex: 1}}>
								<TextEx style={styles.rowTitle}>
									{strings('PrivacyPage.personDetailShow')}
								</TextEx>
							</View>
							<TextEx style={{fontSize: 14, color: '#999'}}>
								{this.personDetailShowTitle}
							</TextEx>
						</Button>
						<Line style={{marginLeft: 16}} />

					</ScrollView>
				</SafeView>

			</Fragment>
		)
	}
}

const styles = StyleSheet.create({
	roowline: {
		paddingHorizontal: 16,
		paddingVertical: 12,
		justifyContent: 'center',
		alignItems: 'center',
		minHeight: 65
	},
	rowTitle: {
		fontSize: 16,
		color: '#333',
		lineHeight: 22
	},
	rowDetail: {
		fontSize: 12,
		color: '#999',
		lineHeight: 20
	}
});
