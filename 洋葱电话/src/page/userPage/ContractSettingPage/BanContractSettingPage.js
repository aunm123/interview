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
import CustomStorage from "../../../global/CustomStorage";
import CustomActionSheet from "../../../components/CustomActionSheet";
import BaseComponents from "../../../BaseComponents";

var {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
export default class BanContractSettingPage extends BaseComponents {

	@observable
	data = [
		{
			name: "asdasdas",
		}
	];

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	async initData() {

	}


	actionSheetShow(item) {

		const options = [
			<TextEx>{strings('BanContractSettingPage.cancel_ban')}</TextEx>,
			<TextEx>{strings('BanContractSettingPage.delete_contract')}</TextEx>,
			<TextEx style={{color: '#999'}}>{strings('other.cancel')}</TextEx>];

		this.global.modalRef.showModal((
			<CustomActionSheet title={item.name}
							   options={options}
							   click={async (index) => {

							   }}
							   cancelIndex={options.length-1}/>
		), 'bottom')
	}

	_renderItem(item, index) {
		return (
			<Fragment>
				<View style={[AppStyle.row, AppStyle.hcenter, styles.rowline]}>
					<Image
						style={{width: 40, height: 40, marginRight: 12}}
						source={require('../../../assets/img/pu/ic_bangzhuhefangui.png')}
					/>
					<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
						{item.name}
					</TextEx>
					<Button onPress={()=>this.actionSheetShow(item)}>
						<TextEx style={{fontSize: 30, lineHeight: 30}}>...</TextEx>
					</Button>
				</View>
				<Line style={{marginLeft: 68}}/>
			</Fragment>
		)
	}

	render() {

		let data = [...this.data];

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={strings('BanContractSettingPage.title')}
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
					<FlatList
						ref={'flatlist'}
						style={{backgroundColor: "white", flex: 1}}
						keyboardDismissMode={'on-drag'}
						renderItem={({item, index}) => this._renderItem(item, index)}
						data={data}
						keyExtractor={(item, index) => item + index}
						stickySectionHeadersEnabled={false}
					/>
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

