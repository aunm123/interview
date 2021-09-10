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
	ImageBackground, SectionList, FlatList
} from 'react-native';
import {strings} from "../../../locales";
import {inject, observer} from "mobx-react";
import AppStyle, {font} from '../../Style';
import NavBar from "../../components/NavBar";
import Line from "../../components/Line";
import {NewPhoneRow} from "../../components/row/NewPhoneRow";
import Button from "../../components/Button";
import SafeView from "../../components/SafeView";
import BaseComponents from "../../BaseComponents";

@inject('store', 'global')
@observer
export default class OrderList extends BaseComponents {
	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;
		this.state = {
			data: [],
		}
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	// 分组列表的renderItem
	_renderItem(item, index) {
		return (
			<Button style={[styles.row]}>
				<Text style={styles.rowDate}>2019-12-12 33:33:33</Text>
				<View style={[AppStyle.row, {marginTop: 15}]}>
					<Text style={[styles.rowTitle, {flex: 1}]}>电话号码19999999999</Text>
					<Text style={styles.rowTitle}>$ 9.99</Text>
				</View>
			</Button>
		);
	}

	render() {

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={strings("OrderList.title")}
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
					<FlatList
						ref={'flatlist'}
						style={{backgroundColor: "white", flex: 1}}
						keyboardDismissMode={'on-drag'}
						renderItem={({item, index}) => this._renderItem(item, index)}
						data={this.state.data}
						keyExtractor={(item, index) => item + index}
						stickySectionHeadersEnabled={false}
						ItemSeparatorComponent={() =>
							<Line style={{marginLeft: 12,marginRight: 12}}/>
						}
					/>

				</SafeView>
			</Fragment>
		)
	}
}
const styles = StyleSheet.create({
	row: {
		padding: 12,
	},
	rowDate: {
		fontSize: 12,
		color: '#999'
	},
	rowTitle: {
		fontSize: 14,
		color: '#333'
	}
});
