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
	ImageBackground, SectionList, FlatList, Clipboard
} from 'react-native';
import {strings} from "../../../locales";
import {inject, observer} from "mobx-react";
import AppStyle, {font} from '../../Style';
import NavBar from "../../components/NavBar";
import Button from "../../components/Button";
import SafeView from "../../components/SafeView";
import TextEx from "../../components/TextEx";
import Line from "../../components/Line";
import CustomActionSheet from "../../components/CustomActionSheet";
import CustomStorage from "../../global/CustomStorage";
import {QRScannerView} from "react-native-qrcode-scanner-view";
import BaseComponents from "../../BaseComponents";

var {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
export default class QRCodeScannerPage extends BaseComponents {

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	renderTitleBar = () => <Text style={{color: 'white', textAlign: 'center', padding: 16}}>Title</Text>

	renderMenu = () => <Text style={{color: 'white', textAlign: 'center', padding: 16}}>Menu</Text>

	barcodeReceived = (event) => {
		console.log('Type: ' + event.type + '\nData: ' + event.data)
	};


	render() {

		return (
			<Fragment>
				<QRScannerView
					onScanResult={this.barcodeReceived}
					renderHeaderView={this.renderTitleBar}
					renderFooterView={this.renderMenu}
					scanBarAnimateReverse={true}>
					<StatusBar barStyle="dark-content"/>
					<SafeView>
						<NavBar title={strings('QRCodeScannerPage.title')}
								bottom_line={true}
								leftRender={(
									<Button style={{paddingLeft: 6, paddingRight: 12}} onPress={() => this.navigation.pop()}>
										<Image
											style={{width: 20, height: 20}}
											source={require('../../assets/img/util/ic_back_black.png')}
										/>
									</Button>
								)}
						/>

					</SafeView>
				</QRScannerView>


			</Fragment>
		)
	}
}

const styles = StyleSheet.create({
	rowline: {
		minHeight: 66,
		paddingHorizontal: 16,
	},
	rowTitle: {
		fontSize: 16,
		color: '#333',
		lineHeight: 22
	},
	rowDetail: {
		fontSize: 12,
		color: '#999',
		lineHeight: 20
	}
});
