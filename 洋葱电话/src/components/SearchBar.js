'use strict';

import React, {Fragment} from "react";
import {
	ActivityIndicator,
	StyleSheet,
	TouchableOpacity,
	Text,
	View,
	Dimensions, Image, TextInput
} from "react-native";

import {inject, observer} from "mobx-react";
import {strings} from "../../locales";
import AppStyle from "../Style";
import TextEx from "./TextEx";
import Button from "./Button";

@inject('global')
@observer
export default class SearchBar extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			searchText: '',
		};
		this.placeholder = this.props.placeholder || "";
		this.btn = this.props.btn;
	}


	touchSearchBar() {
		if (this.props.touchSearchBar){
			this.props.touchSearchBar();
		}
	}

	render() {
		return (
			<Fragment>
				<View style={[styles.searchRow]}>
					<View style={[AppStyle.row, styles.searchRow_bg, {flex: 1}]}>
						<Image
							style={{width: 25, height: 25, marginRight: 4, marginLeft: 12}}
							source={require('../assets/newimg/png/icon/common/common_icon_search.png')}
						/>
						<TouchableOpacity style={{flex: 1}}
										  activeOpacity={1}
										  onPress={()=>this.touchSearchBar()} >
							<TextEx style={styles.searchRow_input}>
								{this.placeholder}
							</TextEx>
						</TouchableOpacity>
					</View>
					{this.btn}
				</View>
			</Fragment>
		)
	}
}

const styles = StyleSheet.create({
	searchRow: {
		minHeight: 48,
		flexDirection: "row",
		marginHorizontal: 16,
		justifyContent: 'center',
		alignItems: 'center'
	},
	searchRow_bg: {
		height: 36,
		backgroundColor: "#f5f5f5",
		borderRadius: 18,
		justifyContent: 'center',
		alignItems: 'center',
	},
	searchRow_input: {
		flex: 1,
		height: 36,
		fontSize: 14,
		paddingVertical: 0,
		color: '#999',
		lineHeight: 36,
	},
});

