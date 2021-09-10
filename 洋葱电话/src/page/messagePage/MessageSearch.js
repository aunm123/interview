'use strict';
import React, {Fragment, Component} from 'react';
import {
	Text, View,
	StyleSheet,
	StatusBar,
	Platform,
	Image, TextInput, Keyboard, FlatList,
	findNodeHandle, UIManager, DatePickerIOS, DatePickerAndroid, RefreshControl
} from 'react-native';
import {inject, observer} from "mobx-react";
import AppStyle, {font} from '../../Style';
import Line from "../../components/Line";
import DataRow from "../../components/messageRow/DataRow";
import KeyboardView from "../../components/KeyboardView";
import SafeView from "../../components/SafeView";
import BaseComponents from "../../BaseComponents";
import ContractHeadRow from "../../components/messageRow/ContractHeadRow";
import MessageRow2 from "../../components/messageRow/MessageRow2";
import PhoneRow from "../../components/messageRow/PhoneRow";
import PhotoRow from "../../components/messageRow/PhotoRow";
import AutoSave from "../../TModal/AutoSave";
import MessageService from "../../service/MessageService";
import {observable, toJS} from "mobx";
import Icon from "../../value/Svg";
import moment from "moment";
import Button from "../../components/Button";
import Util from "../../global/Util";
import PhotoDao from "../../dao/PhotoDao";
import PhotoService from "../../service/PhotoService";

@inject('store', 'global')
@observer
export default class MessageSearch extends BaseComponents {

	@AutoSave
	messageService: MessageService;
	@AutoSave
	photoService: PhotoService;

	@observable
	data = [];

	delayTimer;

	@observable
	smsPrice = 0.0;

	@observable
	searchWord = "";
	@observable
	searchDate = moment(new Date()).utcOffset(480).format('YYYY-MM-DD');
	@observable
	searchArray = [];
	@observable
	currentSearchIndex = {index: 0, messageid: null};
	@observable
	inputing = false;
	@observable
	refreshing = false;

	currentMessageCount = 0;

	contract = {};

	currentDate = new Date();

	startDate = moment(new Date()).utcOffset(480).format('YYYY-MM-DD 00:00:00');
	endDate = moment(new Date()).utcOffset(480).format('YYYY-MM-DD 23:59:59');

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.contentOffsetY = 0;
		this.maxContentOffsetY = 0;
		this.needScrollBottom = true;
		this.global = props.global;

