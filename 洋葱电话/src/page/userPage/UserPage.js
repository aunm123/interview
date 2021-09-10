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
	ImageBackground, SectionList, FlatList
} from 'react-native';
import {strings} from "../../../locales";
import {inject, observer} from "mobx-react";


import AppStyle, {font} from '../../Style';
import NavBar from "../../components/NavBar";
import Line from "../../components/Line";
import URLS from "../../value/URLS";
import Req from "../../global/req";
import Util from "../../global/Util";
import Button from "../../components/Button";
import {observable, toJS} from "mobx";
import SafeView from "../../components/SafeView";
import TextEx from "../../components/TextEx";
import Icon from "../../value/Svg";
import TextExTitle from "../../components/TextExTitle";
import SyanImagePicker from "react-native-syan-image-picker";
import BaseComponents from "../../BaseComponents";
import CustomActionSheet from "../../components/CustomActionSheet";
import LoginActionSheet from "../../components/LoginActionSheet";

var {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
export default class UserPage extends BaseComponents {

	@observable
	onlineType = 0; //1：在线  2：离开 3：请勿打扰 4：隐身

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;

		this.onlineType = this.global.userData.online;
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	quite() {
		Alert.alert(
			strings('userPage.logout'),
			strings('userPage.is_logout'),
			[
				{
					text: strings('other.cancel'),
					onPress: () => console.log('Cancel Pressed'),
					style: 'cancel',
				},
				{
					text: strings('other.sure'), onPress: async () => {
						await Req.global.logout()
						await Req.store.logout()
						Req.global.nav.popToTop()

					}
				},
			],
			{cancelable: false},
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

	onlineAlert() {
		let name = this.global.userData.nickname.length > 0 ? this.global.userData.nickname : this.global.userData.phone_no;

		const actionOptioms = [
			'在线',
			'离开',
			'请勿打扰',
			'隐身',
			"取消"
		];

		this.global.modalRef.showModal((
			<LoginActionSheet  title={name}
							   options={actionOptioms}
							   click={async (index) => {
								   await Req.post(URLS.ON_LINE, {status: index + 1})
								   this.onlineType = index + 1;
								   this.global.userData.online = this.onlineType;
							   }}
							   cancelIndex={actionOptioms.length - 1}/>
		), 'bottom')
	}

	render() {

		let name = this.global.userData.nickname.length > 0 ? this.global.userData.nickname : this.global.userData.phone_no;
		let phone_no = this.global.userData.phone_no;
		let phone = Util.cutPhoneNum(this.global.userData.phone_no, this.global.userData.country_no);

		let {form_no, form_country} = this.global.rootPhone;
		let mainPhone = form_country.length > 0 ? '+' + form_country + ' ' + form_no : '';

		let online_title = "";
		let icon = null;
		switch (this.onlineType) {
			case 1: {
				icon = <Image
					style={{width: 8, height: 8}}
					source={require('../../assets/newimg/png/icon/common/common_icon_status_on12.png')}
				/>;
				online_title = "在线";
				break;
			}
			case 2: {
				icon = <Image
					style={{width: 8, height: 8}}
					source={require('../../assets/newimg/png/icon/common/common_icon_status_out12.png')}
				/>;
				online_title = "离开";
				break;
			}
			case 3: {
				icon = <Image
					style={{width: 8, height: 8}}
					source={require('../../assets/newimg/png/icon/common/common_icon_status_disturb12.png')}
				/>;
				online_title = "请勿打扰";
				break;
			}
			case 4: {
				icon = <Image
					style={{width: 8, height: 8}}
					source={require('../../assets/newimg/png/icon/common/common_icon_status_invisible12.png')}
				/>;
				online_title = "隐身";
				break;
			}
		}

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={strings('userPage.title')}
							bottom_line={true}
							leftRender={(
								<Button style={{paddingLeft: 6, paddingRight: 12}}
										onPress={() => this.navigation.pop()}>
									<Image
										style={{width: 22, height: 22}}
										source={require('../../assets/img/util/ic_close.png')}
									/>
								</Button>
							)}
							rightRender={(
								<Button style={{paddingRight: 6}} onPress={() => {
									this.quite()
								}}>
									<TextExTitle style={{fontSize: 16}}>
										{strings('userPage.logout')}
									</TextExTitle>
								</Button>
							)}
					/>
					<ScrollView>
						<View style={[AppStyle.row, styles.logoRow, {justifyContent: 'center', alignItems: 'center'}]}>
							<Button onPress={() => this.selectImageBtnPress()}>
								{this.global.avatarIcon(60, {marginRight: 12})}
							</Button>
							<View style={{justifyContent: 'center', alignItems: 'flex-start', flex: 1}}>
								<TextEx style={styles.name}>{name}</TextEx>
								<TextEx style={styles.phone}>{phone}</TextEx>
							</View>
							<Button style={[AppStyle.row,
								{
									borderWidth: 1,
									borderColor: '#e6e6e6',
									height: 28,
									justifyContent: 'center',
									alignItems: 'center',
									borderRadius: 14,
									paddingHorizontal: 10
								}]}
									onPress={() => {
										this.onlineAlert();
									}}>
								{icon}
								<TextEx style={{color: '#333', fontSize: 12, marginHorizontal: 4}}>
									{online_title}
								</TextEx>
								<Image
									style={{width: 16, height: 16}}
									source={require('../../assets/img/util/ic_arrow_down_hui.png')}
								/>
							</Button>
						</View>

						{/*洋葱币(余额)*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]}
								onPress={() => {
									this.navigation.push('BuyListPage')
								}}>
							<Image
								style={{width: 40, height: 40, marginRight: 12}}
								source={require('../../assets/newimg/png/icon/chat/chat_icon_onion_coin_40.png')}
							/>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('userPage.miss_money')}
							</TextEx>
							<View>
								<TextEx style={{fontSize: 14, color: '#4A90E2'}}>
									{(parseFloat(this.global.userData.balance)).toFixed(2)}
								</TextEx>
							</View>
						</Button>
						<Line style={{marginLeft: 68}}/>

						{/*洋葱电话*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]}
								onPress={() => this.navigation.push('PhoneList')}>
							<Image
								style={{width: 40, height: 40, marginRight: 12}}
								source={require('../../assets/newimg/png/icon/chat/chat_icon_onion_phone_40.png')}
							/>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('userPage.person_phone')}
								({this.global.userData.phonelist.length})
							</TextEx>
							<View>
								<TextEx style={{fontSize: 14, color: '#4A90E2'}}>
									{mainPhone}
								</TextEx>
							</View>

						</Button>

						<View style={{height: 20, backgroundColor: '#F5F5F5'}}/>

						{/*洋葱个人资料*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]}
								onPress={() => {
									this.navigation.push('UserDetailPage')
								}}>
							<Icon icon={'personal_icon_personal_data'} size={40} color={'#4A90E2'}
								  style={{marginRight: 12}}/>
							<View style={{flex: 1}}>
								<TextEx style={styles.rowTitle}>{strings('userPage.person_detail')}</TextEx>
								<TextEx style={styles.rowDetail}>{strings('userPage.person_detail_d')}</TextEx>
							</View>
						</Button>
						<Line style={{marginLeft: 68}}/>

						{/*电话录音*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]} onPress={() => {
							this.navigation.push('VoicePage');
						}}>
							<Icon icon={'personal_icon_sound_re'} size={40} color={'#4A90E2'}
								  style={{marginRight: 12}}/>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('userPage.save_voice')}
							</TextEx>
						</Button>
						<Line style={{marginLeft: 68}}/>

						{/*设置*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]} onPress={() => {
							this.navigation.push('SettingPage')
							// this.global.developing()
						}}>
							<Icon icon={'personal_icon_set'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<View style={{flex: 1}}>
								<TextEx style={styles.rowTitle}>{strings('userPage.setting')}</TextEx>
								<TextEx style={styles.rowDetail}>{strings('userPage.setting_detail')}</TextEx>
							</View>

						</Button>
						<Line style={{marginLeft: 68}}/>

						{/*帮助和反馈*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]} onPress={() => {
							this.navigation.push('HelpPage')
						}}>
							<Icon icon={'personal_icon_help'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('userPage.help')}
							</TextEx>
						</Button>
						<Line style={{marginLeft: 68}}/>

						{/*关于洋葱*/}
						<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]} onPress={() => {
							this.navigation.push('AboutPage')
						}}>
							<Icon icon={'personal_icon_about'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('userPage.about')}
							</TextEx>
						</Button>


					</ScrollView>
				</SafeView>

			</Fragment>
		)
	}
}

const styles = StyleSheet.create({
	logoRow: {
		paddingHorizontal: 12,
		paddingVertical: 18,
	},
	name: {
		fontSize: 17,
		color: "#333",
		lineHeight: 24,
		fontWeight: '500',
	},
	phone: {
		fontSize: 14,
		color: "#666"
	},
	blueR: {
		backgroundColor: "#7ED321",
		width: 10,
		height: 10,
		borderRadius: 5,
	},
	line: {
		padding: 12,
	},
	rowline: {
		minHeight: 66,
		paddingHorizontal: 16,
	},
	rowTitle: {
		fontSize: 16,
		color: '#333',
		lineHeight: 22,
		fontWeight: '400'
	},
	rowDetail: {
		fontSize: 12,
		color: '#999',
		lineHeight: 20
	}
});
