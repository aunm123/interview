'use strict';
import {
	StyleSheet,
	Text,
	View, ScrollView,Animated,
	TextInput, FlatList, Image, TouchableOpacity, Dimensions,
} from "react-native";
import React, {Fragment} from "react";
import SafeView from "./SafeView";

let {width, height} = Dimensions.get('window');

export default class TabScroll extends React.Component {

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.scrollAnimatedValue = new Animated.Value(0)
	}

	selectIndex(index){
		this.refs.scroll.scrollTo({x: width * index, y: 0, animated: true})
	}

	render() {
		return (
			<Fragment>
				<SafeView>

				</SafeView>
			</Fragment>
		)
	}
}

const styles = StyleSheet.create({
	tabText: {
		textAlign: 'center',
		flex: 1,
		fontSize: 14,
		color: '#333',
		lineHeight: 36
	},
	underLineView: {
		position: 'absolute',
		justifyContent: 'center',
		alignItems: 'center',
		bottom: 0,
		left: 0,
		width: width/2
	},
	underLine: {
		borderBottomWidth: 1,
		borderBottomColor: '#333',
		width: 80,
	}
});
