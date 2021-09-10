import React, {Fragment, Component} from 'react';
import {
	ScrollView,
	StatusBar,
	Dimensions,
	Text,
	Image,
	ImageBackground,
	View,
	DatePickerIOS,
	UIManager,
	NativeModules,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	SectionList,
	Platform,
	findNodeHandle,
	TouchableHighlight,
	Alert,
} from 'react-native';
import {connectActionSheet} from '@expo/react-native-action-sheet'

var {height, width} = Dimensions.get('window');
const CallModule = NativeModules.CallModule;
const CallKitCallModule = NativeModules.CallKitCallModule;


import {inject, observer} from "mobx-react";
import {strings} from "../../../locales";
import moment from "moment";
import NavBar from "../../components/NavBar";
import SearchBar from "../../components/SearchBar";
import Line from "../../components/Line";
import Button from "../../components/Button";
import SafeView from "../../components/SafeView";
import Util from "../../global/Util";
import MessageService from '../../service/MessageService';
import TextEx from "../../components/TextEx";
import AppStyle from "../../Style";
import CustomStorage from "../../global/CustomStorage";
import AutoSave from "../../TModal/AutoSave";
import CallService from "../../global/CallService";
import Global from "../../mobx/Global";
import AppStore from "../../mobx/AppStore";
import PhoneService from "../../service/PhoneService";
import {SwipeListView} from 'react-native-swipe-list-view';
import Icon from "../../value/Svg";
import BaseComponents from "../../BaseComponents";
import RecentService from "../../service/RecentService";
import ButtonEx from "../../components/ButtonEx";
import ConfigService from "../../service/ConfigService";

@inject('store', 'global')
@observer
class MessageTab extends BaseComponents {

	@AutoSave
	callService: CallService;
	@AutoSave
	phoneService: PhoneService;
	@AutoSave
	messageService: MessageService;
	@AutoSave
	recentService: RecentService;
	@AutoSave
	configService: ConfigService;

	store: AppStore;
	global: Global;

	constructor(props) {
		super(props);
		this.store = props.store;
		this.global = props.global;
		this.navigation = props.navigation;
	}

