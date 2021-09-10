'use strict';
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
} from "react-native";
import React, {Fragment} from "react";

export class CountryZoneRow extends React.Component {

	// continent: "亚洲"
	// country_cn: "阿富汗"
	// country_code: "AF"
	// country_en: "Afghanistan"
	// country_no: "93"
	// id: 1
	// status: 1

	constructor(props) {
		super(props);
		this.style = this.props.style?this.props.style:{}
	}

	render() {
		return (
			<TouchableOpacity style={styles.row} onPress={()=>this.props.callback()}>
				<Text style={[styles.row_title, {flex: 1}]}>{this.props.country_cn}</Text>
				<Text style={{marginRight: 25, fontSize: 14,color: '#999'}}>+{this.props.country_no}</Text>
			</TouchableOpacity>
		)
	}
}

export class CountryZoneHeaderRow extends React.Component {
	constructor(props) {
		super(props);
		this.style = this.props.style?this.props.style:{}
	}

	render() {
		return (
			<View style={styles.section}>
				<Text style={styles.section_title}>{this.props.title.toUpperCase()}</Text>
			</View>
		)
	}
}


const styles = StyleSheet.create({
	row_title: {
		fontSize: 14,
		marginLeft: 10,
	},
	row: {
		height: 49,
		backgroundColor: "#fff",
		paddingHorizontal: 12,
		minHeight: 49,
		flexDirection: 'row',
		alignItems: 'center'
	},
	section: {
		height: 28,
		backgroundColor: "#F5F5F5",
	},
	section_title: {
		lineHeight: 28,
		fontSize: 12,
		color: "#999999",
		marginHorizontal: 12,
	},
});


