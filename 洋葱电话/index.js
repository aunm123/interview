/**
 * @format
 */
if (!__DEV__) {
	global.console = {
		info: () => {},
		log: () => {},
		warn: () => {},
		debug: () => {},
		error: () => {},
		assert: () => {},
	};
}

import iniAppData from "./src/global/InitSpace";
import React, {Component, Fragment} from 'react';
import {AppRegistry, View, YellowBox, Text, DeviceEventEmitter} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import {Provider} from "mobx-react";

import AutoSave from "./src/TModal/AutoSave";
import AppStore from "./src/mobx/AppStore";
import Global from "./src/mobx/Global";
import Download from "./src/mobx/Download";
import BaseComponents from "./src/BaseComponents";

iniAppData();

class Root extends BaseComponents {

	@AutoSave
	AppStore: AppStore;
	@AutoSave
	Global: Global;
	@AutoSave
	Download: Download;


	constructor(props) {
		super(props);
		console.log('debug', this.AppStore, this.Global, this.Download);

		// console.log('debug', Text)
	}

	componentWillUnmount() {
		super.componentWillUnmount();
	}

	componentDidMount(): void {
		// let {taskId, filePath} = await this.download.getFileWithUrl("http://message.com/tim/test.png")

		// console.log(filePath);
	}


	render() {
		return (
			<Provider store={this.AppStore} global={this.Global} download={this.Download}>
				<App/>
			</Provider>
		);
	}
}

AppRegistry.registerComponent(appName, () => {
	console.ignoredYellowBox = ['Warning: BackAndroid is deprecated. Please use BackHandler instead.', 'source.uri should not be an empty string', 'Invalid props.style key'];

	console.disableYellowBox = true;

	return Root
});




