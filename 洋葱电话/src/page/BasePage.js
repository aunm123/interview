'use strict';
import React, {Fragment, Component} from 'react';
import {
	Text, View,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	Animated,
	Dimensions,
	Image, ScrollView, Alert,
	ImageBackground, SectionList, FlatList
} from 'react-native';
import {strings} from "../../../locales";
import {inject, observer} from "mobx-react";


import AppStyle, {font} from '../../Style';
import NavBar from "../../components/NavBar";
import Line from "../../components/Line";
import URLS from "../../value/URLS";
import Req from "../../global/req";
import Util from "../../global/Util";
import Button from "../../components/Button";
import {observable, toJS} from "mobx";
import SafeView from "../../components/SafeView";
import TextEx from "../../components/TextEx";
import TextExTitle from "../components/TextExTitle";
import BaseComponents from "../BaseComponents";

var {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
export default class BasePage extends BaseComponents {

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;
	}

	render() {

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={strings('userPage.title')}
							bottom_line={true}
							leftRender={(
								<Button style={{paddingLeft: 6, paddingRight: 12}} onPress={() => this.navigation.pop()}>
									<Image
										style={{width: 22, height: 22}}
										source={require('../../assets/img/util/ic_close.png')}
									/>
								</Button>
							)}
							rightRender={(
								<Button style={{paddingRight: 6}} onPress={() => {
									this.quite()
								}}>
									<TextExTitle style={{fontSize: 16}}>{strings('userPage.logout')}</TextExTitle>
								</Button>
							)}
					/>
					<ScrollView>

						{/*关于洋葱*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]} onPress={() => {
							this.global.developing()
						}}>
							<Image
								style={{width: 40, height: 40, marginRight: 12}}
								source={require('../../assets/img/pu/ic_bangzhuhefangui.png')}
							/>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('userPage.about')}
							</TextEx>
						</Button>


					</ScrollView>
				</SafeView>

			</Fragment>
		)
	}
}

const styles = StyleSheet.create({
	rowline: {
		minHeight: 40,
		paddingHorizontal: 16,
		overflow: 'hidden'
	},
	rowTitle: {
		fontSize: 16,
		color: '#333',
		lineHeight: 22,
		fontWeight: "500",
	},
	rowDetail: {
		fontSize: 16,
		color: '#666',
		lineHeight: 20,
		overflow: 'hidden',
		position: 'absolute',
		top: 10
	}
});
