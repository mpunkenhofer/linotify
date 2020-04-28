export type TitleType = 'LM' | 'CM' | 'WCM' | 'NM' | 'WNM' | 'FM' | 'WFM' | 'IM' | 'WIM' | 'GM' | 'WGM' | '';
export type RatingType = 'bullet' | 'blitz' | 'rapid' | 'classical' | 'ultraBullet' | 'crazyhouse' | 'antichess' | 'atomic' | 'threeCheck' | 'kingOfTheHill' | 'horde' | 'racingKings' | 'correspondence' | 'puzzle';

export interface User {
    id: string;
    username: string;
    title: TitleType;
    online: boolean;
    playing: string | boolean;
    patron: boolean;
    perfs: { [_: string]: { games: number; rating: number; prog: number; prov: boolean } };
    seenAt: number;
    lastApiUpdate: number;
    lastNotification: number;
    notifyWhenOnline: boolean;
    notifyWhenPlaying: boolean;
}

export type PopupThemeType = 'dark' | 'light';
export type PopupCollapsibleStatusesType = 'playing' | 'online' | 'offline';

export interface Preferences {
    popupTheme: PopupThemeType;
    popupCollapsibleStatuses: {
        playing: boolean;
        online: boolean;
        offline: boolean;
    };
    notificationsEnabled: boolean;
    displayBadgeTextEnabled: boolean;
}