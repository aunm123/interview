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
	Image, Alert, Clipboard, TouchableWithoutFeedback,
	LayoutAnimation,
} from 'react-native';
import {AnimatedCacheImage, CacheImage} from "react-native-rn-cacheimage";
import Util from "../../global/Util";
import moment from "moment";
import AppStyle from "../../Style";
import Button from "../Button";

import {createImageProgress} from 'react-native-image-progress';
import {Bar} from "react-native-progress";
import {observable, toJS} from "mobx";
import {inject, observer} from "mobx-react";
import ProgressCircle from "../animate/ProgressCircle";
import PhotoService from "../../service/PhotoService";
import PhotoDao from "../../dao/PhotoDao";
import {UploadList, UploadTask} from '../../global/UploadList'
import MessageService from "../../service/MessageService";
import HistoryDao from "../../dao/HistoryDao";
import TextEx from "../TextEx";
import AutoSave from "../../TModal/AutoSave";
import PopoverTooltip from "../popoverTooltip";
import CameraRoll from "@react-native-community/cameraroll";
import {strings} from "../../../locales";
import Icon from "../../value/Svg";

const ShowImage = createImageProgress(CacheImage);

var {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
export default class PhotoRow extends Component {

	@observable
	modalImageHeight = 304;

	@observable
	imageData;
	@observable
	tempState;

	@observable
	uploadProgress = 0;
	@observable
	uploadFinish = false;


	@AutoSave
	PhotoService: PhotoService;
	@AutoSave
	UploadList: UploadList;
	@AutoSave
	MessageService: MessageService;

	uploadTask: UploadTask;

	// @observable
	rowHeight = null;
	@observable
	needRemove = false;
	// 1.输入模式 2.选择模式
	@observable
	mode = 1;
	@observable
	hasSelect = false;

	constructor(props) {
		super(props);

		this.store = props.store;
		this.global = props.global;

		this.data = props.data || {};

		let phone = '';
		let isLeft = false;
		if (this.data.fromphone == 'me') {
			phone = this.data.tophone;
			isLeft = false;
		} else {
			phone = this.data.fromphone;
			isLeft = true;
		}
		let content = JSON.parse(this.data.content);

		this.date = this.data.date;			// 日期
		this.phone = phone;				// 电话
		this.isLeft = isLeft;			// 是否为左边
		this.tempState = this.data.state;	// 发送状态
		this.photoid = content.photoid;	// 图片ID
		this.taskid = content.taskid;		// 图片下载线程ID
		this.messageid = this.data.id; // messageID
		this.mode = props.mode;

		this.modalImageHeight = 171 / content.width * content.height;
		this.imageData = content;
		this.rowHeight = new Animated.Value(this.modalImageHeight + 45.5);

		this.renewMessageList = props.renewMessageList;
		this.phoneClick = props.onPhotoClick;
		this.rowLongPress = props.rowLongPress || (() => {
		});

		this.uploadTask = this.UploadList.getTaskWithId(this.taskid);
		if (this.uploadTask) {
			this.uploadTask.watchProgress((progress) => {
				if (progress >= 1 || this.uploadFinish) {
					this.uploadTask.stopWatchProgress();
					return;
				}
				this.uploadProgress = progress;
			});
			this.uploadTask.setFinishBlock(()=>{
				this.updateState().then()
			});
			this.uploadFinish = false;
		} else {
			this.uploadFinish = true;
		}

		this.PhotoService.getPhotoById(this.photoid)
			.then((dataS: PhotoDao) => {
				if (!this.uploadTask && this.tempState != 2 && this.data.type != 12) {
					// 更新信息状态为不成功
					this.MessageService.UpdateMessageStateWithContent({
						state: 1,
						content: JSON.stringify({photoid: this.photoid}),
						id: this.messageid
					}).then(() => this.renewMessageList())
				}
			})
	}

	shouldComponentUpdate(nextProps, nextState, nextContext): boolean {
		if (this.mode != nextProps.mode) {
			this.mode = nextProps.mode;
			if (this.mode == 1) {
				this.hasSelect = false;
			}
		}
		return false;
	}

	componentWillUnmount(): void {
		if (this.uploadTask){
			this.uploadTask.stopWatchProgress();
			this.uploadTask.stopFinishBlock();
		}
	}

	async updateState() {
		let res: HistoryDao = await this.MessageService.getMessageHistoryById(this.messageid);
		this.tempState = res.state;
		let content = JSON.parse(res.content);
		let uploadTask = this.UploadList.getTaskWithId(content.taskid);
		if (uploadTask) {
			this.uploadFinish = false;
		} else {
			this.uploadFinish = true;
		}
	}

	stopUploading() {
		Alert.alert('是否确定取消上传', '', [
			{
				text: '确定', onPress: () => {
					try {
						this.uploadTask.stopUpload();
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

	imageLoading() {
		try {
			this.phoneClick({small: this.imageData.small_url, big: this.imageData.big_url})
		}catch (e) {}
	}

	retryBtnPress() {
		Alert.alert('是否确定重发这条信息', '', [
			{
				text: '确定', onPress: () => {
					this.props.retryBtnPress();
				}
			},
			{
				text: '取消', onPress: () => {
				}
			},
		], {cancelable: false});
	}

	renderSelectBtn() {
		let sty = this.isLeft ? {marginRight: 12} : {marginLeft: 12};
		return (
			<View style={[{maxHeight: '100%', alignItems: 'center', justifyContent: 'center'}, sty]}>
				<Fragment>
					{
						this.hasSelect ?
							<Icon icon={'call_icon_chose24_select'} size={25} color={'#4A90E2'}/> :
							<Icon icon={'call_icon_chose24_normal'} size={25} color={'#4A90E2'}/>
					}
				</Fragment>
			</View>
		)
	}

	selectSelect() {
		try {
			this.hasSelect = !this.hasSelect;
			this.props.selectAction(this.hasSelect, this);
		} catch (e) {
		}
	}

	imageClick() {
		if (this.mode == 2) {
			this.selectSelect()
		} else {
			if (this.uploadFinish) {
				this.imageLoading()
			} else {
				this.stopUploading();
			}
		}
	}

	renderMeumBtn(label, imgSource) {

		let moreView = label == "更多" ? (
			<View style={{width: '100%', height: 4, backgroundColor: '#E1E1E1'}} />
		) : null;

		return (
			<Fragment>
				{moreView}
				<View style={styles.meumRow}>
					<TextEx style={{lineHeight: 20, flex: 1}}>{label}</TextEx>
					<Image
						style={{width: 18, height: 18}}
						source={imgSource}
					/>
				</View>
			</Fragment>
		)
	}

	removeItem() {
		this.needRemove = true;
		Animated.timing(this.rowHeight, {
			toValue: 0, // 目标值
			duration: 250, // 动画时间
			easing: Easing.linear, // 缓动函数
		}).start(() => {
			// 延迟删除，避免出现闪动
			setTimeout(()=>{
				try {
					this.props.removeItem();
				} catch (e) {}
			}, 200)
		});
	}

	renderImage() {

		if (!this.imageData) return null;

		let tempView = null;
		if (!this.uploadFinish) {
			tempView = (
				<View style={{
					position: "absolute",
					width: '100%',
					height: '100%',
					justifyContent: 'center',
					alignItems: 'center'
				}}>
					<View style={styles.cirStyle}>
						<ProgressCircle
							value={this.uploadProgress}
							size={30}
							thickness={2}
							color="#FFF"
							animationMethod="timing"
							animationConfig={{speed: 4}}
						/>
						<Image
							style={{width: 16, height: 16, position: 'absolute', margin: 11}}
							source={require('../../assets/img/util/ic_close_white.png')}
						/>
					</View>

				</View>
			)
		}

		let leftBtn = null;
		let rightBtn = null;

		let selectBtn = this.renderSelectBtn();

		if (this.isLeft) {
			leftBtn = this.mode == 2 ? selectBtn : null;
		} else {
			rightBtn = this.mode == 2 ? selectBtn : null;
		}

		return (
			<Fragment>
				{leftBtn}
				<PopoverTooltip
					ref='tooltip1'
					buttonComponent={
						<Button activeOpacity={this.mode == 2 ? 1 : 0.85}
								onPress={() => { this.imageClick() }}
								onLongPress={() => {
									if (this.mode == 1) {
										this.refs['tooltip1'].toggle();
									}
								}}>
							<Image
								resizeMode={'contain'}
								source={{uri: this.imageData.small_url}}
								style={{minHeight: this.modalImageHeight, width: 171, height: this.modalImageHeight, alignSelf: 'center', backgroundColor: 'black',
									borderRadius: 4}}/>
							{tempView}
						</Button>
					}
					items={[
						{
							label: () => {
								return this.renderMeumBtn('保存到本地', require('../../assets/newimg/meum/more.png'))
							},
							onPress: () => {
								this.global.showLoading();
								let promise = CameraRoll.saveToCameraRoll(this.imageData.big_url);
								promise.then((result) => {
									this.global.dismissLoading();
									this.global.presentMessage(strings('messagePage.save_success'));
								}).catch((error) => {
									this.global.dismissLoading();
									this.global.presentMessage(strings('messagePage.save_faile'));
								});
							}
						},
						{
							label: () => {
								return this.renderMeumBtn('转发', require('../../assets/newimg/meum/zhuanfa.png'))
							},
							onPress: () => {
								try {
									this.props.forword();
								} catch (e) {}
							}
						},
						{
							label: () => {
								return this.renderMeumBtn('删除', require('../../assets/newimg/meum/iconfontshanchu5.png'))
							},
							onPress: () => {
								this.removeItem();
							}
						},
						{
							label: () => {
								return this.renderMeumBtn('更多', require('../../assets/newimg/meum/more.png'))
							},
							onPress: () => {
								try {
									this.props.selectModel()
								} catch (e) {
								}

							}
						}
					]}
				/>
				{rightBtn}
			</Fragment>
		)

	}

	render() {

		let {country_no, phone_no} = Util.fixNumber(this.phone);
		let date = this.date ? moment(this.date).format('HH:mm') : '';

		let retryBtn = null;
		let stateMessage = '';
		let color = 'blue';
		if (this.tempState == 0) {
			stateMessage = '发送中';
			color = 'blue';
		} else if (this.tempState == 1) {
			stateMessage = '';
			retryBtn = (
				<Button style={{height: this.modalImageHeight, justifyContent: 'center'}} onPress={() => this.retryBtnPress()}>
					<Image
						style={{width: 20, height: 20, marginBottom: 2}}
						source={require('../../assets/img/util/ic_error_outline.png')}
					/>
					<TextEx style={{fontSize: 10, color: '#FF001F'}}>重试</TextEx>
				</Button>)
		} else if (this.tempState == 2) {
			stateMessage = ''
		}

		let flex = (
			<View style={{padding: 10, flex: 1, alignItems: this.isLeft ? "flex-start" : "flex-end"}}>
				{stateMessage.length > 0 ? (
					<TextEx style={{color: color, lineHeight: this.modalImageHeight}}>{stateMessage}</TextEx>) : null}
				{retryBtn}
			</View>
		)

		let flexLeft = null;
		let flexRight = null;

		if (this.isLeft) {
			flexRight = flex;
		} else {
			flexLeft = flex;
		}

		let neStyle = {};
		if (this.needRemove) {
			let opacityRemove = this.rowHeight.interpolate({
				inputRange: [0, this.rowHeight._value],
				outputRange: [-0.2, 1]
			});
			neStyle = {height: this.rowHeight, opacity: opacityRemove};
		}

		return (
			<TouchableWithoutFeedback onPress={() => {
				if (this.mode == 2) {
					this.selectSelect()
				}
			}}>
				<Animated.View style={[neStyle, {overflow: 'hidden'}]}>
					<View style={[styles.dateView]}>
						{flexLeft}
						<View style={{alignSelf: this.isLeft ? "flex-start" : "flex-end"}}>
							<View style={[this.isLeft ? styles.left : styles.right, AppStyle.row]}>
								{this.renderImage()}
							</View>
							<View style={[AppStyle.row]}>
								<TextEx style={[this.isLeft ? styles.ldateText : styles.rdateText,]}>
									{this.isLeft?'来自':'发给'} +{country_no} {phone_no}
								</TextEx>
								<View style={{flex: 1}}/>
								<TextEx style={[this.isLeft ? styles.ldateText : styles.rdateText, {
									marginLeft: 0,
									marginRight: 0,
									textAlign: 'right',
									minWidth: 33
								}]}>{date}</TextEx>
							</View>
						</View>
						{flexRight}

					</View>
				</Animated.View>
			</TouchableWithoutFeedback>


		);
	}
}

const styles = StyleSheet.create({
	meumRow: {
		width: width * 0.55,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 15,
		paddingVertical: 10
	},
	cirStyle: {
		backgroundColor: 'rgba(0,0,0,0.6)',
		borderRadius: 40,
		padding: 4,
	},
	ldateTitle: {
		color: "#FFF",
		fontSize: 14,
		paddingHorizontal: 5,
		paddingVertical: 3,
	},
	rdateTitle: {
		color: "#333",
		fontSize: 14,
		paddingHorizontal: 5,
		paddingVertical: 3,
	},
	dateView: {
		paddingHorizontal: 12,
		backgroundColor: "#FFF",
		justifyContent: "center",
		marginVertical: 6,
		flexDirection: 'row',
	},
	left: {
		backgroundColor: "#999",
		borderTopLeftRadius: 0,
		overflow: "hidden",
		// borderBottomLeftRadius: 8,
		// borderTopRightRadius: 8,
		// borderBottomRightRadius: 8,
		padding: 8
	},
	right: {
		backgroundColor: "transparent",
		borderTopLeftRadius: 8,
		overflow: "hidden",
		// borderBottomLeftRadius: 8,
		// borderTopRightRadius: 0,
		// borderBottomRightRadius: 8,
		padding: 8
	},
	ldateText: {
		color: "#999",
		fontSize: 12,
		alignSelf: "flex-start",
		marginTop: 3,
		marginRight: 20
	},
	rdateText: {
		color: "#999",
		fontSize: 12,
		alignSelf: "flex-end",
		marginTop: 3,
		marginRight: 20
	}
});

