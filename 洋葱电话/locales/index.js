'use strict';

import I18n from 'react-native-i18n';

// Import all locales
import en from './en.json';
import zh from './zh.json';

//默认为英文
I18n.defaultLocale = 'en';
I18n.fallbacks = true;

// Define the supported translations
I18n.translations = {
	zh,
	en
};

// The method we'll use instead of a regular string
export function strings(name, params = {}) {
	return I18n.t(name, params);
};

export default I18n;
