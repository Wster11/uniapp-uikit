import en from "./en";
import zhHans from "./zh-Hans";

const messages = {
	en,
	"zh-Hans": zhHans
};

const i18nConfig = (messages[uni.getLocale() || "en"]) || messages['zh-Hans']

const t = (key : string) => {
	return i18nConfig[key]
}

export {
	t
}