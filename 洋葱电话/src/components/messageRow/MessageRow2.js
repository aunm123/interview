'use strict';
import React, {Fragment, Component} from 'react';
import {
	Text, View,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	Animated,
	Dimensions,
	Image, Alert, Easing,
	LayoutAnimation,
	Clipboard, TouchableWithoutFeedback
} from 'react-native';
import AppStyle from "../../Style";
import {observable, toJS} from "mobx";
import Util from "../../global/Util";
import moment from "moment";
import Button from "../Button";
import TextEx from "../TextEx";
import {strings} from "../../../locales";
import PopoverTooltip from "../popoverTooltip";
import {inject, observer} from "mobx-react";
import AppStore from "../../mobx/AppStore";
import Global from "../../mobx/Global";
import Icon from "../../value/Svg";

let width = Dimensions.get('window').width;

@inject('store', 'global')
@observer
export default class MessageRow2 extends Component {

	@observable
	rowHeight = null;
	@observable
	needRemove = false;
	// 1.输入模式 2.选择模式
	@observable
	mode = 1;
	@observable
	hasSelect = false;
	@observable
	messageState = 0;

	store: AppStore;
	global: Global;

	// content={item.content} date={item.date} phone={item.tophone} isLeft={false} state={item.state}
	constructor(props) {
		super(props);

		this.store = props.store;
		this.global = props.global;

		this.data = props.data || {};
		this.date = this.data.date || "";
		this.isLeft = this.data.fromphone == 'me' ? false : true;
		this.messageState = this.data.state;
		this.content = this.data.content;
		this.phone = !this.isLeft ? this.data.tophone : this.data.fromphone;
		this.mode = props.mode;

		this.state = {
			bottomUpAnimate: new Animated.Value(0),
			bottomUpOpAnimate: new Animated.Value(0),
			isShowing: false,
			// 搜索关键字
			keyword: props.keyword || "",
		};

		this.selectIndexCallBack = props.selectIndexCallBack;


	}

	componentWillReceiveProps(nextProps: Readonly<P>, nextContext: any): void {
		if (this.mode != nextProps.mode) {
			this.mode = nextProps.mode;
			if (this.mode == 1) {
				this.hasSelect = false;
			}
		}
		this.setState({
			keyword: nextProps.keyword || "",
		});

	}

	retryBtnPress() {
		Alert.alert(strings("other.sms_send_retry"), '', [
			{
				text: strings("other.sure"), onPress: () => {
					this.props.retryBtnPress();
				}
			},
			{
				text: strings("other.cancel"), onPress: () => {
				}
			},
		], {cancelable: false});
	}

	renderMeumBtn(label, imgSource) {

		let moreView = label == "更多" ? (
			<View style={{width: '100%', height: 4, backgroundColor: '#E1E1E1'}} />
		) : null;

		return (
			<Fragment>
				{moreView}
				<View style={styles.meumRow}>
					<TextEx style={{lineHeight: 20, flex: 1}}>{label}</TextEx>
					<Image
						style={{width: 18, height: 18}}
						source={imgSource}
					/>
				</View>
			</Fragment>
		)
	}

	removeItem() {
		this.needRemove = true;
		Animated.timing(this.rowHeight, {
			toValue: 0, // 目标值
			duration: 250, // 动画时间
			easing: Easing.linear, // 缓动函数
		}).start(() => {
			// 延迟删除，避免出现闪动
			setTimeout(()=>{
				try {
					this.props.removeItem(this.data.id);
				} catch (e) {}
			}, 200)
		});
	}

	renderSelectBtn() {
		let sty = this.isLeft ? {marginRight: 12} : {marginLeft: 12};
		return (
			<View style={[{maxHeight: '100%', alignItems: 'center', justifyContent: 'center'}, sty]}>
				<Fragment>
					{
						this.hasSelect ?
							<Icon icon={'call_icon_chose24_select'} size={25} color={'#4A90E2'}/> :
							<Icon icon={'call_icon_chose24_normal'} size={25} color={'#4A90E2'}/>
					}
				</Fragment>
			</View>
		)
	}

	selectSelect() {
		try {
			this.hasSelect = !this.hasSelect;
			this.props.selectAction(this.hasSelect, this);
		} catch (e) {
		}
	}

