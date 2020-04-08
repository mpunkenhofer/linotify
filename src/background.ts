import { browser } from "webextension-polyfill-ts";
import axios, { AxiosResponse, AxiosError } from 'axios';

console.log('LiNotify is open source! https://github.com/mpunkenhofer/linotify');

const api = axios.create({
    baseURL: 'https://lichess.org/api/',
    timeout: 1000
});

const periodInMinutes = 1;
browser.alarms.create('apiPollAlarm', { periodInMinutes })

let count = 0;

browser.alarms.onAlarm.addListener(() => {
    count++;

    browser.browserAction.setBadgeText({text: count.toString()});

    api.get('/users/status', {
        params: {
            ids: 'necator'
        }
    })
        .then((response: AxiosResponse) => {
            console.log(response);
        })
        .catch((error: AxiosError) => {
            console.log(error);
        });
});