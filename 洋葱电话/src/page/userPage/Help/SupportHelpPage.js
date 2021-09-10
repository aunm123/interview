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
	ImageBackground, SectionList, FlatList, Switch, TextInput
} from 'react-native';
import {inject, observer} from "mobx-react";
import SafeView from "../../../components/SafeView";
import NavBar from "../../../components/NavBar";
import Button from "../../../components/Button";
import {strings} from "../../../../locales";
import AppStyle from "../../../Style";
import TextEx from "../../../components/TextEx";
import {observable, toJS} from "mobx";
import Global from "../../../mobx/Global";
import UpLoadImageView from "../../../components/UpLoadImageView";
import AutoSave from "../../../TModal/AutoSave";
import {UploadList} from "../../../global/UploadList";
import SyanImagePicker from "react-native-syan-image-picker";
import Req from "../../../global/req";
import URLS from "../../../value/URLS";
import Util from "../../../global/Util";
import BaseComponents from "../../../BaseComponents";

var {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
export default class SupportHelpPage extends BaseComponents {

	@observable
	text = '';
	@observable
	imageList = [];

	resultImageList = {};
	@AutoSave
	uploadList: UploadList;

	global: Global;

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;

	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	onChangeText(text) {
		this.text = text;
	}

	sendSupport() {
		// Req.post();

		const options = {
			imageCount: 6,          // 最大选择图片数目，默认6
			isCamera: true,         // 是否允许用户在内部拍照，默认true
			isCrop: false,          // 是否允许裁剪，默认false
			circleCropRadius: 150, // 圆形裁剪半径，默认屏幕宽度一半
			isGif: false,           // 是否允许选择GIF，默认false，暂无回调GIF数据
			showCropCircle: false,  // 是否显示圆形裁剪区域，默认false
			showCropFrame: true,    // 是否显示裁剪区域，默认true
			showCropGrid: false     // 是否隐藏裁剪区域网格，默认false
		};
		SyanImagePicker.asyncShowImagePicker(options)
			.then(photos => {
				console.log('选择成功', photos);
				// 选择成功
				for (let item of photos) {
					let params = {type: 'question'};
					let {taskid, task} = this.uploadList.createUploadPhotoCustomerTask(params, {
						uri: item.uri,
						type: 'image/png',
						name: 'file.png'
					});
					this.uploadList.startUploadPhotoTaskCustomer(task);

					this.imageList = [{
						taskid: taskid,
						uri: item.uri
					}, ...this.imageList];

					this.resultImageList[taskid] = {finish: false, url: undefined}

				}

			})
			.catch((e) => {
				console.log(e)
			})

			.catch(err => {
				// 取消选择，err.message为"取消"
			})

	}

	render() {

		let imageListRef = this.imageList.map((item, index) => {
			return (
				<Fragment key={JSON.stringify(item)}>
					<UpLoadImageView style={{
						width: 80,
						height: 140,
						borderRadius: 8,
						backgroundColor: '#E6E6E6',
						justifyContent: 'center',
						alignItems: 'center',
						marginRight: 7,
					}}
									 uri={item.uri}
									 taskid={item.taskid}
									 pFinish={(res) => {
										 this.resultImageList[item.taskid] = {finish: true, url: res.img_url}
										 this.imageList=[...this.imageList];
									 }}
									 cancelUpload={()=>{
										 this.imageList.splice(index, 1)
										 delete this.resultImageList[item.taskid]
									 }}
					>
						<Button style={{position: 'absolute', top: 5, right: 5,}} onPress={() => {
							this.imageList.splice(index, 1)
							delete this.resultImageList[item.taskid]
						}}>
							<Image
								style={{width: 16, height: 16}}
								source={require('../../../assets/newimg/png/icon/common/common_icon_delete_16.png')}
							/>
						</Button>
					</UpLoadImageView>
				</Fragment>
			)
		})

		let buttonUseFul = false;
		if (this.imageList.length > 0 && this.text.length > 0) {
			buttonUseFul = true;
			Object.getOwnPropertyNames(this.resultImageList).forEach((key) => {
				if (key && key != 'undefined') {
					let item = this.resultImageList[key];
					buttonUseFul = buttonUseFul && item.finish
				}
			});
		} else {
			buttonUseFul = false;
		}

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={strings('SupportHelpPage.title')}
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

					<ScrollView
						keyboardDismissMode={'on-drag'}>
						{/*name*/}
						<View style={[AppStyle.row, AppStyle.hcenter, styles.rowline]}>
							{this.global.avatarIcon(40, {marginRight: 12})}
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('SupportHelpPage.hello')} {Util.findstring(this.global.userData.nickname, this.global.userData.phone_no)}
							</TextEx>
						</View>
						<View>
							<TextInput
								style={{
									flex: 1,
									height: 161,
									backgroundColor: '#F5F5F5',
									marginHorizontal: 16,
									borderRadius: 7,
									paddingHorizontal: 12,
									paddingVertical: 30,
									fontSize: 14,
									lineHeight: 20
								}}
								multiline
								numberOfLines={4}
								onChangeText={text => this.onChangeText(text)}
								value={this.text}
								maxLength={200}
								placeholder={strings('SupportHelpPage.support_placeholder')}
							/>
							<TextEx style={{position: 'absolute', right: 30, bottom: 12, color: '#999'}}>
								{this.text.length}/200
							</TextEx>
						</View>

						<ScrollView
							keyboardDismissMode={'on-drag'}
							contentContainerStyle={{padding: 16}}
							horizontal={true}>
							{imageListRef}
							<Button style={styles.imageBtn} onPress={() => {
								this.sendSupport()
							}}>
								<Image
									style={{width: 24, height: 24}}
									source={require('../../../assets/newimg/png/icon/common/common_icon_addimg.png')}
								/>
							</Button>
						</ScrollView>

						<TouchableOpacity style={{
							backgroundColor: buttonUseFul ? '#4A90E2' : '#999',
							minHeight: 44,
							borderRadius: 22,
							marginHorizontal: 28,
							justifyContent: 'center',
							alignItems: 'center'
						}} disabled={!buttonUseFul} onPress={async () => {
							this.global.showLoading();
							let imgs = [];
							Object.getOwnPropertyNames(this.resultImageList).forEach((key) => {
								if (key && key != 'undefined') {
									let item = this.resultImageList[key];
									if (item.finish){
										imgs.push(item.url)
									}
								}
							});
							await Req.post(URLS.SUPPORT_ERROR, {content: this.text, imgs: imgs});
							this.global.dismissLoading();
							this.global.presentMessage('提交成功');
							this.text = "";
							this.context = [];
							this.imageList = [];
							this.resultImageList = {};
						}}>
							<TextEx style={{fontSize: 16, color: '#fff', lineHeight: 44, fontWeight: '400'}}>
								发送
							</TextEx>
						</TouchableOpacity>

					</ScrollView>
				</SafeView>

			</Fragment>
		)
	}
}

const styles = StyleSheet.create({
	imageBtn: {
		width: 80,
		height: 140,
		borderRadius: 8,
		backgroundColor: '#E6E6E6',
		justifyContent: 'center',
		alignItems: 'center'
	},
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

