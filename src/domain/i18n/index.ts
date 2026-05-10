import { MESSAGES as en } from './en';
import { MESSAGES as vi } from './vi';

const locales = { en, vi };
type LocaleType = keyof typeof locales;

// Simple logic to detect system locale or fallback to English
const systemLocale = (process.env.LANG || 'en').split('_')[0] as LocaleType;
const currentLocale: LocaleType = locales[systemLocale] ? systemLocale : 'en';

export const i18n = locales[currentLocale];
