'use strict';
import React from "react";
import {DeviceEventEmitter, Image} from "react-native";
import {inject, observer} from "mobx-react";
import {observable} from "mobx";
import RNFetchBlob from 'rn-fetch-blob'
import {Text, View} from "react-native";
import * as md5 from "md5";
import TextEx from "./TextEx";

@inject('global', 'store', 'download')
@observer
export default class CacheImageView extends React.Component {

	@observable
	filePath = null;

	constructor(props) {
		super(props);
		this.download = this.props.download;
		this.bigUrl = props.bigUrl;

		if (/^http|https/.test(this.bigUrl)){

		} else {
			this.filePath = this.bigUrl;
			console.log('use local file', this.bigUrl)
		}
	}

	componentDidMount() {
		if (!this.filePath){
			this.download.getFileWithUrl(this.bigUrl)
				.then(({taskId, filePath})=>{
					if (taskId){
						this.download.startTaskDownload(taskId)
							.then((filePath)=>{
								this.filePath = filePath;
							})
					}
					this.filePath = filePath;
				}, (error)=>{
					console.log(error)
				})
		}
	}

	componentWillUnmount() {

	}

	render() {
		if (this.filePath) {
			return (
				<Image
					style={{...this.props.style}}
					source={{uri: this.filePath}}
				/>
			)
		}else {
			return (
				<View>
					<TextEx style={{color: '#FFF'}}>加载中...</TextEx>
				</View>
			)
		}
	}
}
