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
	ImageBackground, SectionList, ScrollView, TouchableWithoutFeedback, FlatList, Easing
} from 'react-native';
import {strings} from "../../../locales";
import {inject, observer} from "mobx-react";

import AppStyle, {font} from '../../Style';
import NavBar from "../../components/NavBar";
import Line from "../../components/Line";
import SearchBar from "../../components/SearchBar";
import {NewPhoneRow} from "../../components/row/NewPhoneRow";
import CameraRoll from "@react-native-community/cameraroll";
import SafeView from "../../components/SafeView";
import Button from "../../components/Button";
import TextEx from "../../components/TextEx";
import Icon from "../../value/Svg";
import PhotoDao from "../../dao/PhotoDao";
import BaseComponents from "../../BaseComponents";

let {height, width} = Dimensions.get('window');

let line = 3;
let imageWith = (width - line * 3) / 4;


@inject('store', 'global')
@observer
export default class PhotoPage extends BaseComponents {
	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.state = {
			groupsTitle: [],
			groups: [],
			hasSelectIndex: -1,
			groupAnimateValue: new Animated.Value(0), // 初始值
			currentGroups: strings('PhotoPage.all_photo'),
			photos: []
		}
		this.snedFile = this.navigation.getParam('snedFile') || (()=>{})
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	componentDidMount() {

		CameraRoll.getPhotos({
			first: Number.MAX_SAFE_INTEGER,
			groupTypes: 'All',
			assetType: 'Photos'
		}).then((r) => { //成功的回调
			let edges = r.edges;
			let groups = new Set();
			let groups_data = {'all': {title: strings('PhotoPage.all_photo'), images: []}};
			for (let i in edges) {
				let groups_name = edges[i].node.group_name;
				let img = edges[i].node.image;

				if (!groups.has(groups_name)) {
					groups.add(groups_name);
					groups_data[groups_name] = {
						title: groups_name,
						images: [],
					};
				}
				groups_data[groups_name].images.push(img);
				groups_data['all'].images.push(img);
			}
			let groupsTitle = [];
			let all = groups_data['all'];
			groupsTitle.push({
				title: all.title,
				count: all.images.length,
				icon: all.images.length > 0 ? all.images[0] : null,
			});
			for (let key in groups_data) {
				let item = groups_data[key];
				let icon = item.images.length > 0 ? item.images[0] : null;
				if (key != 'all' && key != 'All Photos') {
					groupsTitle.push({
						title: item.title,
						count: item.images.length,
						icon: icon,
					})
				}
			}

			console.log(groupsTitle, groups_data);
			this.setState({
				groupsTitle: groupsTitle,
				groups: groups_data,
				photos: groups_data['all'].images,
			});
		}).catch((err) => {
			console.log(err)
		});
	}

	_renderGroupItem(item, index) {
		let h = index == 0 ? (<Line style={{borderBottomColor: '#999'}}/>) : null;
		return (
			<View>
				{h}
				<TouchableOpacity style={[AppStyle.row, {alignItems: 'center', padding: 5}]}
								  onPress={() => this.selectGroup(item)}>
					<View style={styles.imageRow}>
						<Image resizeMode="cover" style={styles.image} source={{uri: item.icon}}/>
					</View>
					<View style={{marginLeft: 10}}>
						<TextEx style={{fontSize: 17, lineHeight: 22, color: 'white'}}>{item.title}</TextEx>
						<TextEx style={{fontSize: 17, color: 'white'}}>{item.count}</TextEx>
					</View>
				</TouchableOpacity>
				<Line style={{borderBottomColor: '#999'}}/>
			</View>
		)
	}

	headerTittleSelect() {
		const {groupAnimateValue} = this.state;
		const translateY = groupAnimateValue.interpolate({
			inputRange: [0, 1],
			outputRange: [height, 0],
			extrapolate: 'clamp',
		});

		return (
			<Animated.View style={{
				position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10,
				transform: [{translateY}]
			}}>
				<FlatList
					style={{backgroundColor: 'rgba(51,51,51,0.98)', flex: 1}}
					keyboardDismissMode={'on-drag'}
					renderItem={({item, index}) => this._renderGroupItem(item, index)}
					data={this.state.groupsTitle}
					keyExtractor={(item, index) => item + index}
					stickySectionHeadersEnabled={false}
				/>
			</Animated.View>
		)
	}

	selectIndex(index) {
		if (this.state.hasSelectIndex == index) {
			this.setState({hasSelectIndex: -1})
		} else {
			this.setState({hasSelectIndex: index})
		}
	}

	selectGroup(item) {
		this.toggleGroupShow();
		let {groups} = this.state;

		let images = item.title == strings('PhotoPage.all_photo') ? groups['all'].images : groups[item.title].images

		this.setState({
			hasSelectIndex: -1,
			photos: images,
			currentGroups: item.title,
		});
	}