	render() {

		let {country_no, phone_no} = Util.fixNumber(this.phone);
		let date = this.date ? moment(this.date).format('HH:mm') : '';

		let retryBtn = null;
		let stateMessage = '';
		let color = 'blue';
		if (this.messageState == 0) {
			stateMessage = strings("other.sending");
			color = 'blue';
		} else if (this.messageState == 1) {
			stateMessage = '';
			color = 'red';
			retryBtn = (
				<Button style={{height: 40, justifyContent: 'center', alignItems: 'center', marginHorizontal: 12}}
						onPress={() => this.retryBtnPress()}>
					<Image
						style={{width: 20, height: 20}}
						source={require('../../assets/img/util/ic_error_outline.png')}
					/>
					<Text style={{fontSize: 10, color: '#FF001F'}}>{strings("other.retry")}</Text>
				</Button>)

		} else if (this.messageState == 2) {
			stateMessage = ''
		}

		let flex = (<View style={{flex: 1}}/>)
		let btn = (
			<Fragment>
				{stateMessage.length > 0 ? (<Text style={{color: color, paddingHorizontal: 12, lineHeight: 40}}>
					{stateMessage}
				</Text>) : null}
				{retryBtn}
			</Fragment>
		);
		let selectBtn = this.renderSelectBtn();

		let flexLeft = null, leftBtn = null;
		let flexRight = null, rightBtn = null;
		if (this.isLeft) {
			flexRight = flex;
			rightBtn = btn;
			leftBtn = this.mode == 2 ? selectBtn : null;
		} else {
			flexLeft = flex;
			leftBtn = btn;
			rightBtn = this.mode == 2 ? selectBtn : null;
		}

		const DdateH = this.state.bottomUpAnimate.interpolate({
			inputRange: [0, 1],
			outputRange: [0, 32]
		});

		const TdateH = this.state.bottomUpAnimate.interpolate({
			inputRange: [0, 1],
			outputRange: [0, 18]
		});

		const opacity = this.state.bottomUpOpAnimate.interpolate({
			inputRange: [0, 1],
			outputRange: [0, 1]
		});

		if (this.state.keyword.length > 0) {
			let temp = this.data.content;
			let s = temp.split(this.state.keyword);
			let result = [];
			let i = 0;
			for (let item of s) {
				if (i > 0) {
					result.push((<TextEx key={item + i} style={{color: "red"}}>{this.state.keyword}</TextEx>));
				}
				result.push(item);
				i++;
			}

			this.content = result;
		} else {
			this.content = this.data.content;
		}
		try {
			this.props.keywordAction(this);
		} catch (e) {
		}

		let neStyle = {};
		let nn = {};
		if (this.needRemove) {
			let opacityRemove = this.rowHeight.interpolate({
				inputRange: [0, this.rowHeight._value],
				outputRange: [-0.2, 1]
			});
			neStyle = {height: this.rowHeight, opacity: opacityRemove, overflow: 'hidden'};
			nn = {width: this.rowWidth, height: this.rowHH}
		}


		return (
			<TouchableWithoutFeedback onPress={() => {
				if (this.mode == 2) {
					this.selectSelect()
				}
			}}>
				<Animated.View style={[neStyle]} onLayout={(event) => {
					if (this.rowHeight == null) {
						let {x, y, width, height} = event.nativeEvent.layout;
						this.rowHeight = new Animated.Value(height);
					}
				}}>
					<Animated.View style={{height: DdateH, opacity: opacity, overflow: 'visible'}}>
						<View style={[styles.dateView, {overflow: 'visible'}]}>
							<TextEx style={[styles.dateTitle]}>{date}</TextEx>
						</View>
					</Animated.View>
					<View style={[styles.dateView]}>
						{flexLeft}
						<View>
							<View style={{maxWidth: width * 0.8, alignSelf: this.isLeft ? "flex-start" : "flex-end",}}>
								<View style={[AppStyle.row, {alignSelf: this.isLeft ? "flex-start" : "flex-end",}]}>
									{leftBtn}
									<PopoverTooltip
										ref='tooltip1'
										buttonComponent={
											<Button activeOpacity={this.mode == 2 ? 1 : 0.85} onPress={() => {
												this.toggleAnimateHeigth()
											}} onLongPress={() => {
												if (this.mode == 1) {
													this.refs['tooltip1'].toggle();
												}
											}}>
												<View style={[this.isLeft ? styles.left : styles.right,
													{backgroundColor: this.colorSSS()}]}>
													<TextEx
														onLayout={(event) => {
															let {x, y, width, height} = event.nativeEvent.layout;
															this.rowWidth = width;
															this.rowHH = height;
														}}
														style={[this.isLeft ? styles.ldateTitle : styles.rdateTitle, nn]}>
														{this.content}
													</TextEx>
												</View>
											</Button>
										}
										items={[
											{
												label: () => {
													return this.renderMeumBtn('复制', require('../../assets/newimg/meum/copy.png'))
												},
												onPress: () => {
													Clipboard.setString(this.data.content);
													this.global.presentMessage("复制成功");
												}
											},
											{
												label: () => {
													return this.renderMeumBtn('转发', require('../../assets/newimg/meum/zhuanfa.png'))
												},
												onPress: () => {
													try {
														this.props.forword();
													} catch (e) {}
												}
											},
											{
												label: () => {
													return this.renderMeumBtn('删除', require('../../assets/newimg/meum/iconfontshanchu5.png'))
												},
												onPress: () => {
													this.removeItem();
												}
											},
											{
												label: () => {
													return this.renderMeumBtn('更多', require('../../assets/newimg/meum/more.png'))
												},
												onPress: () => {
													try {
														this.props.selectModel()
													} catch (e) {}
												}
											}
										]}
										// animationType='timing'
										// using the default timing animation
									/>
									{rightBtn}
								</View>
							</View>
							<Animated.View style={[AppStyle.row, {height: TdateH, opacity: opacity}]}>
								<TextEx style={[this.isLeft ? styles.ldateText : styles.rdateText]}>
									{this.isLeft ? strings("other.from") : strings("other.to")} +{country_no} {phone_no}
								</TextEx>
								<View style={{flex: 1}}/>
							</Animated.View>
						</View>
						{flexRight}
					</View>
				</Animated.View>
			</TouchableWithoutFeedback>
		);
	}

