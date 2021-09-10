'use strict';
import React, {Fragment, Component} from 'react';
import {
	Text, View,
	Linking,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	Animated,
	Dimensions,
	Image, ScrollView, Alert,
	ImageBackground, SectionList, FlatList, Switch, Platform
} from 'react-native';
import {inject, observer} from "mobx-react";
import SafeView from "../../../components/SafeView";
import NavBar from "../../../components/NavBar";
import Button from "../../../components/Button";
import {strings} from "../../../../locales";
import AppStyle from "../../../Style";
import TextEx from "../../../components/TextEx";
import {observable} from "mobx";
import Line from "../../../components/Line";
import Global from "../../../mobx/Global";
import Icon from "../../../value/Svg";
import BaseComponents from "../../../BaseComponents";
import AppStore from "../../../mobx/AppStore";

var {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
export default class HelpPage extends BaseComponents {

	@observable
	async_contract = false;

	global: Global;

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	gotoLike() {

		this.global.modalRef.showModal((
			<View style={{
				backgroundColor: "#FFF",
				borderRadius: 7,
				overflow: 'hidden',
				paddingTop: 10,
				paddingHorizontal: 15
			}}>
				<View style={[{backgroundColor: "#fff", alignItems: 'center'}, AppStyle.row]}>
					<TextEx style={{
						textAlign: 'center',
						fontSize: 17,
						width: 280,
						marginBottom: 20,
						marginTop: 5
					}}>{strings('HelpPage.thank_title')}</TextEx>
					<Button style={{
						padding: 12,
						position: 'absolute',
						right: -12,
						top: -8
					}} onPress={() => {
						this.global.modalRef.handlehide();
					}}>
						<Image
							style={{width: 20, height: 20}}
							source={require('../../../assets/img/util/ic_close.png')}
						/>
					</Button>
				</View>
				<View style={{width: 280}}>
					<TextEx style={{fontSize: 15, color: "#666", marginBottom: 20, lineHeight: 20}}>
						{strings('HelpPage.thank_content1')}
					</TextEx>
					<TextEx style={{fontSize: 15, color: "#666", lineHeight: 20}}>
						{strings('HelpPage.thank_content2')}
					</TextEx>

					<Button style={{
						marginVertical: 20,
						marginHorizontal: 40,
						height: 44,
						justifyContent: 'center',
						alignItems: 'center',
						backgroundColor: '#4A90E2',
						borderRadius: 7
					}} onPress={()=>{
						if(Platform.OS === "ios") {
							Linking.openURL(this.global.userData.ios_shop_url);
						} else if (Platform.OS === 'android') {
							Linking.openURL(this.global.userData.android_shop_url);
						} else {
							Linking.openURL(this.global.userData.ios_shop_url);
						}
						this.global.modalRef.handlehide();
					}}>
						<TextEx style={{color: 'white', fontSize: 16,}}>
							{strings('HelpPage.thank_button')}
						</TextEx>
					</Button>
				</View>
			</View>), 'middle')
	}

	render() {

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={strings('HelpPage.title')}
							bottom_line={true}
							leftRender={(
								<Button style={{paddingLeft: 6, paddingRight: 12}} onPress={() => this.navigation.pop()}>
									<Image
										style={{width: 20, height: 20}}
										source={require('../../../assets/img/util/ic_back_black.png')}
									/>
								</Button>
							)}
					/>
					<ScrollView>

						{/*喜欢洋葱，留个好评吧*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]} onPress={()=>{
							this.gotoLike();
						}}>
							<Icon icon={'personal_icon_help_evaluate'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<View style={{flex: 1}}>
								<TextEx style={styles.rowTitle}>
									{strings('HelpPage.if_like_support')}
								</TextEx>
								<TextEx style={styles.rowDetail}>
									{strings('HelpPage.if_like_support_detail')}
								</TextEx>
							</View>
						</Button>
						<Line style={{marginLeft: 68}}/>

						{/*洋葱使用技巧*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]} onPress={()=>{
							this.navigation.push('QuestionAndListPage', {type: 'help'})
						}}>
							<Icon icon={'personal_icon_help_explain'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('HelpPage.help_live')}
							</TextEx>
						</Button>
						<Line style={{marginLeft: 68}}/>

						{/*FAQ*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]} onPress={()=>{
							this.navigation.push('QuestionAndListPage', {type: 'faq'})
						}}>
							<Icon icon={'personal_icon_help_faq'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('HelpPage.FAQ')}
							</TextEx>
						</Button>
						<Line style={{marginLeft: 68}}/>

						{/*报告问题*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]} onPress={()=>{
							this.navigation.push('SupportHelpPage')
						}}>
							<Icon icon={'personal_icon_help_report'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('HelpPage.support_question')}
							</TextEx>
						</Button>
						<Line style={{marginLeft: 68}}/>

						{/*法律*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]} onPress={()=>{
							this.navigation.push('LegalPage', {type: 'legal'})
						}}>
							<Icon icon={'personal_icon_help_low'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('HelpPage.legal')}
							</TextEx>
						</Button>
						<Line style={{marginLeft: 68}}/>

						{/*政策*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]} onPress={()=>{
							this.navigation.push('LegalPage', {type: 'privacy'})
						}}>
							<Icon icon={'personal_icon_personal_data'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('HelpPage.public')}
							</TextEx>
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

