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
	ImageBackground, SectionList
} from 'react-native';
import {strings} from "../../../locales";
import {inject, observer} from "mobx-react";
import AppStyle, {font} from '../../Style';
import NavBar from "../../components/NavBar";
import Line from "../../components/Line";
import SearchBar from "../../components/SearchBar";
import Button from "../../components/Button";
import Req from "../../global/req";
import URLS from "../../value/URLS";
import SafeView from "../../components/SafeView";
import TextEx from "../../components/TextEx";
import Icon from "../../value/Svg";
import BaseComponents from "../../BaseComponents";

@inject('store', 'global')
@observer
export default class PhoneNumberList extends BaseComponents {
	constructor(props) {
		super(props);
		this.global = props.global;
		this.navigation = props.navigation;
		this.data = this.navigation.getParam('data');
		this.state = {
			sections: [{data: []}],
		}
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	componentDidMount() {
		console.log(this.data);
		this.global.showLoading();
		Req.post(URLS.GET_PHONE, {
			country_code: this.data.country_code,
			country_no: this.data.country_no,
			region_no: this.data.region_no || '',
		}).then((res) => {
			this.global.dismissLoading();
			if (res.data.length > 0) {
				this.setState({
					sections: [{data: res.data}]
				})
			} else {
				this.setState({
					sections: []
				})
			}
		})
	}

	// 分组列表的renderItem
	_renderItem(item, index) {

		// let vocArray = [];
		// for(let key in item.capabilities){
		// 	let value = item.capabilities[key];
		// 	if (value){
		// 		vocArray.push((
		// 			<View style={[AppStyle.row, styles.voc]} key={key}>
		// 				<Image resizeMode={'contain'}
		// 					   style={{width: 14}}
		// 					   source={require('../../assets/img/preson/ic_contact_done.png')}/>
		// 				<TextEx style={styles.vocTitle}>{key.toUpperCase()}</Text>
		// 			</View>
		// 		))
		// 	}
		// }

		return (
			<Button style={[AppStyle.row, styles.row]}
					onPress={() => this.navigation.push('PhoneNumberPay', {data: item})}>
				<View style={{flex: 1, justifyContent: 'flex-start'}}>
					<TextEx style={styles.rowTitle}>#   +{item.country_no} {item.friendlyName}</TextEx>
					{/*<View style={[AppStyle.row, {marginTop: 5,}]}>*/}
					{/*	{vocArray}*/}
					{/*</View>*/}
				</View>
				<TextEx style={styles.rowRightTitle}>{this.data.region_code}</TextEx>
				<Image
					style={{width: 22, height: 22, alignSelf: "center", marginLeft: 5}}
					source={require('../../assets/img/util/ic_arrow_right.png')}
				/>
			</Button>
		);
	}

	renderNoContent = () => {
		return (<View style={{flex: 1}}>
			<TextEx style={{flex: 1, textAlign: 'center', marginTop: 20}}>没有找到信息</TextEx>
		</View>)
	};

	renderFooterComponent() {
		return (
			<Fragment >
				<View style={{height: 20, backgroundColor: '#F5F5F5'}}/>
				<View style={{padding: 16, marginBottom: 100}}>
					<View style={[AppStyle.row, { justifyContent: 'flex-start', alignItems: 'center', marginBottom: 10}]}>
						<Icon icon={'buy_icon_msg_tips'} size={24} color={'#4A90E2'} />
						<TextEx style={{marginLeft: 8, fontSize: 14, fontWeight: '600', color: '#333'}}>
							您将享有：
						</TextEx>
					</View>
					<TextEx style={{marginLeft: 32, fontSize: 12, color: '#666', lineHeight: 17}}>1、一个真实的专属号码</TextEx>
					<TextEx style={{marginLeft: 32, fontSize: 12, color: '#666', lineHeight: 17}}>2、国家电话&短信费用节省90%</TextEx>
					<TextEx style={{marginLeft: 32, fontSize: 12, color: '#666', lineHeight: 17}}>3、支持拨打电话、发送短信、语音信箱功能</TextEx>
					<TextEx style={{marginLeft: 32, fontSize: 12, color: '#666', lineHeight: 17}}>4、商户或私人可靠联系专线</TextEx>
				</View>
			</Fragment>
		)
	}

	render() {
		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>

					<NavBar title={'选择电话号码'}
							bottom_line={true}
							leftRender={(
								<Button style={{padding: 6, paddingRight: 12}} onPress={() => {
									this.navigation.pop()
								}}>
									<Image
										style={{width: 22, height: 22}}
										source={require('../../assets/img/util/ic_back_black.png')}
									/>
								</Button>
							)}
					/>
					<SectionList
						style={{backgroundColor: "white", flex: 1}}
						keyboardDismissMode={'on-drag'}
						renderItem={({item, index}) => this._renderItem(item, index)}
						renderSectionHeader={() => {}}
						renderSectionFooter={() => this.renderFooterComponent()}
						sections={this.state.sections}
						keyExtractor={(item, index) => item + index}
						stickySectionHeadersEnabled={false}
						ItemSeparatorComponent={() =>
							<Line style={{marginHorizontal: 12}}/>
						}
						ListEmptyComponent={this.renderNoContent}
					/>

				</SafeView>
			</Fragment>
		)
	}
}
const styles = StyleSheet.create({
	rowTitle: {
		fontSize: 16,
		color: "#333",
		flex: 1,
		textAlign: "left",
		lineHeight: 50,
	},
	rowRightTitle: {
		fontSize: 14,
		color: "#999",
		textAlign: "right",
		alignSelf: "center",
		maxWidth: '30%',
		flexWrap: 'wrap'
	},
	row: {
		paddingHorizontal: 12,
		minHeight: 50
	},
	voc: {
		backgroundColor: '#EBEBEB',
		alignItems: 'center',
		borderRadius: 14,
		padding: 2,
		marginRight: 5
	},
	vocTitle: {
		fontSize: 10,
		color: '#333',
		marginRight: 7,
		marginLeft: 3,
	},
});
