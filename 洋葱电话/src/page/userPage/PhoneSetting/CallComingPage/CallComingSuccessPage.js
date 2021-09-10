'use strict';
import React, {Fragment, Component} from 'react';
import {
	StyleSheet,
	StatusBar,
	Dimensions,
	Image, ScrollView, View, Text, TextInput, TouchableOpacity, Keyboard, ImageBackground,
} from 'react-native';

import {inject, observer} from "mobx-react";
import SafeView from "../../../../components/SafeView";
import Button from "../../../../components/Button";
import TextEx from "../../../../components/TextEx";
import {strings} from "../../../../../locales";
import BaseComponents from "../../../../BaseComponents";
import Icon from "../../../../value/Svg";

const {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
export default class CallComingSuccessPage extends BaseComponents {

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;

		this.phone = this.navigation.getParam("phone");
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	render() {

		return (
			<Fragment>
				<ImageBackground
					resizeMode={'cover'}
					overlayColor={'white'}
					source={require('../../../../assets/newimg/png/bg/bglogin/bg_login_input_img.png')}
					style={{width: width, height: height, backgroundColor: 'transparent'}}>
					<StatusBar barStyle="dark-content"/>
					<SafeView>
						<Fragment>
							<TouchableOpacity activeOpacity={1}
											  style={{flex: 1}}
											  onPress={() => {
												  Keyboard.dismiss()
											  }}>
								<Fragment>
									<Image
										style={{width: 87, height: 93, marginTop: 70, alignSelf: 'center'}}
										source={require('../../../../assets/newimg/png/login/logo.png')}
									/>
									<View style={{justifyContent: 'center', alignSelf: 'center'}}>
										<View style={{
											height: 10, backgroundColor: "#FFE998",
											position: 'absolute', bottom: 0, width: 50, alignSelf: 'center'
										}}/>
										<TextEx style={{
											fontSize: 24,
											color: '#4A90E2',
											alignSelf: 'center',
											marginTop: 20,
											lineHeight: 33,
											fontWeight: '600'
										}}>
											来电显示绑定成功
										</TextEx>
									</View>

									<View style={{justifyContent: 'center', alignSelf: 'center'}}>
										<Icon icon={'calltransfer_succes'} size={93} color={'#4A90E2'}
											  style={{marginTop: 35}}/>
									</View>

									<TextEx style={{
										fontSize: 18,
										color: "#535353",
										lineHeight: 25,
										textAlign: "center",
										marginVertical: 14
									}}>
										{this.phone}
									</TextEx>

									<View style={{flexDirection: 'row', flex: 1, marginTop: 33, marginHorizontal: 28}}>
										<Button
											style={[styles.downBtn_no, {flex: 1}]}
											onPress={() => {
												this.navigation.pop(3)
											}}>
											<Text style={{
												color: '#FFF',
												fontSize: 16,
												alignSelf: 'center'
											}}> {strings('PasswordSuccess.finish')} </Text>
										</Button>
									</View>

								</Fragment>
							</TouchableOpacity>
						</Fragment>
					</SafeView>

				</ImageBackground>
			</Fragment>
		)
	}
}

const styles = StyleSheet.create({
	fk: {
		flexDirection: 'row',
		lineHeight: 50,
		height: 50,
		alignItems: 'center',
		width: 100
	},
	input: {
		fontSize: 14,
		color: '#333',
		fontWeight: '300',
		alignSelf: 'center'
	},
	input_placeholder: {
		paddingVertical: 0,
		fontSize: 14,
		fontWeight: '300',
		color: '#999',
		alignSelf: 'center',
		textAlign: 'center',
		flex: 1,
	},
	inputDown: {
		width: 16,
		height: 16,
	},
	downBtn_no: {
		backgroundColor: '#4A90E2',
		padding: 12,
		paddingLeft: 20,
		paddingRight: 20,
		borderRadius: 24,
		height: 47,
		marginLeft: 8,
	},
});

