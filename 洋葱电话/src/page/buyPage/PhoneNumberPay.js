'use strict';
import React, {Fragment, Component} from 'react';
import {
	Text, View,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	Animated,
	Dimensions,
	Image,
	ImageBackground, SectionList, Alert, DatePickerIOS
} from 'react-native';
import {strings} from "../../../locales";
import {inject, observer} from "mobx-react";
import AppStyle, {font} from '../../Style';
import NavBar from "../../components/NavBar";
import Line from "../../components/Line";
import SearchBar from "../../components/SearchBar";
import Button from "../../components/Button";
import Req from "../../global/req";
import URLS from "../../value/URLS";
import SafeView from "../../components/SafeView";
import {StackActions} from 'react-navigation';
import {observable, toJS} from "mobx";
import CountryIcon from "../../value/CountryIcon";

const ic_mouth = require('../../assets/img/message/ic_mouth.png');
const ic_week = require('../../assets/img/message/ic_week.png');
const ic_safe = require('../../assets/img/message/ic_safe.png');
import {Card} from 'react-native-shadow-cards';
import TextEx from "../../components/TextEx";
import CountryDao from "../../dao/CountryDao";
import AutoSave from "../../TModal/AutoSave";
import Global from "../../mobx/Global";
import BaseComponents from "../../BaseComponents";

function padding(num, length) {
	return ("0000000000000000" + parseInt(num)).substr(-length);
}

@inject('store', 'global')
@observer
export default class PhoneNumberPay extends BaseComponents {

	@AutoSave
	countryService

	@observable
	timer = 5999;
	@observable
	country_en = '';

	global: Global;

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;
		this.data = this.navigation.getParam('data');

