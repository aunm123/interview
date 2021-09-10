'use strict';
import * as React from "react";
import { Platform, BackHandler } from 'react-native';


export interface AppProps {
}

export default class BaseComponents<T> extends React.Component<T, any> {
	static navigationOptions = {
		header: null
	};

	constructor (props: T) {
		super(props);

		this.onBackAndroid = this.onBackAndroid.bind(this);
		if (this.props.navigation) {
			this.willFocus = this.props.navigation.addListener("willFocus", () => {
				this.onStart();
			});

			this.didFocus = this.props.navigation.addListener("didFocus", () => {
				this.onResume();
			});

			this.willBlur = this.props.navigation.addListener("willBlur", () => {
				this.onPause();
			});

			this.didBlur = this.props.navigation.addListener("didBlur", () => {
				this.onStop();
			});

		}

		if (Platform.OS === "android") {
			BackHandler.addEventListener("hardwareBackPress", this.onBackAndroid);
		}
	}

	componentWillUnmount() {
		try {
			if (this.willFocus) {
				this.willFocus.remove();
			}
			if (this.didFocus) {
				this.didFocus.remove();
			}
			if (this.willBlur) {
				this.willBlur.remove();
			}
			if (this.didBlur) {
				this.didBlur.remove();
			}
		}catch (e) {}
	}

	onBackAndroid() {
		return false;
	}

	onStart() {

	}

	onResume() {

	}

	onPause() {

	}

	onStop() {

	}
}
