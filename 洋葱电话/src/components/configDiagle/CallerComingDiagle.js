'use strict';
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
} from "react-native";
import React, {Fragment} from "react";
import TextEx from "../TextEx";
import Button from "../Button";
import Icon from "../../value/Svg";
import Line from "../Line";
import Kine from "../Kine";
import {inject, observer} from "mobx-react";
import {observable} from "mobx";
import Global from "../../mobx/Global";
import AutoSave from "../../TModal/AutoSave";

@observer
export class CallerComingDiagle extends React.Component {

	@observable
	hasSelect = true;
	@observable
	mode = 0;

	@observable
	timeNumber = 0;

	@AutoSave
	global: Global;

	constructor(prop) {
		super(prop);

		this.timeNumber = prop.timeNumber;
		this.startTimeUp();
	}

	startTimeUp() {
		this.timeUp = setInterval(() => {
			this.timeNumber--;
			if (this.timeNumber <= 0 && this.timeUp) {
				clearInterval(this.timeUp);
				this.timeUp = null;
			}
		}, 1000)
	}

	render() {

		return (
			<View style={styles.content}>

				<TextEx style={styles.title}>
					验证码有误
				</TextEx>
				<TextEx style={styles.content_text}>
					{'您输入的验证码有误\n' +
					'请确认你的手机号码填写正确\n' +
					'并在接听电话以后根据提示输入验证码'}
				</TextEx>

				<Line style={{marginTop: 20}}/>
				<View style={{flexDirection: 'row'}}>
					<Button style={{width: '50%', justifyContent: 'center', alignItems: 'center', height: 44}}
							onPress={() => {
								this.global.modalRef.realyHide();
								try {
									this.props.onChangePhoneCode();
								}catch (e) {}
							}}>
						<TextEx style={{fontSize: 16, color: "#999"}}>更新手机号码</TextEx>
					</Button>
					<Kine/>
					{
						this.timeNumber > 0 ? (
							<View style={{width: '50%', justifyContent: 'center', alignItems: 'center', height: 44}}>
								<TextEx style={{fontSize: 16, color: "#4A90E2"}}>重新获取（{this.timeNumber}）</TextEx>
							</View>
						) : (
							<Button style={{width: '50%', justifyContent: 'center', alignItems: 'center', height: 44}}
									disabled={!this.hasSelect}
									onPress={() => {
										this.global.modalRef.realyHide();
										try {
											this.props.onReGetCode();
										}catch (e) {}
									}}>
								<TextEx style={{fontSize: 16, color: "#4A90E2"}}>重新获取</TextEx>
							</Button>
						)
					}
				</View>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	content: {
		backgroundColor: 'white',
		width: 285,
		borderRadius: 10
	},
	title: {
		padding: 16,
		textAlign: 'center',
		fontSize: 18,
		color: "#333",
	},
	content_text: {
		paddingHorizontal: 20,
		textAlign: 'center',
		fontSize: 14,
		color: "#333",
		fontWeight: '300',
		lineHeight: 20,
	}
});
