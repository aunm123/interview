import React, {Fragment, Component} from 'react';
import {
	ScrollView, StatusBar, Dimensions, Text, Image, ImageBackground, View,
	NativeModules, TextInput, TouchableOpacity, StyleSheet, Animated, UIManager, findNodeHandle,
} from 'react-native';

const {height, width} = Dimensions.get('window');
let mWith = width - 100;
const CallModule = NativeModules.CallModule;
import Colors from '../../Color';
import Req from '../../global/req';
import URLS from '../../value/URLS';
import {inject, observer} from "mobx-react";
import {strings} from "../../../locales";
import NavBar from "../../components/NavBar";
import Button from "../../components/Button";
import AppStyle from "../../Style";
import ContactList from "./ConnectTab/ContactList";
import AddressList from "./ConnectTab/AddressList";
import SafeView from "../../components/SafeView";
import SearchBar from "../../components/SearchBar";
import Line from "../../components/Line";
import {observable} from "mobx";
import TextEx from "../../components/TextEx";
import CustomStorage from "../../global/CustomStorage";
import Icon from "../../value/Svg";
import {connectActionSheet} from "@expo/react-native-action-sheet";
import BaseComponents from "../../BaseComponents";

@inject('store', 'global')
@observer
class ConnectTab extends BaseComponents {

	@observable
	currentIndex = 0;

	constructor(props) {
		super(props);
		this.store = props.store;
		this.global = props.global;
		this.navigation = props.navigation;

		this.scrollAnimatedValue = new Animated.Value(0)
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	componentDidMount(): void {
		this.checkTipPop();
	}

	setCurrentIndex(index) {
		if (this.currentIndex != index) {
			this.currentIndex = index;
			this.checkTipPop()
		}
	}

	selectIndex(index) {
		try {
			this.scroll.getNode().scrollTo({x: width * index, y: 0, animated: true})
		} catch (e) {
		}
		setTimeout(() => {
			this.checkTipPop();
		}, 200)
	}

	showTip() {
		if (this.currentIndex == 0) {
			UIManager.measure(findNodeHandle(this.tip0Ref), (x, y, width, height, pageX, pageY) => {

				let position = {x, y, width, height, pageX, pageY};
				this.global.tip_modal_ref.showModal((
					<View style={{backgroundColor: '#4A90E2', borderRadius: 9, padding: 16}}>
						<TextEx style={AppStyle.tipText}>{strings('connect_tab.tip1_1')}</TextEx>
						<TextEx style={AppStyle.tipText}>{strings('connect_tab.tip1_2')}</TextEx>
					</View>
				), position, {w: 128, h: 72}, '#4A90E2');

			})
		} else {
			UIManager.measure(findNodeHandle(this.tip1Ref), (x, y, width, height, pageX, pageY) => {

				let position = {x, y, width, height, pageX, pageY};
				this.global.tip_modal_ref.showModal((
					<View style={{backgroundColor: '#4A90E2', borderRadius: 9, padding: 16}}>
						<TextEx style={AppStyle.tipText}>{strings('connect_tab.tip2_1')}</TextEx>
						<TextEx style={AppStyle.tipText}>{strings('connect_tab.tip2_2')}</TextEx>
					</View>
				), position, {w: 166, h: 72}, '#4A90E2');

			})
		}

	}

	async checkTipPop() {
		let tip0 = await CustomStorage.getItem('tip0');
		let tip1 = await CustomStorage.getItem('tip1');

		setTimeout(async () => {
			if (this.currentIndex == 0) {
				const {letterArr, sections} = this.store.sectionSecList;
				if (sections.length == 0 && !tip0) {
					this.showTip();
					await CustomStorage.setItem('tip0', true)
				}
			} else {
				const {letterArr, sections} = this.store.sectionAllSecList;
				if (sections.length == 0 && !tip1) {
					this.showTip();
					await CustomStorage.setItem('tip1', true)
				}
			}
		})

	}

	rowTap(item) {

		let country_no = '';
		let phone_no = '';
		if (item.phones) {
			item.phones.map((i) => {
				country_no = i.country_no;
				phone_no = i.phone_no;
			});
		} else {
			country_no = item.country_no;
			phone_no = item.phone_no;
		}

		this.navigation.push('CallPhonePage', {
			country_no,
			phone_no,
			contract_id: item.id,
		});
	}

	rowTap2(item) {
		switch (item.contractType) {
			case 0 : {
				this.rowLongPress(item);
				break;
			}
			case 1 : {
				this.rowLocalLongPress(item.name, item);
				break;
			}
			case 2 : {
				this.rowLocalLongPress(item.name, item);
				break;
			}
		}
	}

	rowLongPress(item) {
		const options = [
			strings("connect_tab.sas"),
			strings("connect_tab.person_detail"),
			strings("connect_tab.person_edit"),
			strings("other.cancel"),
		];
		const cancelButtonIndex = 3;

		this.props.showActionSheetWithOptions({
				title: item.name,
				options,
				cancelButtonIndex,
			},
			buttonIndex => {
				switch (buttonIndex) {
					case 0: {
						break;
					}
					case 1: {
						this.navigation.push('ClientDetail', {contract: item});
						break;
					}
					case 2: {
						this.navigation.push('EditContactPage', {contract: item});
						break;
					}
				}
			},
		);
	}

	rowLocalLongPress(name, item) {
		const options = [strings("connect_tab.add_contract"),, strings("other.cancel"),];
		const cancelButtonIndex = 1;
		this.props.showActionSheetWithOptions({
				title: name,
				options,
				cancelButtonIndex,
			},
			buttonIndex => {
				switch (buttonIndex) {
					case 0: {
						this.navigation.push('EditContactPage', {contract: item});
						break;
					}
				}
			},
		);
	}

	render() {
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
										{strings('connect_tab.title')}
									</TextEx>
								</View>
							)}
							rightRender={(
								<Fragment>
									<View style={AppStyle.row}>
										<Button ref={(ref) => {
											this.tip1Ref = ref
										}}
												onPress={() => this.navigation.push('PhoneList')}>
											<Icon icon={'topbar_icon_phonebook'} size={24} color={'#4A90E2'} />
										</Button>
										<Button ref={(ref) => {
											this.tip0Ref = ref
										}}
												onPress={() => this.navigation.push('EditContactPage')}>
											<Icon icon={'chat_icon_add_user'} size={24} color={'#4A90E2'} style={{marginHorizontal: 16}} />
										</Button>
									</View>
								</Fragment>
							)}
					/>

