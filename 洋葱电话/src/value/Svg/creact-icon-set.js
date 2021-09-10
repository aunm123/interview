import React, { Component } from 'react';
import SvgUri from '../../components/SvgComponet/SvgComponent'

export default function creactIconSet(svg, fontName) {
	return class Icon extends Component {
		render () {
			const { icon, color, size, style } = this.props;
			let svgXmlData = svg[icon];

			if (!svgXmlData) {
				let err_msg = `no "${icon}"`;
				throw new Error(err_msg);
			}
			let sstyle = {...style, width: size, height: size};
			return (
				<SvgUri width={size} height={size} svgXmlData={svgXmlData} fill={color} style={sstyle} />
			);
		}
	};
}
