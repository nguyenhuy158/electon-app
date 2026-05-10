import { MESSAGES as en } from './en';
import { MESSAGES as vi } from './vi';

const locales = { en, vi };
type LocaleType = keyof typeof locales;

const systemLocaleRaw = process.env.LANG || 'en';
const systemLocale = systemLocaleRaw.split('_')[0] as LocaleType;
const currentLocale: LocaleType = locales[systemLocale] ? systemLocale : 'en';

export const i18n = locales[currentLocale];
