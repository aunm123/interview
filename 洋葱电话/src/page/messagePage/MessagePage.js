'use strict';
import React, {Fragment, Component} from 'react';
import {
	Text, View,
	StyleSheet,
	StatusBar,
	Animated,
	Dimensions, ScrollView,
	Image, TextInput, Keyboard,
	ImageBackground, FlatList, RefreshControl,
	findNodeHandle, UIManager,
	LayoutAnimation, Clipboard, Alert
} from 'react-native';
import {strings} from "../../../locales";
import {inject, observer} from "mobx-react";
import AppStyle, {font} from '../../Style';
import NavBar from "../../components/NavBar";
import Line from "../../components/Line";
import DataRow from "../../components/messageRow/DataRow";
import MessageRow from "../../components/messageRow/MessageRow";
import InputBar from "../../components/InputBar";
import HeaderDown from "../../components/animate/HeaderDown";
import PhoneRow from "../../components/messageRow/PhoneRow";
import KeyboardView from "../../components/KeyboardView";
import SafeView from "../../components/SafeView";
import {computed, observable, toJS} from "mobx";
import Button from "../../components/Button";
import Req from "../../global/req";
import URLS from "../../value/URLS";
import Util from "../../global/Util";
import PhotoRow from "../../components/messageRow/PhotoRow";

import CameraRoll from "@react-native-community/cameraroll";
import {connectActionSheet} from "@expo/react-native-action-sheet";
import PullToRefresh from "react-native-pull-to-refresh-custom";
import NotificationService from "../../global/NotificationService";
import HistoryDao from '../../dao/HistoryDao'
import PhotoDao from "../../dao/PhotoDao";
import md5 from "md5";
import RNFetchBlob from "rn-fetch-blob";
import TextEx from "../../components/TextEx";
import AutoSave from "../../TModal/AutoSave";
import MessageService from "../../service/MessageService";
import PhotoService from "../../service/PhotoService";
import {UploadList} from "../../global/UploadList";
import ContractHeadRow from "../../components/messageRow/ContractHeadRow";
import Icon from "../../value/Svg";
import MessageRow2 from "../../components/messageRow/MessageRow2";
import BaseComponents from "../../BaseComponents";
import ConfigService from "../../service/ConfigService";
import ConfigDao from "../../dao/ConfigDao";
import CallService from "../../global/CallService";

var {height, width} = Dimensions.get('window');

@inject('store', 'global', 'download')
@observer
class MessagePage extends BaseComponents {

	@AutoSave
	messageService: MessageService;
	@AutoSave
	photoService: PhotoService;
	@AutoSave
	configService: ConfigService;
	@AutoSave
	uploadList: UploadList;
	@AutoSave
	callservice: CallService;

	headerBarShowing = false;

	@observable
	isNew = this.phone_no.length <= 0;
	@observable
	fromePhone = '';
	@observable
	toPhone = '';
	@observable
	newPhoneNo = '';

	needInverted = true;
	@observable
	initFinish = false;
	@observable
	listHeight = 30;

	selectList = [];

	// 页面类型：1 输入类型 2：多选类型
	@observable
	mode = 1;

	ScComponent = ScrollView;
	lastCount = 0;

	delayTimer;

	refreshing = false;

	@observable
	smsPrice = 0.0;
	@observable
	config: ConfigDao = {id: null, key: "", bell: 0, ban: 0};

	@observable
	data = [];
	currentMessageCount = 0;
	maxMessageLength = 10;
	pageSize = 10;


	contract = {};

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;
		this.store = props.store;
		this.download = props.download;
		this.contentOffsetY = 0;
		this.maxContentOffsetY = 0;

		this.state = {
			pT: 0,
		};

		// 优先查找的联系人ID
		this.contract_id = this.navigation.getParam("contract_id") || '';

		// country_no: item.country_no, phone_no: item.phone_no

