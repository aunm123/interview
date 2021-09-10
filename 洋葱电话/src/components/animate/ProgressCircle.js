import React, {Component} from 'react'
import {View, Animated, Easing} from 'react-native'

export default class ProgressCircle extends Component {
	static defaultProps = {
		value: 0,
		size: 64,
		thickness: 7,
		color: '#4c90ff',
		unfilledColor: 'transparent',
		style: {},
		children: null,
		animationMethod: null,
		animationConfig: {duration: 200},
		shouldAnimateFirstValue: false,
		onChange() {
		},
		onChangeAnimationEnd() {
		},
	}

	constructor(props) {
		super(props)
		this.state = {
			animatedValue:
				props.value.constructor.name === 'AnimatedValue'
					? null
					: new Animated.Value(props.shouldAnimateFirstValue ? 0 : props.value),
		}
		this.spinValue = new Animated.Value(0)
		this.spin();
	}

	componentDidMount() {
		if (
			this.props.value.constructor.name !== 'AnimatedValue' &&
			this.props.shouldAnimateFirstValue &&
			this.animationMethod
		) {
			this.animateChange(this.props.value)
		}
	}

	UNSAFE_componentWillReceiveProps({value}) {
		this.handleChange(value)
	}

	render() {
		const {thickness, unfilledColor, children, style} = this.props
		const spin = this.spinValue.interpolate({
			inputRange: [0, 1],//输入值
			outputRange: ['0deg', '360deg'], //输出值
			extrapolate: 'clamp',
		});
		return (
			<Animated.View style={{transform: [{rotate: spin}]}}>
				<View style={[this.fullCircleStyle, {flexDirection: 'row'}, style]}>
					<View
						pointerEvents="box-none"
						style={{
							...this.fullCircleStyle,
							borderWidth: thickness,
							borderColor: unfilledColor,
							position: 'absolute',
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						{children}
					</View>
					{this.renderHalfCircle()}
					{this.renderHalfCircle({isFlipped: true})}

				</View>
			</Animated.View>
		)
	}

	get fullCircleStyle() {
		return {
			width: this.props.size,
			height: this.props.size,
			borderRadius: this.props.size / 2,
		}
	}

	get halfCircleContainerStyle() {
		return {
			width: this.props.size / 2,
			height: this.props.size,
			overflow: 'hidden',
		}
	}

	ANIMATION_TYPES = ['timing', 'spring', 'decay']

	get animationMethod() {
		return this.ANIMATION_TYPES.includes(this.props.animationMethod)
			? this.props.animationMethod
			: null
	}

	handleChange = (value = this.props.value) => {
		this.props.onChange()
		if (value.constructor.name === 'AnimatedValue') {
			return
		}

		if (this.animationMethod) {
			this.animateChange(value)
		} else {
			this.state.animatedValue.setValue(value)
		}
	}

	//旋转方法
	spin = () => {
		this.spinValue.setValue(0)
		Animated.timing(this.spinValue, {
			toValue: 1, // 最终值 为1，这里表示最大旋转 360度
			duration: 1000,
			easing: Easing.linear
		}).start(() => this.spin())
	}

	animateChange = value =>
		Animated[this.animationMethod](this.state.animatedValue, {
			toValue: value,
			useNativeDriver: true,
			...this.props.animationConfig,
		}).start(this.props.onChangeAnimationEnd)

	renderHalfCircle = ({isFlipped = false} = {}) => {
		const {size, color, thickness, value, style} = this.props
		const valueToInterpolate =
			value.constructor.name === 'AnimatedValue'
				? value
				: this.state.animatedValue


		return (
			<Animated.View
				pointerEvents="none"
				style={[
					{
						...this.halfCircleContainerStyle,
						transform: [{scaleX: isFlipped ? -1 : 1}],
					},
					style,
				]}
			>
				<Animated.View
					style={{
						width: size,
						height: size,
						transform: [
							{
								rotate: valueToInterpolate.interpolate({
									inputRange: isFlipped ? [0, 0.5] : [0.5, 1],
									outputRange: isFlipped
										? ['180deg', '0deg']
										: ['-180deg', '0deg'],
									extrapolate: 'clamp',
								}),
							},
						],
					}}
				>
					<View style={this.halfCircleContainerStyle}>
						<View
							style={{
								...this.fullCircleStyle,
								borderWidth: thickness,
								borderColor: color,
							}}
						/>
					</View>
				</Animated.View>
			</Animated.View>
		)
	}
}
