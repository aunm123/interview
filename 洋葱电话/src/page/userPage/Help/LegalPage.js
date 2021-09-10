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
	ImageBackground, SectionList, FlatList, Switch, Easing
} from 'react-native';
import {inject, observer} from "mobx-react";
import SafeView from "../../../components/SafeView";
import NavBar from "../../../components/NavBar";
import Button from "../../../components/Button";
import {strings} from "../../../../locales";
import AppStyle from "../../../Style";
import TextEx from "../../../components/TextEx";
import {observable, toJS} from "mobx";
import Line from "../../../components/Line";
import Global from "../../../mobx/Global";
import Icon from "../../../value/Svg";
import Req from "../../../global/req";
import URLS from "../../../value/URLS";
import HTML from "react-native-render-html";
import BaseComponents from "../../../BaseComponents";

var {height, width} = Dimensions.get('window');


@inject('store', 'global')
@observer
export default class LegalPage extends BaseComponents {

	global: Global;

	@observable
	content = "";

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;

		this.type = this.navigation.getParam('type');
	}

	onStart() {
		super.onStart();

		this.getQuestion();
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	async getQuestion() {
		this.global.showLoading();
		let res = await Req.post(URLS.GET_SERVICE_AND_PUBIC_HTML, {});
		if (this.type == "legal") {
			this.content = res.data.serverClause;
		} else if (this.type == 'privacy') {
			this.content = res.data.serverPrivacy;
		}

		this.global.dismissLoading();
	}

	render() {

		let title = "";
		if (this.type == 'legal') {
			title = strings("HelpPage.legal");
		} else if (this.type == 'privacy') {
			title = strings("HelpPage.public");
		}

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={title}
							bottom_line={true}
							leftRender={(
								<Button style={{paddingLeft: 6, paddingRight: 12}}
										onPress={() => this.navigation.pop()}>
									<Image
										style={{width: 22, height: 22}}
										source={require('../../../assets/img/util/ic_back_black.png')}
									/>
								</Button>
							)}
					/>
					<ScrollView contentContainerStyle={{paddingVertical: 8, paddingHorizontal: 12}}>

						<HTML baseFontStyle={styles.ldateTitle}
							  html={this.content} imagesMaxWidth={Dimensions.get('window').width}/>

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
	},
	viewTT: {
		position: 'absolute',
		top: 10
	},
	ldateTitle: {
		color: "#333",
		fontSize: 14,
		paddingHorizontal: 5,
		paddingVertical: 3,
		minWidth: 200,
		lineHeight: 18,
	},
});
