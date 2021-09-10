'use strict';
import React, {Fragment, Component} from 'react';
import {
	Text, View,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	Animated,
	Dimensions,
	Image,
} from 'react-native';
import moment from "moment";
import TextEx from "../TextEx";
import Button from "../Button";
import Line from "../Line";
import Util from "../../global/Util";
import RNShare from "react-native-share";
import {inject, observer} from "mobx-react";
import Global from "../../mobx/Global";

@inject('store', 'global', 'download')
@observer
export default class ContractHeadRow extends Component {

	global: Global;

	constructor(props){
		super(props)
		this.date = props.date;
		this.global = props.global;
		this.navigation = props.navigation

		// contractType: 0
		// id: "7"
		// name: "TOOL"
		// phones: Array(1)
		// 0:
		// country_no: "855"
		// label: "办公电话"
		// number: "+855 15288763"
		// phone_no: "15288763"
		// type: 1
	}

	switchContent(type) {
		let content = null;
		switch (type) {
			case 1: {
				content = (
					<Fragment>
						<Button style={{width: 243, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#4A90E2',
							marginTop: 20, lineHeight: 22,
							justifyContent: 'center', alignItems: 'center'}} onPress={()=>{
							this.navigation.push('EditContactPage', {contract: this.date});
						}}>
							<TextEx style={{fontSize: 16, color: '#4A90E2'}}>
								添加联系人
							</TextEx>
						</Button>
						<TextEx style={{fontSize: 12,
							lineHeight: 17, color: '#4A4A4A', width: 168, textAlign: 'center', marginTop: 8}}>
							添加联系人，通过洋葱发送短信或拨打电话
						</TextEx>
						<Button style={{width: 243, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#4A90E2',
							marginTop: 8, backgroundColor: '#4A90E2',
							justifyContent: 'center', alignItems: 'center'}} onPress={()=>{
							this.navigation.push('BuyListPage')
						}}>
							<TextEx style={{fontSize: 16, color: '#FFF', lineHeight: 22}}>
								充值洋葱币
							</TextEx>
						</Button>
					</Fragment>
				);
				break;
			}
			case 0: {
				content = (
					<Fragment>
						<TextEx style={{fontSize: 12,lineHeight: 17, color: '#4A4A4A', width: 168, textAlign: 'center', marginTop: 8}}>
							通过洋葱发送短信 或 拨打电话
						</TextEx>
						<Button style={{width: 243, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#4A90E2',
							marginTop: 8, backgroundColor: '#4A90E2', lineHeight: 22,
							justifyContent: 'center', alignItems: 'center'}} onPress={()=>{
							this.navigation.push('BuyListPage')
						}}>
							<TextEx style={{fontSize: 16, color: '#FFF', lineHeight: 22}}>
								充值洋葱币
							</TextEx>
						</Button>
					</Fragment>
				);
				break;
			}
			case 2: {
				content = (
					<Fragment>
						{/*<Button style={{width: 243, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#4A90E2',*/}
						{/*	marginTop: 20,*/}
						{/*	justifyContent: 'center', alignItems: 'center'}} onPress={()=>{*/}
						{/*		this.global.shareAction()*/}
						{/*}}>*/}
						{/*	<TextEx style={{fontSize: 16, color: '#4A90E2'}}>*/}
						{/*		邀请加入  Onion*/}
						{/*	</TextEx>*/}
						{/*</Button>*/}
						{/*<TextEx style={{fontSize: 12,*/}
						{/*	lineHeight: 17, color: '#4A4A4A', width: 168, textAlign: 'center', marginTop: 8}}>*/}
						{/*	邀请加入Onion即可获得免费洋葱币 或*/}
						{/*</TextEx>*/}
						<Button style={{width: 243, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#4A90E2',
							marginTop: 8, backgroundColor: '#4A90E2',
							justifyContent: 'center', alignItems: 'center'}} onPress={()=>{
							this.navigation.push('BuyListPage')
						}}>
							<TextEx style={{fontSize: 16, color: '#FFF', lineHeight: 22}}>
								充值洋葱币
							</TextEx>
						</Button>
						<TextEx style={{fontSize: 12, color: '#4A4A4A', width: 168,
							textAlign: 'center', marginTop: 8, lineHeight: 17}}>
							使用Onion拨打此号码
						</TextEx>
					</Fragment>
				);
				break;
			}
		}
		return content;
	}

	render() {
		let logo = Util.logoFix(this.date.name, this.date.contractType, 80);
		let content = this.switchContent(this.date.contractType);
		return (
			<View>
				<View style={styles.row}>
					<View style={{ marginTop: 20}}>
						{logo}
					</View>
					<TextEx style={{fontSize: 16, color: '#4A4A4A', fontWeight: '500', lineHeight: 22, marginTop: 4}}>
						{this.date.name}
					</TextEx>
					{content}
				</View>
				<Line style={{marginTop: 20, marginBottom: 13}}/>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	row:{
		paddingHorizontal: 20,
		justifyContent: 'center',
		alignItems: 'center'
	}
});

