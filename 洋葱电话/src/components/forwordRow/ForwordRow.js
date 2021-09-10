'use strict';
import {
	StyleSheet,
	Text,
	View,
} from "react-native";
import React, {Fragment} from "react";
import Button from "../Button";
import Icon from "../../value/Svg";
import TextEx from "../TextEx";
import {observable, observe, toJS} from "mobx";
import {observer} from "mobx-react";

@observer
export class ForwordRow extends React.Component {

	@observable
	hasSelect = false;

	from = null;
	item = null;
	icon = null;

	constructor(props) {
		super(props);

		this.item = props.data;
		this.from = props.from;
		this.icon = props.icon;
		this.hasSelect = props.hasSelect;
	}

	shouldComponentUpdate(nextProps, nextState, nextContext) {
		this.item = nextProps.data;
		this.from = nextProps.from;
		this.icon = nextProps.icon;
		this.hasSelect = nextProps.hasSelect;
		return false
	}

	render() {

		let item = {...this.item};

		return (
			<Fragment>
				<Button style={styles.row}
						onPress={() => {
							try {
								this.hasSelect = !this.hasSelect;
								this.props.onPress(this.hasSelect);
							} catch (e) {
							}
						}}
				>
					<View style={{flexDirection: "row", alignItems: "center", minHeight: 74,}}>
						{
							this.hasSelect ?
								<Icon style={{marginRight: 6}} icon={'call_icon_chose24_select'} size={25}
									  color={'#4A90E2'}/> :
								<Icon style={{marginRight: 6}} icon={'call_icon_chose24_normal'} size={25}
									  color={'#4A90E2'}/>
						}
						{this.icon}
						<View style={{flex: 1}}>
							<TextEx style={styles.row_title}>{item.name}</TextEx>
							{this.from}
						</View>
						<TextEx>+{item.country_no} {this.phone_no}</TextEx>
					</View>
				</Button>
			</Fragment>
		)
	}
}


const styles = StyleSheet.create({
	row: {
		backgroundColor: "#fff",
		paddingHorizontal: 10,
	},
	row_title: {
		fontSize: 16,
		marginLeft: 10,
		lineHeight: 23,
	},
});