	colorSSS() {
		if (this.isLeft) {
			if (this.state.isShowing) {
				// 选中 深色
				return '#E6E6E6'
			} else {
				// 未选中 浅色
				return '#F3F3F3'
			}
		} else {
			if (this.state.isShowing) {
				// 选中 深色
				return '#4A90E2'
			} else {
				// 未选中 浅色
				return '#78B7FF'
			}
		}

	}


	toggleAnimateHeigth() {
		if (this.mode == 2) {
			this.selectSelect()
		} else {
			if (this.refs['tooltip1'].isShowing()) {
				this.refs['tooltip1'].hideModal();
			} else {
				if (this.selectIndexCallBack) {
					if (!this.state.isShowing) {
						this.showAnimateHeigth();
						this.selectIndexCallBack(this);
					} else {
						this.hideAnimateHeigth();
					}
				}
			}
		}
	}

	showAnimateHeigth() {
		if (!this.state.isShowing) {
			Animated.timing(this.state.bottomUpAnimate, {
				toValue: 1, // 目标值
				duration: 200, // 动画时间
				easing: Easing.linear, // 缓动函数
			}).start(() => {
				this.setState({isShowing: true})
			});
			Animated.timing(this.state.bottomUpOpAnimate, {
				toValue: 1, // 目标值
				duration: 100, // 动画时间
				delay: 100,
				easing: Easing.linear, // 缓动函数
			}).start(() => {
			});
		}
	}

	hideAnimateHeigth() {
		if (this.state.isShowing) {
			Animated.timing(this.state.bottomUpAnimate, {
				toValue: 0, // 目标值
				duration: 200, // 动画时间
				easing: Easing.linear, // 缓动函数
			}).start(() => {
				this.setState({isShowing: false})
			});
			Animated.timing(this.state.bottomUpOpAnimate, {
				toValue: 0, // 目标值
				duration: 100, // 动画时间
				easing: Easing.linear, // 缓动函数
			}).start(() => {
			});
		}
	}

}

const styles = StyleSheet.create({

	meumRow: {
		width: width * 0.55,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 15,
		paddingVertical: 10
	},
	ldateTitle: {
		color: "#333",
		fontSize: 14,
		lineHeight: 18,
		paddingHorizontal: 5,
		paddingVertical: 3,
	},
	rdateTitle: {
		color: "#fff",
		fontSize: 14,
		lineHeight: 18,
		paddingHorizontal: 5,
		paddingVertical: 3,
	},
	dateView: {
		paddingHorizontal: 12,
		backgroundColor: "#FFF",
		justifyContent: "center",
		marginBottom: 12,
		flexDirection: 'row',
	},
	left: {
		backgroundColor: "#F3F3F3",
		borderTopLeftRadius: 0,
		overflow: "hidden",
		borderBottomLeftRadius: 8,
		borderTopRightRadius: 8,
		borderBottomRightRadius: 8,
		padding: 8
	},
	right: {
		backgroundColor: "#78B7FF",
		borderTopLeftRadius: 8,
		overflow: "hidden",
		borderBottomLeftRadius: 8,
		borderTopRightRadius: 0,
		borderBottomRightRadius: 8,
		padding: 8
	},
	ldateText: {
		color: "#999",
		fontSize: 12,
		alignSelf: "flex-start",
		marginTop: 4,
		marginRight: 20
	},
	rdateText: {
		color: "#999",
		fontSize: 12,
		alignSelf: "flex-end",
		marginTop: 4,
		marginRight: 20
	},
	dateTitle: {
		backgroundColor: "#F3F3F3",
		color: "#999999",
		fontSize: 12,
		paddingHorizontal: 7,
		paddingVertical: 3,
		borderRadius: 4,
	},
});

