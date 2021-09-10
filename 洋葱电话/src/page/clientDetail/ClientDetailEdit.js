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
	ImageBackground, SectionList, FlatList, TextInput, Switch
} from 'react-native';
import {strings} from "../../../locales";
import {inject, observer} from "mobx-react";


import AppStyle, {font} from '../../Style';
import NavBar from "../../components/NavBar";
import Line from "../../components/Line";
import SafeView from "../../components/SafeView";
import BaseComponents from "../../BaseComponents";

var {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
export default class ClientDetailEdit extends BaseComponents {
	constructor(props) {
		super(props);
		this.global = props.global;
		this.navigation = props.navigation;
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}


	render() {
		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>

					<NavBar title={''}
							bottom_line={true}
							leftRender={(
								<TouchableOpacity style={[{padding: 6, paddingRight: 12}, AppStyle.row]} onPress={() => {
									this.navigation.pop()
								}}>
									<Image
										style={{width: 22, height: 22}}
										source={require('../../assets/img/util/ic_back_black.png')}
									/>
									<Text style={{fontSize: 17, lineHeight: 22}}>个人资料</Text>
								</TouchableOpacity>
							)}
					/>
					<ScrollView keyboardShouldPersistTaps='never'>
						<View style={styles.row}>
							<Text style={styles.title}>基本资料</Text>
						</View>
						<View style={[styles.row, AppStyle.row]}>
							<Text style={styles.h2}>洋葱用户名</Text>
							<Text style={styles.h3}>{this.global.userid}</Text>
						</View>
						<View style={[styles.row, AppStyle.row]}>
							<Text style={styles.h2}>性别</Text>
							<Text style={styles.h3}>女</Text>
						</View>
						<View style={[styles.row, AppStyle.row]}>
							<Text style={styles.h2}>生日</Text>
							<Text style={styles.h3}>1999年02月30日</Text>
						</View>
						<View style={[styles.row, AppStyle.row]}>
							<Text style={styles.h2}>城市</Text>
							<Text style={styles.h3}>重庆市/渝北区/中国</Text>
						</View>
						<View style={{height: 10, backgroundColor: '#EAF4FF'}}/>
						<TouchableOpacity style={[styles.row, AppStyle.row]}>
							<Text style={styles.h2}>备注名称</Text>
							<Text style={styles.h3}>点击修改</Text>
						</TouchableOpacity>
						<View style={{height: 10, backgroundColor: '#EAF4FF'}}/>
						<View style={[styles.row]}>
							<Text style={styles.title}>自我介绍</Text>
							<Text style={[styles.h3, {height: 150, marginTop: 12}]}>精忠报国国泰民安安居乐业</Text>
						</View>
						<View style={{height: 10, backgroundColor: '#EAF4FF'}}/>
					</ScrollView>

				</SafeView>
			</Fragment>
		)
	}
}

const styles = StyleSheet.create({
	row:{
		paddingVertical: 12,
	},
	title: {
		fontSize: 15,
		color: '#333',
		lineHeight: 20,
		fontWeight: '500',
		marginHorizontal: 12,
	},
	h2: {
		fontSize: 14,
		color: '#333',
		lineHeight: 20,
		marginHorizontal: 12,
		flex: 1
	},
	h3: {
		fontSize: 14,
		color: '#999',
		lineHeight: 20,
		marginHorizontal: 12,
	},
	t10: {
		marginTop: 12,
	},
});
