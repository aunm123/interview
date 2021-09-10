'use strict';
import React, {Fragment, Component} from 'react';
import {
	Text, View,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	Animated,
	Dimensions,
	Image, ActivityIndicator,
} from 'react-native';
import moment from "moment";
import TextEx from "../TextEx";
import AppStyle from "../../Style";
import Slider from "react-native-slider";
import AutoSave from "../../TModal/AutoSave";
import {DownloadList} from "../../global/DownloadList";
import {observable, toJS} from "mobx";
import Util from "../../global/Util";
import {inject, observer} from "mobx-react";
import Video from "react-native-video";
import Icon from "../../value/Svg";

@inject('store', 'global')
@observer
export default class VoiceMessageRow extends Component {

	@AutoSave
	DownloadList: DownloadList;

	@observable
	filePath = null;
	@observable
	playing = false;
	@observable
	startTimer = 0;

	constructor(props) {
		super(props);
		this.data = props.data;
	}

	componentDidMount(): void {
		console.log(toJS(this.data));

		let mp3URl = this.data['record_url'];
		let {taskid, task} = this.DownloadList
			.createDownloadTask({}, mp3URl);

		task.setFinishBlock((filePath) => {
			const downloadDest = `file://${filePath}`;
			this.filePath = downloadDest;
		});
		this.DownloadList.startDownloadTask(task);
	}


	startVoice() {
		this.playing = true;
		if (this.props.startVoice){
			this.props.startVoice(this.filePath, this.callBackStatus.bind(this), this.startTimer);
		}
	}

	stopVoice() {
		this.playing = false;
		if (this.props.stopVoice){
			this.props.stopVoice();
		}
	}

	pauseVoice(...arg) {
		if (this.props.pauseVoice){
			this.props.pauseVoice(...arg);
		}
	}

	callBackStatus(status, data){
		switch (status) {
			case 'start': {
				break;
			}
			case 'stop': {
				this.playing = false;
				this.startTimer = 0;
				break;
			}
			case 'progress': {
				this.startTimer = data + 1;
				break;
			}
		}
	}

	btnVoiceChange (value) {
		this.pauseVoice(true, this.filePath);
		this.startTimer += value;
		let v = this.startTimer + value;
		let mesasa = Math.min(Math.max(parseInt(v), 0), this.data['duration']);
		this.startTimer = mesasa;
		this.pauseVoice(false, this.filePath, mesasa, this.callBackStatus.bind(this), );
	}

	_renderVoiceFoot() {
		let endTimeM = Util.prefix(2, parseInt(this.data['duration'] / 60));
		let endTimeS = Util.prefix(2, parseInt(this.data['duration'] % 60));

		let startTimeM = Util.prefix(2, parseInt(this.startTimer / 60));
		let startTimeS = Util.prefix(2, parseInt(this.startTimer % 60));

		let progress = this.startTimer;

		return (
			<Fragment>
				<View style={{marginTop: 8}}>

					<Slider
						value={progress}
						onValueChange={value => this.startTimer = value}
						onSlidingStart={()=>{
							this.pauseVoice(true, this.filePath);
						}}
						onSlidingComplete={()=>{
							this.pauseVoice(false, this.filePath, parseInt(this.startTimer), this.callBackStatus.bind(this));
						}}
						minimumTrackTintColor={'#4A90E2'}
						maximumTrackTintColor={'#E6E6E6'}
						thumbTintColor={'#4A90E2'}
						thumbTouchSize={{width: 40, height: 40}}
						thumbStyle={{width: 8, height: 8}}
						trackStyle={{height: 2}}
						style={{height: 24, overflow: 'hidden'}}
						minimumValue={0}
						step={1}
						animationType={"spring"}
						maximumValue={parseInt(this.data['duration'])}
					/>
					<View style={AppStyle.row}>
						<TextEx style={{fontSize: 12, color: '#999'}}>{startTimeM}:{startTimeS}</TextEx>
						<View style={{flex: 1}}/>
						<TextEx style={{fontSize: 12, color: '#999'}}>{endTimeM}:{endTimeS}</TextEx>
					</View>
				</View>
				<View style={[AppStyle.row, {justifyContent: 'center', alignItems: 'center'}]}>
					<TouchableOpacity style={{marginHorizontal: 22}} onPress={()=>{
						this.btnVoiceChange(Math.max(parseInt(this.data['duration'] * 0.1), 1) * -1)
					}}>
						<Icon icon={'personal_icon_rewind'} size={24} color={'#4A90E2'} />
					</TouchableOpacity>
					<TouchableOpacity style={{marginHorizontal: 22}} onPress={()=>{
						if (this.playing){
							this.stopVoice()
						} else {
							this.startVoice()
						}
					}}>
						{
							!this.playing? <Icon icon={'personal_icon_play'} size={24} color={'#4A90E2'} />:
								<Icon icon={'personal_icon_use_pause'} size={24} color={'#4A90E2'} />
						}
					</TouchableOpacity>
					<TouchableOpacity style={{marginHorizontal: 22}} onPress={()=>{
						this.btnVoiceChange(Math.max(parseInt(this.data['duration'] * 0.1), 1))
					}}>
						<Icon icon={'personal_icon_forward'} size={24} color={'#4A90E2'} />
					</TouchableOpacity>
				</View>
			</Fragment>
		)
	}

	_renderDownloading() {
		return (
			<Fragment>
				<View style={{marginTop: 14}}>
					<ActivityIndicator size="small" color="#4A90E2" />
				</View>
				<TextEx style={{fontSize: 16, color: '#333', lineHeight: 22, alignSelf: 'center', marginTop: 16}}>
					正在处理该录音
				</TextEx>
			</Fragment>
		)
	}

	render() {

		let dateTitle = moment(this.data['create_time']).format('YYYY/MM/DD');
		let phoneNum = Util.fixNumber(this.data['phone_no']);
		phoneNum = '+' + phoneNum.country_no + ' ' + phoneNum.phone_no;

		let voicePathComponent = this.filePath ? this._renderVoiceFoot() : this._renderDownloading();

		return (
			<View style={styles.voiceStyle}>
				<View style={AppStyle.row}>
					<Icon icon={'personal_icon_callin'} size={24} color={'#4A90E2'} />
					<TextEx style={{fontSize: 16, color: '#333', flex: 1, lineHeight: 22, marginLeft: 5}}>
						{phoneNum}
					</TextEx>
					<TextEx style={{fontSize: 12, color: '#999', lineHeight: 22}}>
						{dateTitle}
					</TextEx>
				</View>
				{ voicePathComponent }
			</View>);
	}
}

const styles = StyleSheet.create({
	voiceStyle: {
		backgroundColor: '#FFF',
		borderRadius: 8,
		height: 127,
		marginHorizontal: 16,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.16,
		shadowRadius: 3.84,
		flex: 1,
		padding: 16,
	},
	backgroundVideo: {
		position: 'absolute',
		top: 0,
		left: 0,
		bottom: 0,
		right: 0,
	},
});

