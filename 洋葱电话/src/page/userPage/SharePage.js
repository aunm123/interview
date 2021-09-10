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
import Button from "../../components/Button";
import SafeView from "../../components/SafeView";
import TextEx from "../../components/TextEx";
import Line from "../../components/Line";
import Util from "../../global/Util";
import Global from "../../mobx/Global";
import TextExTitle from "../../components/TextExTitle";
import Icon from "../../value/Svg";
import BaseComponents from "../../BaseComponents";

var {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
export default class SharePage extends BaseComponents {

	global: Global;

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	render() {
		let logo = this.global.avatarIcon(240);
		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={strings('SharePage.title')}
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
					<ScrollView>

						<View style={{marginTop: 40, justifyContent: 'center', alignItems: 'center'}}>
							<View style={{width: 240, height: 240,}}>
								{logo}
								<TextExTitle style={{
									position: 'absolute', bottom: 0, left: 0, right: 0, height: 50,
									fontSize: 16, color: '#FFF', paddingHorizontal:12, lineHeight: 50,
									backgroundColor: 'rgba(74,144,226,0.7)', fontWeight: '500'
								}}>
									{this.global.userData.nickname}
								</TextExTitle>
							</View>
						</View>

						<TextEx style={{
							fontSize: 14,
							color: '#999',
							marginHorizontal: 35,
							marginVertical: 20,
							lineHeight: 20,
							textAlign: 'center'
						}}>
							{strings('SharePage.btitle')}
						</TextEx>

						{/*复制到剪贴板*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]} onPress={() => {}}>
							<Icon icon={'personal_icon_copy'} size={40} color={'#4A90E2'} style={{marginRight: 12}} />
							<View style={{flex: 1}}>
								<TextEx style={styles.rowTitle}>
									{strings('SharePage.copyToClip')}
								</TextEx>
								<TextEx style={styles.rowDetail}>
									{strings('SharePage.copyToClipDetail')}
								</TextEx>
							</View>
						</Button>
						<Line style={{marginLeft: 68}}/>

						{/*QR代码*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]} onPress={() => {
							// this.navigation.push('QRCodePage')
							this.global.developing()
						}}>
							<Icon icon={'common_icon_scan_40'} size={40} color={'#4A90E2'} style={{marginRight: 12}} />
							<View style={{flex: 1}}>
								<TextEx style={styles.rowTitle}>
									{strings('SharePage.QRCode')}
								</TextEx>
								<TextEx style={styles.rowDetail}>
									{strings('SharePage.QRCodeDetail')}
								</TextEx>
							</View>
						</Button>
						<Line style={{marginLeft: 68}}/>

						{/*更多*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]} onPress={() => {
							this.global.developing()
						}}>
							<Icon icon={'personal_icon_more'} size={40} color={'#4A90E2'} style={{marginRight: 12}} />
							<View style={{flex: 1}}>
								<TextEx style={styles.rowTitle}>
									{strings('SharePage.more')}
								</TextEx>
								<TextEx style={styles.rowDetail}>
									{strings('SharePage.moreDetail')}
								</TextEx>
							</View>
						</Button>
						<Line style={{marginLeft: 68}}/>


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
