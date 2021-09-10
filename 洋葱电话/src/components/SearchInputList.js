'use strict';
import {
	StyleSheet,
	Text,
	View,
	SafeView, TextInput, FlatList, Image, TouchableOpacity, Dimensions,
} from "react-native";
import React, {Fragment} from "react";
import AppStyle from "../Style";
import Line from "./Line";
import ContractService from "../service/ContractService";

let height = Dimensions.get('window').height;

export default class SearchInputList extends React.Component {

	constructor(props) {
		super(props);
		this.contractSelect = props.contractSelect;
		this.state = {
			data: [],
			inputValue: '',
		}
		return this;
	}

	blur() {
		this.input.blur()
	}

	focus() {
		this.input.focus()
	}

	setText(text) {
		this.setState({inputValue: text});
	}

	onChangeText(text) {
		this.setState({inputValue: text});
		if (text.length > 0) {
			ContractService.getALLContactDataWithKey(text)
				.then((data) => {
					this.setState({data: this.fitData(data)})
				})
		} else {
			this.setState({data: []})
		}
	}

	fitData(items) {
		let result = [];
		items.map((item) => {
			if (item.mobile) {
				result.push({name: item.name, num: item.mobile, type: "移动电话"})
			}
			if (item.telephone) {
				result.push({name: item.name, num: item.telephone, type: "办公电话"})
			}
			if (item.familyphone) {
				result.push({name: item.name, num: item.familyphone, type: "家庭电话"})
			}
		})
		return result;
	}

	_renderItem(item) {
		let logoText = item.name.substring(0, 1).toUpperCase();
		return (
			<Fragment>
				<TouchableOpacity style={[styles.row, AppStyle.row]}
								  onPress={() => {
									  if (this.contractSelect) {
										  this.contractSelect(item)
									  }
									  this.setState({inputValue: item.name, data: []})
								  }}>
					<View style={styles.rowLogo}>
						<Text style={styles.rowLogoText}>{logoText}</Text>
					</View>
					<View style={styles.rowText}>
						<Text style={{fontSize: 14, color: '#333'}}>{item.name}</Text>
						<Text style={{fontSize: 12, color: '#999'}}>{item.type}:{item.num}</Text>
					</View>
				</TouchableOpacity>
				<Line style={{marginLeft: 30, marginRight: 12}}/>
			</Fragment>
		)
	}

	render() {
		let fh = height - 470;
		return (
			<Fragment>
				<TextInput ref={(input)=>{this.input = input}}
						   style={[this.props.style, {paddingVertical: 0}]}
						   value={this.state.inputValue}
						   onChangeText={this.onChangeText.bind(this)}/>
				<FlatList
					style={{flex: 1, position: 'absolute', left: 0, right: 0, height: fh, top: 44}}
					renderItem={({item}) => this._renderItem(item)}
					data={this.state.data}
					keyExtractor={(item, index) => item + index}
					keyboardDismissMode={'none'}
					keyboardShouldPersistTaps={'always'}
				/>
			</Fragment>
		)
	}
}


const styles = StyleSheet.create({
	row: {
		height: 44,
		paddingLeft: 12,
	},
	rowLogo: {
		borderRadius: 15,
		width: 30,
		height: 30,
		backgroundColor: '#999',
		marginVertical: 7,
		alignItems: 'center',
		justifyContent: 'center',
	},
	rowLogoText: {
		color: '#fff',
	},
	rowText: {
		paddingLeft: 12,
		lineHeight: 44,
		justifyContent: "center",
	}
});
