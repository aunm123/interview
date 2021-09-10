'use strict';
import React, {Fragment, Component} from 'react';
import {
	StyleSheet,
	StatusBar,
	Dimensions,
	Image, ScrollView, View, Switch,
} from 'react-native';
import {inject, observer} from "mobx-react";
import SafeView from "../../../components/SafeView";
import NavBar from "../../../components/NavBar";
import Button from "../../../components/Button";
import TextEx from "../../../components/TextEx";
import {strings} from "../../../../locales";
import AppStyle from "../../../Style";
import {observable} from "mobx";
import Line from "../../../components/Line";
import Icon from "../../../value/Svg";
import CustomStorage from "../../../global/CustomStorage";
import BaseComponents from "../../../BaseComponents";
const {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
export default class VoiceAndNotificationPage extends BaseComponents {

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;

	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	render() {

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={strings('VoiceAndNotificationPage.title')}
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

						{/*聊天通知*/}
						<View style={[AppStyle.row, AppStyle.hcenter, styles.rowline]}>
							<Icon icon={'personal_icon_notice_chat'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<View style={{flex: 1}}>
								<TextEx style={styles.rowTitle}>
									{strings('VoiceAndNotificationPage.messageNotice')}
								</TextEx>
								<TextEx style={styles.rowDetail}>
									{strings('VoiceAndNotificationPage.messageNoticeDetail')}
								</TextEx>
							</View>
							<Switch value={this.global.messageNotice_Voice}
									onValueChange={(value) => {
										this.global.messageNotice_Voice = value;
										CustomStorage.setItem('SettingMessageNoticeVoice', value);
									}}/>
						</View>
						<View style={{backgroundColor: '#F5F5F5', paddingHorizontal: 16}} >
							<TextEx style={{fontSize: 12, color: '#999', lineHeight: 30}}>
								{strings('VoiceAndNotificationPage.noticationNotice_title')}
							</TextEx>
						</View>

						{/*应用内置音效*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]} onPress={()=>{
							this.navigation.push('VoiceAndNoticationAppPage')
						}}>
							<Icon icon={'personal_icon_notice_sound'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('VoiceAndNotificationPage.appNotice')}
							</TextEx>
						</Button>
						<Line style={{marginLeft: 68}}/>

						{/*短信通知*/}
						<View style={[AppStyle.row, AppStyle.hcenter, styles.rowline]}>
							<Icon icon={'personal_icon_notice_note'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<View style={{flex: 1}}>
								<TextEx style={styles.rowTitle}>
									{strings('VoiceAndNotificationPage.SMSNotice')}
								</TextEx>
								<TextEx style={styles.rowDetail}>
									{strings('VoiceAndNotificationPage.SMSNoticeDetail')}
								</TextEx>
							</View>
							<Switch value={this.global.messageNotice_Voice}
									onValueChange={(value) => {
										this.global.messageNotice_Voice = value
										CustomStorage.setItem('SettingMessageNoticeVoice', value);
									}}/>
						</View>
						<Line style={{marginLeft: 68}}/>

						{/*通话通知*/}
						<View style={[AppStyle.row, AppStyle.hcenter, styles.rowline]}>
							<Icon icon={'personal_icon_notice_call'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<View style={{flex: 1}}>
								<TextEx style={styles.rowTitle}>
									{strings('VoiceAndNotificationPage.phoneNotice')}
								</TextEx>
								<TextEx style={styles.rowDetail}>
									{strings('VoiceAndNotificationPage.phoneNoticeDetail')}
								</TextEx>
							</View>
							<Switch value={this.global.callingNotice_Voice}
									onValueChange={(value) => {
										this.global.callingNotice_Voice = value
										CustomStorage.setItem('SettingCallingNoticeVoice', value);
									}}/>
						</View>

						<View style={{backgroundColor: '#F5F5F5', paddingHorizontal: 16}} >
							<TextEx style={{fontSize: 12, color: '#999', lineHeight: 30}}>
								{strings('VoiceAndNotificationPage.previceNotice_title')}
							</TextEx>
						</View>

						{/*推送通知预览*/}
						<View style={[AppStyle.row, AppStyle.hcenter, styles.rowline]}>
							<Icon icon={'personal_icon_notice_show'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<View style={{flex: 1}}>
								<TextEx style={styles.rowTitle}>
									{strings('VoiceAndNotificationPage.prviceNotice')}
								</TextEx>
								<TextEx style={styles.rowDetail}>
									{strings('VoiceAndNotificationPage.prviceNoticeDetail')}
								</TextEx>
							</View>
							<Switch value={this.messageNotice}
									onValueChange={(value) => {
										this.messageNotice = value
									}}/>
						</View>

						<View style={{backgroundColor: '#F5F5F5', paddingHorizontal: 16}} >
							<TextEx style={{fontSize: 12, color: '#999', lineHeight: 30}}>
								{strings('VoiceAndNotificationPage.noNotice_title')}
							</TextEx>
						</View>

						{/*显示聊天通知*/}
						<View style={[AppStyle.row, AppStyle.hcenter, styles.rowline]}>
							<Icon icon={'personal_icon_notice_noteshow'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<View style={{flex: 1}}>
								<TextEx style={styles.rowTitle}>
									{strings('VoiceAndNotificationPage.showMessageInNo')}
								</TextEx>
								<TextEx style={styles.rowDetail}>
									{strings('VoiceAndNotificationPage.showMessageInNoDetail')}
								</TextEx>
							</View>
							<Switch value={this.messageNotice}
									onValueChange={(value) => {
										this.messageNotice = value
									}}/>
						</View>
						<Line style={{marginLeft: 68}}/>

						{/*显示通话通知*/}
						<View style={[AppStyle.row, AppStyle.hcenter, styles.rowline]}>
							<Icon icon={'personal_icon_notice_callshow'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<View style={{flex: 1}}>
								<TextEx style={styles.rowTitle}>
									{strings('VoiceAndNotificationPage.showPhoneInNo')}
								</TextEx>
								<TextEx style={styles.rowDetail}>
									{strings('VoiceAndNotificationPage.showPhoneInNoDetail')}
								</TextEx>
							</View>
							<Switch value={this.messageNotice}
									onValueChange={(value) => {
										this.messageNotice = value
									}}/>
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
