'use strict';
import {inject, observer} from "mobx-react";
import React, {Component, Fragment} from "react";
import {FlatList, Image, ScrollView, StatusBar, StyleSheet, View, Linking} from "react-native";
import SafeView from "../../components/SafeView";
import NavBar from "../../components/NavBar";
import Button from "../../components/Button";
import TextEx from "../../components/TextEx";
import {strings} from "../../../locales";
import AppStyle from "../../Style";
import DataRow from "../../components/messageRow/DataRow";
import {observable, toJS} from "mobx";
import MessageService from "../../service/MessageService";
import AutoSave from "../../TModal/AutoSave";
import ActionMessageRow from "../../components/messageRow/ActionMessageRow";
import ActionPhotoMessageRow from "../../components/messageRow/ActionPhotoMessageRow";
import ActionMessageRow2 from "../../components/messageRow/ActionMessageRow2";
import Util from "../../global/Util";
import BaseComponents from "../../BaseComponents";

@inject('store', 'global', 'download')
@observer
export default class ActionMessagePage extends BaseComponents {

	@AutoSave
	MessageService: MessageService;
	@observable
	data = [];

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;
		this.store = props.store;

		this.initData();
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	async initData() {
		let messages = await this.MessageService.getAllActionMessage();
		let data = [];
		let pp = 0;
		let keys = Object.keys(messages);
		for (let date_time_key of keys) {
			data.push({title: date_time_key, type: -1});
			for (let i of messages[date_time_key]) {
				data.push(i);
				pp++;
			}
		}
		this.data = data;
		await this.MessageService.setAllActionMessageRead()
	}

	componentDidMount(): void {
		setTimeout(()=>{
			this.refs.flatlist.scrollToEnd({animated: true})
		}, 400)
	}

	_renderItem(item) {
		let resutl = null;
		switch (item.type) {
			// DataRow
			case -1: {
				resutl = (<DataRow date={item.title}/>);
				break;
			}
			// 内容广告
			case 1: {
				resutl = (<ActionMessageRow data={item} navigation={this.navigation} click={() => {
					Linking.openURL(item.website)
						.catch((err) => console.error('An error occurred', err));
				}}/>);
				break;
			}
			// 图片广告
			case 2: {
				resutl = (<ActionPhotoMessageRow data={item} click={() => {
					Linking.openURL(item.website)
						.catch((err) => console.error('An error occurred', err));
				}}/>);
				break;
			}
			case 3: {
				resutl = (<ActionMessageRow2 data={item}/>);
				break;
			}
		}
		return resutl;
	}

	render() {
		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={''}
							barHeight={52}
							bottom_line={true}
							leftRender={(
								<View style={[AppStyle.row, {paddingBottom: 5}]}>
									<Button style={{paddingLeft: 6, height: 52, width: 35, justifyContent: 'center', zIndex: 88}}
											hitSlop={{top: 15, right: 15, bottom: 15, left: 15}}
											onPress={() => this.navigation.pop()}>
										<Image
											style={{width: 24, height: 24}}
											source={require('../../assets/img/util/ic_back_black.png')}
										/>
									</Button>
									<Image
										resizeMode={'contain'}
										style={{width: 40, height: 52, marginLeft: -9}}
										source={require('../../assets/newimg/onionteam.png')}
									/>
									<View style={{height: 52, justifyContent: 'center', marginLeft: 8}}>
										<TextEx style={styles.titleStyle}>
											{strings('ActionMessagePage.title')}
										</TextEx>
										<TextEx style={styles.titleDetailStyle}>
											{strings('ActionMessagePage.titleDetail')}
										</TextEx>
									</View>
								</View>
							)}
					/>

					<FlatList
						ref={'flatlist'}
						style={{backgroundColor: "white", flex: 1}}
						keyboardDismissMode={'on-drag'}
						// contentContainerStyle={styles.contentContainer}
						renderItem={({item}) => this._renderItem(item)}
						data={this.data}
						keyExtractor={(item, index) => JSON.stringify(item) + index}
						stickySectionHeadersEnabled={false}
					/>

				</SafeView>

			</Fragment>
		);
	}
}

const styles = StyleSheet.create({
	titleStyle: {
		fontSize: 16,
		color: '#333',
		fontWeight: '500',
		lineHeight: 22,
	},
	titleDetailStyle: {
		fontSize: 12,
		color: '#999',
		lineHeight: 15,
		height: 15,
	}
});
