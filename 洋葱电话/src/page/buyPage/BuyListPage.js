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
import {NewPhoneRow} from "../../components/row/NewPhoneRow";
import Button from "../../components/Button";
import SafeView from "../../components/SafeView";
import TextEx from "../../components/TextEx";
import TextExTitle from "../../components/TextExTitle";
import BaseComponents from "../../BaseComponents";

@inject('store', 'global')
@observer
export default class BuyListPage extends BaseComponents {
	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;
		this.state = {
			...this.global.userData,
			sections: [
				{
					data: [
						{message: "", id: 1},
						{message: "", id: 2},
					]
				},
			],       //section数组
		}
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	// 分组列表的renderItem
	_renderItem(item, index) {
		return (
			<Button style={[AppStyle.row, styles.row]}>
				<Image
					style={{width: 32, height: 32, marginRight: 10}}
					source={require('../../assets/newimg/png/icon/chat/chat_icon_onion_coin_40.png')}
				/>
				<TextEx style={[styles.rowTitle, {flex: 1}]}>200个{strings("other.coin_name")}</TextEx>
				<View>
					<TextEx style={styles.rowPrice}>$  999.99</TextEx>
					<TextEx style={styles.rowOldPrice}>$  999.99</TextEx>
				</View>
				<Image
					style={{width: 22, height: 22, alignSelf: "center",marginLeft: 5}}
					source={require('../../assets/img/util/ic_arrow_right.png')}
				/>
			</Button>
		);
	}

	renderHeader(){
		return (
			<Fragment>
				<View style={{height: 20, backgroundColor: '#F5F5F5'}}/>
				<TextEx style={styles.headerText}>{strings("BuyListPage.buy_coin")}</TextEx>
			</Fragment>
		)
	}

	render() {

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>

					<NavBar title={strings("BuyListPage.get_coin")}
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
							rightRender={(
								<Button style={{padding: 10}} onPress={()=>{
									// this.navigation.push('OrderList')
									this.global.developing();
								}}>
									<TextExTitle style={{fontSize: 16, color: '#4A90E2', fontWeight: '500'}}>
										我的订单
									</TextExTitle>
								</Button>
							)}
					/>
					<View>

						<NewPhoneRow navigation={this.navigation} />

						<View style={{height: 20, backgroundColor: '#F5F5F5'}}/>
						<View style={[AppStyle.row, {paddingHorizontal: 12, marginVertical: 14}]}>
							<TextEx style={styles.yueTitle}>{strings("BuyListPage.you_coin")}：</TextEx>
							<TextEx style={styles.yueCoint}>{(parseFloat(this.global.userData.balance)).toFixed(2)} {strings("other.coin_name")}</TextEx>
						</View>

						<SectionList
							style={{backgroundColor: "white", height: "100%"}}
							keyboardDismissMode={'on-drag'}
							renderItem={({item, index}) => this._renderItem(item, index)}
							renderSectionHeader={() => this.renderHeader()}
							renderSectionFooter={() => <View style={{height: 20, backgroundColor: '#F5F5F5'}}/>}
							sections={this.state.sections}
							keyExtractor={(item, index) => item + index}
							stickySectionHeadersEnabled={false}
							ItemSeparatorComponent={() =>
								<Line />
							}
						/>

					</View>

				</SafeView>
			</Fragment>
		)
	}
}
const styles = StyleSheet.create({
	headerText: {
		fontSize: 15,
		color: '#333',
		marginHorizontal: 13,
		marginVertical: 12,
	},
	rowTitle:{
		fontSize: 16,
		color: "#333",
		lineHeight: 32
	},
	rowPrice: {
		fontSize: 14,
		color: "#4A90E2",
		flex: 1,
		fontWeight: '500',
		textAlign: "right",
		alignSelf: "center"
	},
	rowOldPrice: {
		fontSize: 12,
		color: "#9B9B9B",
		textDecorationLine: "line-through",
		textDecorationColor: "#999",
		textAlign: "right",
	},
	row: {
		paddingVertical: 20,
		paddingHorizontal: 12
	},
	yueTitle: {
		fontSize: 15,
	},
	yueCoint: {
		flex: 1,
		textAlign: "right",
		fontSize: 15,
		color: "#4A90E2",
		fontWeight: '500'
	},
});