	componentWillMount(): void {
		this.store.updateLocalContract({alert: false});
		console.log('updateLocalContract finish');
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	showTip() {
		setTimeout(async () => {
			let messageTip = await CustomStorage.getItem('messageTip');
			let data = [...this.store.lastMessageData];
			if (data.length == 0 && !messageTip) {
				UIManager.measure(findNodeHandle(this.tipRef), (x, y, width, height, pageX, pageY) => {

					let position = {x, y, width, height, pageX, pageY};
					this.global.tip_modal_ref.showModal((
						<View style={{backgroundColor: '#4A90E2', borderRadius: 9, padding: 16}}>
							<TextEx style={AppStyle.tipText}>
								{strings('message_tab.tip1_1')}
							</TextEx>
							<TextEx style={AppStyle.tipText}>
								{strings('message_tab.tip1_2')}
							</TextEx>
						</View>
					), position, {w: 196, h: 72}, '#4A90E2');

				});
				await CustomStorage.setItem('messageTip', true);
			}
		})
	}

	componentDidMount() {

		this.store = this.props.store;
		this.global = this.props.global;
		this.navigation = this.props.navigation;

		this.initCell().then();
		this.showTip();

	}

	async initCell() {
		try {
			this.global.showLoading();
			await this.callService.initData();
		} catch (e) {
			console.log("出错了FUCK", e)
		} finally {
			this.global.dismissLoading();
		}

	}

	async deleteMessageWith(item) {

		Alert.alert('确定需要删除该历史记录？', '', [{
			text: '确定', onPress: async () => {
				let phone = item.tophone;
				if (item.tophone == 'me') {
					phone = item.fromphone;
				}

				await this.recentService.deleteByPhone(phone);
				await this.messageService.deleteMessageWithPhone(phone);
			},
		}, {
			text: '取消', onPress: () => {
			},
		}], {cancelable: false});


	}

	async rowLongPress(item) {

		let config = await this.configService.getConfigByPhone({country_no: item.country_no, phone_no: item.phone_no});

		const options = [
			this.store.isContance(item) ? strings('message_tab.sas_disable') : strings('message_tab.sas'),
			strings('message_tab.person_detail'),
			// strings('message_tab.hide_message'),
			strings('message_tab.delete_message'),
			config.ban == 0 ? strings('message_tab.ban_user') : strings('message_tab.not_ban_user'),
			strings('other.cancel'),
		];
		const destructiveButtonIndex = 3;
		const cancelButtonIndex = 4;

		this.props.showActionSheetWithOptions({
				title: item.name,
				options,
				cancelButtonIndex,
				destructiveButtonIndex,
			},
			buttonIndex => {
				switch (buttonIndex) {
					case 0: {
						if (this.store.isContance(item)) {
							this.store.deleteFocusContract(item.name);
						} else {
							this.store.addFocusContract(item);
						}
						break;
					}
					case 1: {
						this.navigation.push('ClientDetail', {contract: item});
						break;
					}
					case 2: {
						this.deleteMessageWith(item);
						break;
					}
					case 3: {
						this.configService.insertOrSaveConfigByPhone(item.country_no, item.phone_no, null, config.ban == 0 ? 1 : 0);
						break;
					}
				}
			},
		);
	}

	_renderContent(item) {
		let date = item.date ? moment(item.date).format('MM-DD HH:mm') : '';
		let content = null;
		let icon = this.global._callIcon(item, 20);
		if (item.type == 0 || item.type == 10) {
			let c = item.content.length > 40 ? item.content.substring(0, 40) + "..." : item.content;
			content = (<View style={{alignItems: "center", flexDirection: "row"}}>
				<TextEx style={[styles.row_title, {
					color: '#999999',
					fontSize: 14,
					lineHeight: 20,
					minHeight: 20,
					maxHeight: 20,
				}]}>{c}</TextEx>
			</View>);
		} else if (item.type == 1) {
			let stateText = this.global._callStatus(item);
			content = (<View style={{alignItems: "center", flexDirection: "row"}}>
				{item.date ? (
					<Fragment>
						{icon}
						<TextEx style={[styles.row_title, {
							color: '#999999',
							fontSize: 14,
							lineHeight: 20,
							marginLeft: 4,
							marginTop: 3,
						}]}>{date}</TextEx>
					</Fragment>
				) : null}
				<TextEx style={[styles.row_title, {
					color: '#999999',
					fontSize: 13,
					marginTop: 3,
					marginLeft: 4,
					lineHeight: 20,
				}]}>{stateText}</TextEx>
			</View>);
		} else if (item.type == 2 || item.type == 12) {
			content = (<View style={{alignItems: "center", flexDirection: "row"}}>
				<TextEx style={[styles.row_title, {
					color: '#999999',
					fontSize: 14,
					lineHeight: 20,
					minHeight: 20,
				}]}>{strings('message_tab.photo')}</TextEx>
			</View>);
		}

		return content;

	}


	// type 0:短信 1:电话
	// state 0:达到 1:未达到
	// 分组列表的renderItem
	_renderItem(item, index) {
		if (item.fromphone == 'service') {
			return this._renderServiceItem(item);
		}

		let content = this._renderContent(item);
		let logo = Util.logoFix(item.name, item.contractType, 50);
		return (
			<Fragment>
				<ButtonEx style={styles.row} activeOpacity={1}
						  underlayColor='#EEE'
						  onLongPress={() => this.rowLongPress(item)}
						  onPress={() => {
							  this.navigation.push('MessagePage', {
								  country_no: item.country_no,
								  phone_no: item.phone_no
							  })
						  }}>
					<View style={{flexDirection: "row", alignItems: "center", minHeight: '100%',}}>
						{logo}
						<View style={styles.row_content}>
							<TextEx style={styles.row_title}>{item.name}</TextEx>
							{content}
						</View>
						{item.isread == 0 ? <View style={[AppStyle.point, {marginRight: 10}]}/> : null}
					</View>

				</ButtonEx>
			</Fragment>
		);
	}

	_renderServiceItem(item) {
		let data = {desc: ""};
		try {
			data = JSON.parse(item.content);
		} catch (e) {
		}

		return (
			<Fragment>
				<ButtonEx style={styles.row} activeOpacity={1}
						  underlayColor='#EEE'
						  onPress={() => {
							  this.navigation.push('ActionMessagePage')
						  }}>
					<View style={{flexDirection: "row", alignItems: "center", minHeight: '100%',}}>
						<Image
							style={{width: 50, height: 50}}
							source={require('../../assets/newimg/onionteam.png')}
						/>
						<View style={styles.row_content}>
							<TextEx style={styles.row_title}>{strings('message_tab.team')}</TextEx>
							<Text numberOfLines={1} style={[styles.row_title, {
								color: '#999999',
								fontSize: 14,
								lineHeight: 20,
								minHeight: 20,
								maxHeight: 20,
							}]}>{data.desc}</Text>
						</View>
						{item.isread == 0 ? <View style={[AppStyle.point, {marginRight: 10}]}/> : null}
					</View>

				</ButtonEx>
			</Fragment>
		);
	}

	EmptyComponent(center = undefined) {
		let style = {};
		if (center) {
			style = {justifyContent: 'center'}
		} else {
			style = {marginTop: 142}
		}
		return (
			<View style={{flex: 1, alignItems: 'center', ...style}}>
				<View style={[AppStyle.row, {
					justifyContent: 'flex-start',
					alignItems: 'center', width: 224,
				}]}>
					<TextEx style={{fontSize: 16, color: '#333',}}>
						{strings('message_tab.empty_tip1')}
					</TextEx>
					<Icon icon={'topbar_icon_new_chat'} size={24} color={'#4A90E2'} style={{marginHorizontal: 8}}/>
					<TextEx style={{fontSize: 16, color: '#333',}}>
						{strings('message_tab.empty_tip2')}
					</TextEx>
				</View>
				<TouchableOpacity onPress={() => {
					this.global.shareAction()
				}}>
					<TextEx style={{
						marginTop: 38,
						justifyContent: 'flex-start', width: 224, color: '#4A90E2',
						marginVertical: 8,
					}}>
						{strings('message_tab.empty_tip3')}
					</TextEx>
					<Line style={{width: 224, backgroundColor: '#E6E6E6'}}/>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => this.navigation.push('MessagePage')}>
					<Text style={{
						justifyContent: 'flex-start', color: '#4A90E2',
						width: 224, marginVertical: 8, marginTop: 24
					}}>
						{strings('message_tab.empty_tip4')}
					</Text>
					<Line style={{width: 224, backgroundColor: '#E6E6E6'}}/>
				</TouchableOpacity>
			</View>
		)
	}