		this.contract = this.navigation.getParam("contract");

	}

	onStart() {
		super.onStart();

		this.renewHistory().then();
	}

	async renewHistory() {
		let {result, count} = await this.messageService.getAllMessageHistoryByContractNameAndDate(this.contract.name, this.startDate, this.endDate);

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

		this.currentMessageCount = count;
		this.data = data;
	}

	async search() {
		if (this.searchWord.length > 0) {
			let searchArray = [];
			for (let i = 0; i < this.data.length; i++) {
				let item = this.data[i];
				if (item.id) {
					if ((item.type == 0 || item.type == 10) && item.content.indexOf(this.searchWord) != -1) {
						// 找到
						searchArray.push({...item, listIndex: i});
					}
				}
			}
			this.searchArray = searchArray;
			if (this.searchArray.length > 0) {
				this.currentSearchIndex = {index: 0, messageid: this.searchArray[0].id};
				this.scrlltoCurrentSelect();
			} else {
				this.currentSearchIndex = {index: 0, messageid: null};
			}
		} else {
			this.searchArray = [];
			this.currentSearchIndex = {index: 0, messageid: null};
		}

	}

	scrlltoCurrentSelect() {
		try {
			let {listIndex} = this.searchArray[this.currentSearchIndex.index];
			this.refs.flatlist.scrollToIndex({index: listIndex,animated: true, viewPosition: 0.2})
		}catch (e) {}
	}

	upSearch() {
		try {
			if (this.searchArray.length > 0) {
				let index = this.currentSearchIndex.index - 1;
				let item = this.searchArray[index];
				this.currentSearchIndex = {index, messageid: item.id};
				this.scrlltoCurrentSelect();
			}
		}catch (e) {}
	}

	downSearch() {
		try {
			if (this.searchArray.length > 0) {
				let index = this.currentSearchIndex.index + 1;
				let item = this.searchArray[index];
				this.currentSearchIndex = {index, messageid: item.id};
				this.scrlltoCurrentSelect();
			}
		}catch (e) {}
	}

	componentWillUnmount() {
		super.componentWillUnmount();

		this.keyboardWillShowSub.remove();
		this.keyboardWillHideSub.remove();
	}

	componentDidMount() {
		this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
		this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);

		this.refs.flatlist.scrollToEnd({animated: true})
	}

	keyboardWillShow = (event) => {
		if (this.needScrollBottom) {
			setTimeout(() => {
				this.refs.flatlist.scrollToOffset({offset: this.maxContentOffsetY, animated: true});
			}, 400)
		}
	};

	keyboardWillHide = (event) => {
		// this.refs.sectionlist.scrollToIndex({animated: true, index: this.generateBig().length - 1, viewPosition: 1.9})
	};

	setNeetScrollBottom(statue) {
		if (this.needScrollBottom !== statue) {
			this.needScrollBottom = statue;
			// console.log("needScrollBottom: ", statue)
		}
	}

	_onScroll(event) {
		this.maxContentOffsetY = event.nativeEvent.contentSize.height;
		this.contentOffsetY = event.nativeEvent.contentOffset.y;
		const handle = findNodeHandle(this.refs.flatlist);
		UIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
			if (this.contentOffsetY + height >= this.maxContentOffsetY - 100) {
				this.setNeetScrollBottom(true);
			} else {
				this.setNeetScrollBottom(false);
			}
		})
	}

	// 分组列表的renderItem
	_renderItem(item, index) {
		let resutl = null;
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
				let open = false;
				if (this.currentSearchIndex.messageid) {
					if (item.id == this.currentSearchIndex.messageid) {
						open = true;
					}
				}
				resutl = (<MessageRow2 data={item}
									   keyword={this.searchWord}
									   keywordAction={(ic) => {
										   // this.searchRowList.push({index, item: ic});
										   if (open) {
											   ic.showAnimateHeigth();
										   } else {
											   ic.hideAnimateHeigth();
										   }
									   }}
				/>);
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
									renewMessageList={async () => {
										await this.renewHistory();
										await this.global.updateUserData();
									}}
				/>);

				break;
			}
		}
		return resutl;
	}

	async showModalBtnPress() {

		if (Platform.OS === "android") {
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
		} else {


			this.global.modalRef.showModal((
				<View style={{padding: 12}}>
					<View style={{backgroundColor: 'white', borderRadius: 8}}>
						<DatePickerIOS
							mode={'date'}
							date={this.currentDate}
							maximumDate={new Date()}
							onDateChange={(date) => {
								this.currentDate = date;
							}}
						/>
						<Button style={{marginTop: 12, backgroundColor: 'white', borderRadius: 8}}
										  onPress={() => {
											  this.global.modalRef.handlehide();
											  this.searchDate = moment(this.currentDate).format('YYYY-MM-DD');
											  this.startDate = moment(this.currentDate).format('YYYY-MM-DD 00:00:00');
											  this.endDate = moment(this.currentDate).format('YYYY-MM-DD 23:59:59');
											  this.renewHistory();
										  }}>
							<Text style={{lineHeight: 58, fontSize: 20, color: '#007AFF', textAlign: 'center'}}>
								搜索
							</Text>
						</Button>
					</View>
					<Button style={{marginTop: 12, backgroundColor: 'white', borderRadius: 8}}
									  onPress={() => {
										  this.global.modalRef.handlehide();
									  }}>
						<Text style={{lineHeight: 58, fontSize: 20, color: '#007AFF', textAlign: 'center'}}>
							取消
						</Text>
					</Button>
				</View>))
		}

	}

	upEnableAction() {
		let {index} = this.currentSearchIndex;
		if (index > 0) {
			return true;
		} else {
			return false;
		}
	}

	downEnableAction() {
		let count = this.searchArray.length;
		let {index} = this.currentSearchIndex;
		if (index < count - 1) {
			return true;
		} else {
			return false;
		}
	}

	render() {

		let resalData = [...this.data];

		// this.searchWordAction();

		let result_map = `全部${this.currentMessageCount}条聊天记录`;
		if (this.searchArray.length > 0) {
			result_map = `第${this.currentSearchIndex.index + 1}个 共${this.searchArray.length}个结果`
		}

		let upEnable = !this.upEnableAction();
		let downEnable = !this.downEnableAction();

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<View style={styles.searchRow}>
						<TextInput style={styles.searchRow_input}
								   ref={'searchInput'}
								   value={this.searchWord}
								   onChangeText={(text) => {
									   this.searchRowList = [];
									   this.searchWord = text;
									   this.search();
								   }}
								   onFocus={() => {
									   this.inputing = true;
								   }}
								   onBlur={() => {
									   this.inputing = false;
								   }}
								   placeholder={'搜索聊天内容'}
								   placeholderTextColor={'gray'}
						>
						</TextInput>
						<Image
							style={{width: 24, height: 24, position: "absolute", left: 20, top: 12}}
							source={require('../../assets/img/util/ic_search.png')}
						/>
						<Line/>
						<Button style={styles.searchBtn} onPress={() => {
							this.navigation.pop()
						}}>
							<Text style={styles.searchRowCancelText}>取消</Text>
						</Button>
					</View>
					<KeyboardView style={{flexDirection: 'column', flex: 1}}>
						<FlatList
							ref={'flatlist'}
							style={{backgroundColor: "white", flex: 1}}
							keyboardDismissMode={'on-drag'}
							// contentContainerStyle={styles.contentContainer}
							renderItem={({item, index}) => this._renderItem(item, index)}
							data={resalData}
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
						/>

						<Fragment>
							<Line/>
							<View style={[AppStyle.row, {paddingHorizontal: 6, paddingVertical: 2}]}>
								<View style={[AppStyle.row, {position: "absolute", padding: 6, zIndex: 9}]}>
									<Button style={styles.bottomBtn} disabled={upEnable} onPress={()=>{
										this.upSearch();
									}}>
										<Image
											style={{width: 24, height: 24}}
											source={require('../../assets/img/util/ic_arrow_up_purple.png')}
										/>
									</Button>
									<Button style={styles.bottomBtn} disabled={downEnable} onPress={()=>{
										this.downSearch();
									}}>
										<Image
											style={{width: 24, height: 24}}
											source={require('../../assets/img/util/ic_arrow_down.png')}
										/>
									</Button>
								</View>
								<Text style={{
									fontSize: 14,
									color: "#333",
									flex: 1,
									alignSelf: 'center',
									textAlign: 'center',
									lineHeight: 44,
								}}>
									{result_map}
								</Text>
								<Button
									style={[styles.bottomBtn, {position: "absolute", padding: 6, right: 6}]}
									onPress={() => this.showModalBtnPress()}>
									<Icon icon={'chat_icon_date'} size={32} color={'#4A90E2'}/>
								</Button>

								{
									this.inputing ? (
										<Button style={[styles.bottomBtn, styles.downBtn]} onPress={() => {
											try {
												this.refs.searchInput.blur()
											} catch (e) {
											}
										}}>
											<Icon icon={'chat_icon_down'} size={32} color={'#4A90E2'}/>
										</Button>
									) : null
								}

							</View>
						</Fragment>
					</KeyboardView>


				</SafeView>
			</Fragment>
		)
	}
}

