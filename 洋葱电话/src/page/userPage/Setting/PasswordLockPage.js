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
	ImageBackground, SectionList, FlatList, Switch, Clipboard
} from 'react-native';
import {inject, observer} from "mobx-react";
import {strings} from "../../../../locales";
import SafeView from "../../../components/SafeView";
import NavBar from "../../../components/NavBar";
import Button from "../../../components/Button";
import AppStyle from "../../../Style";
import Line from "../../../components/Line";
import TextEx from "../../../components/TextEx";
import {observable, toJS} from "mobx";
import CustomActionSheet from "../../../components/CustomActionSheet";
import CustomStorage from '../../../global/CustomStorage'
import Icon from "../../../value/Svg";
import BaseComponents from "../../../BaseComponents";

@inject('store', 'global')
@observer
class PasswordLockPage extends BaseComponents {

	@observable
	openLock = false;
	@observable
	leaveToLock = '';

	actionOptioms = [];


	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;
	}

	onStart() {
		super.onStart();

		this.initData();
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	chooseLeaveToLock(type) {
		let title_detail = '';
		switch (parseInt(type)) {
			case 0 : {
				title_detail = strings('PasswordLockPage.5mim');
				break;
			}
			case 1: {
				title_detail = strings('PasswordLockPage.30mim');
				break;
			}
			case 2: {
				title_detail = strings('PasswordLockPage.1hour');
				break;
			}
			case 3: {
				title_detail = strings('PasswordLockPage.5hour');
				break;
			}
		}
		this.leaveToLock = title_detail;
	}

	async initData() {
		const options = [
			<TextEx>{strings('PasswordLockPage.5mim')}</TextEx>,
			<TextEx>{strings('PasswordLockPage.30mim')}</TextEx>,
			<TextEx>{strings('PasswordLockPage.1hour')}</TextEx>,
			<TextEx>{strings('PasswordLockPage.5hour')}</TextEx>,
			<TextEx style={{color: '#999'}}>{strings('other.cancel')}</TextEx>];

		this.actionOptioms = options;

		let lockPassword = await CustomStorage.getItem('lockPassword');
		if (lockPassword && lockPassword.length > 0) {
			this.openLock = true;
		} else {
			this.openLock = false;
		}
		let leaveToLock = await CustomStorage.getItem('leaveToLock');
		if (leaveToLock == null || leaveToLock == undefined) {
			leaveToLock = 0;
		}
		this.chooseLeaveToLock(leaveToLock);
	}

	UNSAFE_componentWillMount(): void {
		try {
			this.global.modalRef.handlehide();
		} catch (e) {

		}
	}


	actionSheetShow() {

		this.global.modalRef.showModal((
			<CustomActionSheet title={strings('PasswordLockPage.setTimeTitle')}
							   options={this.actionOptioms}
							   click={async (index) => {
								   this.chooseLeaveToLock(index)
								   await CustomStorage.setItem('leaveToLock', index);
							   }}
							   cancelIndex={4}/>
		), 'bottom')
	}

	render() {

		return (
			<Fragment>
				<StatusBar
					barStyle="dark-content"/>
				<SafeView>
					<NavBar
						title={strings('PasswordLockPage.title')}
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
					<ScrollView>

						{/*开启密码锁*/}
						<View style={[AppStyle.row, AppStyle.hcenter, styles.rowline]}>
							<Icon icon={'personal_icon_password_app'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
							<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
								{strings('PasswordLockPage.openLock')}
							</TextEx>

							<Switch value={this.openLock}
									onValueChange={(value) => {
										this.openLock = value;
										if (value) {
											CustomStorage.setItem('leaveToLock', 0);
											this.navigation.push('ChangeLockPasswordPage', {type: 0})
										} else {
											this.navigation.push('ChangeLockPasswordPage', {type: 2})
										}

									}}/>
						</View>

						{
							this.openLock ? (
								<Fragment>
									<View style={{height: 20, backgroundColor: '#F5F5F5'}}/>

									{/*更改密码*/}
									<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]}
											onPress={() => this.navigation.push('ChangeLockPasswordPage', {type: 3})}>
										<Icon icon={'personal_icon_change_password'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
										<TextEx style={[{flex: 1, lineHeight: 24}, styles.rowTitle]}>
											{strings('PasswordLockPage.changeLockPassword')}
										</TextEx>

									</Button>
									<Line style={{marginLeft: 68}}/>

									{/*自动锁定*/}
									<Button style={[AppStyle.row, AppStyle.hcenter, styles.rowline]}
											onPress={() => {
												this.actionSheetShow()
											}}>
										<Icon icon={'personal_icon_lock'} size={40} color={'#4A90E2'} style={{marginRight: 12}}/>
										<View style={{flex: 1}}>
											<TextEx
												style={styles.rowTitle}>{strings('PasswordLockPage.auto_lock')}</TextEx>
											<TextEx style={styles.rowDetail}>{this.leaveToLock}</TextEx>
										</View>
									</Button>
									<Line style={{marginLeft: 68}}/>
								</Fragment>
							) : null
						}
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
		lineHeight: 22
	},
	rowDetail: {
		fontSize: 12,
		color: '#999',
		lineHeight: 20
	}
});

export default PasswordLockPage
