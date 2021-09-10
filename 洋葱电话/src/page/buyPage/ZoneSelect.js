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
import Util from "../../global/Util";
import pinyin from "pinyin";
import SafeView from "../../components/SafeView";
import TextEx from "../../components/TextEx";
import Icon from "../../value/Svg";
import BaseComponents from "../../BaseComponents";

@inject('store', 'global')
@observer
export default class ZoneSelect extends BaseComponents {
	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.data = this.navigation.getParam('data');
		this.country_no = this.navigation.getParam('country_no');
		this.country_code = this.navigation.getParam('country_code');
		this.state = {
			sections: [
				{
					index: 0,
					data: []
				},
			],       //section数组
		}
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	componentDidMount() {
		this.dataFix('', this.data);
	}

	dataFix(searchKey, data) {
		let result = new Map();
		if (searchKey.length > 0) {
			data = Util.foundArrayMapWithKey(searchKey, data, ['region_code', 'region_no'])
		}

		for (let item of data) {
			let first = pinyin(item['region_code'].substring(0, 1), {
				style: pinyin.STYLE_FIRST_LETTER,
			})[0][0].toUpperCase();
			let tar = result.get(first);
			if (!tar) {
				tar = {data: [item]};
				result.set(first, tar)
			} else {
				tar.data.push(item);
			}
		}

		let rk = [];
		let index = 1;
		for (let r of result) {
			rk.push({
				index: index,
				key: r[0],
				data: r[1].data
			})
			index++;
		}

		this.setState({
			sections: [{index: 0, data: []}, ...rk]
		})
	}

	_renderSectionHeader(sectionItem) {
		const {section} = sectionItem;
		if (section.index == 0) {
			return (
				<Fragment>
					<View style={{height: 20, backgroundColor: '#F5F5F5'}} />
					<Button style={[AppStyle.row, styles.row]}
							onPress={() => this.navigation.push('PhoneNumberList', {
								data: {
									country_code: this.country_code,
									country_no: this.country_no,
								}
							})}>
						<Icon icon={'buy_icon_random'} size={32} color={'#4A90E2'} style={{marginRight: 10}} />
						<TextEx style={styles.rowTitle}>随机选号</TextEx>
						<Image
							style={{width: 24, height: 24, alignSelf: "center", marginLeft: 5}}
							source={require('../../assets/img/util/ic_arrow_right.png')}
						/>
					</Button>
					<Line style={{marginLeft: 40, marginRight: 12}}/>
					<Button style={[AppStyle.row, styles.row]}
							onPress={() => this.navigation.push('PhoneNumberList', {
								data: {
									country_code: this.country_code,
									country_no: this.country_no,
								}
							})}>
						<Icon icon={'buy_icon_location'} size={32} color={'#4A90E2'} style={{marginRight: 10}} />
						<Text style={styles.rowTitle}>附近区号</Text>
						<Image
							style={{width: 24, height: 24, alignSelf: "center", marginLeft: 5}}
							source={require('../../assets/img/util/ic_arrow_right.png')}
						/>
					</Button>
				</Fragment>
			)
		} else {
			return (
				<View style={{height: 30, backgroundColor: '#F5F5F5', paddingHorizontal: 12}}>
					<TextEx style={{fontSize: 12, lineHeight: 30, color: "#999"}}>{section.key}</TextEx>
				</View>
			)
		}
	}

	_renderSectionFooter(sectionItem) {
		const {section} = sectionItem;
		if (section.index == this.state.sections.length - 1) {
			return (<View style={{height: 20, backgroundColor: '#F5F5F5'}} />)
		} else {
			return null;
		}
	}

	// 分组列表的renderItem
	_renderItem(item, index) {
		let resutl = item;
		resutl['country_no'] = this.country_no;
		return (
			<Button style={[AppStyle.row, styles.row]}
					onPress={() => this.navigation.push('PhoneNumberList', {data: resutl})}>
				<TextEx style={styles.rowTitle}>{item.region_code}</TextEx>
				<TextEx style={styles.rowRightTitle}>{item.region_no}</TextEx>
				<Image
					style={{width: 22, height: 22, alignSelf: "center", marginLeft: 5}}
					source={require('../../assets/img/util/ic_arrow_right.png')}
				/>
			</Button>
		);
	}

	renderNoContent = () => {
		return (<View style={{flex: 1}}>
			<TextEx style={{flex: 1, textAlign: 'center'}}>没有找到信息</TextEx>
		</View>)
	};

	render() {
		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>

					<NavBar title={'选择电话号码'}
							bottom_line={true}
							leftRender={(
								<Button style={{padding: 10}} onPress={() => {
									this.navigation.pop()
								}}>
									<Image
										style={{width: 22, height: 22}}
										source={require('../../assets/img/util/ic_back_black.png')}
									/>
								</Button>
							)}
					/>
					<View style={{flex: 1}}>
						<SearchBar canFocus={true}
								   placeholder={strings("ZoneSelect.search_placeholder")}
								   textChange={(text) => {
									   this.dataFix(text, this.data)
								   }}
						/>
						<SectionList
							style={{backgroundColor: "white", flex: 1}}
							keyboardDismissMode={'on-drag'}
							// contentContainerStyle={styles.contentContainer}
							renderItem={({item, index}) => this._renderItem(item, index)}
							renderSectionHeader={this._renderSectionHeader.bind(this)}
							renderSectionFooter={this._renderSectionFooter.bind(this)}
							sections={this.state.sections}
							keyExtractor={(item, index) => item + index}
							stickySectionHeadersEnabled={true}
							ListEmptyComponent={this.renderNoContent}
							ItemSeparatorComponent={() =>
								<Line style={{marginHorizontal: 12}}/>
							}
						/>

					</View>

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
		alignSelf: "center"
	},
	rowRightTitle: {
		fontSize: 14,
		color: "#999",
		flex: 1,
		textAlign: "right",
		alignSelf: "center"
	},
	row: {
		paddingVertical: 10,
		paddingHorizontal: 12
	},
});