		this.state = {
			sections: [],
		}
	}

	// key?: string;
	// newKey?: string;
	// routeName: string;

	componentDidMount() {

		this.global.showLoading();
		Req.post(URLS.GET_PHONE_PRICE, {
			country_code: this.data.country_code,
			country_no: this.data.country_no,
			region_no: this.data.region_no,
			phoneNumber: this.data.phoneNumber,
			phone_type: this.data.phone_type,
		}).then(async (res) => {
			let country: CountryDao = await this.countryService.getCountryWithCountry_code(this.data.country_code);
			this.country_en = country.country_en;
			console.log(country);
			this.global.dismissLoading();
			this.dataFix(res.data);
		})

		this.timerAct = setInterval(() => {
			this.timer -= 1;
			if (this.timer <= 0) {
				this.back();
			}
		}, 1000)
	}

	componentWillUnmount() {
		super.componentWillUnmount();

		clearInterval(this.timerAct);
	}

	renderHeader(m, s) {

		return (
			<Fragment>
				<Card style={[{
					padding: 20,
					margin: 15,
					borderRadius: 8,
					justifyContent: 'center',
					alignItems: 'center',
				}]} opacity={0.15}>
					<TextEx style={styles.headerTextTitle}>您挑选的号码</TextEx>
					<TextEx style={styles.headerPhoneText}>
						+{this.data.country_no} {this.data.friendlyName}
					</TextEx>
					<View style={[AppStyle.row, {flex: 1, alignItems: 'center', justifyContent: 'center'}]}>
						<Image
							resizeMode={'contain'}
							style={{width: 20}}
							source={CountryIcon[this.data.country_code]}
						/>
						<TextEx style={styles.headerCountry}>{this.country_en}</TextEx>
					</View>
					<View style={[{
						borderWidth: 1,
						borderRadius: 18,
						borderColor: '#DD0D26',
						justifyContent: 'center',
						alignItems: 'center',
						minHeight: 36,
						minWidth: 115,
						marginTop: 10,
					}]}>
						<TextEx style={[styles.headerTimer, font(16)]}>{m}:{s}</TextEx>
					</View>
					<TextEx style={[styles.headerTimer, font(10), {marginTop: 5}]}>剩余时间</TextEx>
				</Card>
				<View style={{
					height: 30, backgroundColor: '#F5F5F5', marginTop: 5,
					justifyContent: 'center', alignItems: 'flex-start'
				}}>
					<TextEx style={{fontSize: 12, color: '#999', marginLeft: 16}}>
						选择您购买的号码套餐
					</TextEx>
				</View>
			</Fragment>

		)
	}

	findRouteName(name) {
		let i = -1;
		this.global.routeList.map((item, index) => {
			if (item.routeName == name) {
				i = index
			}
		})
		return i;
	}

	back() {
		let result = this.findRouteName('PhoneList');
		if (result != -1) {
			this.navigation.pop(this.global.routeList.length - result - 1);
		} else {
			result = this.findRouteName('CountrySelect');
			if (result != -1) {
				this.navigation.pop(this.global.routeList.length - result);
			} else {
				this.navigation.pop();
			}
		}
	}

	buySuccessBack() {
		let result = this.findRouteName('PhoneList');
		if (result != -1) {
			this.navigation.pop(this.global.routeList.length - result - 1);
		} else {
			result = this.findRouteName('CountrySelect');
			if (result != -1) {
				let rou = this.global.routeList[result];
				const replaceAction = StackActions.replace({
					key: rou.key,
					routeName: 'PhoneList',
				});
				this.navigation.dispatch(replaceAction);
				this.navigation.pop(this.global.routeList.length - result - 1);
			}
		}
	}

	dataFix(data) {
		let hot = [];
		let normal = [];
		for (let item of data) {
			if (item.ishot) {
				item.icon = require('../../assets/img/message/ic_mouth.png');
				hot.push(item);
			}
			item.icon = require('../../assets/img/message/ic_safe.png');
			normal.push(item);
		}
		let section = [];
		let hotSection = hot.length > 0 ? {title: '热销', data: hot} : undefined;
		let normalSection = normal.length > 0 ? {title: '套餐', data: normal} : undefined;
		if (hotSection) {
			section.push(hotSection);
		}
		if (normalSection) {
			section.push(normalSection);
		}
		this.setState({
			sections: section
		})
	}

	_renderSectionHeader(sectionItem) {
		const {section} = sectionItem;
		return (
			<Fragment>
				<View style={{backgroundColor: '#FFF', paddingHorizontal: 12, paddingTop: 12, fontWeight: "500"}}>
					<TextEx style={{fontSize: 15, lineHeight: 30, color: "#333"}}>{section.title}</TextEx>
				</View>
			</Fragment>
		)
	}

	// 1:连续包月 2:包季 3:连续包年
	// 分组列表的renderItem
	_renderItem(item, index) {
		let price_string = '';
		let icon = '';
		switch (parseInt(item.pay_type)) {
			case 1: {
				price_string = '连续包月';
				icon= require('../../assets/newimg/png/icon/buy/buy_icon_product2.png');
				break;
			}
			case 2: {
				price_string = '包季';
				icon= require('../../assets/newimg/png/icon/buy/buy_icon_product1.png');
				break;
			}
			case 3: {
				price_string = '连续包年';
				icon= require('../../assets/newimg/png/icon/buy/buy_icon_product3.png');
				break;
			}
		}
		return (
			<Button style={[AppStyle.row, styles.row]}
					onPress={() => {
						this.showConfig(item);
					}}>
				<Image
					style={{width: 40, height: 40, alignSelf: "center", marginRight: 10}}
					source={icon}
				/>
				<View style={{maxWidth: '50%'}}>
					<TextEx style={styles.rowTitle}>{price_string}</TextEx>
					<TextEx style={styles.rowLeftTitle}>按周扣费，每周更新，灵活方便【{price_string}】</TextEx>
				</View>
				<TextEx style={styles.rowPrice}>$ {item.current_price}</TextEx>
				<Image
					style={{width: 22, height: 22, alignSelf: "center", marginLeft: 5}}
					source={require('../../assets/img/util/ic_arrow_right.png')}
				/>
			</Button>
		);
	}

	UNSAFE_componentWillMount(): void {
		try {
			this.global.modalRef.handlehide();
		} catch (e) {}
	}

	showConfig(item) {
		console.log(toJS(item))
		let price_string = '';
		let price_name = '';
		switch (parseInt(item.pay_type)) {
			case 1: {
				price_string = '1个月';
				price_name = '连续包月';
				break;
			}
			case 2: {
				price_string = '3个月';
				price_name = '包季';
				break;
			}
			case 3: {
				price_string = '1年';
				price_name = '连续包年';
				break;
			}
		}
		this.global.modalRef.showModal((
			<View style={{
				padding: 20,
				borderRadius: 13,
				backgroundColor: 'white',
				justifyContent: 'center',
				alignItems: 'center',
			}}>
				<Image
					style={{width: 60, height: 60}}
					source={require('../../assets/newimg/png/icon/buy/buy_icon_hot.png')}
				/>
				<TextEx style={{fontSize: 16, color: '#333', marginVertical: 4}}>{price_name}</TextEx>
				<TextEx style={{color: '#4A90E2', fontSize: 24, fontWeight: '500'}}>¥{item.current_price}</TextEx>
				<View style={[AppStyle.row, {width: 172, justifyContent: 'flex-start', marginTop: 5}]}>
					<TextEx style={{fontSize: 12, color: '#999', lineHeight: 20}}>有效期限：</TextEx>
					<TextEx style={{fontSize: 14, color: '#333', lineHeight: 20}}>{price_string}</TextEx>
				</View>
				<View style={[AppStyle.row, {width: 172, justifyContent: 'flex-start', marginTop: 5}]}>
					<TextEx style={{fontSize: 12, color: '#999', lineHeight: 20}}>自动续费：</TextEx>
					<TextEx style={{fontSize: 14, color: '#333', lineHeight: 20}}>开启（随时关闭）</TextEx>
				</View>
				<View style={[AppStyle.row, {width: 172, justifyContent: 'flex-start', marginTop: 5}]}>
					<TextEx style={{fontSize: 12, color: '#999', lineHeight: 20}}>广告设置：</TextEx>
					<TextEx style={{fontSize: 14, color: '#333', lineHeight: 20}}>开启</TextEx>
				</View>
				<TouchableOpacity style={{
					backgroundColor: '#4A90E2',
					minHeight: 44,
					paddingHorizontal: 70,
					borderRadius: 22,
					marginTop: 28,
				}} onPress={()=>{this.PayPhone(item)}}>
					<TextEx style={{fontSize: 16, color: '#fff', lineHeight: 44, fontWeight: '500'}}>
						获取号码使用权
					</TextEx>
				</TouchableOpacity>
			</View>
		), 'middle')
	}

	// addressRequirements: "none"
	// capabilities: {voice: true, SMS: true, MMS: true, fax: false}
	// country_code: "US"
	// country_no: "1"
	// friendlyName: "(623) 526-1308"
	// phoneNumber: "+16235261308"
	// phone_type: "local"
	// region_code: "AZ"
	// region_no: "623"


	async PayPhone(itemdata) {
		this.global.modalRef.handlehide();
		this.global.showLoading();
		Req.post(URLS.PAY_PHONE, {
			price_id: itemdata.id,
			country_code: this.data.country_code,
			country_no: this.data.country_no,
			region_no: this.data.region_no,
			phone_no: this.data.phoneNumber.replace('+', ''),
			price_usd: itemdata.current_price,
			capabilities: JSON.stringify(this.data.capabilities),
			phone_type: this.data.phone_type,
		}).then((res) => {
			this.global.dismissLoading();
			Alert.alert(
				'购买成功',
				'',
				[{
					text: '确定',
					onPress: () => {
						this.buySuccessBack()
					}
				}],
				{cancelable: false}
			)
		}, (res) => {
			this.global.dismissLoading();
			Alert.alert(
				'购买失败',
				'',
				[{
					text: '确定',
					onPress: () => {
					}
				}],
				{cancelable: false}
			)
		})
	}

	render() {
		// let vocArray = [];
		// for (let key in this.data.capabilities) {
		// 	let value = this.data.capabilities[key];
		// 	if (value) {
		// 		vocArray.push((
		// 			<View style={[AppStyle.row, styles.voc]} key={key}>
		// 				<Image resizeMode={'contain'}
		// 					   style={{width: 14}}
		// 					   source={require('../../assets/img/preson/ic_contact_done.png')}/>
		// 				<TextEx style={styles.vocTitle}>{key.toUpperCase()}</Text>
		// 			</View>
		// 		))
		// 	}
		// }

		let m = padding(this.timer / 60, 2);
		let s = padding(this.timer % 60, 2);

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>

					<NavBar title={'选择电话套餐'}
							bottom_line={true}
							leftRender={(
								<Button style={{padding: 10, paddingRight: 12}} onPress={() => {
									this.back()
								}}>
									<Image
										style={{width: 22, height: 22}}
										source={require('../../assets/img/util/ic_back_black.png')}
									/>
								</Button>
							)}
					/>
					<View style={{flex: 1}}>
						<SectionList
							style={{backgroundColor: "white", flex: 1}}
							keyboardDismissMode={'on-drag'}
							// contentContainerStyle={styles.contentContainer}
							renderItem={({item, index}) => this._renderItem(item, index)}
							ListHeaderComponent={() => this.renderHeader(m, s)}
							renderSectionHeader={this._renderSectionHeader}
							renderSectionFooter={() => <View style={{height: 20, backgroundColor: '#F5F5F5'}}/>}
							sections={this.state.sections}
							keyExtractor={(item, index) => item + index}
							stickySectionHeadersEnabled={false}
							ItemSeparatorComponent={() =>
								<Line style={{marginLeft: 60, marginRight: 12}}/>
							}
						/>

					</View>

				</SafeView>
			</Fragment>
		)
	}
}
const styles = StyleSheet.create({
	rowTitle: {
		fontSize: 15,
		color: "#333",
		textAlign: "left",
	},
	rowLeftTitle: {
		fontSize: 12,
		lineHeight: 16,
		color: "#999",
		textAlign: "left",
		flexWrap: 'wrap',
		marginTop: 5,
	},
	rowPrice: {
		fontSize: 14,
		color: "#4A90E2",
		textAlign: "right",
		alignSelf: "center",
		flexWrap: 'nowrap',
		flex: 1,
		fontWeight: '500'
	},
	row: {
		paddingVertical: 10,
		paddingHorizontal: 12
	},
	headerTextTitle: {
		fontSize: 12,
		color: '#333',
		fontWeight: "300",
		textAlign: 'center',
		marginVertical: 8,
	},
	headerPhoneText: {
		fontSize: 24,
		color: '#333',
		marginTop: 4,
		textAlign: 'center'
	},
	headerTimer: {
		color: "#DD0D26",
		fontWeight: "300",
	},
	headerCountry: {
		fontSize: 12,
		color: "#333",
		lineHeight: 17,
		marginLeft: 4,
		justifyContent: 'center',
	},
	voc: {
		backgroundColor: '#EBEBEB',
		alignItems: 'center',
		borderRadius: 14,
		padding: 2,
		marginRight: 5
	},
	vocTitle: {
		fontSize: 10,
		color: '#333',
		marginRight: 7,
		marginLeft: 3,
	},
});
