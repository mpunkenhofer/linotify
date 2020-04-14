import { Preferences } from "../common/types";
import { i18n } from "./i18n";

export const defaultPreferences: Preferences = {
    popupTheme: 'light',
    popupCollapsibleStatuses: {
        playing: true,
        online: true,
        offline: false,
    },
    notificationsEnabled: true,
    displayBadgeTextEnabled: true,
}

export const TITLES = {
    'LM': i18n.lm,
    'CM': i18n.cm,
    'WCM': i18n.wcm,
    'NM': i18n.nm,
    'WNM': i18n.wnm,
    'FM': i18n.fm,
    'WFM': i18n.wfm,
    'IM': i18n.im,
    'WIM': i18n.wim,
    'GM': i18n.gm,
    'WGM': i18n.wgm,
} 

export const ICONS = {
    'bullet': 'T',
    'blitz': ')',
    'rapid': '#',
    'classical': '+',
    'ultraBullet': '{',
    'crazyhouse': '\ue00b',
    'chess960': "'",
    'antichess': '@',
    'atomic': '>',
    'threeCheck': '.',
    'kingOfTheHill': '(',
    'horde': '_',
    'racingKings': '\ue00a',
    'correspondence': ';',
    'puzzle': '-',
    'arrow-upperright': 'N',
    'arrow-lowerright': 'M',
    'ograve': 'Ò',
    'patron': '\ue019',
    'online': '\ue010',
    'tv': '1',
    'delicious': '4'
}

export const clearBadgeTextMessage = 'clearBadgeText';

export const GITHUB = 'https://github.com/mpunkenhofer/linotify';