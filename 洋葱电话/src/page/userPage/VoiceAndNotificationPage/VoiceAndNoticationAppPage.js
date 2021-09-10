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
export default class VoiceAndNoticationAppPage extends BaseComponents {

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
					<NavBar title={strings('VoiceAndNoticationAppPage.title')}
							bottom_line={true}
							leftRender={(
								<Button style={{paddingLeft: 6, paddingRight: 12}} onPress={() => this.navigation.pop()}>
									<Image
										style={{width: 22, height: 22}}
										source={require('../../../assets/img/util/ic_back_black.png')}
									/>
								</Button>
							)}
					/>
					<ScrollView>

						{/*声音*/}
						<View style={[AppStyle.row, AppStyle.hcenter, styles.rowline]}>
							<Icon icon={'personal_icon_sound_voice'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('VoiceAndNoticationAppPage.voice')}
							</TextEx>
							<Switch value={this.global.Voice}
									onValueChange={(value) => {
										this.global.Voice = value
										CustomStorage.setItem('SettingVoice', value);
									}}/>
						</View>
						<Line style={{marginLeft: 68}}/>

						{/*震动*/}
						<View style={[AppStyle.row, AppStyle.hcenter, styles.rowline]}>
							<Icon icon={'personal_icon_sound_shock'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('VoiceAndNoticationAppPage.shock')}
							</TextEx>
							<Switch value={this.global.Shake}
									onValueChange={(value) => {
										this.global.Shake = value
										CustomStorage.setItem('SettingShake', value);
									}}/>
						</View>
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