		this.country_no = this.navigation.getParam('country_no') || '';
		this.phone_no = this.navigation.getParam('phone_no') || '';

	}

	async onStart() {
		this.nickname = Util.findstring(this.global.userData.nickname, this.global.userData.phone_no);

		await this.reSetUser({country_no: this.country_no, phone_no: this.phone_no});
		this.config = await this.configService.getConfigByContract(this.contract);
	}

	componentDidMount() {

		this.setState({
			...this.global.userData
		});

		this.lisIndex = NotificationService.addCustomMessageListen((data) => {
			this.maxMessageLength += 1;
			this.renewHistory().then();

			if (this.contract.hasOwnProperty('name')) {
				this.messageService.setAllMessageToRead(this.contract).then()
			}
		});

		if (this.contract.hasOwnProperty('name')) {
			this.messageService.setAllMessageToRead(this.contract).then()
		}
	}

	//  不知名电话
	// 	name: '',
	// 	contractType: 0,
	// 	phones: [
	// 		{ label: 'mobile', number: '', type: 0, country_no : '855', phone_no: '123123123' }
	// 	]

	async reSetUser({country_no, phone_no}) {
		this.country_no = country_no;
		this.phone_no = phone_no;
		this.isNew = phone_no.length <= 0;
		if (phone_no.length > 0) {
			this.contract = this.store.finListAllContent2({
				country_no,
				phone_no,
			}, false, this.contract_id) || {};

			if (this.contract.name && this.contract.contractType != 2) {
				if (this.contract_id.length > 0) {
					let temp = this.store.findAllContentWithID(this.contract_id);
					if (temp) {
						this.contract = temp;
					} else {
						this.contract = await this.store.findAllContentWithName(this.contract.name);
					}
				} else {
					this.contract = await this.store.findAllContentWithName(this.contract.name);
				}
			} else {
				this.contract = {
					name: '+' + country_no + ' ' + phone_no,
					contractType: 2,
					phones: [
						{label: '', number: '', type: 0, country_no: country_no, phone_no: phone_no}
					]
				};
				await this.store.addUnknowPhone(this.contract);
			}
			this.toPhone = '+' + country_no + ' ' + phone_no;
			try {
				this.smsPrice = this.global.smsPriceList[country_no].coin;
			} catch (e) {
				this.smsPrice = "1"
			}
		}

		let {form_no, form_country} = this.global.rootPhone;
		this.fromePhone = '+' + form_country + ' ' + form_no;

		this.renewHistory();

	}

	componentWillUnmount() {
		super.componentWillUnmount();

		try {
			NotificationService.removeCustomMessageListen(this.lisIndex);
			this.global.modalRef.handlehide();
		} catch (e) {
		}
	}

	async renewHistory() {

		if (!this.isNew) {
			let {result, count} = await this.messageService.getAllMessageHistoryWithContractName(this.contract.name, this.maxMessageLength);
			let data = [];
			let keys = Object.keys(result);
			for (let date_time_key of keys) {
				data.push({title: date_time_key, type: -1});
				for (let i of result[date_time_key]) {
					data.push(i);
				}
			}
			for (let temp of data) {
				if (temp.type == 2 || temp.type == 12) {
					let t = JSON.parse(temp.content);
					let tempPhoto: PhotoDao = await this.photoService.getPhotoById(t.photoid);
					temp.content = JSON.stringify({...t, ...tempPhoto});
				}
			}
			if (count < this.maxMessageLength) {
				// 添加头部信息
				data = [{
					...this.contract,
					type: -2
				}, ...data];
				if (data.length < 2) {
					this.ScComponent = ScrollView;
				} else {
					this.ScComponent = View;
				}
			} else {
				this.ScComponent = View;
			}

			this.data = data;
			this.currentMessageCount = count;

			this.headerBar = this.refs.heagerdown;
		}
	}

	// "userid":"ep7u9j4ye666azeiimav",
	// "to_country":"855",
	// "to_no":"966357939",
	// "content":测试发送短信,
	// "type":1,                                   //1:文本 2:图片 3:视频 4:录音 5:位置
	// "authToken":"654654656546",                 //不加入签名
	// "sign":"CB8BE024D864C533A9FD99E044DFD74A"   //签名串

	async sendMessage(text, tophone = null, type = 0, needAdd = true) {

		if (!tophone) {
			tophone = '+' + this.country_no + ' ' + this.phone_no;
			if (!Util.CheckPhone(this.country_no, this.phone_no)) {
				this.global.presentMessage(strings("messagePage.error_phone_code"));
				return;
			}
		}

		let service_Text = text;
		if (type == 12) {
			// 图片转发
			let photoid = JSON.parse(text).photoid;
			let data: PhotoDao = await this.photoService.getPhotoById(photoid);
			service_Text = data.big_url;
			text = JSON.stringify({photoid: photoid});
		}

		// 数据库记录
		let data = {state: 0, content: text, tophone: tophone, fromphone: 'me', time: 0, type: type, isread: 1};
		let history = new HistoryDao(data);
		let {country_no, phone_no} = Util.fixNumber(this.fromePhone);
		let toPhoneItem = Util.fixNumber(tophone);

		let r = await this.messageService.insertMessage(history);
		if (needAdd) this.maxMessageLength += 1;
		await this.renewHistory();

		try {
			await Req.post(URLS.SEND_MESSAGE, {
				type: 0,
				content: service_Text,
				to_country: toPhoneItem.country_no,
				to_no: toPhoneItem.phone_no,
				form_no: phone_no,
				form_country: country_no,
			}, true);
			await this.messageService.UpdateMessageState({state: 2, id: r.insertId});
		} catch (e) {
			await this.messageService.UpdateMessageState({state: 1, id: r.insertId});
		} finally {
			setTimeout(async () => {
				await this.renewHistory();
				await this.global.updateUserData();
			}, 500)
		}
	}

	async messageRetry(item) {
		await this.messageService.DeleteMessageWithId(item.id);
		await this.sendMessage(item.content, item.tophone, item.type, false);
	}

	async sendFile(photo: PhotoDao, tophone = null, needAdd = true) {
		if (!tophone) {
			tophone = '+' + this.country_no + ' ' + this.phone_no;
			if (!Util.CheckPhone(this.country_no, this.phone_no)) {
				this.global.presentMessage(strings('messagePage.error_phone_code'));
				return;
			}
		}

		let {country_no, phone_no} = Util.fixNumber(this.fromePhone);
		let toPhoneItem = Util.fixNumber(tophone);
		let params = {
			type: 2,
			content: "",
			to_country: toPhoneItem.country_no,
			to_no: toPhoneItem.phone_no,
			form_no: phone_no,
			form_country: country_no,
		};
		// 数据库记录
		let dbData = {state: 0, content: '', tophone: tophone, fromphone: 'me', time: 0, type: 2};
		let history = new HistoryDao(dbData);

		setTimeout(async () => {

			let type = 'image/png';
			try {
				let data = await fetch(photo.big_url, {method: 'GET'})
				type = data.headers.map['content-type'];
			} catch (e) {
			}

			let pid = photo.id;
			if (!pid) {
				photo.filetype = type;
				let pr = await this.photoService.insertPhoto(photo);
				pid = pr.insertId
			}
			let {taskid, task} = this.uploadList.createUploadPhotoTask(params, {
				uri: photo.big_url,
				type,
				name: photo.filename
			});

			history.content = JSON.stringify({photoid: pid, taskid: taskid});
			history.isread = 1;
			let r = await this.messageService.insertMessage(history);
			this.uploadList.startUploadPhotoTask(task, r.insertId, pid);
			if (needAdd) this.maxMessageLength += 1;
			await this.renewHistory();
			await this.global.updateUserData();

		}, 500)
	}

	async fileRetry(item) {
		if (item.type == 12) {
			// 图片转发
			await this.messageRetry(item);
		} else {
			let con = JSON.parse(item.content);
			let prow = await this.photoService.getPhotoById(con.photoid);
			let photo = new PhotoDao(prow);
			await this.messageService.DeleteMessageWithId(item.id);
			await this.renewHistory();
			await this.sendFile(photo, item.tophone, false);
		}
	}

	scrollBottom() {
		if (this.needInverted) {
			this.refs.flatlist.scrollToOffset({offset: 0});
		} else {
			this.refs.flatlist.scrollToEnd();
		}
	}

	async _onRefresh() {
		if (!this.refreshing && this.maxMessageLength <= this.currentMessageCount) {
			this.refreshing = true;
			this.maxMessageLength += this.pageSize;
			await this.renewHistory(false).then();
			if (this.data.length < this.maxMessageLength) {
				// console.log(this.data.length, this.maxMessageLength, "已经到底部")
			} else {

			}
			this.refreshing = false;
		}
	}

	_onScroll(event) {
		this.contentOffsetY = event.nativeEvent.contentOffset.y;
		// console.log('加载更多', this.contentOffsetY, this.maxContentOffsetY, this.listHeight);
		if (this.needInverted) {
			if (this.contentOffsetY + this.listHeight >= this.maxContentOffsetY) {
				this._onRefresh();
			}
		} else {
			if (this.contentOffsetY < 0) {
				this._onRefresh();
			}
		}

		// const handle = findNodeHandle(this.refs.flatlist);
		// UIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
		//
		// 	console.log(this.maxContentOffsetY, this.contentOffsetY);
		//
		// 	// if (this.contentOffsetY + height >= this.maxContentOffsetY - 100) {
		// 	//
		// 	// 	this.setNeetScrollBottom(true);
		// 	// } else {
		// 	// 	this.setNeetScrollBottom(false);
		// 	// }
		// })
	}

	onRef(c) {
		this.inputbar = c
	}

	hideInputBarExtent() {
		try {
			this.inputbar.scrollHidenImageScroll();
		} catch (e) {
		}
	}

	sethowHeaderBar(isShow) {
		try {
			if (isShow) {
				this.headerBar.show(95, 200);
			} else {
				this.headerBar.hide(200);
			}
			this.headerBarShowing = isShow;
		} catch (e) {
		}
	}

	toggleHeaderBar() {
		if (this.headerBar) {
			if (!this.headerBarShowing) {
				this.sethowHeaderBar(true);
			} else {
				this.sethowHeaderBar(false);
			}
		}
	}

	deleteContract() {
		Alert.alert('确定需要删除该联系人？', '', [{
			text: '确定', onPress: async () => {
				this.global.showLoading();
				try {
					await this.store.deleteContractAndHistory(this.contract);
				} catch (e) {
				} finally {
					this.global.dismissLoading();
				}
				this.navigation.pop();
			},
		}, {
			text: '取消', onPress: () => {
			},
		}], {cancelable: false});
	}

	renderListPage() {
		return (
			<Button onPress={() => {
				this.global.modalRef.handlehide();
				this.navigation.push('CountrySelect')
			}} key={-2}>
				<View style={[AppStyle.row, {padding: 9, marginVertical: 12, alignItems: 'center'}]}>
					<View style={{marginLeft: 12, justifyContent: 'center', flex: 1}}>
						<TextEx style={{
							fontSize: 14,
							color: '#333',
							lineHeight: 20
						}}>{strings("messagePage.get_phone_string")}</TextEx>
						<TextEx style={{
							fontSize: 12,
							color: '#999',
							lineHeight: 20
						}}>{strings("messagePage.get_phone_detail_string")}</TextEx>
					</View>
					<View style={{
						backgroundColor: '#999', borderRadius: 4, height: 32,
						alignItems: 'center', justifyContent: 'center', paddingHorizontal: 9
					}}>
						<TextEx style={{fontSize: 15, color: '#FFF'}}>{strings('messagePage.rende_sms_string')}</TextEx>
					</View>
				</View>
			</Button>
		)
	}

	changePostPhoneNum() {
		this.global.selectCallOutPhone(({phone_no, country_no}) => {
			console.log(phone_no, country_no)
			if (phone_no == '') {
				this.fromePhone = '';
			} else {
				this.fromePhone = '+' + country_no + ' ' + phone_no;
			}
		}, this.navigation);
	}

	changeGetPhoneNum() {
		if (this.contract.phones.length <= 1) {
			return;
		}

		let phoneListView = this.contract.phones.map((item, index) => {
			return (
				<Fragment key={item + index}>
					<Button style={[styles.bottomUpPhoneBtn, AppStyle.row]} onPress={() => {
						this.global.modalRef.handlehide();
						this.toPhone = '+' + item.country_no + ' ' + item.phone_no;
						try {
							this.smsPrice = this.global.smsPriceList[item.country_no].coin;
						} catch (e) {
							this.smsPrice = '1';
						}
					}}>
						<Icon icon={'chat_icon_onion_phone2'} size={40} color={'#4A90E2'}
							  style={{marginHorizontal: 15}}/>
						<View style={[{flex: 1, paddingRight: 10, alignItems: 'center'}, AppStyle.row]}>
							<TextEx style={styles.bottomUpPhoneTitle}>+{item.country_no} {item.phone_no}</TextEx>
							<TextEx style={styles.bottomUpPhoneStyle}>{item.label}</TextEx>
						</View>
					</Button>
					<Line style={{marginLeft: 68}}/>
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
					}}>
						{strings('messagePage.select_get_message_phone')}
					</TextEx>
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
					{phoneListView}
				</ScrollView>

			</View>))


	}

	showImageLongPress(url) {
		const options = [
			strings('messagePage.save_to_local'),
			strings('other.cancel')
		];
		const cancelButtonIndex = 1;
		this.props.showActionSheetWithOptions({
				options,
				cancelButtonIndex,
			},
			buttonIndex => {
				switch (buttonIndex) {
					case 0: {
						this.global.showLoading();
						let promise = CameraRoll.saveToCameraRoll(url);
						promise.then((result) => {
							this.global.dismissLoading();
							this.global.presentMessage(strings('messagePage.save_success'));
						}).catch((error) => {
							this.global.dismissLoading();
							this.global.presentMessage(strings('messagePage.save_faile'));
						});
						break;
					}
				}
			},
		);
	}

	currentSelectIndex = null;

	// 分组列表的renderItem
	_renderItem(item) {
		let resutl = null;
		let self = this;

		switch (item.type) {
			// ContractRow
			case -2: {
				resutl = (<ContractHeadRow navigation={this.navigation} date={item}/>);
				break;
			}
			// DataRow
			case -1: {
				resutl = (<DataRow date={item.title}/>);
				break;
			}
			// MessageRow
			case 10:
			case 0: {
				resutl = (<MessageRow2 data={item} retryBtnPress={() => this.messageRetry(item)}
									   mode={this.mode}
									   removeItem={this.removeItem.bind(this)}
									   forword={() => {
										   this.navigation.push('ForwordPage', {callback: (list) => this.forword(list, item)})
									   }}
									   selectModel={() => self.selectModal(2)}
									   selectAction={(select, itemRef) => {
										   if (select) {
											   self.selectList.push({...item, row: itemRef});
										   } else {
											   self.selectList = self.selectList.filter(res => res.id !== item.id);
										   }
										   self.selectList.sort(function (a, b) {
											   return a.id - b.id;
										   });
									   }}
									   selectIndexCallBack={(com) => {
										   try {
											   if (this.currentSelectIndex != null && this.currentSelectIndex != com) {
												   this.currentSelectIndex.hideAnimateHeigth(0);
											   }
											   this.currentSelectIndex = com;
										   } catch (e) {
										   }
									   }}/>);
				break;
			}
			// PhoneRow
			case 1: {
				let phone = "";
				let isLeft = false;
				if (item.fromphone == 'me') {
					phone = item.tophone;
					isLeft = false;
				} else {
					phone = item.fromphone;
					isLeft = true;
				}
				resutl = (<PhoneRow time={item.time}
									date={item.date}
									phone={phone}
									isLeft={isLeft}
									onPress={() => {
										let {country_no, phone_no} = Util.fixNumber(phone);
										this.navigation.push('CallPhonePage', {
											country_no: country_no,
											phone_no: phone_no,
											contract_id: this.contract.id,
										})
									}}/>);
				break;
			}
			// PhoneRow
			case 12:
			case 2: {
				resutl = (<PhotoRow data={item}
									mode={this.mode}
									removeItem={() => {
										this.removeItem(item.id)
									}}
									forword={() => {
										this.navigation.push('ForwordPage', {
											callback: (list) => {
												this.forword(list, item);
											}
										})
									}}
									rowLongPress={({url}) => {
										this.showImageLongPress(url)
									}}
									onPhotoClick={({small, big}) => {
										this.navigation.push('PhotoModal', {small, big})
									}}
									retryBtnPress={() => this.fileRetry(item)}
									renewMessageList={async () => {
										await this.renewHistory();
										await this.global.updateUserData();
									}}
									selectModel={() => self.selectModal(2)}
									selectAction={(select, itemRef) => {
										if (select) {
											self.selectList.push({...item, row: itemRef});
										} else {
											self.selectList = self.selectList.filter(res => res.id !== item.id);
										}
										self.selectList.sort(function (a, b) {
											return a.id - b.id;
										});
									}}
				/>);

				break;
			}
		}
		return resutl;
	}

	_renderHeader() {
		let logo = Util.logoFix(this.contract.name, this.contract.contractType, 30);
		return (
			<Fragment>
				<View style={[{
					backgroundColor: 'white',
					paddingHorizontal: 12,
					paddingVertical: 6,
					zIndex: 88
				}, AppStyle.row]}>
					{logo}
					<TextEx style={styles.HeaderDownNameTitle}>{this.contract.name}</TextEx>
					{
						this.contract.contractType != 0 ? (
							<Button style={{paddingVertical: 4}} onPress={() => {
								this.navigation.push('EditContactPage', {contract: this.contract});
							}}>
								<Icon icon={'chat_icon_add_user'} size={20} color={'#4A90E2'}/>
							</Button>
						) : null
					}

				</View>
				<View style={[styles.HeaderDownView, AppStyle.row]}>
					<Button style={styles.HeaderBtn} onPress={() => {
						this.navigation.push('MessageSearch', {contract: this.contract});
					}}>
						<Icon icon={'chat_icon_search'} size={24} color={'#4A90E2'}/>
						<TextEx style={[styles.HeaderBtnLabel, {color: '#4A90E2'}]}>
							{strings('messagePage.search')}
						</TextEx>
					</Button>
					{
						this.config.bell == 1 ? (
							<Button style={styles.HeaderBtn} onPress={async () => {
								// 禁止响铃
								await this.configService.insertOrSaveConfig(this.contract, 0);
								this.config = await this.configService.getConfigByContract(this.contract);
							}}>
								<Icon icon={'chat_icon_bell'} size={24} color={'#4A90E2'}/>
								<TextEx style={[styles.HeaderBtnLabel, {color: '#4A90E2'}]}>
									{strings('messagePage.ring')}
								</TextEx>
							</Button>
						) : (
							<Button style={styles.HeaderBtn} onPress={async () => {
								// 开启响铃
								await this.configService.insertOrSaveConfig(this.contract, 1);
								this.config = await this.configService.getConfigByContract(this.contract);
							}}>
								<Icon icon={'chat_icon_bell'} size={24} color={'#999'}/>
								<TextEx style={styles.HeaderBtnLabel}>
									{strings('messagePage.ring')}
								</TextEx>
							</Button>
						)
					}
					{
						this.config.ban == 1 ? (
							<Button style={styles.HeaderBtn} onPress={async () => {
								// 阻止来电
								await this.configService.insertOrSaveConfig(this.contract, null, 0);
								this.config = await this.configService.getConfigByContract(this.contract);
							}}>
								<Icon icon={'chat_icon_stop_select'} size={24}/>
								<TextEx style={[styles.HeaderBtnLabel, {color: '#E44343'}]}>
									{strings('messagePage.stop')}
								</TextEx>
							</Button>
						) : (
							<Button style={styles.HeaderBtn} onPress={async () => {
								// 不阻止来电
								await this.configService.insertOrSaveConfig(this.contract, null, 1);
								this.config = await this.configService.getConfigByContract(this.contract);
							}}>
								<Icon icon={'chat_icon_stop_normal'} size={24} color={'#4A90E2'}/>
								<TextEx style={[styles.HeaderBtnLabel, {color: '#4A90E2'}]}>
									{strings('messagePage.stop')}
								</TextEx>
							</Button>
						)
					}

					<Button style={styles.HeaderBtn} onPress={() => {
						this.deleteContract();
					}}>
						<Icon icon={'chat_icon_delete'} size={24} color={'#4A90E2'} />
						<TextEx style={[styles.HeaderBtnLabel, {color: '#4A90E2'}]}>
							{strings('messagePage.delete')}
						</TextEx>
					</Button>
				</View>
				<Line/>
			</Fragment>
		)
	}

	_renderFootItem() {
		let money = parseFloat(this.global.userData.balance).toFixed(2);
		return (
			<Fragment>
				<View>
					<Line/>
					<View style={[AppStyle.row, {paddingTop: 8, paddingBottom: 16, paddingHorizontal: 12}]}>
						<View style={[AppStyle.row, {flex: 1}]}>
							<TextEx style={styles.sucLineText}>
								{strings('messagePage.from_phone_to_phone_1')}&nbsp;
							</TextEx>
							<Button onPress={() => this.changePostPhoneNum()}>
								<Text
									style={[styles.sucLineTextUnline]}>{this.fromePhone.length > 2 ? this.fromePhone : '洋葱号码'}</Text>
							</Button>
							<TextEx style={styles.sucLineText}>
								&nbsp;{strings('messagePage.from_phone_to_phone_2')}&nbsp;
							</TextEx>
							<Button onPress={() => this.changeGetPhoneNum()}>
								<TextEx style={styles.sucLineTextUnline}>{this.toPhone}</TextEx>
							</Button>
						</View>
						<Button style={AppStyle.row} onPress={() => this.navigation.push('BuyListPage')}>
							<Image
								style={{width: 22, height: 22, marginHorizontal: 3}}
								source={require('../../assets/newimg/png/icon/chat/chat_icon_onion_coin_24.png')}
							/>
							<TextEx style={[styles.sucLineText, {color: '#000'}]}>{money}</TextEx>
						</Button>
					</View>
					<InputBar onRef={this.onRef.bind(this)}
							  onSendPress={(text) => {
								  this.sendMessage(text).then();
							  }}
							  onSendFilePress={(photo) => {
								  let tPhoto = new PhotoDao();
								  tPhoto.big_url = photo.uri;
								  tPhoto.small_url = photo.uri;
								  tPhoto.height = photo.height;
								  tPhoto.width = photo.width;
								  tPhoto.filename = photo.filename;
								  this.sendFile(tPhoto).then();
							  }}
							  smsPrice={(parseFloat(this.smsPrice).toFixed(2))}
							  navigation={this.navigation}/>
				</View>
			</Fragment>
		)
	}

	renderEmpty() {
		let footBar = this._renderFootItem();
		return (
			<Fragment>
				<NavBar title={''}
						bottom_line={true}
						leftRender={(
							<Button style={[{padding: 6}, AppStyle.row]} onPress={() => {
								this.navigation.pop()
							}}>
								<Image
									style={{width: 22, height: 22}}
									source={require('../../assets/img/util/ic_back_black.png')}
								/>
								<TextEx style={{fontSize: 17, lineHeight: 22}}>
									{strings('messagePage.newMessage')}
								</TextEx>
							</Button>
						)}
				/>
				<View style={{flexDirection: 'column', flex: 1}}>
					<ScrollView
						onTouchStart={() => {
							this.hideInputBarExtent();
						}}
						style={{backgroundColor: "white", flex: 1}}
						keyboardDismissMode={'none'}
						keyboardShouldPersistTaps={'handled'}
						scrollEnabled={false}
					>
						<Fragment key={'-23'}>
							<View style={[AppStyle.row, {alignItems: 'center', paddingLeft: 12}]}>
								<TextEx style={{fontSize: 15, color: '#333'}}>
									{strings('messagePage.get_phone')}:
								</TextEx>
								<TextInput ref={'searchinputbar'}
										   style={{flex: 1, height: 52, paddingHorizontal: 12}}
										   onChangeText={(text) => {
											   this.newPhoneNo = text
										   }}
										   onBlur={() => {
											   let {country_no, phone_no} = Util.fixNumber(this.newPhoneNo);
											   console.log({country_no, phone_no})
											   this.reSetUser({country_no, phone_no});
										   }}
										   keyboardType={'phone-pad'}
										   maxLength={20}
										   value={this.newPhoneNo}/>

								<Button style={[{padding: 10}]}
										onPress={() => this.navigation.push('SearchPage', {
											rowTap: (item) => {
												console.log(toJS(item));
												this.navigation.pop();
												this.reSetUser({country_no: item.country_no, phone_no: item.phone_no});
											},
										})}>
									<Icon icon={'chat_icon_contact'} size={22} color={'#4A90E2'}/>
								</Button>
							</View>
							<Line style={{marginLeft: 60, marginRight: 12}}/>
						</Fragment>
					</ScrollView>
					{footBar}
				</View>
			</Fragment>
		)
	}

	renderMessageContent() {

		let resalData = [...this.data];
		if (this.needInverted) {
			resalData = resalData.reverse();
		}

		let footBar = this._renderFootItem();
		let bootBar = this._renderSelectTabbar();
		let typeName = '';
		switch (this.contract.contractType) {
			case 0: {
				typeName = strings('messagePage.contract_type_0');
				break;
			}
			case 1: {
				typeName = strings('messagePage.contract_type_1');
				break;
			}
			case 2: {
				typeName = strings('messagePage.contract_type_2');
				break;
			}
		}
		let logo = Util.logoFix(this.contract.name, this.contract.contractType, 40);
		let ScComponent = this.ScComponent;
		return (
			<Fragment>
				<NavBar title={''}
						barHeight={52}
						bottom_line={true}
						leftRender={(
							<View style={AppStyle.row}>
								<Button style={[{paddingLeft: 6, paddingRight: 6}, AppStyle.row]} onPress={() => {
									this.navigation.pop()
								}}>
									<Image
										resizeMode={'contain'}
										style={{width: 24, height: 52}}
										source={require('../../assets/newimg/png/icon/common/common_icon_back_black.png')}
									/>
								</Button>

								<Button
									style={[{paddingLeft: 0, alignItems: 'center'}, AppStyle.row]}
									onPress={() => {
										this.navigation.push('ClientDetail', {contract: this.contract});
									}}>
									{logo}
									<View style={{marginLeft: 8}}>
										<TextEx style={{fontSize: 17, lineHeight: 22}}>
											{this.contract.name}
										</TextEx>
										<TextEx style={{fontSize: 12, lineHeight: 17, color: '#999'}}>
											{typeName}
										</TextEx>
									</View>
								</Button>
							</View>
						)}
						rightRender={this.mode == 2 ? (
							<View style={AppStyle.row}>
								<Button style={{padding: 10, paddingHorizontal: 16}} onPress={() => this.allDelete()}>
									<TextEx style={{color: '#DD0D26', fontSize: 16, lineHeight: 24}}>全部删除</TextEx>
								</Button>
							</View>

						) : (
							<View style={AppStyle.row}>
								<Button style={{padding: 10, paddingHorizontal: 0}} onPress={() => {
									this._showClientActionSheet(this.contract)
								}}>
									<Icon icon={'topbar_icon_dial'} size={24} color={'#4A90E2'}/>
								</Button>
								<Button style={{padding: 10, paddingHorizontal: 16}}
										onPress={() => this.toggleHeaderBar()}>
									<Icon icon={'topbar_icon_sort'} size={24} color={'#4A90E2'}/>
								</Button>
							</View>
						)}
						onTouchStart={() => {
							this.hideInputBarExtent();
							this.sethowHeaderBar(false);
						}}
				/>
				<View style={{flexDirection: 'column', flex: 1, overflow: 'hidden'}}
					  behavior="height">

					<HeaderDown ref={'heagerdown'} style={{position: 'absolute', left: 0, right: 0}}>
						{this._renderHeader()}
					</HeaderDown>

					<ScComponent
						ref={'mainscroll'}
						onLayout={(event) => {
							this.listHeight = event.nativeEvent.layout.height;
							if (this.refs.mainscroll.scrollToEnd) {
								this.refs.mainscroll.scrollToEnd({animated: false})
							}
						}}
						onContentSizeChange={(contentWidth, contentHeight) => {
							if (this.lastCount != this.data.length) {
								if (this.refs.mainscroll.scrollToEnd) {
									this.refs.mainscroll.scrollToEnd({animated: true})
								}
								this.lastCount = this.data.length;
							}
						}}
					>
						<FlatList
							onTouchStart={() => {
								this.hideInputBarExtent();
								this.sethowHeaderBar(false);
							}}
							// automaticallyAdjustContentInsets={false}
							ref={'flatlist'}
							// snapToAlignment={'end'}
							style={{backgroundColor: "transparent", overflow: 'visible'}}
							contentContainerStyle={{justifyContent: 'flex-end'}}
							// keyboardDismissMode={'on-drag'}
							keyboardShouldPersistTaps={'never'}
							renderItem={({item}) => this._renderItem(item)}
							renderSectionHeader={(section) => this._renderSectionHeader(section)}
							data={resalData}
							onContentSizeChange={(contentWidth, contentHeight) => {
								this.maxContentOffsetY = contentHeight;
								const handle = findNodeHandle(this.refs.flatlist);
								UIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
									// this.listHeight = height;
									if (this.maxContentOffsetY > 5) {
										this.delayAction(() => {
											this.initFinish = true;
										})
									}
								});
							}}
							onScroll={this._onScroll.bind(this)}
							scrollEventThrottle={200}
							keyExtractor={(item, index) => {
								let t = 0;
								try {
									t = item.id.toString() + "_" + item.state.toString();
								} catch (e) {
									t = JSON.stringify(item) + index;
								}
								return t;
							}}
							stickySectionHeadersEnabled={false}
							inverted={this.needInverted}
						/>

					</ScComponent>
					<View style={{width: "100%", flex: 1, backgroundColor: 'transparent'}}
						  onTouchStart={() => {
							  this.hideInputBarExtent();
							  this.sethowHeaderBar(false);
						  }}
					/>

					{this.initFinish ? null : (
						<View
							style={{
								position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
								backgroundColor: 'white'
							}}>
						</View>
					)}
					{/*<View style={{height: 200, backgroundColor: 'red'}}/>*/}

				</View>

				{footBar}
				{
					this.mode == 2 ? bootBar : null
				}
			</Fragment>
		)
	}

	delayAction(action) {
		if (!this.delayTimer) {
			this.delayTimer = setTimeout(() => {
				action();
				this.delayTimer = undefined;
			}, 220)
		}
	}

	render() {
		let content = null;
		if (this.isNew) {
			content = this.renderEmpty();
		} else {
			content = this.renderMessageContent();
		}


		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					{content}
				</SafeView>

			</Fragment>
		)
	}

	removeItem(messageId) {
		let temp = this.data.slice().filter(item => item.id != messageId);
		this.data = temp;
		this.messageService.DeleteMessageWithId(messageId)
	};

	async _showClientActionSheet(item) {
		this.global.modalRef.showModal((
			<CallPhoneAlert item={item} navigation={this.navigation} contract={this.contract}/>
		))
	}

	_renderSelectTabbar() {
		return (
			<View style={[styles.selectTab]}>
				<Line/>
				<View style={{flexDirection: "row"}}>
					<Button style={styles.selectTabButton} onPress={() => this.selectModal(1)}>
						<Icon icon={'tabbar_icon_quxiao'} size={32}/>
						<TextEx style={[styles.selectTabText, {color: '#999'}]}>取消</TextEx>
					</Button>
					{/*<Button style={styles.selectTabButton} onPress={() => this.multiCopy()}>*/}
					{/*	<Icon icon={'tabbar_icon_fuzhi'} size={32} color={'#4A90E2'}/>*/}
					{/*	<TextEx style={[styles.selectTabText, {color: '#4A90E2'}]}>复制</TextEx>*/}
					{/*</Button>*/}
					<Button style={styles.selectTabButton} onPress={() => this.multiForword()}>
						<Icon icon={'tabbar_icon_share'} size={32} color={'#4A90E2'}/>
						<TextEx style={[styles.selectTabText, {color: '#4A90E2'}]}>转发</TextEx>
					</Button>
					<Button style={styles.selectTabButton} onPress={() => this.multiDelete()}>
						<Icon icon={'tabbar_icon_delete'} size={32}/>
						<TextEx style={[styles.selectTabText, {color: '#DD0D26'}]}>删除</TextEx>
					</Button>
				</View>
			</View>
		)
	}

	selectModal(mode) {
		if (mode == 2) {
			this.selectList = [];
		}
		this.mode = mode;
		LayoutAnimation.spring();
	}

	async allDelete() {
		for (let phone of this.contract.phones) {
			let phoneStr = '+' + phone.country_no + ' ' + phone.phone_no;
			await this.messageService.deleteMessageWithPhone(phoneStr);
		}
		await this.renewHistory();
		this.selectModal(1);
	}

	multiDelete() {
		for (let item of this.selectList) {
			let row = item.row;
			row.removeItem();
		}
	}

	async forword(list, item) {
		for (let contract of list) {
			let tophone = '+' + contract.country_no + ' ' + contract.phone_no;

			switch (item.type) {
				case 10:
				case 0: {
					// 文字
					let content = item.content;
					await this.sendMessage(content, tophone, 10);
					break;
				}
				case 12:
				case 2: {
					// 图片
					let content = item.content;
					await this.sendMessage(content, tophone, 12);
					break;
				}
			}
		}
	}

	// 转发
	multiForword() {
		this.navigation.push('ForwordPage', {
			callback: async (list) => {
				this.selectModal(1);
				for (let item of this.selectList) {
					try {
						await this.forword(list, item);
					} catch (e) {
					}
				}
			}
		})
	}

	multiCopy() {
		let result = "";
		for (let item of this.selectList) {
			if (result.length > 0) {
				result += "\n\n";
			}
			let phone = "";
			if (item.fromphone == 'me') {
				phone = Util.findstring(this.global.userData.nickname, this.global.userData.phone_no);
			} else {
				phone = this.contract.name;
			}
			let tempStr = `${phone} : \n${item.content} `;
			result += tempStr;
		}
		this.selectModal(1);

		Clipboard.setString(result);
		this.global.presentMessage("复制成功");
	}
}

