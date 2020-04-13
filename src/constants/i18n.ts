import {browser} from "webextension-polyfill-ts";

const i = (key: string): string => browser.i18n.getMessage(key);

export const i18n = {
    no: i('no'),
    yes: i('yes'),
    theme: i('theme'),
    patron: i('patron'),
    online: i('online'),
    offline: i('offline'),
    playing: i('playing'),
    options: i('options'),
    version: i('version'),
    spectate: i('spectate'),
    darkThemeButtonTitle: i('darkThemeButtonTitle'),
    lightThemeButtonTitle: i('lightThemeButtonTitle'),
    liNotifyButtonActivate: i('liNotifyButtonActivate'),
    liNotifyButtonDeactivate: i('liNotifyButtonDeactivate'),
}