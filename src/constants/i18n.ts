import {browser} from "webextension-polyfill-ts";

const i = (key: string): string => browser.i18n.getMessage(key);

export const i18n = {
    name: i('name'),
    users: i('users'),
    theme: i('theme'),
    remove: i('remove'),
    patron: i('patron'),
    online: i('online'),
    offline: i('offline'),
    playing: i('playing'),
    options: i('options'),
    version: i('version'),
    spectate: i('spectate'),
    settings: i('settings'),
    userCount: i('userCount'),
    darkThemeButtonTitle: i('darkThemeButtonTitle'),
    lightThemeButtonTitle: i('lightThemeButtonTitle'),
    liNotifyButtonActivate: i('liNotifyButtonActivate'),
    liNotifyButtonDeactivate: i('liNotifyButtonDeactivate'),
    notifyWhenOnlineQuestion: i('notifyWhenOnlineQuestion'),
    notifyWhenPlayingQuestion: i('notifyWhenPlayingQuestion'),
    searchUsersInputPlaceholder: i('searchUsersInputPlaceholder'),
    displayBadgeTextSettingTitle: i('displayBadgeTextSettingTitle'),
    displayBadgeTextSettingDescription: i('displayBadgeTextSettingDescription'),
    enableSystemNotificationsSettingTitle: i('enableSystemNotificationsSettingTitle'),
    enableSystemNotificationsSettingDescription: i('enableSystemNotificationsSettingDescription')

}