@inject('store', 'global')
@observer
class CallPhoneAlert extends React.Component {

	FromphoneListView = [];
	TophoneListView = [];

	@observable
	selectCallFromCountry_no;
	@observable
	selectCallFromPhone_no;

	@observable
	Callindex = 0;

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;
		this.store = props.store;
		this.item = props.item;
		this.contract = props.contract;
	}

	renderListPage() {
		return (
			<Button onPress={() => {
				this.global.modalRef.handlehide();
				this.navigation.push('CountrySelect')
			}} key={-2}>
				<View style={[AppStyle.row, {padding: 9, marginVertical: 12, alignItems: 'center'}]}>
					<View style={{marginLeft: 12, justifyContent: 'center', flex: 1}}>
						<TextEx style={{fontSize: 14, color: '#333', lineHeight: 20}}>
							{strings('messagePage.ad_tip_1')}
						</TextEx>
						<TextEx style={{fontSize: 12, color: '#999', lineHeight: 20}}>
							{strings('messagePage.ad_tip_2')}
						</TextEx>
					</View>
					<View style={{
						backgroundColor: '#999', borderRadius: 4, height: 32,
						alignItems: 'center', justifyContent: 'center', paddingHorizontal: 9
					}}>
						<TextEx style={{fontSize: 15, color: '#FFF'}}>
							{strings('messagePage.ad_tip_3')}
						</TextEx>
					</View>
				</View>
			</Button>
		)
	}

	initData() {

		this.FromphoneListView = [];
		this.TophoneListView = [];

		let titleList = this.global.userData.balance <= 100 ? [
			strings('messagePage.list_tip_1_1'),
			strings('messagePage.list_tip_1_2'),
			strings('messagePage.list_tip_1_3'),
		] : [
			strings('messagePage.list_tip_2_1'),
			strings('messagePage.list_tip_2_2'),
			strings('messagePage.list_tip_2_3'),
		];

		this.FromphoneListView.push((
			<Fragment key={-1}>
				<Button style={[styles.bottomUpPhoneBtn, AppStyle.row]} onPress={() => {
					this.selectCallFromCountry_no = '';
					this.selectCallFromPhone_no = '';
					if (this.contract.phones.length == 1) {
						let country_no = this.contract.phones[0].country_no;
						let phone_no = this.contract.phones[0].phone_no;
						this.global.modalRef.handlehide();
						this.navigation.push('CallPhonePage', {
							country_no: country_no,
							phone_no: phone_no,
							from_country_no: this.selectCallFromCountry_no,
							from_phone_no: this.selectCallFromPhone_no,
							contract_id: this.contract.id,
						})
					} else {
						this.Callindex = 1;
					}
				}}>
					<Icon icon={'chat_icon_onion_phone'} size={40} color={'#4A90E2'} style={{marginHorizontal: 15}}/>
					<View style={[{flex: 1, paddingRight: 10, alignItems: 'flex-start'}]}>
						<TextEx style={styles.bottomUpPhoneTitle}>
							{strings('messagePage.default_phone')}
						</TextEx>
						<TextEx style={styles.olDetail}>
							{strings('messagePage.no_name_phone')}
						</TextEx>
					</View>
				</Button>
				<Line style={{marginLeft: 68}}/>
			</Fragment>
		));

		this.global.userData.phonelist.map((item, index) => {
			this.FromphoneListView.push(
				<Fragment key={index}>
					<Button style={[styles.bottomUpPhoneBtn, AppStyle.row]} onPress={() => {
						console.log(toJS(item))
						this.selectCallFromCountry_no = item.country_no;
						this.selectCallFromPhone_no = item.phone_no;
						if (this.contract.phones.length == 1) {
							let country_no = this.contract.phones[0].country_no;
							let phone_no = this.contract.phones[0].phone_no;
							this.global.modalRef.handlehide();
							this.navigation.push('CallPhonePage', {
								country_no: country_no,
								phone_no: phone_no,
								from_country_no: this.selectCallFromCountry_no,
								from_phone_no: this.selectCallFromPhone_no,
								contract_id: this.contract.id,
							})
						} else {
							this.Callindex = 1;
						}
					}}>
						<Icon icon={'chat_icon_onion_phone2'} size={40} color={'#4A90E2'}
							  style={{marginHorizontal: 15}}/>
						<View style={[{flex: 1, paddingRight: 10, alignItems: 'center'}, AppStyle.row]}>
							<View style={[{flex: 1, paddingRight: 10, alignItems: 'flex-start'}]}>
								<TextEx style={styles.bottomUpPhoneTitle}>+{item.country_no} {item.phone_no}</TextEx>
								<TextEx style={styles.olDetail}>{titleList[index]}</TextEx>
							</View>
							{item.ismain == '1' ? <TextEx style={styles.bottomUpPhoneStyle}>
								{strings('messagePage.main_phone')}
							</TextEx> : null}
						</View>
					</Button>
					<Line style={{marginLeft: 68}}/>
				</Fragment>
			)
		});
		if (this.global.userData.phonelist.length <= 0) {
			this.FromphoneListView.push(this.renderListPage());
		}


		this.TophoneListView = this.contract.phones.map((item, index) => {
			return (
				<Fragment key={index}>
					<Button style={[styles.bottomUpPhoneBtn, AppStyle.row]} onPress={() => {
						this.global.modalRef.handlehide();
						this.navigation.push('CallPhonePage', {
							country_no: item.country_no,
							phone_no: item.phone_no,
							from_country_no: this.selectCallFromCountry_no,
							from_phone_no: this.selectCallFromPhone_no,
							contract_id: this.contract.id,
						})
					}}>
						<Icon icon={'chat_icon_onion_phone2'} size={40} color={'#4A90E2'}
							  style={{marginHorizontal: 15}}/>
						<View style={[{flex: 1, paddingRight: 10, alignItems: 'center'}, AppStyle.row]}>
							<TextEx style={styles.bottomUpPhoneTitle}>+{item.country_no} {item.phone_no}</TextEx>
							<TextEx style={styles.bottomUpPhoneStyle}>{item.label}</TextEx>
						</View>
					</Button>
					<Line style={{marginHorizontal: 68}}/>
				</Fragment>
			)
		});
	}

	render() {

		this.initData();

		return (
			<Fragment>
				{
					this.Callindex == 0 ? (
						<View style={{backgroundColor: "#FFF", borderTopLeftRadius: 10, borderTopRightRadius: 10}}>
							<View style={[{
								backgroundColor: "#fff",
								alignItems: 'center',
								borderTopLeftRadius: 10,
								borderTopRightRadius: 10
							}, AppStyle.row]}>
								<TextEx style={{
									position: 'absolute',
									left: 0,
									right: 0,
									textAlign: 'center',
									fontSize: 17
								}}>
									{strings('messagePage.select_callout_phone')}
								</TextEx>
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
								{this.FromphoneListView}
							</ScrollView>
						</View>
					) : (
						<View style={{backgroundColor: "#FFF", borderTopLeftRadius: 10, borderTopRightRadius: 10}}>
							<View style={[{
								backgroundColor: "#fff",
								alignItems: 'center',
								height: 60,
								borderTopLeftRadius: 10,
								borderTopRightRadius: 10
							}, AppStyle.row]}>
								<View style={{position: 'absolute', left: 0, right: 0,}}>
									<TextEx style={{
										textAlign: 'center',
										fontSize: 17
									}}>
										{strings('messagePage.select_get_phone')}
									</TextEx>
									<TextEx style={[styles.olDetail, {textAlign: 'center'}]}>
										{strings('messagePage.callout')}{this.selectCallFromPhone_no.length > 0 ? '+' + this.selectCallFromCountry_no + ' ' + this.selectCallFromPhone_no : '洋葱号码'}
									</TextEx>
								</View>
								<Button style={{padding: 12}} onPress={() => {
									this.Callindex = 0
								}}>
									<Image
										style={{width: 20, height: 20}}
										source={require('../../assets/img/util/ic_arrow_back.png')}
									/>
								</Button>
							</View>
							<ScrollView style={{marginBottom: 4, maxHeight: 240}}>
								{this.TophoneListView}
							</ScrollView>

						</View>
					)
				}

			</Fragment>
		)
	}
}

