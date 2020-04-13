import {browser} from "webextension-polyfill-ts";

const i = (key: string): string => browser.i18n.getMessage(key);

export const i18n = {
    no: i('no'),
    yes: i('yes'),
    patron: i('patron'),
    options: i('options'),
    liNotifyButtonActivate: i('liNotifyButtonActivate'),
    liNotifyButtonDeactivate: i('liNotifyButtonDeactivate'),
}