	_renderItem(item, index) {
		let marginLeft = index % 4 === 0 ? 0 : line;
		let bimg = this.state.hasSelectIndex == index ?
			require('../../assets/img/call/ic_circle_chose.png') :
			require('../../assets/img/call/ic_circle_normal.png');
		return (
			<TouchableOpacity style={[styles.imageRow, {marginTop: line, marginLeft: marginLeft}]}
							  onPress={() => this.selectIndex(index)}>
				<View style={styles.imageRow}>
					<Image resizeMode="cover" style={styles.image} source={{uri: item.uri}}/>
				</View>
				<Image
					style={styles.bimage}
					source={bimg}
				/>
			</TouchableOpacity>
		)
	}

	toggleGroupShow() {
		if (this.state.groupAnimateValue._value == 1) {
			Animated.timing(this.state.groupAnimateValue, {
				toValue: 0, // 目标值
				duration: 300, // 动画时间
				easing: Easing.ease // 缓动函数
			}).start();
		} else {
			Animated.timing(this.state.groupAnimateValue, {
				toValue: 1, // 目标值
				duration: 300, // 动画时间
				easing: Easing.ease // 缓动函数
			}).start();
		}
	}

	render() {

		let groupRender = this.headerTittleSelect();

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={''}
							bottom_line={true}
							leftRender={(
								<TouchableOpacity style={{paddingLeft: 6, paddingRight: 12}} onPress={() => this.navigation.pop()}>
									<Image
										style={{width: 20, height: 20}}
										source={require('../../assets/img/util/ic_close.png')}
									/>
								</TouchableOpacity>
							)}
							centerRender={(
								<View style={{justifyContent: 'center', alignItems: 'center',}}>
									<TouchableOpacity
										style={[AppStyle.row, {justifyContent: 'center', alignItems: 'center'}]}
										onPress={() => this.toggleGroupShow()}>
										<TextEx style={styles.navbar_title}>{this.state.currentGroups}</TextEx>
										<Image
											style={{width: 22, height: 22}}
											source={require('../../assets/img/util/ic_arrow_down_hui.png')}
										/>
									</TouchableOpacity>
								</View>
							)}
					/>
					<View style={{flex: 1}}>
						{groupRender}
						<FlatList
							ref={'flatlist'}
							style={{backgroundColor: "white", flex: 1}}
							numColumns={4}
							keyboardDismissMode={'on-drag'}
							renderItem={({item, index}) => this._renderItem(item, index)}
							data={this.state.photos}
							keyExtractor={(item, index) => item + index}
							stickySectionHeadersEnabled={false}
							ItemSeparatorComponent={() => null}
						/>
					</View>

					{
						this.state.hasSelectIndex != -1?(
							<Button style={{position: "absolute", right: 20, bottom: 20}}
									onPress={() => {
										let file = this.state.photos[this.state.hasSelectIndex];
										this.snedFile(file);
										this.navigation.pop();
									}}>
								<Icon icon={'chat_icon_ send_big'} size={60} color={'#4A90E2'}/>
							</Button>
						) : (
							<Button style={{position: "absolute", right: 20, bottom: 20}}
									onPress={() => {
										this.navigation.navigate('CameraPage', {
											sendBlock: (file) => {
												this.navigation.pop();
												this.snedFile(file);
											}
										});
									}}>
								<Icon icon={'chat_icon_ camera_big'} size={60} color={'#4A90E2'}/>
							</Button>
						)
					}
				</SafeView>
			</Fragment>
		)
	}
}


const styles = StyleSheet.create({
	logoRow: {
		paddingHorizontal: 12,
		paddingVertical: 18,
	},
	name: {
		fontSize: 17,
		color: "#333",
		lineHeight: 24,
		fontWeight: '500',
	},
	phone: {
		fontSize: 14,
		color: "#666"
	},
	blueR: {
		backgroundColor: "#7ED321",
		width: 10,
		height: 10,
		borderRadius: 5,
	},
	line: {
		padding: 12,
	},
	rowline: {
		paddingVertical: 20,
		paddingHorizontal: 12,
	},
	rowTitle: {
		fontSize: 14,
		color: '#333',
		lineHeight: 20
	},
	rowDetail: {
		fontSize: 12,
		color: '#999',
		lineHeight: 20
	},
	navbar_title: {
		lineHeight: 48,
		fontSize: 18,
		textAlign: 'center',
		fontWeight: '500'
	},
	imageRow: {
		width: imageWith,
		height: imageWith,
	},
	container: {
		alignItems: 'center',
		height: 257,
		flexDirection: "row"
	},
	image: {
		width: "100%",
		height: "100%",
		borderWidth: 1,
		borderColor: '#e2e2e2'
	},
	bimage: {
		width: 30,
		height: 30,
		position: 'absolute',
		top: 3,
		right: 3
	}
});