const styles = StyleSheet.create({

	selectTab: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		width: width,
		backgroundColor: 'white'
	},
	selectTabButton: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 3,
	},
	selectTabText: {
		fontSize: 10,
	},
	rowTitle: {
		fontSize: 14,
		color: "#333",
		flex: 1,
		textAlign: "left",
		alignSelf: "center"
	},
	rowRightTitle: {
		fontSize: 14,
		color: "#999",
		flex: 1,
		textAlign: "right",
		alignSelf: "center"
	},
	row: {
		paddingVertical: 10,
		paddingHorizontal: 12
	},
	sucLineText: {
		fontSize: 12,
		color: "#333",
		lineHeight: 17,
		fontWeight: '400',
		alignSelf: 'center'
	},
	sucLineTextUnline: {
		fontSize: 10,
		color: "#487ad3",
		textDecorationLine: "underline",
		textDecorationColor: "#487ad3",
		lineHeight: 22,
	},
	HeaderDownNameTitle: {
		fontSize: 14,
		color: '#000',
		flex: 1,
		lineHeight: 16,
		alignSelf: 'center',
		marginHorizontal: 6
	},
	HeaderBtnLabel: {
		fontSize: 12,
		color: '#999',
		marginTop: 3,
		lineHeight: 17,
	},
	HeaderBtn: {
		width: 50,
		height: 50,
		justifyContent: "center",
		alignItems: 'center',
	},
	HeaderDownView: {
		backgroundColor: 'white',
		justifyContent: 'space-around',

		shadowOffset: {width: 0, height: 1},
		shadowOpacity: 0.8,
		shadowRadius: 3,
		shadowColor: 'rgba(0,0,0,0.21)',
	},
	bottomUpPhoneTitle: {
		fontSize: 17,
		fontWeight: "400",
		color: "#333",
	},
	bottomUpPhoneStyle: {
		flex: 1,
		fontSize: 14,
		color: "#999",
		textAlign: "right"
	},
	bottomUpPhoneBtn: {
		paddingRight: 7,
		paddingVertical: 12,
		backgroundColor: "#FFF",
	},
	olDetail: {
		fontSize: 14,
		color: "#999",
		flexWrap: 'wrap',
		lineHeight: 18,
		marginTop: 2,
		minHeight: 18,
	},
});

export default connectActionSheet(MessagePage)
