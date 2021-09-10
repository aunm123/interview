import { StyleSheet } from 'react-native';

export function font(size){ return {fontSize: size} }

export default StyleSheet.create({
	row: {
		flexDirection: 'row',
	},
	white:{
		color: "#FFF"
	},
	block:{
		fontWeight: "500"
	},
	hcenter: {
		justifyContent: "flex-start",
		alignItems: "center"
	},
	vcenter: {
		justifyContent: "center",
		alignItems: "center"
	},
	light: {
		fontWeight: "300"
	},
	bgColor: {
		backgroundColor: 'rgba(0,0,0,0.6)'
	},
	bColor: {
		borderColor: "#E6E6E6"
	},
	mainFontFamily: {
		fontWeight: '300',
		fontFamily: 'PingFangSC-Regular',
		lineHeight: 20
	},
	titleFontFamily: {
		fontFamily: 'PingFangSC-Medium',
		fontWeight: '500',
	},
	tipText: {
		color: '#FFF',
		fontSize: 14,
		lineHeight: 20,
		fontWeight: '400'
	},
	point: {
		width: 12,
		height: 12,
		backgroundColor: '#4A90E2',
		borderRadius: 6,
	}
});
