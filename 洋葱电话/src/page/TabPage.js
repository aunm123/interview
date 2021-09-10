'use strict';
import {createBottomTabNavigator} from 'react-navigation-tabs';
import MessageTab from "./tabPage/MessageTab";
import PhoneTab from "./tabPage/PhoneTab";
import ConnectTab from "./tabPage/ConnectTab";
import React, {Fragment, Component} from 'react';
import {
	Dimensions,
	Image,
	Text,
	View,
} from 'react-native';
import {inject, observer} from "mobx-react";
import Icon from "../value/Svg";
import TextEx from "../components/TextEx";
import BaseComponents from "../BaseComponents";

@inject('store', 'global')
@observer
class MessageTabBarRedPoint extends BaseComponents {

	constructor(props){
		super(props);
		this.store = props.store;
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	render(){

		let currentRedPoint = this.store.currentRedPoint;
		if (currentRedPoint > 0) {
			return (
				<View style={{
					justifyContent: 'center',
					alignItems: 'center',
					width: 16,
					height: 16,
					backgroundColor: '#E44343',
					borderRadius: 8,
					position: 'absolute',
					top: 0,
					right: -6
				}}>
					<TextEx style={{
						color: '#fff',
						fontSize: 10,
						fontWeight: 'bold' ,
						lineHeight: 16,
						textAlign: 'center',
					}}>
						{currentRedPoint}
					</TextEx>
				</View>
			)
		} else {
			return null;
		}


	}
}

const TabNavigator = createBottomTabNavigator({
	MessageTab: {
		screen: MessageTab,
		navigationOptions: ({ navigation }) => ({
			tabBarLabel: '短信',
			tabBarIcon: ({ focused, tintColor }) => (
				<View>
					{
						focused? <Icon icon={'tabbar_icon_msg_select'} size={32} color={'#4A90E2'} />:
							<Icon icon={'tabbar_icon_msg_normal'} size={32} color={'#4A90E2'}/>
					}
					<MessageTabBarRedPoint />
				</View>
			)
		}),
	},
	PhoneTab: {
		screen: PhoneTab,
		navigationOptions: ({ navigation }) => ({
			tabBarLabel: '通话',
			tabBarIcon: ({ focused, tintColor }) => (
				<View>
					{
						focused? <Icon icon={'tabbar_icon_phone_select'} size={32} color={'#4A90E2'} />:
							<Icon icon={'tabbar_icon_phone_normal'} size={32} color={'#4A90E2'}/>
					}
				</View>
			)
		}),
	},
	ConnectTab: {
		screen: ConnectTab,
		navigationOptions: ({ navigation }) => ({
			tabBarLabel: '联系人',
			tabBarIcon: ({ focused, tintColor }) => (
				<View>
					{
						focused? <Icon icon={'tabbar_icon_contacts_select'} size={32} color={'#4A90E2'} />:
							<Icon icon={'tabbar_icon_contacts_normal'} size={32} color={'#4A90E2'}/>
					}
				</View>
			),

		}),
	}
}, {
	tabBarPosition: "bottom",
	tabBarOptions: {
		activeTintColor: '#4A90E2',
		inactiveTintColor: 'gray',
		allowFontScaling: true,
		labelStyle: {
			fontWeight: '500'
		},
	},

});

export default TabNavigator
