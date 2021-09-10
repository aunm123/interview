'use strict';

import React from "react";
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	View,
	Dimensions,
	Image
} from "react-native";
import {inject, observer} from "mobx-react";
import {observable} from "mobx";
import AutoSave from "../../TModal/AutoSave";

let width = Dimensions.get('window').width;
let height = Dimensions.get('window').height;

@observer
export default class Loading extends React.Component {

	@AutoSave
	global;
	@observable
	isLoading = false;

	@observable
	loadingMessage = '请稍后...';

	componentDidMount(): void {
		this.minShowingTime = 200;

		this.global.loadingRef = this;
	}

	setIsLoading = (isLoading) => {
		if (isLoading != this.isLoading) {
			let curTimeLong = new Date().getTime();
			if (isLoading) {
				this.startTime = curTimeLong;
				this.isLoading = isLoading;
			} else {
				let hasShowingTimeLong = curTimeLong - this.startTime;
				if (hasShowingTimeLong < this.minShowingTime) {
					setTimeout(() => {
						this.isLoading = isLoading;
					}, this.minShowingTime - hasShowingTimeLong);

				} else {
					this.isLoading = isLoading;
				}
			}

		}
	};

	showLoading = () => {
		this.setIsLoading(true);
		this.loadingMessage = '请稍后...';
	};
	dismissLoading = () => {
		this.setIsLoading(false);
	};

	showProgress = (message) => {
		this.loadingMessage = message;
		this.setIsLoading(true);
	};

	render() {
		if (!this.isLoading) {
			return null;
		}
		return (
			<View style={{
				flex : 1,
				width : width,
				height : height,
				position : 'absolute',
				// backgroundColor : '#10101099',
			}}>
				<View style={styles.loading}>
					{/*<ActivityIndicator color="white"/>*/}
					{/*<Text style={styles.loadingTitle}>{this.loadingMessage}</Text>*/}
					<Image style={{width: 80, height: 80, marginRight: 7}}
						   source={require('../../assets/img/gif/loading.gif')}/>
				</View>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	loading : {
		backgroundColor : 'rgba(0,0,0, 0.05)',
		height : 100,
		width : 100,
		borderRadius : 10,
		justifyContent : 'center',
		alignItems : 'center',
		position : 'absolute',
		top : (height - 100) / 2,
		left : (width - 100) / 2,
	},

	loadingTitle : {
		marginTop : 10,
		fontSize : 14,
		color : 'white'
	}
});