					<SearchBar placeholder={strings("connect_tab.search_placeholder")}
							   touchSearchBar={() => this.navigation.push('SearchPage',
								   {
									   rowTap: (item) => {
										   this.rowTap(item);
									   },
									   rowTap2: (item) => {
										   if (item.islocal) {
											   let re = this.store.findLocalContentWithName(item.name);
											   this.rowLocalLongPress(re)
										   } else {
											   let re = this.store.findContentWithID(item.id);
											   this.rowLongPress(re)
										   }
									   }
								   })}
					/>

					<View style={[AppStyle.row, {marginHorizontal: 50}]}>
						<TouchableOpacity style={{flex: 1, height: 36}} onPress={() => {
							this.selectIndex(0)
						}}>
							<TextEx
								style={[styles.tabText, this.currentIndex == 0 ? styles.blue : styles.normal]}>
								{strings('connect_tab.my_friend')}
							</TextEx>
						</TouchableOpacity>
						<TouchableOpacity style={{flex: 1, height: 36}} onPress={() => {
							this.selectIndex(1)
						}}>
							<TextEx
								style={[styles.tabText, this.currentIndex == 1 ? styles.blue : styles.normal]}>
								{strings('connect_tab.all_friend')}
							</TextEx>
						</TouchableOpacity>

						<Animated.View style={[styles.underLineView, {
							transform: [
								{
									translateX: this.scrollAnimatedValue.interpolate({
										inputRange: [0, width],
										outputRange: [0, mWith / 2],
									})
								}]
						}]}>
							<View style={styles.underLine}/>
						</Animated.View>
					</View>
					<Line/>
					<Animated.ScrollView style={{flex: 1}}
										 pagingEnabled={true}
										 showsHorizontalScrollIndicator={false}
										 showsVerticalScrollIndicator={false}
										 horizontal={true}
										 onScroll={Animated.event(
											 [{nativeEvent: {contentOffset: {x: this.scrollAnimatedValue}}}],
											 {
												 listener: (event) => {
													 let x = event.nativeEvent.contentOffset.x;
													 if (x < width / 2) {
														 this.setCurrentIndex(0);
													 } else {
														 this.setCurrentIndex(1);
													 }
												 }, useNativeDriver: true
											 }
										 )}
										 ref={(scroll) => {
											 this.scroll = scroll
										 }}
										 scrollEventThrottle={8} // target 120fps
					>
						<View style={{flex: 1, width: width}}>
							<ContactList navigation={this.navigation}/>
						</View>
						<View style={{flex: 1, width: width}}>
							<AddressList navigation={this.navigation}/>
						</View>
					</Animated.ScrollView>
				</SafeView>
			</Fragment>
		)
	}
}

const styles = StyleSheet.create({
	normal: {
		color: '#999',
	},
	blue: {
		color: '#000',
	},
	tabText: {
		textAlign: 'center',
		flex: 1,
		fontSize: 14,
		color: '#999',
		lineHeight: 36,
		fontWeight: '500'
	},
	underLineView: {
		position: 'absolute',
		justifyContent: 'center',
		alignItems: 'center',
		bottom: 0,
		left: 0,
		width: mWith / 2,
	},
	underLine: {
		borderBottomWidth: 2,
		borderBottomColor: '#000',
		width: 80,
	}
});

export default connectActionSheet(ConnectTab)
