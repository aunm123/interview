'use strict';
import React, {Fragment, Component} from 'react';
import {
	Text, View,
	StyleSheet,
	TouchableOpacity,
	StatusBar,
	Animated,
	Dimensions,
	Image, ScrollView, Alert,
	ImageBackground, SectionList, FlatList
} from 'react-native';
import Slider from "react-native-slider";
import {strings} from "../../../locales";
import {inject, observer} from "mobx-react";
import AppStyle, {font} from '../../Style';
import NavBar from "../../components/NavBar";
import Line from "../../components/Line";
import URLS from "../../value/URLS";
import Req from "../../global/req";
import Util from "../../global/Util";
import Button from "../../components/Button";
import {observable, toJS} from "mobx";
import SafeView from "../../components/SafeView";
import TextEx from "../../components/TextEx";
import {DownloadList} from "../../global/DownloadList";
import AutoSave from "../../TModal/AutoSave";
import VoiceMessageRow from "../../components/messageRow/VoiceMessageRow";
import Global from "../../mobx/Global";
import Sound from 'react-native-sound';
import BaseComponents from "../../BaseComponents";

var {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
export default class VoicePage extends BaseComponents {

	@observable
	data = [];
	@observable
	currentSlideValue = 0.0;

	@AutoSave
	DownloadList: DownloadList;


	currentSound: Sound = null;
	currentProgressTimer = null;
	currentFilePath = null;
	timerpause = false;

	currentCallback: null;

	global: Global;

	constructor(props) {
		super(props);
		this.navigation = props.navigation;
		this.global = props.global;
	}

	_renderItem(item, index){
		return <VoiceMessageRow data={item}
								stopVoice={()=>{this.stopSound()}}
								startVoice={(filePath, callback, startTime)=>{this.startSound(filePath, callback, startTime)}}
								pauseVoice={(...args)=>this.pausVoice(...args)}
		/>
	}

	startSound(filePath, callback, startTime) {
		if (this.currentSound){
			this.currentCallback('stop');
			this.stopSound();
		}
		this.currentCallback = callback;
		Sound.setCategory('Playback', true);
		let whoosh = new Sound( filePath , '', (error) => {
			if (error) {
				console.log('failed to load the sound', filePath, error);
				this.stopSound();
				this.global.presentMessage('文件出错，播放失败');
				return;
			}
			// loaded successfully
			console.log('duration in seconds: ' + whoosh.getDuration() + 'number of channels: ' + whoosh.getNumberOfChannels());

			this.currentFilePath = filePath;
			whoosh.setCurrentTime(startTime);
			callback('start');
			// Play the sound with an onEnd callback
			whoosh.play((success) => {
				if (success) {
					console.log('successfully finished playing');
					callback('stop');
					this.stopSound();
				} else {
					console.log('playback failed due to audio decoding errors');
					callback('stop');
					this.stopSound();
				}
			});

			if (callback){
				this.currentProgressTimer = setInterval(()=>{
					if (!this.timerpause){
						whoosh.getCurrentTime((seconds) => {
							callback('progress', parseInt(seconds));
						});
					}
				}, 100)
			}

		});

		this.currentSound = whoosh;
	}

	pausVoice(value, filepath, startTime, callback) {
		if(this.currentFilePath != filepath){
			return;
		}
		if (this.currentSound) {
			if (value){
				this.timerpause = true;
				this.currentSound.pause();
			} else {
				this.currentSound.setCurrentTime(startTime);
				this.timerpause = false;
				this.currentSound.play((success)=>{
					if (success) {
						console.log('successfully finished playing');
						callback('stop');
						this.stopSound();
					} else {
						console.log('playback failed due to audio decoding errors');
						callback('stop');
						this.stopSound();
					}
				});
			}
		}
	}

	stopSound() {
		if (this.currentProgressTimer){
			clearInterval(this.currentProgressTimer);
			this.currentProgressTimer = null;
		}
		if (this.currentSound) {
			this.currentSound.stop();
			this.currentSound.release();
			this.currentSound = null;
			this.currentFilePath= null;
		}
	}

	componentDidMount(): void {
		// CustomStorage.setItem('globalDownloadListCache', "{}");
		this.getData().then();
	}

	componentWillUnmount(): void {
		super.componentWillUnmount();

		this.stopSound();
	}

	async getData() {
		this.global.showLoading();
		let res = await Req.post(URLS.GET_RECORDING, {});
		this.data = res.data;
		this.global.dismissLoading();
	}

	render() {

		let data = [...this.data];

		return (
			<Fragment>
				<StatusBar barStyle="dark-content"/>
				<SafeView>
					<NavBar title={strings('VoicePage.title')}
							bottom_line={true}
							leftRender={(
								<Button style={{paddingLeft: 6, paddingRight: 12}} onPress={() => this.navigation.pop()}>
									<Image
										style={{width: 22, height: 22}}
										source={require('../../assets/img/util/ic_back_black.png')}
									/>
								</Button>
							)}
							// rightRender={(
							// 	<Button style={{paddingRight: 6}} onPress={() => {
							// 		this.quite()
							// 	}}>
							// 		<TextEx style={{lineHeight: 22, color: '#4A90E2', fontSize: 16}}>
							// 			{strings('VoicePage.edit')}
							// 		</TextEx>
							// 	</Button>
							// )}
					/>
					<FlatList
						ref={'flatlist'}
						style={{backgroundColor: "white", flex: 1}}
						contentContainerStyle={{paddingVertical: 16}}
						keyboardDismissMode={'on-drag'}
						renderItem={({item, index}) => this._renderItem(item, index)}
						data={data}
						keyExtractor={(item, index) => item + index}
						stickySectionHeadersEnabled={false}
						ItemSeparatorComponent={() =>
							<View style={{height: 16}} />
						}
					/>
				</SafeView>

			</Fragment>
		)
	}
}

const styles = StyleSheet.create({
});
