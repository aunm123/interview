'use strict';
import React, {Fragment, Component} from 'react';
import {
	Text, View,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	Animated,
	Dimensions,
	Image
} from 'react-native';
import {inject, observer} from "mobx-react";
import {strings} from "../../../../locales";
import NavBar from "../../../components/NavBar";
import Button from "../../../components/Button";
import TextEx from "../../../components/TextEx";
import SafeView from "../../../components/SafeView";
import {observable} from "mobx";
import AppStyle from "../../../Style";
import CustomStorage from '../../../global/CustomStorage'
import BaseComponents from "../../../BaseComponents";

let {height, width} = Dimensions.get('window');
let btn = parseInt(width / 375.0 * 64, 10);

@inject('store', 'global')
@observer
class ChangeLockPasswordPage extends BaseComponents {

	newPassword;
	deleTimer = null;
	@observable
	password = '';

	@observable
	title = '';
	@observable
	dtitle = '';
	@observable
	errorMessage = '';

	@observable
	no_return = false;

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;

		let type = this.navigation.getParam('type') || 0;
		this.done = ()=>{}
		this.initPasswordLock(type);
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	initPasswordLock(type) {
		switch (type) {
			case 0: {
				// 设置新密码 -> 1
				this.title = strings('ChangeLockPasswordPage.title');
				this.dtitle = strings('ChangeLockPasswordPage.inputPassword');
				this.done = async ()=> {
					this.newPassword = this.password;
					this.password = ''
					this.initPasswordLock(1);
				};
				break;
			}
			case 1: {
				// 验证密码 -> 返回
				this.title = strings('ChangeLockPasswordPage.title');
				this.dtitle = strings('ChangeLockPasswordPage.inputPasswordAgain');
				this.done = async ()=> {
					if (this.password == this.newPassword) {
						await CustomStorage.setItem('lockPassword', this.password);
						this.navigation.pop()
					} else {
						this.timerOutClear(strings("ChangeLockPasswordPage.passwordError1"));
					}
				};
				break;
			}
			case 2: {
				// 关闭密码 -> 返回
				this.title = strings('ChangeLockPasswordPage.title');
				this.dtitle = strings('ChangeLockPasswordPage.inputOldPassword');
				this.done = async ()=> {
					let oldPassword = await CustomStorage.getItem('lockPassword');
					if (this.password == oldPassword) {
						await CustomStorage.removeItem('lockPassword');
						this.navigation.pop()
					} else {
						this.timerOutClear(strings("ChangeLockPasswordPage.passwordError2"));
					}
				};
				break;
			}
			case 3: {
				// 更改密码 -> 0
				this.title = strings('ChangeLockPasswordPage.title');
				this.dtitle = strings('ChangeLockPasswordPage.inputOrginPassword');
				this.done = async ()=> {
					let oldPassword = await CustomStorage.getItem('lockPassword');
					if (this.password == oldPassword) {
						this.password = '';
						this.initPasswordLock(0)
					} else {
						this.timerOutClear(strings("ChangeLockPasswordPage.passwordError3"));
					}
				};
				break;
			}
			case 4: {
				// 锁屏 -> 返回
				this.no_return = true;
				this.title = strings('ChangeLockPasswordPage.title');
				this.dtitle = strings('ChangeLockPasswordPage.inputOldPassword');
				this.done = async ()=> {
					let oldPassword = await CustomStorage.getItem('lockPassword');
					if (this.password == oldPassword) {
						this.navigation.pop();
					} else {
						this.timerOutClear(strings("ChangeLockPasswordPage.passwordError4"));
					}
				};
				break;
			}
		}
	}

	async timerOutClear(errorMessage) {
		this.errorMessage = errorMessage;
		setTimeout(()=>{
			this.errorMessage = ""
		}, 1000);

		let clerrr = ()=>{
			return new Promise((resolve => {
				setTimeout(()=>{
					this.password = this.password.substring(0, this.password.length -1);
					resolve();
				}, 150)
			}))

		};
		let count = this.password.length;
		for (let i = 0; i < count; i++) {
			await clerrr();
		}

	}

	numberClick(num) {
		let currentPassword = this.password;

		switch (num) {
			case 0:
			case 1:
			case 2:
			case 3:
			case 4:
			case 5:
			case 6:
			case 7:
			case 8:
			case 9: {
				if (currentPassword.length>=4){
					return;
				}
				currentPassword +=num.toString();
				break;
			}
			case 10:{
				break
			}
			case 11:{
				break
			}
			case 12:{
				if (currentPassword.length>0){
					currentPassword = currentPassword.substring(0,currentPassword.length-1);
				}
				break
			}
		}
		if (currentPassword.length<4){
			this.errorMessage = ''
		}
		this.password = currentPassword;
		if (currentPassword.length>=4 && this.done) {
			this.done()
		}
	}

	longDelete(){
		this.deleTimer = setInterval(()=>{
			this.numberClick(12);
		}, 100)
	}

	rfDeleTimer(){
		if (this.deleTimer){
			clearInterval(this.deleTimer);
			this.deleTimer = null;
		}
	}

	renderBtnLength(num) {
		return [1,2,3,4].map((item, index)=>{
			if (index<num) {
				return (<Image
					key={index}
					style={{width: 18, height: 18, marginHorizontal: 16}}
					source={require('../../../assets/img/icon/kbg.png')}
				/>)
			} else {
				return (<Image
					key={index}
					style={{width: 18, height: 18, marginHorizontal: 16}}
					source={require('../../../assets/img/util/ic_status_offline.png')}
				/>)
			}
		})
	}

