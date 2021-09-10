'use strict';
import React, {Fragment, Component} from 'react';
import {
	Text, View,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	Animated,
	Dimensions,
	Easing,
	Image, Alert,
} from 'react-native';
import {AnimatedCacheImage, CacheImage} from "react-native-rn-cacheimage";

import {createImageProgress} from 'react-native-image-progress';
import {observable, toJS} from "mobx";
import {inject, observer} from "mobx-react";
import {UploadList, UploadTask, UpLoadTaskCustomer} from "../global/UploadList";
import ProgressCircle from "./animate/ProgressCircle";
import Button from "./Button";
import AutoSave from "../TModal/AutoSave";
import BaseComponents from "../BaseComponents";

const ShowImage = createImageProgress(CacheImage);

var {height, width} = Dimensions.get('window');

@inject('global')
@observer
export default class UpLoadImageView extends BaseComponents {


	@observable
	uri;

	@observable
	uploadProgress = 0;
	@observable
	uploadFinish = false;

	@AutoSave
	UploadList: UploadList;

	uploadTask: UpLoadTaskCustomer;

	constructor(props) {
		super(props);
		this.global = props.global;
		this.taskid = props.taskid;		// 图片下载线程ID
		this.uri = props.uri;

		this.uploadTask = this.UploadList.getTaskWithId(this.taskid);
		if (this.uploadTask) {
			this.uploadTask.watchProgress((progress) => {
				if (progress >= 1 || this.uploadFinish) {
					this.uploadTask.stopWatchProgress();
					return;
				}
				this.uploadProgress = progress;
			});
			this.uploadTask.setFinishBlock((res)=>{
				if (res) {
					this.uploadFinish = true;
					if (this.props.pFinish){
						this.props.pFinish(res);
					}
				} else {
					this.uploadFinish = false;
				}
			});
			this.uploadFinish = false;
		} else {
			this.uploadFinish = true;
		}

	}

	componentWillUnmount(): void {
		super.componentWillUnmount();

		if (this.uploadTask){
			this.uploadTask.stopWatchProgress();
			this.uploadTask.stopFinishBlock();
		}
	}

	stopUploading() {
		Alert.alert('是否确定取消上传', '', [
			{
				text: '确定', onPress: () => {
					try {
						this.uploadTask.stopUpload();
						if (this.props.cancelUpload){
							this.props.cancelUpload();
						}
					} catch (e) {
					}
				}
			},
			{
				text: '取消', onPress: () => {
				}
			},
		], {cancelable: false});
	}

	imageClick() {
		if (this.uploadFinish) {
			// this.imageLoading()
		} else {
			this.stopUploading();
		}
	}


	render() {

		if (!this.uri) return null;

		let tempView = null;
		if (!this.uploadFinish) {
			tempView = (
				<View style={{
					position: "absolute",
					width: '100%',
					height: '100%',
					justifyContent: 'center',
					alignItems: 'center',
					zIndex: 99,
				}}>
					<View style={styles.cirStyle}>
						<ProgressCircle
							value={this.uploadProgress}
							size={18}
							thickness={2}
							color="#FFF"
							animationMethod="timing"
							animationConfig={{speed: 4}}
						/>
						<Image
							style={{width: 14, height: 14, position: 'absolute', margin: 6}}
							source={require('../assets/img/util/ic_close_white.png')}
						/>
					</View>

				</View>
			)
		}

		return (
			<Button onPress={() => { this.imageClick() }} style={[{...this.props.style}, {overflow: 'hidden'}]} >
				<Image
					resizeMode={'cover'}
					source={{uri: this.uri}}
					style={{width: '100%', height: '100%', alignSelf: 'center'}}/>
				{tempView}
				{this.uploadFinish?this.props.children:null}
			</Button>
		)
	}
}

const styles = StyleSheet.create({
	cirStyle: {
		backgroundColor: 'rgba(0,0,0,0.6)',
		borderRadius: 40,
		padding: 4,
	},
});

