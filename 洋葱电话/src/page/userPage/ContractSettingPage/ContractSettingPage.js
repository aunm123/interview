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
	ImageBackground, SectionList, FlatList, Switch
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
import Icon from "../../../value/Svg";
import BaseComponents from "../../../BaseComponents";

var {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
export default class ContractSettingPage extends BaseComponents {

	@observable
	async_contract = false;

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
					<NavBar title={strings('ContractSettingPage.title')}
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

						{/*同步联系人*/}
						<View style={[AppStyle.row, AppStyle.hcenter, styles.rowline]}>
							<Icon icon={'personal_icon_contacts_replace'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('ContractSettingPage.async_contract')}
							</TextEx>
							<Switch value={this.async_contract}
									onValueChange={(value) => {
										this.async_contract = value
									}}/>
						</View>
						<Line style={{marginLeft: 68}}/>

						{/*被阻止的联系人*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]} onPress={()=>{
							// this.navigation.push('BanContractSettingPage')
						}}>
							<Icon icon={'personal_icon_contacts_black'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('ContractSettingPage.ban_contract')}
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