	render() {
		let currentPassword = this.password;

		let passwordBtn = this.renderBtnLength(currentPassword.length);

		let leftBtn = this.no_return?null: (
			<Button style={{paddingLeft: 6}} onPress={() => this.navigation.pop()}>
				<Image
					style={{width: 22, height: 22}}
					source={require('../../../assets/img/util/ic_back_black.png')}
				/>
			</Button>
		);

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={this.title}
							bottom_line={true}
							leftRender={leftBtn}
					/>

					<View style={{justifyContent: 'center', alignItems: 'center', marginTop: 44}}>
						<TextEx style={{fontSize: 18, color: "#333", fontWeight: '400'}}>
							{this.dtitle}
						</TextEx>
						<View style={[AppStyle.row, {
							justifyContent: 'center',
							alignItems: 'center',
							marginVertical: 32
						}]}>
							{passwordBtn}
						</View>
					</View>

					<View style={{flex: 1,justifyContent:'center', alignItems: 'center'}}>
						<TextEx style={{fontSize: 14, color: "#dd2a23", fontWeight: '400'}}>
							{this.errorMessage}
						</TextEx>
					</View>

					<View style={{
						alignItems: 'center',
						width: '100%',
						marginBottom: 64 - 24 -12,
					}}>
						<View style={styles.callView}>
							<TouchableOpacity style={styles.numBtn} onPress={()=>this.numberClick(1)}>
								<TextEx style={styles.numBtnText}>1</TextEx>
								<TextEx style={styles.minNumBtnText}></TextEx>
							</TouchableOpacity>
							<TouchableOpacity style={styles.numBtn} onPress={()=>this.numberClick(2)}>
								<TextEx style={styles.numBtnText}>2</TextEx>
								<TextEx style={styles.minNumBtnText}>A B C</TextEx>
							</TouchableOpacity>
							<TouchableOpacity style={styles.numBtn} onPress={()=>this.numberClick(3)}>
								<TextEx style={styles.numBtnText}>3</TextEx>
								<TextEx style={styles.minNumBtnText}>D E F</TextEx>
							</TouchableOpacity>
							<TouchableOpacity style={styles.numBtn} onPress={()=>this.numberClick(4)}>
								<TextEx style={styles.numBtnText}>4</TextEx>
								<TextEx style={styles.minNumBtnText}>G H I</TextEx>
							</TouchableOpacity>
							<TouchableOpacity style={styles.numBtn} onPress={()=>this.numberClick(5)}>
								<TextEx style={styles.numBtnText}>5</TextEx>
								<TextEx style={styles.minNumBtnText}>J K L</TextEx>
							</TouchableOpacity>
							<TouchableOpacity style={styles.numBtn} onPress={()=>this.numberClick(6)}>
								<TextEx style={styles.numBtnText}>6</TextEx>
								<TextEx style={styles.minNumBtnText}>N M O</TextEx>
							</TouchableOpacity>
							<TouchableOpacity style={styles.numBtn} onPress={()=>this.numberClick(7)}>
								<TextEx style={styles.numBtnText}>7</TextEx>
								<TextEx style={styles.minNumBtnText}>P Q R</TextEx>
							</TouchableOpacity>
							<TouchableOpacity style={styles.numBtn} onPress={()=>this.numberClick(8)}>
								<TextEx style={styles.numBtnText}>8</TextEx>
								<TextEx style={styles.minNumBtnText}>S T U</TextEx>
							</TouchableOpacity>
							<TouchableOpacity style={styles.numBtn} onPress={()=>this.numberClick(9)}>
								<TextEx style={styles.numBtnText}>9</TextEx>
								<TextEx style={styles.minNumBtnText}>V W Y</TextEx>
							</TouchableOpacity>
							<View style={[styles.numBtn, {backgroundColor: 'white'}]} >

							</View>
							<TouchableOpacity style={styles.numBtn} onPress={()=>this.numberClick(0)}>
								<TextEx style={styles.numBtnText}>0</TextEx>
								<TextEx style={styles.minNumBtnText}>+ Z</TextEx>
							</TouchableOpacity>
							<TouchableOpacity style={styles.vBtn}
											  onPress={()=>this.numberClick(12)}
											  onLongPress={()=>this.longDelete()}
											  onPressOut={()=>this.rfDeleTimer()}>
								<Image
									style={{width: btn/70 * 60, height: btn/70 * 60}}
									source={require('../../../assets/img/phone/ic_delete_number.png')}
								/>
							</TouchableOpacity>

						</View>


					</View>
				</SafeView>
			</Fragment>
		)
	}
}
const styles = StyleSheet.create({
	callView: {
		flexDirection: 'row',
		justifyContent: "space-around",
		paddingVertical: 12,
		paddingTop: 0,
		flexWrap: 'wrap',
		marginTop: 12,
		maxWidth: '80%',

	},
	numBtn: {
		marginBottom: 24,
		marginHorizontal: 13,
		padding: 5,
		width: btn,
		height: btn,
		borderRadius: 35,
		backgroundColor: 'rgba(51,51,51,0.10)'
	},
	numBtnText: {
		width: '100%',
		height: '100%',
		fontSize: btn/70 *34,
		color: '#333333',
		textAlign: 'center',
	},
	minNumBtnText: {
		fontSize: 10,
		color: '#333333',
		textAlign: 'center',
		position: 'absolute',
		bottom: 5,
		left: 0,
		right: 0
	},
	vBtn: {
		marginBottom: 24,
		marginHorizontal: 13,
		padding: 5,
		width: btn,
		height: btn,
		justifyContent: 'center',
		alignItems: 'center',
	}
});

export default ChangeLockPasswordPage
