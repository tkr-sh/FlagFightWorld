import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

i18next
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .use(resourcesToBackend((language, namespace) => import(`../../public/locales/${language}/translation.json`)))
    .init({
        // lng: '',
        fallbackLng: 'en',
        debug: true,
        // backend: {
        //     loadPath: './translation.json'
        // }

        // interpolation: {
        //   escapeValue: false, // not needed for react as it escapes by default
        // },
    });

export default i18next;