	// 分组列表的头部
	_renderSectionHeader(sectionItem) {
		const {section} = sectionItem;
		if (section.data.length <= 0) return null;
		if (section.title == strings('message_tab.forcus')) {
			return (
				<Fragment>
					<View style={[styles.section, AppStyle.row]}>
						<TextEx style={styles.section_title}>{section.title.toUpperCase()}</TextEx>
						<Image
							style={{width: 14, height: 30, marginLeft: 5}}
							resizeMode={'contain'}
							source={require('../../assets/newimg/png/icon/common/follow.png')}
						/>
					</View>
				</Fragment>
			)
		} else {
			if (this.store.focusContractList.length <= 0) return null;
			return (
				<Fragment>
					<View style={styles.section}>
						<TextEx style={styles.section_title}>{section.title.toUpperCase()}</TextEx>
					</View>
				</Fragment>
			);
		}

	}

	_renderSectionFooter({section}) {
		if (section.data.length <= 0) return null;
		if (section.title == strings('message_tab.forcus')) {
			return (
				<Fragment>
					<View style={{height: 20, backgroundColor: '#F5F5F5'}}/>
				</Fragment>
			)
		} else {
			return (
				<Fragment>
					<View style={{height: 20, backgroundColor: '#F5F5F5'}}/>
				</Fragment>
			);
		}
	}

	// 差集
	diffent(lastMessageData, tempfocusContractList) {
		let nameArray = {};
		for (let item of lastMessageData) {
			nameArray[item.name] = item;
		}
		for (let key of Object.keys(tempfocusContractList)) {
			if (nameArray.hasOwnProperty(key)) {
				delete nameArray[key];
			}
		}
		let message = [];
		Object.keys(nameArray).map((key) => {
			message.push(nameArray[key])
		});
		return message;
	}