const styles = StyleSheet.create({
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
	bottomModal: {
		justifyContent: 'flex-end',
		margin: 0,
	},
	content: {
		backgroundColor: 'white',
	},
	ol: {
		flexDirection: "row",
		paddingVertical: 12,
	},
	olTitle: {
		fontSize: 17,
		fontWeight: "400",
		color: "#333"
	},
	olDetail: {
		fontSize: 14,
		color: "#999",
		flexWrap: 'wrap',
		lineHeight: 18,
		marginTop: 2,
	},
	row: {
		paddingVertical: 10,
		paddingHorizontal: 12
	},
	sucLineText: {
		fontSize: 10,
		color: "#333",
		lineHeight: 22,
	},
	sucLineTextUnline: {
		fontSize: 10,
		color: "#487ad3",
		textDecorationLine: "underline",
		textDecorationColor: "#487ad3",
		lineHeight: 22,
	},
	searchRow: {
		flexDirection: "row",
		paddingLeft: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#E6E6E6",
	},
	searchRow_input: {
		height: 34,
		backgroundColor: "#f5f5f5",
		flex: 1,
		borderRadius: 18,
		paddingLeft: 40,
		marginVertical: 7,
		fontSize: 14,
		paddingTop: 4,
		paddingVertical: 0
	},
	searchBtn: {
		width: 48,
		height: 48,
		justifyContent: "center",
		alignItems: "center",
		marginHorizontal: 5
	},
	searchRowCancelText: {
		fontSize: 17,
		color: "#007AFF",
		fontWeight: "300"
	},
	bottomBtn: {
		padding: 6,
	},
	downBtn: {
		position: "absolute",
		top: -46,
		right: 6
	}
});
