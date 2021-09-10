'use strict';
import React, {Fragment, Component} from 'react';
import {
	Text, View,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	Animated,
	Dimensions,
	Image, ScrollView,
	ImageBackground, SectionList, FlatList, TextInput
} from 'react-native';
import {strings} from "../../../locales";
import {inject, observer} from "mobx-react";


import AppStyle, {font} from '../../Style';
import NavBar from "../../components/NavBar";
import Line from "../../components/Line";
import Button from "../../components/Button";
import Req from "../../global/req";
import URLS from "../../value/URLS";
import SafeView from "../../components/SafeView";
import {observable, toJS} from "mobx";
import TextEx from "../../components/TextEx";
import {Card} from "react-native-shadow-cards";
import AppStore from "../../mobx/AppStore";
import Global from "../../mobx/Global";
import Icon from "../../value/Svg";
import CustomActionSheet from "../../components/CustomActionSheet";
import CustomStorage from "../../global/CustomStorage";
import Util from "../../global/Util";
import BaseComponents from "../../BaseComponents";
import AutoSave from "../../TModal/AutoSave";
import ConfigService from "../../service/ConfigService";
import ConfigDao from "../../dao/ConfigDao";

var {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
export default class ClientDetail extends BaseComponents {

	appStore: AppStore;
	global: Global;

	@AutoSave
	configService: ConfigService;

	@observable
	contract = {name: '', phones: []};
	@observable
	config: ConfigDao = {id: null, key: "", bell: 0, ban: 0};

	constructor(props) {
		super(props);
		this.global = props.global;
		this.appStore = props.store;
		this.navigation = props.navigation;
	}

	async onStart() {
		super.onStart();

		let temp = this.navigation.getParam('contract') || {name: '', phones: []};

		try {
			let {country_no, phone_no} = Util.fixNumber(temp.name);
			temp.country_no = country_no;
			temp.phone_no = phone_no;

			if (temp.country_no && temp.phone_no) {
				let contract = this.appStore.finListAllContent4({
					country_no: temp.country_no,
					phone_no: temp.phone_no
				}, false);
				if (contract) {
					temp = contract;
				}
			}

		} catch (e) {
		}

		this.contract = temp;
		this.config = await this.configService.getConfigByContract(this.contract);
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	actionSheet() {
		const options = [
			<TextEx style={{lineHeight: 21}}>{strings('ClientDetail.newContract')}</TextEx>,
			// <TextEx>{strings('ClientDetail.updateContract')}</TextEx>,
			<TextEx style={{color: '#999', lineHeight: 21}}>{strings('other.cancel')}</TextEx>];

		this.global.modalRef.showModal((
			<CustomActionSheet title={this.contract.name}
							   options={options}
							   click={async (index) => {
								   if (index == 0) {
									   this.navigation.push('EditContactPage', {contract: this.contract});
								   }
								   if (index == 1) {

								   }
							   }}
							   cancelIndex={1}/>
		), 'bottom')
	}

	UNSAFE_componentWillMount(): void {
		this.global.modalRef.handlehide()
	}

	actionCall() {
		let data = this.contract.phones;
		if (data.length === 1) {
			let d = data[0];
			return this.navigation.push('CallPhonePage', {
				country_no: d.country_no,
				phone_no: d.phone_no,
				contract_id: this.contract.id,
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
									contract_id: this.contract.id,
								})
							}
							}>
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
				<View style={{height: 230}}>
					{btns}
				</View>
			</View>))
	}

	actionMessage() {
		let data = this.contract.phones;
		if (data.length === 1) {
			let d = data[0];
			return this.navigation.push('MessagePage', {
				country_no: d.country_no,
				phone_no: d.phone_no
			});
		}
		let btns = data.map((kk, index) => {
			return (
				<Fragment key={index}>
					<Button style={[styles.bottomUpPhoneBtn, AppStyle.row]}
							onPress={() => {
								this.global.modalRef.handlehide();
								this.navigation.push('MessagePage', {
									country_no: kk.country_no,
									phone_no: kk.phone_no
								})
							}
							}>
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
				<View style={{height: 230}}>
					{btns}
				</View>
			</View>))
	}

	renderHeader() {
		return (
			<View style={{alignItems: 'center', flex: 1}}>

				<View style={[AppStyle.row, {paddingHorizontal: 12, width: '100%'}]}>
					<Button style={{alignSelf: 'flex-start', paddingVertical: 7, zIndex: 99}}
							onPress={() => this.navigation.pop()}>
						<Image
							style={{width: 24, height: 24}}
							source={require('../../assets/img/util/ic_arrow_left_white.png')}
						/>
					</Button>
					<View style={{
						flex: 1,
						position: 'absolute',
						height: 38,
						justifyContent: 'center',
						alignItems: 'center',
						left: 0, right: 0
					}}>
						<TextEx style={{
							color: '#FFF',
							fontSize: 18,
							fontWeight: '500',
							lineHeight: 38,
						}}>{strings('UserDetailPage.title')}</TextEx>
					</View>
					<View style={{width: 24, height: 24}}/>
				</View>

				<View style={{width: '100%', marginTop: 47, paddingHorizontal: 16}}>
					<Card style={[{
						padding: 12,
						borderRadius: 8,
						alignItems: 'center',
						width: '100%',
						paddingVertical: 21,
					}, AppStyle.row]} opacity={0.08}>
						<Image
							style={[styles.headerRow]}
							source={require('../../assets/img/bg/timg.png')}
						/>
						<View style={{marginLeft: 12, flex: 1}}>
							<Text style={{fontSize: 16, color: '#333'}}>
								{this.contract.name}
							</Text>
							{/*<Text style={styles.headerCode}>洋葱号：0987654321</Text>*/}
							{/*<Text style={[styles.headerCode, {marginBottom: 12}]}>地区：国家/区域</Text>*/}
						</View>
						{
							this.contract.contractType == 2 ? (
								<Button style={{borderRadius: 16, borderWidth: 1, borderColor: '#4A90E2'}}
										onPress={() => {
											this.actionSheet()
										}}>
									<TextEx style={{
										fontSize: 12, lineHeight: 17, color: "#4A90E2", marginHorizontal: 16,
										marginVertical: 5
									}}>
										添加好友
									</TextEx>
								</Button>
							) : null
						}
					</Card>
				</View>


			</View>
		)
	}

	renderPhoneRow() {
		let mm = this.contract.phones.map((item, index) => {
			let line = index != this.contract.phones.length - 1 ?
				(<Line style={{marginLeft: 68}}/>) : null;
			let name = '';
			let phone = item.country_no + ' ' + item.phone_no;
			switch (parseInt(item.type)) {
				case 1: {
					name = "家庭电话";
					break;
				}
				case 2: {
					name = "办公电话";
					break;
				}
				case 3: {
					name = "移动电话";
					break;
				}
				default: {
					name = "未知电话";
					break;
				}
			}
			return (
				<Fragment key={index}>
					<Button style={styles.phoneRow}>
						<Icon icon={'personal_icon_phone'} size={40} color={'#4A90E2'}/>
						<Text style={styles.phoneRowTitle}>{name}</Text>
						<Text style={styles.phoneRowNumber}>+{phone}</Text>
					</Button>
					{line}
				</Fragment>
			)
		});

		let messageBtn = (
			<Fragment>
				<Button style={styles.phoneRow} onPress={() => {
					this.actionMessage()
				}}>
					<Icon icon={'personal_icon_sendmsg'} size={40} color={'#4A90E2'}/>
					<Text style={styles.phoneRowTitle}>发送消息</Text>
				</Button>
				<Line style={{marginLeft: 68}}/>
				<Button style={styles.phoneRow} onPress={() => {
					this.actionCall()
				}}>
					<Icon icon={'personal_icon_phonecall'} size={40} color={'#4A90E2'}/>
					<Text style={styles.phoneRowTitle}>开始通话</Text>
				</Button>
				<Line style={{marginLeft: 68}}/>
			</Fragment>
		);

		return (
			<Fragment>
				{messageBtn}
				<View style={{marginTop: 8}}>
					{/*<Button style={styles.phoneRow}>*/}
					{/*	<Icon icon={'personal_icon_date'} size={40} color={'#4A90E2'}/>*/}
					{/*	<Text style={styles.phoneRowTitle}>详细信息</Text>*/}
					{/*</Button>*/}
					{/*<Line style={{marginLeft: 68}}/>*/}
					{mm}
					<View style={{height: 20, backgroundColor: '#F5F5F5'}}/>
				</View>
			</Fragment>
		)
	}

	renderActionRow() {

		let deleteContractBtn = this.contract.contractType == 0 ? (
			<Fragment>
				<Button style={styles.actionRow} onPress={() => {
					this.global.showLoading();
					Req.post(URLS.DELETE_CONTACTS, {cid: this.contract.id,})
						.then(() => {
							this.global.dismissLoading();
							this.appStore.removeContent(this.contract.id);
							this.global.presentMessage("保存成功");
							this.navigation.pop();
						})
				}}>
					<Text style={styles.actionRowTitle}>从联系人列表中删除</Text>
				</Button>
				<Line style={{marginLeft: 12}}/>
			</Fragment>
		) : null;

		let banContractBtn = this.config.ban == 0 ? (
			<Button style={styles.actionRow} onPress={async ()=>{
				// 阻止来电
				await this.configService.insertOrSaveConfig(this.contract, null, 1);
				this.config = await this.configService.getConfigByContract(this.contract);
			}}>
				<Text style={[styles.actionRowTitle, {color: '#E34E61'}]}>不阻止联系人</Text>
			</Button>
		) : (
			<Button style={styles.actionRow} onPress={async ()=>{
				// 不阻止来电
				await this.configService.insertOrSaveConfig(this.contract, null, 0);
				this.config = await this.configService.getConfigByContract(this.contract);
			}}>
				<Text style={[styles.actionRowTitle, {color: '#E34E61'}]}>阻止联系人</Text>
			</Button>
		);

		return (
			<View>
				{/*<Button style={styles.actionRow}>*/}
				{/*	<Text style={styles.actionRowTitle}>标记星级好友</Text>*/}
				{/*	<Image style={{width: 24, height: 24}}*/}
				{/*		   source={require('../../assets/img/pu/ic_xingjihaoyou.png')}/>*/}
				{/*</Button>*/}
				{/*<Line style={{marginHorizontal: 12}} />*/}

				{deleteContractBtn}
				{banContractBtn}

			</View>
		)
	}

	render() {
		return (
			<Fragment>
				<StatusBar barStyle="light-content"/>
				<ScrollView>
					<ImageBackground source={require('../../assets/newimg/png/personal/personalbg/personal_bg_img.png')}
									 style={{width: width, height: 162, position: 'absolute', top: 0, left: 0}}/>
					<SafeView>
						{this.renderHeader()}
						{this.renderPhoneRow()}
						{this.renderActionRow()}
					</SafeView>

				</ScrollView>

			</Fragment>
		)
	}
}

const styles = StyleSheet.create({
	headerRow: {
		width: 56,
		height: 56,
		justifyContent: 'center',
		alignSelf: 'center',
		borderRadius: 45,
	},
	headerName: {
		fontSize: 17,
		color: '#333',
		fontWeight: '500',
		marginTop: 12,
	},
	headerCode: {
		fontSize: 14,
		color: '#999',
		marginTop: 8
	},
	phoneRowTitle: {
		fontSize: 16,
		color: '#333',
		justifyContent: 'center',
		alignSelf: 'center',
		marginLeft: 12,
		lineHeight: 24,
		flex: 1
	},
	phoneRowNumber: {
		fontSize: 16,
		textAlign: 'right',
		color: '#999',
		lineHeight: 24,
		justifyContent: 'center',
		alignSelf: 'center'
	},
	phoneRow: {
		flexDirection: 'row',
		paddingHorizontal: 16,
		paddingVertical: 20,
		minHeight: 66
	},
	actionRow: {
		flexDirection: 'row',
		paddingHorizontal: 16,
		paddingVertical: 14,
		minHeight: 66
	},
	actionRowTitle: {
		fontSize: 16,
		color: '#333',
		lineHeight: 20,
		alignSelf: 'center',
		flex: 1
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
