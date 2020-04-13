import { Preferences } from "../common/types";

export const defaultPreferences: Preferences = {
    popupTheme: 'light',
    popupCollapsibleStatuses: {
        playing: true,
        online: true,
        offline: false,
    }
}

export const TITLES = {
    'LM': 'Lichess Master',
    'CM': 'Candidate Master',
    'WCM': 'Woman Candidate Master',
    'NM': 'National Master',
    'WNM': "Woman National Master",
    'FM': 'Fide Master',
    'WFM': "Woman Fide Master",
    'IM': 'International Master',
    'WIM': 'Woman International Master',
    'GM': 'Grand Master',
    'WGM': 'Woman Grand Master',
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