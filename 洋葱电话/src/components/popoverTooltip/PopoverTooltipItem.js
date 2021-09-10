// @flow

import type {
	StyleObj,
} from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

import * as React from 'react';
import {
	View,
	TouchableOpacity,
	StyleSheet,
	Text,
	ViewPropTypes, Dimensions,
} from 'react-native';
import PropTypes from 'prop-types';
import TextEx from "../TextEx";
import Button from "../Button";

let width = Dimensions.get('window').width;

export type Label = string | () => React.Node;
export const labelPropType = PropTypes.oneOfType([
	PropTypes.string,
	PropTypes.func,
]);

type Props = {
	onPress: (userCallback: () => void) => void,
	onPressUserCallback: () => void,
	label: Label,
	containerStyle: ?StyleObj,
	labelStyle: ?StyleObj,
};
class PopoverTooltipItem extends React.PureComponent<Props> {

	static propTypes = {
		onPress: PropTypes.func.isRequired,
		onPressUserCallback: PropTypes.func.isRequired,
		label: labelPropType.isRequired,
		containerStyle: ViewPropTypes.style,
		labelStyle: Text.propTypes.style,
	};
	static defaultProps = {
		labelStyle: null,
		containerStyle: null,
	};

	render() {
		let label = typeof this.props.label === 'string'
			? <Text style={this.props.labelStyle}>{this.props.label}</Text>
			: this.props.label();

		return (
			<View style={[styles.itemContainer, this.props.containerStyle]}>
				<Button onPress={this.onPress}>
					{label}
				</Button>
			</View>
		);
	}

	onPress = () => {
		this.props.onPress(this.props.onPressUserCallback);
	}

}

const styles = StyleSheet.create({
	itemContainer: {
		padding: 0,
	},
});

export default PopoverTooltipItem;
