export type TitleType = 'LM' | 'CM' | 'WCM' | 'NM' | 'WNM' | 'FM' | 'WFM' | 'IM' | 'WIM' | 'GM' | 'WGM' | '';

export interface User {
    id: string;
    username: string;
    title: TitleType;
    online: boolean;
    playing: string | boolean;
    patron: boolean;
    perfs: {[_: string]: {rating: number; prog: number}};
    seenAt: number;
}

export interface UserStatus {
    name: string;
    id: string;
    online: boolean;
    playing: boolean;
}