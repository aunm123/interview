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
import TextExTitle from "../../components/TextExTitle";
import BaseComponents from "../../BaseComponents";

var {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
export default class QRCodePage extends BaseComponents {

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	actionSheetShow() {

		const actionOptioms = [
			strings('QRCodePage.reset')+'QR',
			strings('QRCodePage.share')+'QR',
			strings('QRCodePage.save')+'QR',
			strings('other.cancel')
		];

		this.global.modalRef.showModal((
			<CustomActionSheet title={strings('PasswordLockPage.setTimeTitle')}
							   options={actionOptioms}
							   click={async (index) => {

							   }}
							   cancelIndex={actionOptioms.length-1}/>
		), 'bottom')
	}

	render() {

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={strings('QRCodePage.title')}
							bottom_line={true}
							leftRender={(
								<Button style={{paddingLeft: 6, paddingRight: 12}} onPress={() => this.navigation.pop()}>
									<Image
										style={{width: 22, height: 22}}
										source={require('../../assets/img/util/ic_back_black.png')}
									/>
								</Button>
							)}
							rightRender={(
								<View style={AppStyle.row}>
									<TouchableOpacity style={{padding: 10}} onPress={()=>{
										this.navigation.push('QRCodeScannerPage')
									}}>
										<TextExTitle style={{fontSize: 16}}>{strings('QRCodePage.scan')}</TextExTitle>
									</TouchableOpacity>
									<TouchableOpacity style={{padding: 10}} onPress={() => this.actionSheetShow()}>
										<TextExTitle style={{fontSize: 16}}>{strings('QRCodePage.more')}</TextExTitle>
									</TouchableOpacity>
								</View>
							)}
					/>
					<ScrollView style={{backgroundColor: '#f5f5f5',}}
								contentContainerStyle={{
									justifyContent: 'center',
									alignItems: 'center'
								}}>
						<View style={{
							backgroundColor: '#FFF',
							width: 300,
							height: 300,
							marginTop: 50,
							justifyContent: 'center',
							alignItems: 'center',
							borderRadius: 10}}>

							<Image
								style={{width: '30%', height: '30%'}}
								source={require('../../assets/img/bg/timg.png')}
							/>

						</View>
					</ScrollView>
				</SafeView>

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