	render() {

		let message = this.diffent(this.store.lastMessageData, this.store.tempfocusContractList);
		let sections = [
			{
				title: strings('message_tab.forcus'),
				data: [...this.store.messageFocusContractList]
			},
			{
				title: strings('message_tab.message'),
				data: [...message]
			}
		];
		if (sections[0].data.length == 0 && sections[1].data.length == 0) {
			sections = []
		}

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={''}
							barHeight={52}
							bottom_line={false}
							leftRender={(
								<View style={AppStyle.row}>
									<Button style={{paddingLeft: 6}}
											onPress={() => this.navigation.push('UserPage')}>
										{this.global.avatarIcon(40)}
									</Button>
									<TextEx style={{
										fontSize: 28, color: '#333',
										lineHeight: 40, marginLeft: 12, fontWeight: '500'
									}}>
										{strings('message_tab.title')}
									</TextEx>
								</View>
							)}
							rightRender={(
								<Fragment>
									<View style={AppStyle.row}>
										<Button
											ref={(ref) => {
												this.tipRef = ref
											}}
											onPress={async () => {
												this.navigation.push('BuyListPage')
											}}
										>
											<Icon icon={'topbar_icon_buy'} size={24} color={'#4A90E2'}/>
										</Button>
										<Button
											onPress={async () => {
												this.navigation.push('MessagePage')
											}}>
											<Icon icon={'topbar_icon_new_chat'} size={24} color={'#4A90E2'}
												  style={{marginHorizontal: 16}}/>
										</Button>
									</View>
								</Fragment>
							)}
					/>
					<SearchBar placeholder={strings("connect_tab.search_placeholder")}
							   touchSearchBar={() => this.navigation.push('SearchPage', {
								   rowTap: (item) => {
									   this.navigation.push('MessagePage', {
										   country_no: item.country_no,
										   phone_no: item.phone_no
									   })
								   },
							   })}
							   btn={(
								   <Button style={styles.searchBtn} onPress={() => {
									   // this.global.callingPageShowAction(true)
									   this.navigation.push('SearchPage', {
										   rowTap: (item) => {
											   this.navigation.push('MessagePage', {
												   country_no: item.country_no,
												   phone_no: item.phone_no
											   })
										   },
									   })
								   }}>
									   <Icon icon={'topbar_icon_sort'} size={24} color={'#4A90E2'}/>
								   </Button>
							   )}/>

					<SwipeListView
						useSectionList={true}
						sections={sections}
						style={{backgroundColor: "#FFF", flex: 1}}
						contentContainerStyle={sections.length == 0 ? styles.contentContainerEmpty : styles.contentContainer}
						keyboardShouldPersistTaps={'always'}
						keyboardDismissMode={'on-drag'}
						keyExtractor={(item, index) => 'asd' + index}
						renderItem={({item, index}) => this._renderItem(item, index)}
						renderHiddenItem={(data, rowMap) => {

							let d = data.item;
							if (d.fromphone == "service") {
								return null;
							} else {
								return (
									<View style={styles.rowBack}>
										<Text></Text>
										<View style={[{paddingHorizontal: 10}, AppStyle.row]}>
											<TouchableOpacity
												style={{
													marginHorizontal: 10,
												}} onPress={() => {
												this.rowLongPress(d);
												rowMap['asd' + data.index].closeRow()
											}}>
												<Image
													style={{width: 40, height: 40}}
													source={require('../../assets/newimg/png/icon/chatlist/msg_list_more.png')}
												/>
											</TouchableOpacity>
											<TouchableOpacity
												style={{
													marginHorizontal: 10,
												}} onPress={() => {
												this.navigation.push('CallPhonePage', {
													country_no: d.country_no,
													phone_no: d.phone_no,
												});
												rowMap['asd' + data.index].closeRow()
											}}>
												<Image
													style={{width: 40, height: 40}}
													source={require('../../assets/newimg/png/icon/chatlist/msg_list_phone.png')}
												/>
											</TouchableOpacity>
											<TouchableOpacity
												style={{
													marginHorizontal: 10,
												}} onPress={() => {
												this.deleteMessageWith(d);
												rowMap['asd' + data.index].closeRow()
											}}>
												<Image
													style={{width: 40, height: 40}}
													source={require('../../assets/newimg/png/icon/chatlist/msg_list_delete.png')}
												/>
											</TouchableOpacity>
										</View>
									</View>
								)
							}
						}}
						leftOpenValue={0}
						rightOpenValue={-200}
						ItemSeparatorComponent={() => <Line style={{marginLeft: 68}}/>}
						ListEmptyComponent={() => this.EmptyComponent()}
						ListHeaderComponent={() => {
							return sections.length > 0 ? <View style={{height: 20, backgroundColor: '#F5F5F5'}}/> : null
						}}
						ListFooterComponent={() => this.renderFooter(sections)}
						renderSectionHeader={this._renderSectionHeader.bind(this)}
						renderSectionFooter={this._renderSectionFooter.bind(this)}
					/>

				</SafeView>

			</Fragment>
		)
	}

	renderFooter(sections) {
		if (!sections[1]) {
			return null;
		}
		if (sections[1].data.length == 0) {
			return null;
		}
		// item.fromphone == 'service
		if (sections[0].data.length == 0 &&
			sections[1].data.length == 1 &&
			sections[1].data[0].fromphone == 'service') {
			let rem = this.EmptyComponent('center');
			return (
				<Fragment>
					<View style={{marginTop: 98}}>
						{rem}
					</View>
				</Fragment>
			);
		} else {
			return null;
		}
	}
}

const styles = StyleSheet.create({
	contentContainerEmpty: {
		flex: 1,
	},
	contentContainer: {},
	section: {
		height: 30,
		backgroundColor: "#FFF",
	},
	section_title: {
		lineHeight: 30,
		fontSize: 12,
		color: "#999999",
		marginLeft: 16,
	},
	row: {
		height: 80,
		backgroundColor: "#fff",
		paddingHorizontal: 16,
		minHeight: 80,
	},
	row_title: {
		fontSize: 18,
		lineHeight: 25,
	},
	row_content: {
		flex: 1,
		justifyContent: "center",
		marginLeft: 10,
	},
	searchBtn: {
		height: 48,
		marginLeft: 9,
		justifyContent: "center",
		alignItems: "center",
	},
	rowBack: {
		alignItems: 'center',
		backgroundColor: '#F5F5F5',
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingLeft: 15,
	},
});

export default connectActionSheet(MessageTab)
