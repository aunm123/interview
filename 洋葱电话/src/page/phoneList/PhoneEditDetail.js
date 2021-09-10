'use strict';
import React, {Fragment, Component} from 'react';
import {
	Text, View,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	Animated,
	Dimensions,
	Image, ScrollView, TextInput,
	Switch, Alert, Easing, findNodeHandle, UIManager
} from 'react-native';
import {strings} from "../../../locales";
import {inject, observer} from "mobx-react";
import AppStyle, {font} from '../../Style';
import NavBar from "../../components/NavBar";
import Line from "../../components/Line";
import {NewPhoneRow} from "../../components/row/NewPhoneRow";
import Req from "../../global/req";
import URLS from "../../value/URLS";
import Button from "../../components/Button";
import SafeView from "../../components/SafeView";
import CountryIcon from "../../value/CountryIcon";
import TextEx from "../../components/TextEx";
import BaseComponents from "../../BaseComponents";
import Util from "../../global/Util";

@inject('store', 'global')
@observer
export default class PhoneEditDetail extends BaseComponents {

	startY = 0;
	maxStartY = 0;

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;
		this.data = this.navigation.getParam('data') || {};
		this.state = {
			editRemark: false,
			animateValue: new Animated.Value(0), // 初始值
			...this.data
		}
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	resetView() {
		return new Promise((resolve => {
			const handle = findNodeHandle(this.editView);
			setTimeout(() => {
				UIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
					this.startY = pageY;
					this.maxStartY = pageY + height;

					console.log(x, y, width, height, pageX, pageY);
					resolve();
				});
			})
		}))

	}

	deleteBtnPress() {
		Alert.alert(
			strings('PhoneEditDetail.delete_title'),
			strings('PhoneEditDetail.delete_detail'),
			[
				{
					text: '取消', onPress: () => {
					}
				},
				{
					text: '好', onPress: () => {
						Req.post(URLS.DELETE_PHONE, {phone_no: this.state.phone_no})
							.then(() => {
								this.global.presentMessage(strings("PhoneEditDetail.delete_success"));
								this.navigation.pop();
							})
					}
				},
			],
			{cancelable: false}
		)
	}

	editToggle() {
		let currentEditing = !this.state.editRemark;
		this.setState({editRemark: !this.state.editRemark});
		setTimeout(() => {
			if (currentEditing) {
				this.editRemark();
			} else {
				this.endEditRemark();
			}

		}, 200)

	}

	editRemark() {
		Animated.timing(this.state.animateValue, {
			toValue: 1, // 目标值
			duration: 200, // 动画时间
			easing: Easing.ease // 缓动函数
		}).start();
	}

	endEditRemark() {
		Animated.timing(this.state.animateValue, {
			toValue: 0, // 目标值
			duration: 200, // 动画时间
			easing: Easing.ease // 缓动函数
		}).start();
		Req.post(URLS.EDIT_PHONE_DETAIL, {
			remark: this.state.remarkNum,
			phone_no: this.state.phone_no
		}).then()
	}

	async tap(nativeEvent) {
		await this.resetView();

		let {pageY} = nativeEvent;
		if (pageY >= this.startY && pageY <= this.maxStartY) {

		} else {
			if (this.state.editRemark) {
				this.setState({editRemark: false});
				setTimeout(() => {
					this.endEditRemark();
				}, 200)
			}
		}


	}

	setStatus(value) {
		this.setState({status: value ? 0 : 1});
		Req.post(URLS.EDIT_PHONE_DETAIL, {status: value ? 0 : 1, phone_no: this.state.phone_no})
			.then(() => {
			}, () => {
				this.setState({status: value ? 1 : 0})
			})
		if (value == 1) {
			this.setMain(0);
		}
	}

	setMain(value) {
		this.setState({ismain: value ? 1 : 0});
		Req.post(URLS.EDIT_PHONE_DETAIL, {ismain: value ? 1 : 0, phone_no: this.state.phone_no})
			.then(() => {
			}, () => {
				this.setState({ismain: value ? 0 : 1})
			})
		if (value == 1) {
			this.setStatus(0);
		}
	}

	chargePhone() {

		Alert.alert(
			'号码续费',
			'确定使用' + this.state.renewal_coin + '洋葱币来锁定这个号码1年的时间吗？在锁定期内号码将不会过期',
			[
				{
					text: '否', onPress: () => {
					}
				},
				{
					text: '是', onPress: async () => {

						this.global.showLoading();

						let {country_no, phone_no} = Util.fixNumber(this.state.phone);
						await Req.post(URLS.RENEWAA_PHONE, {country_no: country_no, phone_no: phone_no});
						let phonelist = await Req.post(URLS.MY_PHONE);
						this.global.userData.phonelist = phonelist.data;

						for (let item of this.global.userData.phonelist) {
							if (this.state.phone_no == item.buy_no) {
								let jtem = {
									country_code: item.country_code,
									region: item.region_no,
									phone_no: item.buy_no,
									capabilities: item.capabilities,
									end_time: Util.formatDate(parseFloat(item.end_time) * 1000),
									ismain: parseInt(item.ismain),
									remarkNum: parseInt(item.remark),
									countryName: item.country_cn,
									countryIcon: "",
									status: parseInt(item.status),
									renewal_coin: parseInt(item.renewal_coin),
								}
								this.setState({
									...jtem
								});
								break;
							}
						}

						this.global.presentMessage("续费成功");
						this.global.dismissLoading();


					}
				},
			],
			{cancelable: false}
		)


	}

	render() {

		const {animateValue} = this.state;

		// const height = layout.initHeight;
		const translateH = animateValue.interpolate({
			inputRange: [0, 1],
			outputRange: [0, 47],
			extrapolate: 'clamp',
		});

		let vocArray = [];
		for (let key in this.state.capabilities) {
			let value = this.state.capabilities[key];
			if (value) {
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
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView onTouchStart={(event, args) => {
					this.tap(event.nativeEvent);
				}}>
					<NavBar title={strings("PhoneEditDetail.title")}
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
					<ScrollView keyboardShouldPersistTaps='never'>
						<View style={{backgroundColor: '#F5F5F5'}}>
							<TextEx style={styles.headerNote}>
								{strings('PhoneEditDetail.tip1')}
								<TextEx style={styles.headerUnLine}>
									{strings('PhoneEditDetail.tip2')}
								</TextEx>
							</TextEx>
						</View>
						<View>
							<View ref={(editView) => {
								this.editView = editView
							}}>
								<View style={[AppStyle.row, {
									paddingHorizontal: 12,
									paddingVertical: 7,
								}]}>
									<TextEx style={styles.rowHeaderTitle}>{this.state.remark}</TextEx>
									<Button onPress={() => {
										this.editToggle()
									}}>
										<TextEx
											style={styles.leftRowHeaderTitle}>{this.state.editRemark ? '完成' : '编辑'}</TextEx>
									</Button>
								</View>
								<Animated.View
									style={[AppStyle.row, {
										paddingHorizontal: 12, alignItems: 'center',
										height: translateH, overflow: 'hidden'
									}]}>
									<Button onPress={() => {
										this.setState({remarkNum: 1, remark: strings('PhoneEditDetail.home')})
									}}>
										<Text
											style={this.state.remarkNum == 1 ? styles.bzBtnSelect : styles.bzBtn}>
											{strings('PhoneEditDetail.home')}
										</Text>
									</Button>
									<Button onPress={() => {
										this.setState({remarkNum: 2, remark: strings('PhoneEditDetail.office')})
									}}>
										<Text
											style={this.state.remarkNum == 2 ? styles.bzBtnSelect : styles.bzBtn}>
											{strings('PhoneEditDetail.office')}
										</Text>
									</Button>
									<Button onPress={() => {
										this.setState({remarkNum: 3, remark: strings('PhoneEditDetail.mobile')})
									}}>
										<Text
											style={this.state.remarkNum == 3 ? styles.bzBtnSelect : styles.bzBtn}>
											{strings('PhoneEditDetail.mobile')}
										</Text>
									</Button>
								</Animated.View>
							</View>
							<View style={[AppStyle.row, styles.row]}>
								<Image
									resizeMode={'contain'}
									style={{width: 40, marginRight: 20}}
									source={CountryIcon[this.state.country_code]}
								/>
								<View style={{flex: 1}}>
									<TextEx style={styles.rowTitle}>{this.state.phone}</TextEx>
									<View style={AppStyle.row}>
										{vocArray}
									</View>
								</View>
							</View>
							<View style={[AppStyle.row, {paddingHorizontal: 12, paddingVertical: 10, paddingTop: 5}]}>
								<TextEx style={styles.rowfootTitle}>{this.state.countryName}</TextEx>
								<TextEx style={styles.leftRowfootTitle}>
									{strings('PhoneEditDetail.exprot_date')}：{this.state.end_time}
								</TextEx>
							</View>
						</View>
						<View style={{height: 20, backgroundColor: '#F5F5F5'}}/>

						<View style={[styles.rowL, AppStyle.row]}>
							<TextEx style={{flex: 1}}>
								{strings('PhoneEditDetail.stop_phone')}
							</TextEx>
							<Switch value={this.state.status == 0}
									onValueChange={(value) => {
										this.setStatus(value)
									}}/>
						</View>
						<Line style={{marginHorizontal: 12}}/>

						<View style={[styles.rowL, AppStyle.row]}>
							<TextEx style={{flex: 1}}>
								{strings('PhoneEditDetail.main_phone')}
							</TextEx>
							<Switch value={this.state.ismain == 1}
									onValueChange={(value) => {
										this.setMain(value);
									}}/>
						</View>
						<Line style={{marginHorizontal: 12}}/>

						<TouchableOpacity style={[styles.rowL, AppStyle.row]} onPress={() => this.deleteBtnPress()}>
							<TextEx style={{flex: 1, color: '#E34E61'}}>
								{strings('PhoneEditDetail.delete_phone')}
							</TextEx>
							<Image
								resizeMode={'contain'}
								style={{width: 20, height: 20}}
								source={require('../../assets/img/util/ic_arrow_right.png')}
							/>
						</TouchableOpacity>
						<View style={{height: 20, backgroundColor: '#F5F5F5'}}/>

						<TouchableOpacity style={[styles.rowL, AppStyle.row]} onPress={() => {
							this.chargePhone();
						}}>
							<TextEx style={{flex: 1}}>
								{strings('PhoneEditDetail.phone_charge')}
							</TextEx>
							<Image
								resizeMode={'contain'}
								style={{width: 20, height: 20}}
								source={require('../../assets/img/util/ic_arrow_right.png')}
							/>
						</TouchableOpacity>
						<View style={{height: 20, backgroundColor: '#F5F5F5'}}/>
					</ScrollView>

				</SafeView>
			</Fragment>
		)
	}
}
const styles = StyleSheet.create({
	rowL: {
		padding: 12,
		alignItems: 'center'
	},
	bzBtn: {
		borderRadius: 4,
		borderColor: '#E5E5E5',
		borderWidth: 1,
		color: '#333',
		fontSize: 14,
		paddingVertical: 10,
		paddingHorizontal: 12,
		marginRight: 12,
	},
	bzBtnSelect: {
		borderRadius: 4,
		backgroundColor: "#999",
		color: '#FFF',
		fontSize: 14,
		paddingVertical: 10,
		paddingHorizontal: 12,
		marginRight: 12,
	},
	headerNote: {
		fontSize: 10,
		color: '#666',
		marginVertical: 13,
		textAlign: 'center'
	},
	headerUnLine: {
		fontSize: 10,
		color: '#999',
		textDecorationLine: 'underline'
	},
	headerTitle: {
		fontSize: 15,
		color: '#333',
		fontWeight: '500'
	},
	rowTitle: {
		fontSize: 15,
		color: "#333",
		flex: 1,
		textAlign: "left",
		lineHeight: 25,
		fontWeight: "500"
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
		backgroundColor: '#FFF'
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
		width: 40,
		textAlign: 'center',
	},
	leftRowfootTitle: {
		fontSize: 10,
		color: '#999',
		flex: 1,
		textAlign: 'right'
	}
});
