'use strict';
import React, {Fragment, Component} from 'react';
import {
	Text, View,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	Animated,
	Dimensions,
	Image, ScrollView, Clipboard,
	ImageBackground, SectionList, FlatList, TextInput
} from 'react-native';
import {strings} from "../../../locales";
import {inject, observer} from "mobx-react";
import AppStyle, {font} from '../../Style';
import NavBar from "../../components/NavBar";
import Line from "../../components/Line";
import {connectActionSheet} from "@expo/react-native-action-sheet";
import Util from "../../global/Util";
import Button from "../../components/Button";
import SafeView from "../../components/SafeView";
import TextEx from "../../components/TextEx";
import {Card} from "react-native-shadow-cards";
import {observable} from "mobx";
import SyanImagePicker from 'react-native-syan-image-picker';
import Global from "../../mobx/Global";
import Req from "../../global/req";
import PhotoDao from "../../dao/PhotoDao";
import URLS from "../../value/URLS";
import Icon from "../../value/Svg";
import BaseComponents from "../../BaseComponents";

var {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
class UserDetailPage extends BaseComponents {

	@observable
	userEdit = false;
	@observable
	nickname = '';

	global: Global;

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;

		this.state = {
			...this.global.userData
		};

	}

	onStart() {
		super.onStart();

		this.setState({
			...this.global.userData
		});
		this.nickname = Util.findstring(this.global.userData.nickname, this.global.userData.phone_no);
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	actionSheetShow(item) {
		const options = [
			strings('UserDetailPage.copy'),
			strings('UserDetailPage.edit'),
			strings('other.cancel')];
		const cancelButtonIndex = 2;

		this.props.showActionSheetWithOptions({
				title: item.title,
				options,
				cancelButtonIndex,
			},
			buttonIndex => {
				switch (buttonIndex) {
					case 0: {
						Clipboard.setString(item.date);
						this.props.global.presentMessage(strings('UserDetailPage.copySuccess'));
						break;
					}
					case 1: {
						this.navigation.push('UserEditPage');
						break;
					}
				}
			},
		);
	}

	selectImageBtnPress() {

		const options = {
			imageCount: 1,          // 最大选择图片数目，默认6
			isCamera: true,         // 是否允许用户在内部拍照，默认true
			isCrop: true,          // 是否允许裁剪，默认false
			circleCropRadius: 150, // 圆形裁剪半径，默认屏幕宽度一半
			isGif: false,           // 是否允许选择GIF，默认false，暂无回调GIF数据
			showCropCircle: true,  // 是否显示圆形裁剪区域，默认false
			showCropFrame: true,    // 是否显示裁剪区域，默认true
			showCropGrid: false     // 是否隐藏裁剪区域网格，默认false
		};
		SyanImagePicker.asyncShowImagePicker(options)
			.then(photos => {
				// 选择成功
				this.global.showLoading();

				try {
					let uri = photos[0].uri;
					console.log("选择成功", uri, photos[0].uri);
					let {xhr, formData} = Req.createXhrUpload(URLS.UPLOAD_PHOTO,
						{type: 'avatar'}, {
							uri: uri,
							type: 'image/jpeg',
							name: "cut.jpeg"
						},
						(cProgress) => {
							console.log(cProgress);

						}, async (res) => {
							console.log('上传成功', res);
							this.global.dismissLoading();

							let img_url = res.data.img_url;
							this.global.userData.avatar = img_url;

						}, async (error) => {
							console.log('上传失败', error)
							this.global.dismissLoading();

						});

					console.log(xhr, formData);
					xhr.send(formData);

				} catch (e) {
					console.log(e);
					this.global.dismissLoading();
				}


			})

			.catch(err => {
				// 取消选择，err.message为"取消"
			})
	}

	renderHeader() {
		let weizhi = Util.fitArrayWithString([this.state.city, this.state.province, this.state.country_name], '/');
		let birthday = this.state.birthday;

		return (
			<View style={{flex: 1}}>
				<View source={require('../../assets/newimg/png/personal/personalbg/personal_bg_img.png')}
					  style={[AppStyle.row, {paddingHorizontal: 12}]}>
					<Button style={{alignSelf: 'flex-start', paddingVertical: 7, zIndex: 99}}
							onPress={() => this.navigation.pop()}>
						<Image
							style={{width: 24, height: 24}}
							source={require('../../assets/img/util/ic_arrow_left_white.png')}
						/>
					</Button>
					<View style={{
						flex: 1,
						position: 'absolute',
						height: 38,
						justifyContent: 'center',
						alignItems: 'center',
						left: 0, right: 0
					}}>
						<TextEx style={{
							color: '#FFF',
							fontSize: 18,
							fontWeight: '500',
							lineHeight: 38,
						}}>{strings('UserDetailPage.title')}</TextEx>
					</View>
				</View>

				<View style={{width: '100%', marginTop: 47, paddingHorizontal: 16}}>
					{
						!this.userEdit ? (
							<Card style={[{
								padding: 12,
								borderRadius: 8,
								alignItems: 'center',
								width: '100%',
								paddingVertical: 21,
							}, AppStyle.row]} opacity={0.08}>
								{this.global.avatarIcon(40, styles.headerRow)}
								<TextEx style={styles.headerName}>{this.nickname}</TextEx>
								<TouchableOpacity style={{marginLeft: 8}} onPress={() => {
									this.userEdit = true
								}}>
									<Icon icon={'personal_icon_edit'} size={16} color={'#4A90E2'}/>
								</TouchableOpacity>
							</Card>
						) : (
							<Card style={[{
								padding: 12,
								borderRadius: 8,
								alignItems: 'center',
								width: '100%',
								paddingVertical: 21,
							}, AppStyle.row]} opacity={0.08}>
								<View>
									{this.global.avatarIcon(40, styles.headerRow)}
									<Button style={{
										backgroundColor: 'rgba(0,0,0,0.5)',
										justifyContent: 'center',
										alignItems: 'center',
										position: 'absolute',
										top: 0,
										left: 0,
										right: 0,
										bottom: 0,
										borderRadius: 28,
									}} onPress={() => {
										this.selectImageBtnPress()
									}}>
										<Image
											resizeMode={'contain'}
											style={{width: 25, height: 25}}
											source={require('../../assets/newimg/headedit.png')}
										/>
									</Button>
								</View>
								<View style={{flex: 1}}>
									<TextInput autoFocus={true} style={[
										styles.headerName, {
											textAlign: 'left', justifyContent: 'center', padding: 0, margin: 0,
											alignSelf: 'flex-start', width: '100%',
											flex: 1,
										}]}
											   onChangeText={(text) => {
												   this.nickname = text;
											   }}
											   value={this.nickname}/>
									<Line/>
								</View>

								<TouchableOpacity onPress={async () => {
									this.userEdit = false;
									await Req.post(URLS.EDIT_USER_DETAIL, {nickname: this.nickname})
									this.global.userData.nickname = this.nickname;
									this.global.presentMessage('修改成功')
								}}>
									<Icon icon={'personal_icon_edit_ok'} size={16} color={'#4A90E2'}/>
								</TouchableOpacity>

							</Card>
						)
					}
				</View>

				<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline, {marginTop: 8}]}
						onPress={() => {
							this.navigation.push('SharePage')
						}}>
					<Icon icon={'personal_icon_share'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
					<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
						{strings('UserDetailPage.share_person_detail')}
					</TextEx>
				</Button>

				<View style={{backgroundColor: '#F5F5F5', paddingHorizontal: 16}}>
					<TextEx style={{fontSize: 12, color: '#999', lineHeight: 30}}>
						{strings('UserDetailPage.person_detail')}
					</TextEx>
				</View>

				<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]}
						onPress={() => {
							this.actionSheetShow({
								title: strings('UserDetailPage.app_user_name'),
								date: this.global.userid
							})
						}}>

					<Icon icon={'personal_icon_name'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
					<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
						{strings('UserDetailPage.app_user_name')}
					</TextEx>
					<TextEx style={[{flex: 2, lineHeight: 24}, styles.rowDetail]}>
						{this.global.userid}
					</TextEx>
				</Button>
				<Line style={{marginLeft: 68}}/>

				<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]}
						onPress={() => {
							this.actionSheetShow({
								title: strings('UserDetailPage.address'),
								date: weizhi
							})
						}}>
					<Icon icon={'personal_icon_position'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
					<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
						{strings('UserDetailPage.address')}
					</TextEx>
					<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowDetail]}>
						{weizhi}
					</TextEx>
				</Button>
				<Line style={{marginLeft: 68}}/>

				<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]}
						onPress={() => {
							this.actionSheetShow({
								title: strings('UserDetailPage.birthday'),
								date: birthday
							})
						}}>
					<Icon icon={'personal_icon_birthday'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
					<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
						{strings('UserDetailPage.birthday')}
					</TextEx>
					<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowDetail]}>{birthday}</TextEx>
				</Button>
				<Line style={{marginLeft: 68}}/>

				<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]}
						onPress={() => {
							this.actionSheetShow({
								title: strings('UserDetailPage.register_phone'),
								date: '+12345678901234'
							})
						}}>
					<Icon icon={'personal_icon_phone'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
					<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
						{strings('UserDetailPage.register_phone')}
					</TextEx>
					<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowDetail]}>
						{Util.cutPhoneNum(this.state.phone_no, this.state.country_no)}
					</TextEx>
				</Button>
				<View style={{backgroundColor: '#F5F5F5', paddingHorizontal: 16}}>
					<TextEx style={{fontSize: 12, color: '#999', lineHeight: 30}}>
						{strings('UserDetailPage.other')}
					</TextEx>
				</View>

				<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]}>
					<Icon icon={'personal_icon_mode'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
					<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
						{strings('UserDetailPage.find_you')}
					</TextEx>
				</Button>
				<Line style={{marginLeft: 68}}/>

				<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]} onPress={()=>{
					this.navigation.push('HelpPage')
				}}>
					<Icon icon={'personal_icon_help'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
					<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
						{strings('UserDetailPage.help')}
					</TextEx>
				</Button>
				<Line style={{marginLeft: 68}}/>

			</View>
		)
	}

	render() {
		return (
			<Fragment>
				<StatusBar barStyle="light-content"/>
				<ScrollView contentContainerStyle={{paddingBottom: 64}} keyboardShouldPersistTaps={'handled'}>
					<ImageBackground source={require('../../assets/newimg/png/personal/personalbg/personal_bg_img.png')}
									 style={{width: width, height: 162, position: 'absolute', top: 0, left: 0}}/>
					<SafeView>
						{this.renderHeader()}
					</SafeView>

				</ScrollView>

			</Fragment>
		)
	}
}

const styles = StyleSheet.create({
	headerRow: {
		width: 56,
		height: 56,
		justifyContent: 'center',
		alignSelf: 'center',
		borderRadius: 28,
	},
	headerName: {
		fontSize: 17,
		color: '#333',
		fontWeight: '500',
		justifyContent: 'center',
		alignSelf: 'center',
		marginLeft: 12,
		lineHeight: 22,
		height: 22,
	},
	headerCode: {
		fontSize: 14,
		color: '#999',
		marginTop: 8
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
		fontSize: 14,
		color: '#999',
		lineHeight: 20,
		textAlign: 'right'
	}
});
export default connectActionSheet(UserDetailPage)
