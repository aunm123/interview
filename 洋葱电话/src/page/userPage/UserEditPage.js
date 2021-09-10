'use strict';
import React, {Fragment, Component} from 'react';
import {
	Text, View,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	Animated,
	Dimensions, TextInput,
	Image, ScrollView, Clipboard,
	ImageBackground, SectionList, FlatList, Platform, DatePickerAndroid, DatePickerIOS
} from 'react-native';
import {strings} from "../../../locales";
import {inject, observer} from "mobx-react";


import AppStyle from '../../Style';
import NavBar from "../../components/NavBar";
import Line from "../../components/Line";
import {connectActionSheet} from "@expo/react-native-action-sheet";
import HeaderDown from "../../components/animate/HeaderDown";
import KeyboardView from "../../components/KeyboardView";
import Util from "../../global/Util";
import Req from "../../global/req";
import URLS from "../../value/URLS";
import Button from "../../components/Button";
import SafeView from "../../components/SafeView";
import TextEx from "../../components/TextEx";
import BaseComponents from "../../BaseComponents";

let {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
class UserEditPage extends BaseComponents {
	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;
		this.state = {
			...this.global.userData
		}

	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	selectMaleOrFeMale() {
		const options = ['男', '女', '取消'];
		const cancelButtonIndex = 2;

		this.props.showActionSheetWithOptions({
				options,
				cancelButtonIndex,
			},
			buttonIndex => {
				switch (buttonIndex) {
					case 0:{
						this.setState({'sex': 1});
						break;
					}
					case 1:{
						this.setState({'sex': 2});
						break;
					}
				}
			},
		);
	}

	async selectBirthday() {
		let selectData = this.state.birthday.length>0?new Date(this.state.birthday): new Date();

		if(Platform.OS === "android") {
			try {
				const {action, year, month, day} = await DatePickerAndroid.open({
					// 要设置默认值为今天的话，使用`new Date()`即可。
					// 下面显示的会是2020年5月25日。月份是从0开始算的。
					date: new Date(2020, 4, 25)
				});
				if (action !== DatePickerAndroid.dismissedAction) {
					// 这里开始可以处理用户选好的年月日三个参数：year, month (0-11), day
				}
			} catch ({code, message}) {
				console.warn('Cannot open date picker', message);
			}
		}else{
			this.global.modalRef.showModal((
				<View style={{padding: 12}}>
					<View style={{backgroundColor: 'white', borderRadius: 8}}>
						<DatePickerIOS
							mode={'date'}
							date={selectData}
							maximumDate={new Date()}
							onDateChange={(date)=>{ selectData = date; }}
						/>
						<Button style={{marginTop: 12, backgroundColor: 'white', borderRadius: 8}}
										  onPress={()=>{
										  	this.global.modalRef.handlehide();
										  	this.setState({birthday: Util.formatDate(selectData)})
										  }}>
							<TextEx style={{lineHeight: 58, fontSize: 20, color: '#007AFF', textAlign: 'center'}}>
								确定
							</TextEx>
						</Button>
					</View>
					<Button style={{marginTop: 12, backgroundColor: 'white', borderRadius: 8}} onPress={()=>{
						this.global.modalRef.handlehide();
					}}>
						<TextEx style={{lineHeight: 58, fontSize: 20, color: '#007AFF', textAlign: 'center'}}>
							取消
						</TextEx>
					</Button>
				</View>))
		}
	}

	_renderHeader() {
		return (
			<View style={[{backgroundColor: '#F1F8E9', paddingHorizontal: 12, alignItems: 'center', paddingVertical: 10}, AppStyle.row]}>
				<Image
					style={{width: 23, height: 23, marginRight: 12}}
					source={require('../../assets/img/pu/ic_check_circle.png')}
				/>
				<TextEx style={{fontSize: 12, color: '#333'}}>你的个人资料已经更新</TextEx>
			</View>
		)
	}

	showHeaderBar() {
		try {
			this.headerBar.show(50, 200);
			setTimeout(()=>{
				try {
					this.headerBar.hide(200);
				} catch (e) {}
			}, 2000);
		} catch (e) {}
	}

	saveBtnPress() {
		Req.post(URLS.EDIT_USER_DETAIL, {
			nickname: this.state.nickname,
			sex : this.state.sex,
			birthday : this.state.birthday,
			country_name : this.state.country_name,
			province : this.state.province,
			city : this.state.city,
			remark : this.state.remark,
		}).then(()=>{
			this.showHeaderBar();

			this.global.userData = {
				...this.global.userData,
				nickname: this.state.nickname,
				sex : this.state.sex,
				birthday : this.state.birthday,
				country_name : this.state.country_name,
				province : this.state.province,
				city : this.state.city,
				remark : this.state.remark,
			}
		})
	}

	render() {

		let sex = parseInt(this.state.sex);
		sex = sex==0?'请选择性别':(sex==1?'男':'女');

		let birthday = this.state.birthday.length>0?this.state.birthday:Util.formatDate(new Date().getTime())

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={'个人资料'}
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
					/>

					<KeyboardView style={{flexDirection: 'column', flex: 1}}>
						<HeaderDown ref={(headerBar)=>{this.headerBar = headerBar}} style={{position: 'absolute', left: 0, right: 0, zIndex: 99}}>
							{this._renderHeader()}
						</HeaderDown>
						<ScrollView keyboardDismissMode={'on-drag'}>
							<SafeView>
								<View style={styles.row}>
									<View style={{height: 66, paddingHorizontal: 16}}>
										<TextEx style={[styles.title]}>个人资料</TextEx>
										<TextEx style={[styles.h2]}>其他用户可以在洋葱上看到您的个人资料</TextEx>
									</View>
									<View style={[AppStyle.row, {paddingVertical: 21, paddingHorizontal: 16, marginTop: 2}]}>
										<TextEx style={styles.title}>洋葱用户名</TextEx>
										<TextEx style={[styles.h2, {color: '#999', textAlign: 'right', flex: 1}]}>{this.global.userid}</TextEx>
									</View>
									<Line style={{marginHorizontal: 16}}/>
									<TextEx style={[styles.title, styles.t10, {paddingHorizontal: 16}]}>名称</TextEx>
									<TextInput
										style={[styles.onetextArea, {marginHorizontal: 16}]}
										underlineColorAndroid="transparent"
										placeholder="请输入名称"
										placeholderTextColor="grey"
										numberOfLines={1}
										maxLength={32}
										multiline={false}
										value={this.state.nickname}
										onChangeText={(text)=>{
											this.setState({nickname: text});
										}}
									/>
									{/*<TextEx style={[styles.title, styles.t10]}>自我介绍</TextEx>*/}
									{/*<TextInput*/}
									{/*	style={styles.mtextArea}*/}
									{/*	underlineColorAndroid="transparent"*/}
									{/*	placeholder="请输入自我介绍"*/}
									{/*	placeholderTextColor="grey"*/}
									{/*	numberOfLines={10}*/}
									{/*	maxLength={200}*/}
									{/*	multiline={true}*/}
									{/*	value={this.state.remark}*/}
									{/*	onChangeText={(text)=>{*/}
									{/*		this.setState({remark: text});*/}
									{/*	}}*/}
									{/*/>*/}
									<View style={{paddingHorizontal: 16}}>
										<TextEx style={[styles.title, styles.t10]}>性别</TextEx>
										<Button style={[styles.lineRow, AppStyle.row]} onPress={()=>this.selectMaleOrFeMale()}>
											<TextEx style={[styles.h2, {flex: 1, fontSize: 16, color: '#666'}]}>{sex}</TextEx>
											<Image
												style={{width: 24, height: 24}}
												source={require('../../assets/img/util/ic_arrow_down_hui.png')}
											/>
										</Button>
									</View>
									<View style={{paddingHorizontal: 16}}>
										<TextEx style={[styles.title, styles.t10]}>生日</TextEx>
										<Button style={[styles.lineRow, AppStyle.row]} onPress={()=>this.selectBirthday()}>
											<TextEx style={[styles.h2, {flex: 1, fontSize: 16, color: '#666'}]}>{birthday}</TextEx>
											<Image
												style={{width: 24, height: 24}}
												source={require('../../assets/img/util/ic_arrow_down_hui.png')}
											/>
										</Button>
									</View>

									<Button style={styles.saveBtn} onPress={()=>this.saveBtnPress()}>
										<TextEx style={{color: 'white', fontSize: 16}}>保存修改</TextEx>
									</Button>

									<View style={{height: 30, backgroundColor: '#F5F5F5'}}>
										<TextEx style={{fontSize:12, fontWeight: '400', color:'#999', lineHeight: 30,
											paddingHorizontal: 16
										}}>地区</TextEx>
									</View>


									<View style={{paddingHorizontal: 16}}>
										<TextEx style={[styles.title, {marginTop: 12}]}>城市</TextEx>
										<TextInput
											style={styles.onetextArea}
											underlineColorAndroid="transparent"
											placeholder="请输入城市"
											placeholderTextColor="grey"
											numberOfLines={1}
											maxLength={32}
											multiline={false}
											value={this.state.city}
											onChangeText={(text)=>{
												this.setState({city: text});
											}}
										/>
									</View>

									<View style={{paddingHorizontal: 16}}>
										<TextEx style={[styles.title, styles.t10]}>省/直辖市/自治区</TextEx>
										<TextInput
											style={styles.onetextArea}
											underlineColorAndroid="transparent"
											placeholder="请输入具体地址"
											placeholderTextColor="grey"
											numberOfLines={1}
											maxLength={32}
											multiline={false}
											value={this.state.province}
											onChangeText={(text)=>{
												this.setState({province: text});
											}}
										/>
									</View>

									<View style={{paddingHorizontal: 16}}>
										<TextEx style={[styles.title, styles.t10]}>国家</TextEx>
										<Button style={[styles.lineRow, AppStyle.row]}
												onPress={()=>this.navigation.push('CountryZone', {callback: (item)=>{
														this.setState({country_no: '+'+item.country_no, country_name: item.country_cn})
													}})}>
											<TextEx>{this.state.country_name}</TextEx>
										</Button>
									</View>

									<Button style={[styles.saveBtn, {marginBottom: 50}]} onPress={()=>this.saveBtnPress()}>
										<TextEx style={{color: 'white', fontSize: 16,}}>保存修改</TextEx>
									</Button>

								</View>
							</SafeView>

						</ScrollView>
					</KeyboardView>
				</SafeView>

			</Fragment>
		)
	}
}

