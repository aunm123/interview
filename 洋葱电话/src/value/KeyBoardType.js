'use strict';
export let KeyboardType = {
	normal: 'normal',
	emoji: 'emoji',
};

export let KeyboardHeight = function (type) {
	let h = 0;
	switch (type) {
		case 'normal' : {
			h = 258;
		}
		case 'emoji' : {
			h = 200;
		}
	}
	return h;
}
