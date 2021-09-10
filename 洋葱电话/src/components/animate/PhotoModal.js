'use strict';

import React, {Fragment} from "react";
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	View,
	Dimensions, StatusBar, TouchableOpacity, Modal, Image
} from "react-native";
import {inject, observer} from "mobx-react";
import {observable} from "mobx";
import SafeView from "../SafeView";
import CameraRoll from "@react-native-community/cameraroll";

import {AnimatedCacheImage, CacheImage} from "react-native-rn-cacheimage";
import { createImageProgress } from 'react-native-image-progress';
import {connectActionSheet} from "@expo/react-native-action-sheet";

import ProgressImage from 'react-native-image-progress';
import ProgressBar from 'react-native-progress/Bar';
import Circle from "react-native-progress/Circle";


const ShowImage = createImageProgress(CacheImage);
import CacheImageView from '../CacheImageView'

let sc_width = Dimensions.get('window').width;
let sc_height = Dimensions.get('window').height;

@inject('global', 'store', 'download')
@observer
class PhotoModal extends React.Component {

	@observable
	smallUrl = '';
	@observable
	bigUrl = '';
	@observable
	modalImageWidth = sc_width;
	@observable
	modalImageHeight = sc_width;


	constructor(props) {
		super(props);
		let {global} = props;
		this.navigation = props.navigation;
		global.photoRef = this;

		this.global = props.global;
		this.store = props.store;
		this.download = props.download;

		this.smallUrl = this.navigation.getParam('small') || '';
		this.bigUrl = this.navigation.getParam('big') || '';

		this.showImage(this.smallUrl)
	}

	showImage(url) {
		Image.getSizeWithHeaders(url, {}, (width, height)=>{
			this.modalImageHeight = sc_width/width * height;
		});
	}

	showImageLongPress(url) {
		console.log(url)
		const options = ['保持图片到本地相册', '取消'];
		const cancelButtonIndex = 1;
		this.props.showActionSheetWithOptions({
				options,
				cancelButtonIndex,
			},
			async buttonIndex => {

				switch (buttonIndex) {
					case 0: {
						try {
							this.global.showLoading();
							let {taskId, filePath} = await this.download.getFileWithUrl(url);
							if (filePath){
								url = filePath;
								console.log(filePath);
							}
							await CameraRoll.saveToCameraRoll(url);
							this.global.dismissLoading();
							this.global.presentMessage('保存成功');
						} catch (e) {
							console.log(e);
							this.global.dismissLoading();
							this.global.presentMessage('保存失败');
						}
						break;
					}
				}
			},
		);
	}



	render() {
		return (
			<Fragment>
				<StatusBar barStyle="light-content"/>
				<SafeView style={{backgroundColor: '#000', flex: 1}}>
					<View style={styles.showImageStyle}>
						<TouchableOpacity style={{width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center'}}
										  activeOpacity={1}
										  onLongPress={() => this.showImageLongPress(this.bigUrl)}
										  onPress={() => {this.navigation.pop()}}>

							{/*<CacheImage*/}
							{/*	source={{ uri: this.bigUrl}}*/}
							{/*	defaultSource={{ uri: this.smallUrl}}*/}
							{/*	style={{*/}
							{/*		width: this.modalImageWidth,*/}
							{/*		height: this.modalImageHeight,*/}
							{/*	}}*/}
							{/*/>*/}

							{/*<ProgressImage*/}
							{/*	source={{ uri: this.smallUrl }}*/}
							{/*	indicator={Circle}*/}
							{/*	indicatorProps={{*/}
							{/*		size: 80,*/}
							{/*		borderWidth: 0,*/}
							{/*		color: 'rgba(150, 150, 150, 1)',*/}
							{/*		unfilledColor: 'rgba(200, 200, 200, 0.2)'*/}
							{/*	}}*/}
							{/*	style={{*/}
							{/*		width: this.modalImageWidth,*/}
							{/*		height: this.modalImageHeight,*/}
							{/*	}}*/}
							{/*/>*/}

							<CacheImageView smallUrl={this.smallUrl}
											bigUrl={this.bigUrl}
											style={{
												width: this.modalImageWidth,
												height: this.modalImageHeight,
											}}/>

						</TouchableOpacity>
					</View>
				</SafeView>
			</Fragment>
		)
	}
}

const styles = StyleSheet.create({
	showImageStyle: {
		backgroundColor: '#000',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
});

export default connectActionSheet(PhotoModal)
