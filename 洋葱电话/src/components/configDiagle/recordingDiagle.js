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
export class RecordingDiagle extends React.Component {

	@observable
	hasSelect = true;
	@observable
	mode = 0;

	@AutoSave
	global: Global;

	constructor() {
		super();
	}

	renderMode() {
		let component = null;
		switch (this.mode) {
			case 0: {
				component = (
					<Fragment>
						<TextEx style={styles.title}>
							电话录音计费
						</TextEx>
						<TextEx style={{
							paddingHorizontal: 20, textAlign: 'left', fontSize: 16,
							fontWeight: '300', lineHeight: 20, color: '#333',
						}}>
							电话录音1~10分钟消耗2洋葱币，10~30分钟消耗6洋葱币，30分钟及以上消耗20洋葱币
						</TextEx>
						<View style={{flexDirection: 'row', marginTop: 20, paddingHorizontal: 20}}>
							<Button hitSlop={{top: 15, right: 15, bottom: 15, left: 15}} onPress={() => {
								this.hasSelect = !this.hasSelect;
							}}>
								{
									this.hasSelect ?
										<Icon style={{marginRight: 6}} icon={'call_icon_chose24_select'} size={25}
											  color={'#4A90E2'}/> :
										<Icon style={{marginRight: 6}} icon={'call_icon_chose24_normal'} size={25}
											  color={'#4A90E2'}/>
								}
							</Button>
							<TextEx style={{fontSize: 16, fontWeight: '300', lineHeight: 25, color: '#333'}}>
								电话录音
							</TextEx>
							<Button onPress={()=>{
								this.mode = 1;
								this.hasSelect = true;
							}}>
								<TextEx style={{
									fontSize: 16,
									fontWeight: '300',
									lineHeight: 25,
									color: '#4A90E2',
									textDecorationLine: 'underline'
								}}>
									免责声明
								</TextEx>
							</Button>
						</View>
					</Fragment>
				);
				break
			}
			case 1: {
				component = (
					<Fragment>
						<TextEx style={{padding: 16, textAlign: 'center', fontSize: 18, fontWeight: '300'}}>
							免费声明
						</TextEx>
						<TextEx style={{paddingHorizontal: 20, textAlign: 'left', fontSize: 16, fontWeight: '300', lineHeight: 20}}>
							电话录音需符合相关国家法律法规，另外，个人电话录音只可以用在存档、参考之用，不应用作法律证据。
						</TextEx>
					</Fragment>
				)
			}
		}

		return component;
	}

	render() {

		let component = this.renderMode();

		return (
			<View style={styles.content}>

				{component}

				<Line style={{marginTop: 20}}/>
				<View style={{flexDirection: 'row'}}>
					<Button style={{width: '50%', justifyContent: 'center', alignItems: 'center', height: 44}}
							onPress={() => {
								this.global.modalRef.realyHide();
							}}>
						<TextEx style={{fontSize: 16, color: "#4A90E2"}}>取消</TextEx>
					</Button>
					<Kine/>
					<Button style={{width: '50%', justifyContent: 'center', alignItems: 'center', height: 44}}
							disabled={!this.hasSelect}
							onPress={() => {
								this.global.modalRef.realyHide();
								try {
									this.props.onSuccess();
								}catch (e) {}
							}}>
						<TextEx style={{fontSize: 16, color: "#4A90E2"}}>电话录音</TextEx>
					</Button>
				</View>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	content: {
		backgroundColor: 'white',
		width: 280,
		borderRadius: 5
	},
	title: {
		padding: 16,
		textAlign: 'center',
		fontSize: 18,
		fontWeight: '300'
	},
});
