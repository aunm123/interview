'use strict';
import React, {Fragment, Component} from 'react';
import {
	Text, View,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	Animated,
	Dimensions, TextInput,
	Image, ScrollView,
	ImageBackground
} from 'react-native';
import {strings} from "../../../locales";
import {inject, observer} from "mobx-react";

import AppStyle, {font} from '../../Style';
import NavBar from "../../components/NavBar";
import Line from "../../components/Line";
import {connectActionSheet} from "@expo/react-native-action-sheet";
import Button from "../../components/Button";
import Req from "../../global/req";
import URLS from "../../value/URLS";
import {observable, toJS} from "mobx";
import Util from "../../global/Util";
import SafeView from "../../components/SafeView";
import TextEx from "../../components/TextEx";
import Icon from "../../value/Svg";
import Global from "../../mobx/Global";
import TextExTitle from "../../components/TextExTitle";
import BaseComponents from "../../BaseComponents";
import AutoSave from "../../TModal/AutoSave";
import ConfigService from "../../service/ConfigService";

@inject('store', 'global')
@observer
class EditContactPage extends BaseComponents {

	@AutoSave
	configService: ConfigService;
	@observable
	name = '';
	@observable
	phones = [];
	@observable
	animateIndex;

	global: Global

	constructor(props) {
		super(props);
		this.global = props.global;
		this.store = props.store;
		this.navigation = props.navigation;
		this.contract = this.navigation.getParam('contract') || {name: '', phones: [], contractType: 2};

		// this.contract = this.initLocalContent(this.contract);
		this.isEdit = this.contract.contractType == 0;
		this.animatedValue = new Animated.Value(0);

		this.name = this.contract.name;
		let r = [];
		for (let temp of this.contract.phones) {
			r.push({
				"country_no": temp.country_no,
				"phone_no": temp.phone_no,
				"type": temp.type
			})
		}
		this.phones = r;

		console.log(toJS(this.contract), toJS(this.contract.phones))

	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	isCanSave() {
		if (this.name.length <= 0) {
			return false;
		}
		if (this.phones.length <= 0) {
			return false;
		}
		for (let item of this.phones) {
			if (item.phone_no.length <= 0) {
				return false;
			}
		}
		return true;
	}

	// 获得还没有选中的方式
	newList(array) {
		let result = [];
		let a = []
		for (let item of array) {
			a.push(item.type);
		}
		if (!a.includes(1)) {
			result.push(1);
		}
		if (!a.includes(2)) {
			result.push(2);
		}
		if (!a.includes(3)) {
			result.push(3);
		}
		return result;
	}

	addMore() {
		this.animatedValue.setValue(0);

		let newArray = [...this.phones];
		let rNewList = this.newList(newArray);
		let resultIndex = -1;
		if (rNewList.length > 0) {
			resultIndex = newArray.push({
				"country_no": this.global.currentIp_Country,
				"phone_no": "",
				"type": rNewList[0]
			})
		}
		this.phones = newArray;
		this.animateIndex = resultIndex - 1;
		Animated.timing(
			this.animatedValue,
			{
				toValue: 1,
				duration: 300,
				useNativeDriver: true
			}
		).start();

	}

	del(index) {
		this.animatedValue.setValue(1);
		let newArray = [...this.phones];
		newArray.splice(index, 1);

		this.animateIndex = index;

		Animated.timing(
			this.animatedValue,
			{
				toValue: 0,
				duration: 300,
				useNativeDriver: true
			}
		).start(() => {
			this.animateIndex = -1;
			this.phones = newArray;
		});
	}

	changeTypeActionSheet(index) {
		let rArray = this.newList(this.phones);
		if (rArray.length <= 0) {
			return
		}
		let op = rArray.map((item) => {
			switch (item) {
				case 1: {
					return '家庭电话';
				}
				case 2: {
					return '办公电话';
				}
				case 3: {
					return '移动电话';
				}
				default: {
					return '未知电话';
				}
			}
		});
		const options = [...op, '取消'];
		const cancelButtonIndex = options.length - 1;

		this.props.showActionSheetWithOptions({
				options,
				cancelButtonIndex,
			},
			buttonIndex => {
				if (buttonIndex != cancelButtonIndex) {
					let newArray = this.phones;
					newArray[index].type = rArray[buttonIndex];
					this.phones = newArray
				}
			},
		);
	}

	savePressent() {
		this.global.showLoading();
		Req.post(URLS.ADD_CONTACTS, {cname: this.name, content: this.phones})
			.then(async (res) => {
				this.global.dismissLoading();
				let newContract = {id: res.data.id, cname: this.name, content: this.phones, contractType: 0};
				let intContent = await this.store.addContent(newContract);

				// 更新本地设置
				this.configService.updateKey(this.contract, intContent);

				this.global.presentMessage("保存成功");
				this.navigation.pop();
			})
	}

	upDateBtnPress() {
		this.global.showLoading();
		Req.post(URLS.UPDATE_CONTACTS, {id: this.contract.id, cname: this.name, content: this.phones})
			.then(() => {
				this.global.dismissLoading();
				this.store.updateContent({id: this.contract.id, name: this.name, phones: this.phones, contractType: 0});
				this.global.presentMessage("保存成功");
				this.navigation.pop();
			})
	}

	deleteBtnPress() {
		this.global.showLoading();
		Req.post(URLS.DELETE_CONTACTS, {cid: this.contract.id,})
			.then(() => {
				this.global.dismissLoading();
				this.store.removeContent(this.contract.id);
				this.global.presentMessage("保存成功");
				this.navigation.pop();
			})
	}

	render() {
		let btitle = this.isEdit ? '编辑个人信息' : ' 添加电话号码';
		let saveDisable = this.isCanSave();

		const animationValue = this.animatedValue.interpolate(
			{
				inputRange: [0, 1],
				outputRange: [-30, 0]
			});
		let newArray = this.phones.map((item, index) => {
			let title = '';
			let phone = item.phone_no;
			let country = item.country_no;
			switch (item.type) {
				case 1: {
					title = "家庭电话";
					break;
				}
				case 2: {
					title = "办公电话";
					break;
				}
				case 3: {
					title = "移动电话";
					break;
				}
				default: {
					title = "未知电话";
					break;
				}
			}
			let content = (
				<Fragment>
					<View style={{paddingHorizontal: 12}}>
						<View style={[AppStyle.row]}>
							{
								this.phones.length > 1 ? (
									<Button style={[AppStyle.row, {paddingVertical: 20}]}
											onPress={() => this.del(index)}>
										<Image
											style={{width: 22, height: 22}}
											source={require('../../assets/img/preson/ic_del.png')}
										/>
									</Button>
								) : (
									<View style={[AppStyle.row, {width: 22, paddingVertical: 20}]}/>
								)
							}
							<Button style={[AppStyle.row, {paddingVertical: 20}]}
									onPress={() => this.navigation.push('CountryZone',
										{
											callback: (selectCountry) => {
												let newItem = {...item};
												newItem.country_no = selectCountry.country_no;
												let nn = [...this.phones];
												nn[index] = newItem;
												this.phones = nn;
											}
										})}>
								<Text style={{fontSize: 14, lineHeight: 22, marginHorizontal: 12}}>+{country}</Text>
								<Image
									style={{width: 22, height: 22}}
									source={require('../../assets/img/util/ic_arrow_down_hui.png')}
								/>
							</Button>
						</View>
						<Line/>
					</View>
					<View style={[{paddingRight: 12, flex: 1}]}>
						<View style={[{flex: 1, paddingVertical: 8}, AppStyle.row]}>
							<TextInput maxLength={35}
									   style={{flex: 1, height: 44, paddingRight: 12, textAlign: 'right',}}
									   placeholder={'请输入电话'}
									   value={phone}
									   keyboardType={'phone-pad'}
									   onChangeText={(text) => {
										   let newItem = {...item};
										   newItem.phone_no = text;
										   let nn = [...this.phones];
										   nn[index] = newItem;
										   this.phones = nn;
									   }}
							/>
							<Button style={[AppStyle.row, AppStyle.vcenter]}
									onPress={() => this.changeTypeActionSheet(index)}>
								<Text style={{fontSize: 14, lineHeight: 22}}>{title}</Text>
								<Image
									style={{width: 22, height: 22, marginLeft: 12}}
									source={require('../../assets/img/util/ic_arrow_down_hui.png')}
								/>
							</Button>
						</View>
						<Line/>
					</View>
				</Fragment>
			);
			if (this.animateIndex === index) {
				return (
					<Animated.View key={index} style={[AppStyle.row, AppStyle.vcenter,
						{
							opacity: this.animatedValue,
							transform: [{translateY: animationValue}],
							backgroundColor: 'white'
						}]}>
						{content}
					</Animated.View>
				);
			} else {
				return (
					<View key={index} style={[AppStyle.row, AppStyle.vcenter, {backgroundColor: 'white'}]}>
						{content}
					</View>
				);
			}
		});
		let addBtn = this.newList(this.phones).length === 0 ? null : (
			<View style={AppStyle.row}>
				<TouchableOpacity style={[{
					paddingVertical: 23, flex: 1, paddingHorizontal: 12,
					justifyContent: 'center', alignItems: 'center'
				}, AppStyle.row]}
								  onPress={() => {
									  this.addMore()
								  }}>
					<Icon icon={'call_icon_add_cord'} size={24} color={'#4A90E2'}/>
					<Text style={{fontSize: 14, lineHeight: 20, color: '#4A90E2', marginLeft: 4}}>
						添加号码
					</Text>
				</TouchableOpacity>
			</View>
		);

		let saveBtn = this.isEdit ? (
			<View style={AppStyle.row}>
				<Button style={[{padding: 10}, AppStyle.row]} onPress={() => {
					this.deleteBtnPress()
				}}>
					<Image
						style={{width: 22, height: 22}}
						source={require('../../assets/img/preson/ic_delete.png')}
					/>
				</Button>
				<Button style={[{padding: 10}, AppStyle.row]} onPress={() => {
					this.upDateBtnPress();
				}}>
					<Image
						style={{width: 22, height: 22}}
						source={require('../../assets/img/preson/ic_complete.png')}
					/>
				</Button>
			</View>
		) : (
			<Button style={[{padding: 10}, AppStyle.row]}
					disabled={!saveDisable}
					onPress={() => this.savePressent()}>
				<TextExTitle style={{fontSize: 16, lineHeight: 22, color: !saveDisable ? '#999' : '#4A90E2'}}>
					保存
				</TextExTitle>
			</Button>
		)

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={btitle}
							bottom_line={true}
							leftRender={(
								<Button style={[{padding: 6, paddingRight: 12}, AppStyle.row]} onPress={() => {
									this.navigation.pop()
								}}>
									<Image
										style={{width: 22, height: 22}}
										source={require('../../assets/img/util/ic_back_black.png')}
									/>
								</Button>
							)}
							rightRender={saveBtn}
					/>
					<ScrollView>
						<View style={{height: 20, backgroundColor: '#F5F5F5'}}/>
						<View style={[AppStyle.row, AppStyle.vcenter, {height: 50, paddingHorizontal: 16}]}>
							<TextEx style={{fontSize: 16, color: '#333'}}>姓名</TextEx>
							<TextInput style={{flex: 1, height: 44, textAlign: 'right', marginLeft: 10}}
									   maxLength={35}
									   value={this.name}
									   onChangeText={(text) => {
										   this.name = text;
									   }}
									   placeholderTextColor={'#999'}
									   placeholder={'请输入名称'}/>
						</View>
						<View style={{height: 20, backgroundColor: '#F5F5F5'}}/>
						<View style={[{paddingHorizontal: 16, paddingTop: 24}]}>
							<TextEx style={{fontSize: 16, color: '#333'}}>电话</TextEx>
						</View>
						{newArray}
						{addBtn}
					</ScrollView>
				</SafeView>
			</Fragment>
		)
	}
}

const styles = StyleSheet.create({});

export default connectActionSheet(EditContactPage)
