'use strict';
import React, {Fragment, Component} from 'react';
import {
	Text, View,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	Animated,
	Dimensions,
	Image, ScrollView, Alert,
	ImageBackground, SectionList, FlatList, Switch, Easing
} from 'react-native';
import {inject, observer} from "mobx-react";
import SafeView from "../../../components/SafeView";
import NavBar from "../../../components/NavBar";
import Button from "../../../components/Button";
import {strings} from "../../../../locales";
import AppStyle from "../../../Style";
import TextEx from "../../../components/TextEx";
import {observable, toJS} from "mobx";
import Line from "../../../components/Line";
import Global from "../../../mobx/Global";
import Icon from "../../../value/Svg";
import Req from "../../../global/req";
import URLS from "../../../value/URLS";
import HTML from "react-native-render-html";
import BaseComponents from "../../../BaseComponents";

var {height, width} = Dimensions.get('window');


@inject('store', 'global')
@observer
export default class QuestionAndListPage extends BaseComponents {

	@observable
	async_contract = false;
	@observable
	helpDataList = [];
	@observable
	faqDataList = [];


	global: Global;

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;

		this.type = this.navigation.getParam('type');
	}

	onStart() {
		super.onStart();

		this.getQuestion();
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	async getQuestion() {
		this.global.showLoading();
		let res = await Req.post(URLS.GET_HELP, {});
		let help = [];
		let faq = [];

		for (let item of res.data) {
			if (item.type == 1) {
				help.push(item);
			}
			if (item.type == 2) {
				faq.push(item);
			}
		}

		this.helpDataList = help;
		this.faqDataList = faq;
		this.global.dismissLoading();
	}

	listRender() {
		let result = null;
		if (this.type == 'help') {
			return (this.helpDataList.map((item, index) => {
				return (<ItemRow key={index} title={item.title} content={item.content}/>)
			}))
		} else if (this.type == 'faq') {
			return (this.faqDataList.map((item, index) => {
				return (<ItemRow key={index} title={item.title} content={item.content}/>)
			}))
		}

		return result;
	}

	render() {

		let title = "";
		if (this.type == 'faq') {
			title = strings('HelpPage.FAQ');
		} else if (this.type == 'help') {
			title = strings('HelpPage.help_live');
		}

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={title}
							bottom_line={true}
							leftRender={(
								<Button style={{paddingLeft: 6, paddingRight: 12}}
										onPress={() => this.navigation.pop()}>
									<Image
										style={{width: 22, height: 22}}
										source={require('../../../assets/img/util/ic_back_black.png')}
									/>
								</Button>
							)}
					/>
					<ScrollView>

						{this.listRender()}

					</ScrollView>
				</SafeView>

			</Fragment>
		)
	}
}

@observer
class ItemRow extends Component {

	animateValue: Animated.Value;
	opactyValue: Animated.Value;
	contentHeight: number = 20;
	titleHeight: number = 20;
	showing = false;

	@observable
	content = "";
	@observable
	title = "";

	constructor() {
		super();
		this.animateValue = new Animated.Value(20);
		this.opactyValue = new Animated.Value(0);
	}

	componentDidMount(): void {
		this.content = this.props.content;
		this.title = this.props.title;
	}

	btnPress() {
		// console.log(this.contentHeight, this.showing);

		if (this.showing) {
			// 隐藏
			Animated.timing(this.animateValue, {
				toValue: 20, // 目标值
				duration: 300, // 动画时间
				easing: Easing.ease, // 缓动函数
			}).start(() => {
				this.showing = false
			});
			Animated.timing(this.opactyValue, {
				toValue: 0, // 目标值
				duration: 100, // 动画时间
				easing: Easing.ease, // 缓动函数
			}).start();
		} else {
			// 显示
			Animated.timing(this.animateValue, {
				toValue: this.contentHeight + this.titleHeight, // 目标值
				duration: 300, // 动画时间
				easing: Easing.ease, // 缓动函数
			}).start(() => {
				this.showing = true
			});
			Animated.timing(this.opactyValue, {
				toValue: 1, // 目标值
				duration: 300, // 动画时间
				easing: Easing.ease, // 缓动函数
			}).start();
		}

	}

	render() {

		const opacity = this.opactyValue.interpolate({
			inputRange: [0, 1],
			outputRange: [0, 1]
		});

		return (
			<Fragment>
				<TouchableOpacity activeOpacity={1} style={[AppStyle.row, AppStyle.hcenter, styles.rowline]}
								  onPress={() => {
									  this.btnPress()
								  }}>
					<Animated.View style={{flex: 1, marginVertical: 16, height: this.animateValue}}>
						<TextEx style={styles.rowTitle}>
							{this.title}
						</TextEx>

						<TextEx style={[styles.rowTitle, {opacity: 0, position: 'absolute', top: 0,}]} onLayout={(event) => {
							if (this.titleHeight == 20) {
								this.titleHeight = event.nativeEvent.layout.height;
							}
						}}>
							{this.title}
						</TextEx>
						<Animated.View style={{flex: 1, opacity: opacity}}>
							<View style={[styles.viewTT]}
								  onLayout={(event) => {
									  if (this.contentHeight == 20) {
										  this.contentHeight = event.nativeEvent.layout.height + 10;
									  }
								  }}>
								<HTML baseFontStyle={styles.ldateTitle}
									  html={this.content} imagesMaxWidth={Dimensions.get('window').width}/>
							</View>

						</Animated.View>
					</Animated.View>
				</TouchableOpacity>
				<Line style={{marginLeft: 12, marginRight: 12}}/>
			</Fragment>
		);
	}
}

const styles = StyleSheet.create({
	rowline: {
		minHeight: 40,
		paddingHorizontal: 16,
		overflow: 'hidden'
	},
	rowTitle: {
		fontSize: 16,
		color: '#333',
		lineHeight: 22,
		fontWeight: "500",
	},
	rowDetail: {
		fontSize: 16,
		color: '#666',
		lineHeight: 20,
		overflow: 'hidden',
		position: 'absolute',
		top: 10
	},
	viewTT: {
		position: 'absolute',
		top: 10
	},
	ldateTitle: {
		color: "#333",
		fontSize: 14,
		paddingHorizontal: 5,
		paddingVertical: 3,
		minWidth: 200,
		lineHeight: 18,
	},
});
