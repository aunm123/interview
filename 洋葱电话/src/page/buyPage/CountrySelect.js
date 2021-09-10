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
import URLS from "../../value/URLS";
import Req from "../../global/req";
import Button from "../../components/Button";
import CountryIcon from "../../value/CountryIcon";
import SafeView from "../../components/SafeView";
import BaseComponents from "../../BaseComponents";

@inject('store', 'global')
@observer
export default class CountrySelect extends BaseComponents {
	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.state = {
			sections: [
				{
					header: strings("CountrySelect.advance"),
					data: []
				},
				{
					header: strings("CountrySelect.hot_sell"),
					data: []
				},
				{
					header: strings("CountrySelect.country_number"),
					data: []
				},
			],
		}
	}

	componentDidMount() {
		this.initData().then();
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	async initData(){
		let res = await Req.post(URLS.GET_REGION);
		this.dataFix(res.data);
	}

	dataFix(data){
		let normal = [];
		let hot = [];
		let sell = []
		for (let item of data){
			if (item.status == 0){
				normal.push(item)
			}
			if (item.status == 1){
				sell.push(item)
			}
			if (item.status == 2){
				hot.push(item)
			}
		}
		this.setState({sections: [
				{
					header: strings("CountrySelect.advance"),
					data: sell,
				},
				{
					header: strings("CountrySelect.hot_sell"),
					data: hot,
				},
				{
					header: strings("CountrySelect.country_number"),
					data: normal
				}
			]})
	}

	_renderSectionHeader(sectionItem) {
		const {section} = sectionItem;
		return (
			<View style={{height: 30, backgroundColor: '#F5F5F5', paddingHorizontal: 12}}>
				<Text style={{fontSize:12, lineHeight: 30, color: "#999"}}>{section.header}</Text>
			</View>
		)
	}

	_renderSectionFooter(sectionItem) {
		const {section} = sectionItem;
		if (section.header == strings("CountrySelect.country_number")){
			return (<Line style={{marginLeft: 64}} />)
		} else {
			return null;
		}
	}

	// 分组列表的renderItem
	_renderItem(item, index) {

		let k = ['VOICE','SMS','MMS'];
		let vocArray = [];
		for(let value of k){
			if (value){
				vocArray.push((
					<View style={[AppStyle.row, styles.voc]} key={value}>
						<Image resizeMode={'contain'}
							   style={{width: 14}}
							   source={require('../../assets/img/preson/ic_contact_done.png')}/>
						<Text style={styles.vocTitle}>{value.toUpperCase()}</Text>
					</View>
				))
			}
		}

		return (
			<Button style={[AppStyle.row, styles.row]}
					onPress={()=>{
						if (item.region.length>0){
							this.navigation.push('ZoneSelect', {data: item.region, country_no: item.country_no, country_code: item.country_code})
						} else {
							this.navigation.push('PhoneNumberList', {data: item})
						}
					}}>
				<Image
					resizeMode={'contain'}
					style={{width: 40, marginRight: 20}}
					source={CountryIcon[item.country_code]}
				/>

				<View style={{justifyContent: 'flex-start'}}>
					<Text style={styles.rowTitle}>{item.country_cn}(+{item.country_no})</Text>
					<View style={[AppStyle.row, {marginTop: 5,}]}>
						{vocArray}
					</View>
				</View>


			</Button>


		);
	}

	render() {
		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>

					<NavBar title={strings("CountrySelect.get_own_phone")}
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
						renderSectionHeader={this._renderSectionHeader}
						renderSectionFooter={this._renderSectionFooter}
						sections={this.state.sections}
						keyExtractor={(item, index) => item + index}
						stickySectionHeadersEnabled={false}
						ItemSeparatorComponent={() =>
							<Line style={{marginLeft: 64}} />
						}
					/>

				</SafeView>
			</Fragment>
		)
	}
}
const styles = StyleSheet.create({
	rowTitle:{
		fontSize: 14,
		color: "#333",
		flex: 1,
		textAlign: "left",
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
	voc:{
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
	}
});
