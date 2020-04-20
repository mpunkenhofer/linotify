import { browser } from "webextension-polyfill-ts";
import { enableStorageApiLogger, getUsers, updateUser, getPreferences } from "../common/storage";
import { getUserStatus, getUserData } from "../common/lichess";
import { User } from "../common/types";
import { delay } from "lodash";
import { clearBadgeTextMessage } from "../constants";

console.log('LiNotify is open source! https://github.com/mpunkenhofer/linotify');

if (process.env.NODE_ENV === "development") {
    enableStorageApiLogger();
}

const userDataPollPeriodInMinutes = 30;
const statusPollPeriodInMinutes = 1;

browser.alarms.create('apiStatusPollAlarm', { periodInMinutes: statusPollPeriodInMinutes })

const clearNotification = (user: User): void => {
    browser.notifications.clear(user.id);
}

const createOnlineNotification = (user: User): void => {
    if (user.notifyWhenOnline) {

        // clear old notification
        clearNotification(user);

        browser.notifications.create(user.id, {
            "type": "basic",
            "iconUrl": browser.runtime.getURL("assets/images/linotify_icon.svg"),
            "title": "LiNotify!",
            "message": `${(user.username && user.username.length > 0) ? user.username : user.id} is now online on lichess.org.`
        });
    }
}

const createPlayingNotification = (user: User): void => {
    if (user.notifyWhenPlaying) {

        // clear old notification
        clearNotification(user);

        browser.notifications.create(user.id, {
            "type": "basic",
            "iconUrl": browser.runtime.getURL("assets/images/linotify_icon.svg"),
            "title": "LiNotify!",
            "message": `${(user.username && user.username.length > 0) ? user.username : user.id} is playing on lichess.org!`,
        });
    }
}


const updateUserData = (): void => {
    const successiveUpdateDelayInMs = 3000;

    getUsers()
        .then(users => {
            let updateCount = 0;
            for (const user of users) {
                const diff = Date.now() - user.lastApiUpdate;
                if (diff > 0) {
                    const diffInMinutes = Math.floor(diff / (1000 * 60));
                    if (diffInMinutes >= userDataPollPeriodInMinutes) {
                        delay(() => getUserData(user.id).then(user => updateUser(user)).catch(err => console.error(err)), updateCount * successiveUpdateDelayInMs);
                        updateCount++;
                    }
                }
            }
        }).catch(err => console.error(err));
}

const clearBadgeText = (): void => {
    browser.browserAction.setBadgeText({ text: '' });
}

const updateBadgeText = (text: string): void => {
    browser.browserAction.setBadgeText({ text });
}

const incBadgeNumber = (n: number): void => {
    browser.browserAction.getBadgeText({})
        .then(text => {
            const badgeNumber = Number(text);

            if(!isNaN(badgeNumber)) {
                updateBadgeText((badgeNumber + n).toString());
            }
        }).catch(err => console.error(err));
}

const updateUserStatuses = async (): Promise<void> => {
    try {
        const users = await getUsers();

        const userIds = users.map(u => u.id);
        const userRecord = users.map(u => { return { [u.id.toLowerCase()]: { ...u } } }).reduce((a, b) => Object.assign(a, b), {});

        const [prefs, userStatuses] = await Promise.all([getPreferences(), getUserStatus(userIds)]);

        let updateCount = 0;

        for (const status of userStatuses) {
            if (status.id) {
                const user: User = userRecord[status.id];

                if (user) {
                    const updated = { ...user, ...status } as User;
                    updateUser({ ...status });

                    //check if a user started playing or came online and display notification
                    if (!user.playing && status.playing) {
                        prefs.notificationsEnabled && createPlayingNotification(updated);
                        updateCount++;
                    } else if (!user.online && status.online) {
                        prefs.notificationsEnabled && createOnlineNotification(updated);
                        updateCount++;
                    } else if (user.playing && !status.playing || user.online && !status.online) {
                        clearNotification(updated);
                        updateCount--;
                    }
                }
            }
        }

        if (updateCount > 0 && prefs.displayBadgeTextEnabled)
            incBadgeNumber(updateCount);
        else
            clearBadgeText();

    } catch (err) {
        console.error(err);
    }

    return;
}

const messageHandler = (message: { [_: string]: string }): void => {
    if (message && message.request !== undefined) {
        if (message.request === clearBadgeTextMessage) {
            clearBadgeText();
        }
    }
}

browser.alarms.onAlarm.addListener(() => {
    updateUserStatuses();
    updateUserData();
});

browser.runtime.onMessage.addListener(messageHandler);