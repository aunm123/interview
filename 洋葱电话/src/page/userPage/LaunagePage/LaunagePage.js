'use strict';
import React, {Fragment, Component} from 'react';
import {
	StyleSheet,
	StatusBar,
	Dimensions,
	Image, ScrollView,
} from 'react-native';
import {inject, observer} from "mobx-react";
import SafeView from "../../../components/SafeView";
import NavBar from "../../../components/NavBar";
import Button from "../../../components/Button";
import TextEx from "../../../components/TextEx";
import AppStyle from "../../../Style";
import {strings} from "../../../../locales";
import Line from "../../../components/Line";
import {observable} from "mobx";
import TextExTitle from "../../../components/TextExTitle";
import BaseComponents from "../../../BaseComponents";


var {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
export default class LaunagePage extends BaseComponents {

	@observable
	selectLaunage = 0;

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
					<NavBar title={strings('LaunagePage.title')}
							bottom_line={true}
							leftRender={(
								<Button style={{paddingLeft: 6, paddingRight: 12}} onPress={() => this.navigation.pop()}>
									<Image
										style={{width: 20, height: 20}}
										source={require('../../../assets/img/util/ic_back_black.png')}
									/>
								</Button>
							)}
							rightRender={(
								<Button style={{paddingRight: 6}} >
									<TextExTitle style={{color: '#4A90E2', fontSize: 16, fontWeight: '500'}}>
										{strings('LaunagePage.saveSure')}
									</TextExTitle>
								</Button>
							)}
					/>
					<ScrollView>

						{/*设备语言*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]} onPress={() => {
							this.selectLaunage = 0
						}}>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('LaunagePage.device_launage')}
							</TextEx>

							{
								this.selectLaunage ==0 ? <Image
									style={{width: 18, height: 18, marginHorizontal: 16}}
									source={require('../../../assets/img/icon/kbg.png')}
								/> : <Image
									style={{width: 18, height: 18, marginHorizontal: 16}}
									source={require('../../../assets/img/util/ic_status_offline.png')}
								/>

							}
						</Button>
						<Line style={{marginLeft: 12}}/>

						{/*中文（简体）*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]} onPress={() => {
							this.selectLaunage = 1
						}}>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('LaunagePage.zht_launage')}
							</TextEx>
							{
								this.selectLaunage ==1 ? <Image
									style={{width: 18, height: 18, marginHorizontal: 16}}
									source={require('../../../assets/img/icon/kbg.png')}
								/> : <Image
									style={{width: 18, height: 18, marginHorizontal: 16}}
									source={require('../../../assets/img/util/ic_status_offline.png')}
								/>
							}
						</Button>
						<Line style={{marginLeft: 12}}/>

						{/*中文（简体）*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]} onPress={() => {
							this.selectLaunage = 2
						}}>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('LaunagePage.zhtf_launage')}
							</TextEx>
							{
								this.selectLaunage ==2 ? <Image
									style={{width: 18, height: 18, marginHorizontal: 16}}
									source={require('../../../assets/img/icon/kbg.png')}
								/> : <Image
									style={{width: 18, height: 18, marginHorizontal: 16}}
									source={require('../../../assets/img/util/ic_status_offline.png')}
								/>
							}
						</Button>
						<Line style={{marginLeft: 12}}/>

						{/*English*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]} onPress={() => {
							this.selectLaunage = 3
						}}>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('LaunagePage.en_launage')}
							</TextEx>
							{
								this.selectLaunage ==3 ? <Image
									style={{width: 18, height: 18, marginHorizontal: 16}}
									source={require('../../../assets/img/icon/kbg.png')}
								/> : <Image
									style={{width: 18, height: 18, marginHorizontal: 16}}
									source={require('../../../assets/img/util/ic_status_offline.png')}
								/>
							}
						</Button>
						<Line style={{marginLeft: 12}}/>

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
