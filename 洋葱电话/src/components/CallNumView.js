'use strict';

import React from "react";
import {
	ActivityIndicator,
	TouchableOpacity,
	StyleSheet,
	Text,
	View,
	Dimensions, Image
} from "react-native";

import {inject, observer} from "mobx-react";
import {strings} from "../../locales";
let {height, width} = Dimensions.get('window');
import Button from "./Button";
import {observable} from "mobx";
import Icon from "../value/Svg";
import TextEx from "./TextEx";
let btn = parseInt(width / 375.0 * 64, 10);

@inject('global')
@observer
export default class CallNumView extends React.Component {

	deleTimer = null;

	constructor(props) {
		super(props);
	}

	messageBtnPress() {
		if (this.props.messageClick) {
			this.props.messageClick()
		}
	}

	numberChange({phone_no, country_no}) {
		if (this.props.onNumberChange) {
			this.props.onNumberChange({phone_no, country_no});
		}
	}

	callBtnPress() {
		if (this.props.onCallBtnPress) {
			this.props.onCallBtnPress();
		}
	}

	numberClick(num) {
		let phone_no = this.props.phone_no;
		let country_no = this.props.country_no;
		switch (num) {
			case 0:
			case 1:
			case 2:
			case 3:
			case 4:
			case 5:
			case 6:
			case 7:
			case 8:
			case 9: {
				phone_no +=num.toString();
				break;
			}
			case 10:{
				phone_no +="*";
				break
			}
			case 11:{
				phone_no +="#";
				break
			}
			case 12:{
				if (phone_no.length<=0){
					country_no = country_no.substring(0,country_no.length-1);
				} else {
					phone_no = phone_no.substring(0,phone_no.length-1);
				}
				break
			}
		}

		this.numberChange({phone_no, country_no})
	}

	longDelete(){
		this.deleTimer = setInterval(()=>{
			this.numberClick(12);
		}, 100)
	}

	rfDeleTimer(){
		if (this.deleTimer){
			clearInterval(this.deleTimer);
			this.deleTimer = null;
		}
	}

	render() {
		return (
			<View style={{alignItems: 'center', width: '100%'}}>
				<View style={styles.callView}>
					<View style={styles.row}>
						<TouchableOpacity style={styles.numBtn} onPress={()=>this.numberClick(1)}>
							<Text style={styles.numBtnText}>1</Text>
							<Text style={styles.minNumBtnText}></Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.numBtn} onPress={()=>this.numberClick(2)}>
							<Text style={styles.numBtnText}>2</Text>
							<Text style={styles.minNumBtnText}>A B C</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.numBtn} onPress={()=>this.numberClick(3)}>
							<Text style={styles.numBtnText}>3</Text>
							<Text style={styles.minNumBtnText}>D E F</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.row}>
						<TouchableOpacity style={styles.numBtn} onPress={()=>this.numberClick(4)}>
							<Text style={styles.numBtnText}>4</Text>
							<Text style={styles.minNumBtnText}>G H I</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.numBtn} onPress={()=>this.numberClick(5)}>
							<Text style={styles.numBtnText}>5</Text>
							<Text style={styles.minNumBtnText}>J K L</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.numBtn} onPress={()=>this.numberClick(6)}>
							<Text style={styles.numBtnText}>6</Text>
							<Text style={styles.minNumBtnText}>N M O</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.row}>
						<TouchableOpacity style={styles.numBtn} onPress={()=>this.numberClick(7)}>
							<Text style={styles.numBtnText}>7</Text>
							<Text style={styles.minNumBtnText}>P Q R</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.numBtn} onPress={()=>this.numberClick(8)}>
							<Text style={styles.numBtnText}>8</Text>
							<Text style={styles.minNumBtnText}>S T U</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.numBtn} onPress={()=>this.numberClick(9)}>
							<Text style={styles.numBtnText}>9</Text>
							<Text style={styles.minNumBtnText}>V W Y</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.row}>
						<TouchableOpacity style={styles.numBtn} onPress={()=>this.numberClick(10)}>
							<Text style={styles.numBtnText}>*</Text>
							<Text style={styles.minNumBtnText}>Z</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.numBtn} onPress={()=>this.numberClick(0)}>
							<Text style={styles.numBtnText}>0</Text>
							<Text style={styles.minNumBtnText}>+</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.numBtn} onPress={()=>this.numberClick(11)}>
							<Text style={styles.numBtnText}>#</Text>
							<Text style={styles.minNumBtnText}></Text>
						</TouchableOpacity>
					</View>

					<View style={[styles.row, {marginTop: 8}]}>
						<Button style={[styles.vBtn, {opacity: this.props.messageIsUseful?1:0.3}]}
								disabled={!this.props.messageIsUseful}
								onPress={()=>this.messageBtnPress()} >
							<Image
								resizeMode={'contain'}
								style={{width: btn/64 * 60, height: btn/64 * 60}}
								source={require('../assets/newimg/png/icon/call/call_icon_open_msg.png')}
							/>
						</Button>
						<Button onPress={()=>this.callBtnPress()}>
							<Icon icon={'call_icon_btn_phone'} size={btn/64 *72} color={'#4A90E2'} />
						</Button>
						<TouchableOpacity style={styles.vBtn}
										  onPress={()=>this.numberClick(12)}
										  onLongPress={()=>this.longDelete()}
										  onPressOut={()=>this.rfDeleTimer()}>
							<Image
								resizeMode={'contain'}
								style={{width: btn/64 * 60, height: btn/64 * 60}}
								source={require('../assets/newimg/png/icon/call/call_icon_delete_number.png')}
							/>
						</TouchableOpacity>
					</View>
				</View>


			</View>)
	}
}

const styles = StyleSheet.create({
	callView: {
		paddingTop: 0,
		marginTop: 8,
		marginBottom: 28,
		paddingHorizontal: 44,
		width: '100%'
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	numBtn: {
		marginBottom: 8,
		padding: 5,
		width: btn,
		height: btn,
		borderRadius: 35,
		backgroundColor: '#F3F3F3'
	},
	numBtnText: {
		width: '100%',
		fontSize: btn/70 *34,
		color: '#333333',
		textAlign: 'center'
	},
	minNumBtnText: {
		width: '100%',
		fontSize: 10,
		color: '#333333',
		textAlign: 'center'
	},
	vBtn: {
		width: btn/64 * 60,
		height: btn/64 * 60,
		justifyContent: 'center',
		alignItems: 'center',
	}
});
