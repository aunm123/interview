import React, {
	Component,
} from 'react';
import {
	StyleSheet,
	Image,
	PanResponder,
	Animated, Text, Dimensions, TouchableOpacity,
} from 'react-native';
import {observer} from "mobx-react/dist/mobx-react";
import {inject} from "mobx-react";
import {observable} from "mobx";
import BaseComponents from "../../BaseComponents";

var {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
class Draggable extends BaseComponents {

	@observable
	moving = false;

	constructor(props) {
		super(props);
		this.state = {
			pan: new Animated.ValueXY(),
			scale: new Animated.Value(1),
			rotate: new Animated.Value(0),
			left: new Animated.Value(0),
		};

		this.onPositionChange = props.onPositionChange;
		this.onPress = props.onPress;

		if (this.onPositionChange) {
			this.onPositionChange(120, width - 80)
		}
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	/**
	 * 计算吸附边框
	 * @param top
	 * @param left
	 */
	linePosition(top, left) {
		let resultLeft = 0;
		if (left > width / 2) {
			resultLeft = width - 80;
		}
		return {top: top, left: resultLeft, offectX: resultLeft - width + 80, offectY: 0}
	}

	UNSAFE_componentWillMount() {
		this._panResponder = PanResponder.create({
			onMoveShouldSetResponderCapture: () => true,
			onMoveShouldSetPanResponderCapture: () => true,
			// 设置初始位置
			onPanResponderGrant: (e, gestureState) => {
				this.moving = true;
				this.state.pan.setOffset({
					x: this.state.pan.x._value,
					y: this.state.pan.y._value
				});
				this.state.pan.setValue({x: 0, y: 0});
				Animated.spring(this.state.scale, {
						toValue: 1.3,
						friction: 3
					}
				).start();
				Animated.timing(this.state.rotate, {
					toValue: 25,
					duration: 300
				}).start();
			},
			// 使用拖拽的偏移量来定位
			onPanResponderMove: Animated.event([
				null, {dx: this.state.pan.x, dy: this.state.pan.y},
			]),
			onPanResponderRelease: (e, {vx, vy}) => {

				this.state.pan.flattenOffset();
				// Animated.spring(
				//     this.state.pan,
				//     {toValue: {x: 0, y: 0}}
				// ).start();
				Animated.spring(
					this.state.scale,
					{toValue: 1, friction: 3}
				).start();
				Animated.timing(this.state.rotate, {
					toValue: 0,
					duration: 300
				}).start();

				let leftOrg = this.state.pan.x._value + vx + width - 80;
				let topOrg = this.state.pan.y._value + vy + 120;

				let {top, left, offectX, offectY} = this.linePosition(topOrg, leftOrg);

				if (this.onPositionChange) {
					this.onPositionChange(top, left)
				}
				this.moving = false;
				Animated.timing(this.state.left, {
					toValue: offectX,
					duration: 300
				}).start();
				this.state.pan.x._value = offectX

			}
		});
	}

	render() {
		// 从state中取出pan
		const {pan, scale} = this.state;

		// 从pan里计算出偏移量
		let [translateX, translateY] = [pan.x, pan.y];
		if (!this.moving) {
			translateX = this.state.left;
		}

		// 计算旋转
		// const rotate = this.state.rotate.interpolate({
		// 	inputRange: [0, 100],
		// 	outputRange: ['0deg', '360deg']
		// });

		// 设置transform为偏移量
		const imageStyle = {transform: [{translateX}, {translateY}, {scale}], ...this.props.style};
		return (
			<Animated.View style={[styles.container, imageStyle]}
						   {...this._panResponder.panHandlers}>
				<TouchableOpacity onPress={() => {
					this.onPress()
				}}>
					<Text style={{
						fontSize: 35, backgroundColor: 'blue', width: 80, height: 80, color: 'white',
						borderRadius: 40, lineHeight: 80, textAlign: 'center'
					}}>
						测试
					</Text>
				</TouchableOpacity>
			</Animated.View>
		)
	}
}

export default Draggable;
const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		left: width - 80,
		top: 120,
	}
});
