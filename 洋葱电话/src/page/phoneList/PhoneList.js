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
	ImageBackground, SectionList
} from 'react-native';
import {strings} from "../../../locales";
import {inject, observer} from "mobx-react";
import AppStyle, {font} from '../../Style';
import NavBar from "../../components/NavBar";
import Line from "../../components/Line";
import SearchBar from "../../components/SearchBar";
import {NewPhoneRow} from "../../components/row/NewPhoneRow";
import URLS from "../../value/URLS";
import Req from "../../global/req";
import Util from "../../global/Util";
import Button from "../../components/Button";
import SafeView from "../../components/SafeView";
import CountryIcon from "../../value/CountryIcon";
import TextEx from "../../components/TextEx";
import BaseComponents from "../../BaseComponents";

@inject('store', 'global')
@observer
export default class PhoneList extends BaseComponents {
	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;
		this.state = {
			sections: [{
				data: []
			}],
		}

	}

	onStart() {
		super.onStart();

		this.global.showLoading();
		Req.post(URLS.MY_PHONE)
			.then((res)=>{
				this.global.dismissLoading();
				this.dataInit(res.data).then()
				this.global.userData.phonelist = res.data;
			})
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	async dataInit(data){
		// "id": "14",
		// 	"user_id": "ddo8gvo3x4455d7126bf",
		// 	"country_no": "1",
		// 	"region_no": "901",
		// 	"buy_no": "19012095288",
		// 	"bind_no": "855969799683",
		// 	"capabilities": {
		// 	"voice": true,
		// 		"SMS": true,
		// 		"fax": true,
		// 		"MMS": true
		// },
		// "start_time": "1568809805",
		// 	"end_time": "1571401804",
		// 	"status": "1",                        //0:锁定 1:正常 2:删除
		// 	"country_code": "US",
		// 	"ismain": "0",                        //0:普通 1:主叫号码
		// 	"remark": "0",                        //0:无 1:z住宅 2:办公室 3:移动电话
		// 	"country_cn": "美国",
		// 	"country_en": "United States"

		let resultDatas = [];
		for (let item of data) {
			console.log(item)
			let remarkName = '';
			switch (item.remark) {
				case '0':{
					remarkName = '';
					break;
				}
				case '1':{
					remarkName = '住宅';
					break;
				}
				case '2':{
					remarkName = '办公室';
					break;
				}
				case '3':{
					remarkName = '移动电话';
					break;
				}
			}
			if (item.status != '2'){
				resultDatas.push({
					country_code: item.country_code,
					region: item.region_no,
					phone_no: item.buy_no,
					phone: Util.cutPhoneNum(item.buy_no, item.country_no, item.region_no),
					capabilities: item.capabilities,
					end_time: Util.formatDate(parseFloat(item.end_time)* 1000),
					ismain: parseInt(item.ismain),
					remark: remarkName,
					remarkNum: parseInt(item.remark),
					countryName: item.country_cn,
					countryIcon: "",
					status: parseInt(item.status),
					renewal_coin: parseInt(item.renewal_coin),
				})
			}
		}

		this.setState({sections: [{data: resultDatas}],})
	}

	_renderSectionHeader(sectionItem) {
		const {section} = sectionItem;
		return (
			<View style={{paddingHorizontal: 12, paddingTop: 20,paddingBottom:8}}>
				<TextEx style={styles.headerTitle}>拥有的电话号码 : ({section.data.length}）</TextEx>
			</View>
		)
	}

	_renderSectionFooter(sectionItem) {
		return (
			<Fragment>
				<View style={{height: 20, backgroundColor: '#F5F5F5'}}/>
				<NewPhoneRow navigation={this.navigation} />
				<View style={{height: 20, backgroundColor: '#F5F5F5'}}/>
			</Fragment>

		)
	}

	// 分组列表的renderItem
	_renderItem(item, index) {

		console.log(item);

		let vocArray = [];
		for(let key in item.capabilities){
			let value = item.capabilities[key];
			if (value){
				vocArray.push((
					<View style={[AppStyle.row, styles.voc]} key={key}>
						<Image resizeMode={'contain'}
							   style={{width: 14}}
							   source={require('../../assets/img/preson/ic_contact_done.png')}/>
						<TextEx style={styles.vocTitle}>{key.toUpperCase()}</TextEx>
					</View>
				))
			}
		}

		return (
			<Button onPress={()=>this.navigation.push('PhoneEditDetail', {data: item})}>
				<View style={[AppStyle.row, {paddingHorizontal: 12, paddingTop: 12}]}>
					<TextEx style={styles.rowHeaderTitle}>{item.remark}</TextEx>
					<TextEx style={styles.leftRowHeaderTitle}>{item.ismain==1?'主叫号码':''}</TextEx>
				</View>
				<View style={[AppStyle.row, styles.row]}>
					<Image
						resizeMode={'contain'}
						style={{width: 40, marginRight: 20}}
						source={CountryIcon[item.country_code]}
					/>
					<View style={{flex: 1}}>
						<TextEx style={styles.rowTitle}>{item.phone}</TextEx>
						<View style={[AppStyle.row, {flexWrap: 'wrap'}]}>
							{vocArray}
						</View>
					</View>
					<Image
						resizeMode={'contain'}
						style={{width: 24, marginRight: 24}}
						source={item.status==0?
							require('../../assets/img/preson/ic_timeout.png'):
							require('../../assets/img/preson/ic_using.png')}
					/>
					<Image
						resizeMode={'contain'}
						style={{width: 20, height: 20}}
						source={require('../../assets/img/util/ic_arrow_right.png')}
					/>
				</View>
				<View style={[AppStyle.row, {paddingHorizontal: 12, paddingVertical: 10, paddingTop: 5}]}>
					<TextEx style={styles.rowfootTitle}>{item.countryName}</TextEx>
					<TextEx style={styles.leftRowfootTitle}>有效期至：{item.end_time}</TextEx>
				</View>
			</Button>
		);
	}

	render() {
		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={'我的电话号码'}
							bottom_line={true}
							leftRender={(
								<Button style={{padding: 6, paddingRight: 12}} onPress={() => {
									this.navigation.pop()
								}}>
									<Image
										style={{width: 22, height: 22}}
										source={require('../../assets/img/util/ic_back_black.png')}
									/>
								</Button>
							)}
					/>
					<SectionList
						style={{backgroundColor: "white", flex: 1}}
						keyboardDismissMode={'on-drag'}
						renderItem={({item, index}) => this._renderItem(item, index)}
						renderSectionHeader={this._renderSectionHeader.bind(this)}
						renderSectionFooter={this._renderSectionFooter.bind(this)}
						sections={this.state.sections}
						keyExtractor={(item, index) => item + index}
						stickySectionHeadersEnabled={false}
						ItemSeparatorComponent={() =>
							<Line style={{marginHorizontal: 12}} />
						}
					/>

				</SafeView>
			</Fragment>
		)
	}
}
const styles = StyleSheet.create({
	headerTitle: {
		fontSize: 15,
		color: '#333',
		fontWeight: '500'
	},
	rowTitle:{
		fontSize: 15,
		color: "#333",
		flex: 1,
		textAlign: "left",
		lineHeight: 25,
		fontWeight: '500',
	},
	rowRightTitle: {
		fontSize: 14,
		color: "#999",
		flex: 1,
		textAlign: "right",
		alignSelf: "center"
	},
	row: {
		paddingTop: 10,
		paddingHorizontal: 12,
		alignItems: 'center',
	},
	voc:{
		backgroundColor: '#EBEBEB',
		alignItems: 'center',
		borderRadius: 14,
		padding: 2,
		marginRight: 5,
		marginBottom: 3,
	},
	vocTitle: {
		fontSize: 10,
		color: '#333',
		marginRight: 7,
		marginLeft: 3,
	},
	rowHeaderTitle: {
		fontSize: 14,
		color: '#333',
		flex: 1,
	},
	leftRowHeaderTitle: {
		fontSize: 14,
		color: '#999'
	},
	rowfootTitle: {
		fontSize: 10,
		color: '#333',
		textAlign: 'center',
		width: 40,
	},
	leftRowfootTitle: {
		fontSize: 10,
		color: '#999',
		flex: 1,
		textAlign: 'right'
	}
});
