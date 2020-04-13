export type TitleType = 'LM' | 'CM' | 'WCM' | 'NM' | 'WNM' | 'FM' | 'WFM' | 'IM' | 'WIM' | 'GM' | 'WGM' | '';
export type RatingType = 'bullet' | 'blitz' | 'rapid' | 'classical' | 'ultraBullet' | 'crazyhouse' | 'antichess' | 'atomic' | 'threeCheck' | 'kingOfTheHill' | 'horde' | 'racingKings' | 'correspondence' | 'puzzle';

export interface User {
    id: string;
    username: string;
    title: TitleType;
    online: boolean;
    playing: string | boolean;
    patron: boolean;
    perfs: {[_: string]: {games: number; rating: number; prog: number; prov: boolean}};
    seenAt: number;
    lastApiUpdate: number;
}

export interface UserStatus {
    name: string;
    id: string;
    online: boolean;
    playing: boolean;
}

export interface Preferences {
    collapsibleStatuses: CollapsibleStatuses;
}

export interface CollapsibleStatuses {
    playing: boolean;
    online: boolean;
    offline: boolean;
}