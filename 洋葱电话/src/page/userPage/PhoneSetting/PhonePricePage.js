'use strict';
import React, {Fragment, Component} from 'react';
import {
	StyleSheet,
	StatusBar,
	Dimensions,
	Image, ScrollView, View, Switch, Text, TextInput, FlatList,
} from 'react-native';

import {inject, observer} from "mobx-react";
import SafeView from "../../../components/SafeView";
import NavBar from "../../../components/NavBar";
import Button from "../../../components/Button";
import TextEx from "../../../components/TextEx";
import AppStyle from "../../../Style";
import {strings} from "../../../../locales";
import Line from "../../../components/Line";
import {observable, toJS} from "mobx";
import Kine from "../../../components/Kine";
import Util from "../../../global/Util";
import BaseComponents from "../../../BaseComponents";
import Req from "../../../global/req";
import URLS from "../../../value/URLS";
import Svg from "react-native-svg";
import Icon from "../../../value/Svg";

const {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
export default class PhonePricePage extends BaseComponents {

	@observable
	country_no = '';
	@observable
	phone_no = '';
	@observable
	country_code = "";

	@observable
	btnUseFul = true;

	@observable
	data = [];

	@observable
	connect_rate = 0;


	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;
	}

	async search() {
		this.global.showLoading();

		let res = await Req.post(URLS.GET_PHONE_RATE, {
			country_no: this.country_no,
			phone_no: this.phone_no,
			country_code: this.country_code
		});
		let result = [];
		let phonePrice = [];
		for (let pPrice of res.data.call_rate) {
			phonePrice.push({
				title: pPrice.name,
				price: pPrice.coins,
				cout: '分钟'
			})
		}
		result.push({
			title: '电话',
			data: phonePrice,
		});
		phonePrice = [];
		for (let pPrice of res.data.sms_rate) {
			phonePrice.push({
				title: pPrice.name,
				price: pPrice.coins,
				cout: '分钟'
			})
		}
		result.push({
			title: '短信',
			data: phonePrice,
		});

		this.connect_rate = parseInt(res.data.connect_rate.coins);

		this.data = result;
		this.global.dismissLoading();
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	_renderItem(item, index) {
		let rows = item.data.map((i) => {
			return (
				<Fragment key={JSON.stringify(i)}>
					<View style={[AppStyle.row, {height: 36, alignItems: 'center'}]}>
						<TextEx style={{flex: 3, color: '#999', fontSize: 12, lineHeight: 17}}>
							{i.title}
						</TextEx>
						<TextEx style={{flex: 7, color: '#999', fontSize: 12, lineHeight: 17}}>
							{i.price}洋葱币/{i.cout}
						</TextEx>
					</View>
					<Line/>
				</Fragment>
			)
		});
		let firstHeader = index == 0 ? this.renderResultSearchView() : null;
		return (
			<Fragment key={JSON.stringify(item) + index}>
				{firstHeader}
				<View style={{paddingHorizontal: 16}}>
					<View style={[AppStyle.row, {marginTop: 10}]}>
						<TextEx style={{flex: 3, color: '#333', fontSize: 14, fontWeight: '500', lineHeight: 20}}>
							{item.title}
						</TextEx>
						<TextEx style={{flex: 7, color: '#333', fontSize: 14, fontWeight: '500', lineHeight: 20}}>
							资费
						</TextEx>
					</View>
					<View>
						{rows}
					</View>
				</View>
			</Fragment>
		)
	}

	renderResultSearchView() {
		return (
			<View style={{width: '100%'}}>
				<View style={{lineHeight: 30, backgroundColor: '#F5F5F5', paddingHorizontal: 16}}>
					<TextEx style={{lineHeight: 30, fontSize: 12, color: '#999'}}>查询结果</TextEx>
				</View>
			</View>
		)
	}

	_renderHeader() {

		let btnUseFul = this.country_no.length > 0;

		return (
			<View style={{justifyContent: 'center', alignItems: 'center'}}>
				<TextEx style={{fontSize: 16, color: '#333', marginTop: 28, marginBottom: 20}}>
					{strings('PhonePricePage.title2')}
				</TextEx>

				<View style={{flexDirection: 'row', marginHorizontal: 16}}>
					<Button style={{borderBottomWidth: 1, borderColor: '#E6E6E6'}}
							onPress={() => this.navigation.push('CountryZone', {
								callback: (item) => {
									this.country_no = item.country_no;
									this.country_code = item.country_code;
								}
							})}>
						<View style={[styles.fk, AppStyle.row,]}>
							<View style={{flex: 1, height: 16}}>
								<Text
									style={this.country_no.length > 0 ? styles.input : styles.input_placeholder}>
									{this.country_no.length > 0 ? '+' + this.country_no : strings('CreateAccount.areaCode_title')}
								</Text>
							</View>
							<Image
								style={[styles.inputDown]}
								source={require('../../../assets/newimg/png/icon/common/common_icon_unfold24.png')}
							/>
						</View>

					</Button>
					<View style={[styles.fk, {
						marginLeft: 15,
						flex: 1,
						borderBottomWidth: 1,
						borderColor: '#E6E6E6'
					}]}>
						<TextInput style={[styles.input, {flex: 1, height: '100%'}]}
								   onChangeText={(text) => {
									   this.phone_no = text;
								   }}
								   keyboardType={'phone-pad'}
								   maxLength={20}
								   placeholder={strings('CreateAccount.input_phone_placeholder')}
								   value={this.phone_no}/>
						<Button style={{
							justifyContent: "center",
							alignItems: 'center',
							height: '100%'
						}} onPress={() => this.navigation.push('SearchPage', {
							rowTap: (item) => {
								console.log(toJS(item));
								this.navigation.pop();
								this.country_no = item.country_no;
								this.phone_no = item.phone_no;
								this.country_code = "";
							},
						})}>
							<Icon icon={'chat_icon_contact'} size={22} color={'#4A90E2'}/>
						</Button>
					</View>
				</View>

				<TextEx style={{fontSize: 12, color: '#999', marginVertical: 16}}>
					您可以根据地区号或者电话号码来查询资费信息
				</TextEx>

				<View style={{width: '100%'}}>
					<Button
						disabled={!btnUseFul}
						style={{
							marginVertical: 8,
							marginHorizontal: 16,
							backgroundColor: '#4A90E2',
							flex: 1,
							paddingVertical: 11,
							height: 44,
							borderRadius: 22,
							justifyContent: 'center',
							alignItems: 'center',
							marginBottom: 20
						}}
						onPress={() => {
							this.search();
						}}>
						<TextEx style={{
							fontSize: 16, fontWeight: '400',
							color: '#fff'
						}}>
							搜索
						</TextEx>
					</Button>
				</View>
			</View>
		)
	}

	_renderFooter() {
		if (this.connect_rate == 0) {
			return null;
		}
		return (
			<View style={{marginVertical: 10, marginHorizontal: 16}}>
				<TextEx style={{fontSize: 12, color: '#999', lineHeight: 20}}>
					<TextEx style={{fontSize: 12, color: 'red', lineHeight: 20}}>* </TextEx>每通电话接通费收取{this.connect_rate}个洋葱币
				</TextEx>
			</View>
		)
	}

	render() {

		let data = [...this.data];

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={strings('PhonePricePage.title')}
							bottom_line={true}
							leftRender={(
								<Button style={{paddingLeft: 6, paddingRight: 12}}
										onPress={() => this.navigation.pop()}>
									<Image
										style={{width: 22, height: 22}}
										source={require('../../../assets/img/util/ic_back_black.png')}
									/>
								</Button>
							)}
					/>
					<FlatList
						style={{backgroundColor: "white", flex: 1}}
						keyboardDismissMode={'on-drag'}
						renderItem={({item, index}) => this._renderItem(item, index)}
						data={data}
						keyExtractor={(item, index) => item + index}
						stickySectionHeadersEnabled={false}
						ListHeaderComponent={this._renderHeader()}
						ListFooterComponent={this._renderFooter()}
					/>
				</SafeView>

			</Fragment>
		)
	}
}

const styles = StyleSheet.create({
	fk: {
		flexDirection: 'row',
		lineHeight: 50,
		height: 50,
		alignItems: 'center',
		width: 100
	},
	input: {
		fontSize: 14,
		color: '#333',
		fontWeight: '300',
		alignSelf: 'center'
	},
	input_placeholder: {
		paddingVertical: 0,
		fontSize: 14,
		fontWeight: '300',
		color: '#999',
		alignSelf: 'center',
		textAlign: 'center',
		flex: 1,
	},
	inputDown: {
		width: 16,
		height: 16,
	},
});