const styles = StyleSheet.create({
	onetextArea: {
		height: 44,
		justifyContent: "flex-start",
		borderColor: '#E5E5E5',
		borderBottomWidth: 1,
		alignItems: 'center',
		color: "#333",
		fontSize: 15,
		marginTop: 12,
	},
	mtextArea: {
		height: 104,
		justifyContent: "flex-start",
		borderColor: '#E5E5E5',
		borderWidth: 1,
		paddingHorizontal: 7,
		paddingVertical: 14,
		alignItems: 'center',
		color: "#333",
		fontSize: 15,
		marginTop: 12,
		marginHorizontal: 12,
	},
	lineRow: {
		borderColor: '#E5E5E5',
		borderBottomWidth: 1,
		paddingVertical: 12,
		alignItems: 'center',
		height: 50
	},
	title: {
		fontSize: 16,
		color: '#666',
		lineHeight: 20,
		fontWeight: '400',
	},
	h2: {
		fontSize: 12,
		color: '#999',
		lineHeight: 20,
	},
	t10: {
		marginTop: 32,
	},
	saveBtn: {
		marginVertical: 32,
		marginHorizontal: 12,
		height: 44,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#4A90E2',
		borderRadius: 22.5
	},
	saveBtnBg: {
		width: '100%',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center'
	}
});
export default connectActionSheet(UserEditPage)
