'use strict';
import React, {Fragment, Component} from 'react';
import {
	ScrollView, StatusBar, Dimensions, Text, Image, ImageBackground, View, UIManager,
	NativeModules, TextInput, TouchableOpacity, StyleSheet, FlatList, SectionList, Animated, Easing, findNodeHandle
} from 'react-native';
import pinyin from 'pinyin';

import {inject, observer} from "mobx-react";
import Colors from "../../Color";
import {strings} from "../../../locales";
import Line from "../../components/Line";
import {connectActionSheet} from "@expo/react-native-action-sheet";
import NavBar from "../../components/NavBar";
import AppStyle from "../../Style";
import Button from "../../components/Button";
import {observable} from "mobx";
import SafeView from "../../components/SafeView";
import Util from "../../global/Util";
import TextEx from "../../components/TextEx";
import Icon from "../../value/Svg";
import Global from "../../mobx/Global";
import BaseComponents from "../../BaseComponents";

var {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
class SearchPage extends BaseComponents {

	@observable
	searchText = '';

	animating = false;
	modal = 1;
	contentOffsetY = 0;

	mainviewHeight = 0;
	moving = false;
	maxContentOffsetY = 0;

	@observable
	datasource = [];

	global: Global;

	constructor(props) {
		super(props);
		this.global = props.global;
		this.store = props.store;
		this.navigation = props.navigation;

		this.rowTap = this.navigation.getParam('rowTap') || (() => {
		});
		this.rowTap2 = this.navigation.getParam('rowTap2') || (() => {
		});

		this.isAll = this.navigation.getParam('isAll') == undefined ? true : this.navigation.getParam('isAll');



		this.state = {
			animateValue: new Animated.Value(0),
		}

	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	componentDidMount() {

		this.search();

		try {
			this.input.focus()
		} catch (e) {
			console.log(this.input)
		}

		setTimeout(() => {
			const handle = findNodeHandle(this.refs.mainview);
			UIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
				this.mainviewHeight = height;
			})
		})
	}

	// 分组列表的renderItem
	_renderItem(item, index) {
		// type
		// 0 网络通讯录
		// 1 本地通讯录
		// 2 未知电话

		let icon = Util.logoFix(item.name, item.contractType);
		let from = null;
		if (item.contractType === 1) {
			from = (<TextEx style={[styles.row_title, {color: '#999', fontSize: 13,}]}>来自通讯录</TextEx>);
		}

		return (
			<Button style={styles.row}
					onPress={() => {
						try {
							this.input.blur();
						} catch (e) {
						}
						this.rowTap(item)
					}
					}
					onLongPress={() => {
						try {
							this.input.blur();
						} catch (e) {
						}
						this.rowTap2(item);
					}}
			>
				<View style={{flexDirection: "row", alignItems: "center", minHeight: 74,}}>
					{icon}
					<View style={{flex: 1}}>
						<TextEx style={styles.row_title}>{item.name}</TextEx>
						{from}
					</View>
					<TextEx>+{item.country_no} {item.phone_no}</TextEx>
				</View>
			</Button>
		);
	}

	_renderHeader() {
		if (this.datasource.length == 0) return null;
		return (
			<TextEx style={{
				fontSize: 12, color: '#999', lineHeight: 29, paddingLeft: 16,
				backgroundColor: '#F5F5F5'
			}}>
				{strings('connect_tab.title')}
			</TextEx>
		)
	}

	addToCustoer() {
		let contract = {};
		if (this.searchText.match(/^[0-9]+$/)) {
			// 全是数字
			contract = {
				name: '', phones: [
					{ label: 'mobile', number: '', type: 0, country_no : this.global.currentIp_Country,
						phone_no: this.searchText }
				], contractType: 2
			};

		} else {
			// 不是数字
			contract = {
				name: this.searchText, phones: [
					{ label: 'mobile', number: '', type: 0, country_no : this.global.currentIp_Country,
						phone_no: '' }
				], contractType: 2
			};
		}

		this.navigation.push('EditContactPage', {contract});


	}

	renderNoContent = () => {
		if (this.datasource.length == 0) {
			if (this.searchText.length == 0) {
				return null;
			} else {
				return (
					<Fragment>
						<TouchableOpacity onPress={()=>{this.addToCustoer()}}>
							<View style={[AppStyle.row, {paddingHorizontal: 16, paddingVertical: 12,}]}>
								<Icon icon={'common_icon_phone_40'} size={40} color={'#4A90E2'} />
								<View style={{flex: 1, height: 42, justifyContent: 'center', alignItems: 'flex-start', marginLeft: 12}}>
									<TextEx style={{fontSize: 16, color: "#333", lineHeight: 22}}>
										{strings('SearchPage.save_phone')}
									</TextEx>
									<TextEx style={{fontSize: 12, color: "#999", lineHeight: 17}}>
										{strings('SearchPage.save_contract_to_cont')}
									</TextEx>
								</View>
								<Image style={{width: 24, height: 42}}
									   resizeMode={'contain'}
									   source={require('../../assets/newimg/png/icon/common/common_icon_rightin.png')}/>
							</View>
						</TouchableOpacity>
						<TextEx style={{
							fontSize: 12, color: '#999', lineHeight: 29, paddingLeft: 16,
							backgroundColor: '#F5F5F5'
						}}>
							{strings('connect_tab.title')}
						</TextEx>
						<View style={{alignItems: 'center'}}>
							<Image style={{width: 200, height: 200, marginTop: 26}}
								   resizeMode={'contain'}
								   source={require('../../assets/newimg/png/empty_img.png')}/>
							<TextEx style={{fontSize: 14, color: "#999", lineHeight: 20}}>
								{strings('SearchPage.no_contract')}
							</TextEx>
						</View>
					</Fragment>
				)
			}
		}
	};

	showNavbar() {
		if (!this.animating && this.modal == 2) {
			this.animating = true;
			Animated.timing(this.state.animateValue, {
				toValue: 0, // 目标值
				duration: 300, // 动画时间
				easing: Easing.linear, // 缓动函数
				// useNativeDriver: true,
			}).start(() => {
				this.animating = false;
				this.modal = 1;
			});
		}
	}
	hideNavBar() {
		if (this.datasource.length == 0 || this.maxContentOffsetY < this.mainviewHeight) return ;
		if (!this.animating && this.modal == 1) {
			this.animating = true;
			Animated.timing(this.state.animateValue, {
				toValue: 1, // 目标值
				duration: 300, // 动画时间
				easing: Easing.linear, // 缓动函数
				// useNativeDriver: true,
			}).start(() => {
				this.animating = false;
				this.modal = 2;
			});
		}
	}

	cancelBtnPress() {
		this.showNavbar();
	}

	search() {
		// if (this.searchText.length == 0) {
		// 	this.datasource = [];
		// 	return ;
		// }
		let dataList = [];
		if (this.isAll){
			dataList = this.store.finListAllContentPhoneWithOutunKonows(this.searchText);
		} else {
			dataList = this.store.finListContentPhone(this.searchText)
		}
		this.datasource = [...dataList]
	}

	render() {
		let dataList = [...this.datasource];

		const translateY = this.state.animateValue.interpolate({
			inputRange: [0, 1],
			outputRange: [0, -100],
		});

		const translateSCY = this.state.animateValue.interpolate({
			inputRange: [0, 1],
			outputRange: [0, -44],
		});

		const searchBarWidth = this.state.animateValue.interpolate({
			inputRange: [0, 1],
			outputRange: [0, 50],
		});

		const searchBarOpacity = this.state.animateValue.interpolate({
			inputRange: [0, 1],
			outputRange: [0, 1],
		});

		const fletViewHeight = this.state.animateValue.interpolate({
			inputRange: [0, 1],
			outputRange: [this.mainviewHeight - 48, this.mainviewHeight - 4],
		});

		return (
			<SafeView>
				<Animated.View style={{transform: [{translateY}], height: this.state.barHeight}}>
					<NavBar title={strings('SearchPage.title')}
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
				</Animated.View>
				<Animated.View ref={'mainview'} style={{transform: [{translateY: translateSCY}], flex: 1}}>

					<View style={[styles.searchRow]}>
						<View style={{flex: 1}}>
							<TextInput style={styles.searchRow_input}
									   value={this.searchText}
									   ref={(input) => {
										   this.input = input
									   }}
									   onChangeText={(text) => {
										   this.searchText = text;
										   this.search();
									   }}
									   onSubmitEditing={()=>{
										   this.input.blur();
										   this.search();
									   }}
									   clearButtonMode = 'always'
									   placeholder={strings("connect_tab.search_placeholder")}>
							</TextInput>
							<Image
								style={{width: 24, height: 24, position: "absolute", left: 25, top: 5}}
								source={require('../../assets/newimg/png/icon/common/common_icon_search.png')}
							/>
						</View>
						<Animated.View style={{width: searchBarWidth, opacity: searchBarOpacity}}>
							<TouchableOpacity onPress={() => this.cancelBtnPress()}>
								<TextEx style={{
									color: '#4A90E2', fontSize: 16, lineHeight: 36,
									paddingRight: 16, fontWeight: '400'
								}}>
									{strings('other.cancel')}
								</TextEx>
							</TouchableOpacity>
						</Animated.View>
					</View>


					<Animated.View style={{height: fletViewHeight, backgroundColor: 'white'}}>
						<FlatList
							ref={'flatlist'}
							style={{backgroundColor: 'white', height: '100%'}}
							keyboardDismissMode={'on-drag'}
							renderItem={({item, index}) => this._renderItem(item, index)}
							data={dataList}
							keyExtractor={(item, index) => item + index}
							stickySectionHeadersEnabled={false}
							ItemSeparatorComponent={() =>
								<Line style={{marginLeft: 60, marginRight: 12}}/>
							}
							ListEmptyComponent={this.renderNoContent}
							ListHeaderComponent={() => this._renderHeader()}
							onScrollBeginDrag={(event) => {
								this.currentMove = event.nativeEvent.contentOffset.y;
							}}
							onScrollEndDrag={(event) => {
								if (this.currentMove - event.nativeEvent.contentOffset.y > 20){
									this.showNavbar();
								}

								if (this.currentMove - event.nativeEvent.contentOffset.y < -20) {
									this.hideNavBar();
								}
							}}
							onContentSizeChange={(contentWidth, contentHeight) => {
								this.maxContentOffsetY = contentHeight;
							}}
						/>
					</Animated.View>
				</Animated.View>
			</SafeView>
		)
	}
}

const styles = StyleSheet.create({
	contentContainer: {
		paddingBottom: 48
	},
	section: {
		height: 28,
		backgroundColor: "#F5F5F5",
	},
	section_title: {
		lineHeight: 28,
		fontSize: 12,
		color: "#999999",
		marginHorizontal: 12,
	},
	row: {
		backgroundColor: "#fff",
		paddingHorizontal: 10,
	},
	row_title: {
		fontSize: 16,
		marginLeft: 10,
		lineHeight: 23,
	},
	flex_Left: {
		position: "absolute",
		right: 0,
		top: 0,
		bottom: 48,
		width: 30,
		justifyContent: "center",
		alignItems: "center",
	},
	searchRow: {
		height: 48,
		flexDirection: "row",
		paddingVertical: 6,
		width: width,
	},
	searchRow_input: {
		height: 36,
		flex: 1,
		paddingLeft: 40,
		fontSize: 14,
		backgroundColor: '#F5F5F5',
		marginHorizontal: 16,
		borderRadius: 18,
	},
	searchBtn: {
		width: 48,
		height: 48,
		justifyContent: "center",
		alignItems: "center",
	}
});

export default connectActionSheet(SearchPage)
