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
import Global from "../../../mobx/Global";
import BaseComponents from "../../../BaseComponents";

var {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
export default class AboutPage extends BaseComponents {


	global:Global;

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
					<NavBar title={strings('AboutPage.title')}
							bottom_line={false}
							leftRender={(
								<Button style={{paddingLeft: 6, paddingRight: 12}} onPress={() => this.navigation.pop()}>
									<Image
										style={{width: 22, height: 22}}
										source={require('../../../assets/img/util/ic_back_black.png')}
									/>
								</Button>
							)}
					/>
					<ScrollView
						contentContainerStyle={{flex: 1, alignItems: 'center'}}
						style={{flex: 1}}>

						<Image
							style={{width: 139, height: 149, marginTop: 48}}
							source={require('../../../assets/newimg/png/login/logo.png')}
						/>
						<TextEx style={{marginTop: 10, color: '#4A90E2', fontSize: 14}}>
							版本 2.2.222
						</TextEx>

						<TextEx style={{color: '#78B7FF', fontSize: 12, marginTop: 72, lineHeight: 17}}>
							新版 2.2.222
						</TextEx>
						<View style={{width: '100%', marginTop: 8}}>
							<TouchableOpacity style={{
								backgroundColor: '#FFF',
								minHeight: 44,
								borderRadius: 22,
								marginHorizontal: 52,
								justifyContent: 'center',
								alignItems: 'center',
								borderWidth: 1,
								borderColor: '#4A90E2'
							}}>
								<TextEx style={{fontSize: 16, color: '#4A90E2', lineHeight: 44, fontWeight: '400'}}
										onPress={()=>{
											this.global.presentMessage('已经最新');
										}}>
									检查更新
								</TextEx>
							</TouchableOpacity>

							<TouchableOpacity style={{
								backgroundColor: '#4A90E2',
								minHeight: 44,
								borderRadius: 22,
								marginHorizontal: 52,
								justifyContent: 'center',
								alignItems: 'center',
								marginTop: 24
							}}>
								<TextEx style={{fontSize: 16, color: '#fff', lineHeight: 44, fontWeight: '400'}}>
									洋葱官网
								</TextEx>
							</TouchableOpacity>
						</View>

						<TextEx style={{bottom: 20, position: 'absolute', fontSize: 12, color: '#999'}}>
							Copyright@2019 Onioncall Inc版权所有
						</TextEx>

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

