'use strict';
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity, Image, Dimensions,
} from "react-native";
import React, {Fragment} from "react";
import AppStyle from "../../Style";
import Line from "../Line";
import Button from "../Button";
import Icon from "../../value/Svg";

let {height, width} = Dimensions.get('window');
let fit = width/365.0;

export class NewPhoneRow extends React.Component {

	constructor(props) {
		super(props);
		this.style = this.props.style?this.props.style:{};
		this.navigation = props.navigation;
	}

	render() {
		return (
			<Fragment>
				<Button style={styles.ol} onPress={()=>this.navigation.push('CountrySelect')}>
					<Icon icon={'chat_icon_onion_phonenum'} size={40} color={'#4A90E2'} style={{marginHorizontal: 15}} />
					<View style={{flex: 1, paddingRight: 10}}>
						<Text style={styles.olTitle}>获取洋葱专属电话号码</Text>
						<Text style={styles.olDetail}>所有号码均支持语音、电话、短信及彩信</Text>
					</View>
				</Button>
				<Line style={{marginHorizontal: 10}}/>
				<View style={[{paddingHorizontal: 12, marginVertical: 14}, AppStyle.row]}>
					<View style={[AppStyle.row, {justifyContent: "space-around", flex: 1}]}>
						<Image
							resizeMode={'contain'}
							style={{width: fit* 40}}
							source={require('../../assets/newimg/png/icon/common/common_icon_flag_de40.png')}
						/>
						<Image
							resizeMode={'contain'}
							style={{width: fit* 40}}
							source={require('../../assets/newimg/png/icon/common/common_icon_flag_cn40.png')}
						/>
						<Image
							resizeMode={'contain'}
							style={{width: fit* 40}}
							source={require('../../assets/newimg/png/icon/common/common_icon_flag_us40.png')}
						/>
						<Image
							resizeMode={'contain'}
							style={{width: fit* 40}}
							source={require('../../assets/newimg/png/icon/common/common_icon_flag_af40.png')}
						/>
						<Image
							resizeMode={'contain'}
							style={{width: fit* 40}}
							source={require('../../assets/newimg/png/icon/call/call_icon_more40_gray.png')}
						/>
					</View>
					<Button style={styles.getPhoneBtn}
									  onPress={()=>this.navigation.push('CountrySelect')}>
						<Text style={styles.getPhoneBtnText}>申请号码</Text>
					</Button>
				</View>
			</Fragment>
		)
	}
}



const styles = StyleSheet.create({
	getPhoneBtn: {
		backgroundColor: "#fff",
		borderRadius: 18,
		height: 36,
		paddingHorizontal: 12,
		borderWidth: 1,
		borderColor: '#4A90E2',
		justifyContent: 'center',
		alignItems: 'center'
	},
	getPhoneBtnText: {
		lineHeight: 20,
		color: "#4A90E2",
	},
	ol: {
		flexDirection: "row",
		paddingVertical: 12,
		justifyContent: 'center',
		alignItems: 'center'
	},
	olTitle: {
		fontSize: 14,
		color: "#333",
		lineHeight: 20,
	},
	olDetail: {
		fontSize: 12,
		color: "#999",
		flexWrap: 'wrap',
		lineHeight: 17,
		marginTop: 3,
	},
});

