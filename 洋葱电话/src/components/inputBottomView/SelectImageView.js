'use strict';
import React, {Component, Fragment} from "react";
import CameraRoll from "@react-native-community/cameraroll";
import {observable} from "mobx";
import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View} from "react-native";
import Button from "../Button";
import {inject, observer} from "mobx-react";

@inject('global')
@observer
class SelectImageView extends Component{

	@observable
	photos = [];
	@observable
	selectImageIndex = -1;

	constructor(props) {
		super(props);
		this.sendFile = props.sendFile;
		this.global = props.global;
		this.navigation = props.navigation;
	}

	componentDidMount() {
		this.selectImageIndex = -1;
		this.global.requestCameraPromisser()
			.then(() => {
				CameraRoll.getPhotos({
					first: 20,
					groupTypes: 'All',
					assetType: 'Photos'
				}).then((r) => { //成功的回调
					let edges = r.edges;
					let photos = [];
					for (let i in edges) {
						photos.push(edges[i].node.image);
					}
					this.photos = photos;
				}).catch((err) => {
					console.log("======================", err)
				});
			})
	}

	selectImage(index) {
		if (this.selectImageIndex == index) {
			this.selectImageIndex = -1
		} else {
			this.selectImageIndex = index;
		}
	}

	render() {

		let photos = [...this.photos];
		let photosView = [];
		for (let i = 0; i < 20; i += 1) {
			if (photos[i]) {
				let image = (<Image resizeMode="cover" style={styles.image} source={{uri: photos[i].uri}}/>);
				if (this.selectImageIndex === i) {
					image = (
						<Fragment>
							<Image resizeMode="cover" style={styles.image} source={{uri: photos[i].uri}}
								   blurRadius={10}/>
							<View style={[styles.absolute, {justifyContent: "center", alignItems: "center"}]}>
								<Button style={styles.sendImageBtn} onPress={() => {
									this.sendFile(photos[i])
								}}>
									<Text style={styles.sendImageBtnText}>发送</Text>
								</Button>
							</View>
						</Fragment>)
				}
				photosView.push(
					<TouchableWithoutFeedback style={styles.imageRow} onPress={() => {
						this.selectImage(i)
					}} key={i}>
						<View style={styles.imageRow}>
							{image}
						</View>
					</TouchableWithoutFeedback>
				)
			}
		}

		return (
			<Fragment>
				<ScrollView style={{flex: 1, width: '100%'}} horizontal={true}>
					<View style={styles.container}>
						{photosView}
					</View>
				</ScrollView>
				<TouchableOpacity style={[styles.moreImageBtn, {
					position: 'absolute', left: 18,
					bottom: 18
				}]} onPress={() => {
					this.navigation.push('PhotoPage', {
						snedFile: (file) => {
							this.sendFile(file)
						}
					})
				}}>
					<Image
						style={{width: 40, height: 40}}
						source={require('../../assets/newimg/png/icon/chat/chat_icon_picture_more.png')}
					/>
				</TouchableOpacity>
			</Fragment>
		)
	}


}


const styles = StyleSheet.create({
	inputView: {
		lineHeight: 20,
		fontSize: 14,
		backgroundColor: "#F5F5F5",
		borderRadius: 10,
		padding: 0,
		paddingHorizontal: 10,
	},
	imageRow: {
		width: 144,
		height: 258,
	},
	container: {
		alignItems: 'center',
		height: 258,
		flexDirection: "row",
	},
	image: {
		width: "100%",
		height: 258,
	},
	absolute: {
		position: "absolute",
		width: "100%",
		height: "100%",
		left: 0,
		top: 0
	},
	sendImageBtn: {
		justifyContent: "center",
		alignItems: "center",
		width: 38,
		height: 38,
		borderRadius: 19,
		backgroundColor: "rgba(0,0,0,0.4)"
	},
	moreImageBtn: {
		justifyContent: "center",
		alignItems: "center",
		width: 38,
		height: 38,
		borderRadius: 19,
	},
	sendImageBtnText: {
		color: "white",
		fontSize: 12
	}
});

export default SelectImageView
