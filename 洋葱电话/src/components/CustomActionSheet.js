'use strict';
import {
	Dimensions,
	StyleSheet,
	Text,
	View,
} from "react-native";
import React, {Fragment} from "react";
import Button from "./Button";
import Line from "./Line";
import TextEx from "./TextEx";
import {inject, observer} from "mobx-react";

const {height, width} = Dimensions.get('window');

@inject('store', 'global')
@observer
export default class CustomActionSheet extends React.Component {

	constructor(props) {
		super(props);
		this.options = this.props.options || [];
		this.click = this.props.click;
		this.title = this.props.title;
		this.cancelIndex = this.props.cancelIndex;

		this.global = this.props.global;
	}

	render() {

		let mapButtonMaps = this.options.map((value, index) => {

			if (index == this.cancelIndex) {
				return null;
			}

			let line = index > (this.options.length - 1) ? null : (<Line/>);
			return (
				<Fragment key={'action'+index}>
					{line}
					<Button style={{
						height: 57,
						justifyContent: 'center',
						alignItems: 'center',
						overflow: 'hidden'
					}} onPress={()=>{
						this.global.modalRef.handlehide()
						if (this.click){
							this.click(index)
						}
					}}>
						<TextEx style={{color: '#4A90E2', fontSize: 18}}>
							{value}
						</TextEx>
					</Button>
				</Fragment>
			)
		});

		let cancelBtn = this.options.map((value, index) => {
			if (index == this.cancelIndex) {
				return (
					<Fragment key={'cancel'+index}>
						<Button style={{
							height: 57,
							justifyContent: 'center',
							alignItems: 'center',
						}} onPress={()=>this.global.modalRef.handlehide()}>
							<TextEx style={{color: '#4A90E2', fontSize: 18}}>
								{value}
							</TextEx>
						</Button>
					</Fragment>
				);
			} else {
				return null;
			}
		});

		return (
			<View style={{
				width: width,
			}}>
				<View style={{marginHorizontal: 15, borderRadius: 13, backgroundColor: 'white',}}>
					<Button style={{
						height: 44,
						justifyContent: 'center',
						alignItems: 'center',

					}}>
						<TextEx style={{color: '#999'}}>{this.title}</TextEx>
					</Button>


					{mapButtonMaps}


				</View>
				<View style={{
					marginTop: 10, marginHorizontal: 15,
					marginBottom: 10, borderRadius: 13, backgroundColor: 'white',
				}}>
					{cancelBtn}
				</View>


			</View>
		)
	}
}
