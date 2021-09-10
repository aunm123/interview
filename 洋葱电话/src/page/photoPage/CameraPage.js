'use strict';
import React, {Fragment, Component} from 'react';
import {
	Text, View,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	Animated,
	Dimensions,
	Image, Alert, Platform,
} from 'react-native';
import {RNCamera} from 'react-native-camera';
import {strings} from "../../../locales";
import {inject, observer} from "mobx-react";
import Permissions from 'react-native-permissions'

import AppStyle, {font} from '../../Style';
import NavBar from "../../components/NavBar";
import Line from "../../components/Line";
import SafeView from "../../components/SafeView";
import Button from "../../components/Button";
import BaseComponents from "../../BaseComponents";

let {height, width} = Dimensions.get('window');

let line = 3;
let imageWith = (width - line * 3) / 4;


@inject('store', 'global')
@observer
export default class CameraPage extends BaseComponents {

	isTacking = false;

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.sendBlock = this.navigation.getParam('sendBlock') || (()=>{})

	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	componentDidMount() {
		if (Platform.OS == 'android'){
			Permissions.check(Permissions.PERMISSIONS.ANDROID.CAMERA, { type: 'always' }).then(permission => {
				if (permission !== Permissions.RESULTS.GRANTED) {
					// 拒绝
					// Alert.alert('访问摄像头权限没打开', '请在设置-隐私”选项中,允许访问您的摄像头', [{
					// 	text: '确定', onPress: () => {
					// 		this.navigation.pop();
					// 	}
					// },], {cancelable: false});
				}
			})
		} else {
			Permissions.check(Permissions.PERMISSIONS.IOS.CAMERA, { type: 'always' }).then(permission => {
				console.log(permission);
				if (permission !== Permissions.RESULTS.GRANTED) {
					// 拒绝
					Alert.alert(strings('CameraPage.permissions_title_ios'),
						strings('CameraPage.permissions_detail_ios'), [{
						text: strings('other.sure'), onPress: () => {
							this.navigation.pop();
						}
					},], {cancelable: false});
				}
			})
		}
	}

	takePicture = async function (camera) {
		if (this.isTacking) return ;
		this.isTacking = true;
		const options = {quality: 0.5, base64: true};
		const data = await camera.takePictureAsync(options);
		camera.pausePreview();

		Alert.alert(strings('CameraPage.sure_send'), '', [
			{
				text: strings('other.sure'), onPress: () => {
					this.navigation.pop();
					console.log(data);
					this.sendBlock({
						uri: data.uri,
						filename: 'camerafile.jpg',
						height: data.height,
						width: data.width,
					})
				}
			},
			{
				text: strings('other.cancel'), onPress: () => {
					camera.resumePreview();
					this.isTacking = false;
				}
			},
		], {cancelable: false});
	};

	render() {
		return (
			<Fragment>
				<StatusBar barStyle="light-content"/>
				<View style={{width: width, height: height}}>
					<View style={{position: 'absolute', left: 12, top: 32, zIndex: 12}}>
						<TouchableOpacity style={{padding: 6}} onPress={() => {
							this.navigation.pop()
						}}>
							<Image
								style={{width: 22, height: 22}}
								source={require('../../assets/img/util/ic_arrow_left_white.png')}
							/>
						</TouchableOpacity>
					</View>
					<View style={{flex: 1}}>
						<RNCamera
							ref={ref => {
								this.camera = ref;
							}}
							style={styles.preview}
							type={RNCamera.Constants.Type.back}
							flashMode={RNCamera.Constants.FlashMode.off}
						/>
					</View>

					<View style={{position: "absolute", bottom: 20, left: 0, right: 0, alignItems: 'center', justifyContent: 'center'}}>
						<Button onPress={() => {
							this.takePicture(this.camera);
						}}>
							<Image
								style={{width: 60, height: 60}}
								source={require('../../assets/img/util/ic_image_all.png')}
							/>
						</Button>
					</View>
				</View>
			</Fragment>
		)
	}
}

const styles = StyleSheet.create({
	navbar_title: {
		lineHeight: 48,
		fontSize: 17,
		textAlign: 'center',
	},
	preview: {
		flex: 1,
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
});
