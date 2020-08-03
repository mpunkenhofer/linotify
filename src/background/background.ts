import { browser } from "webextension-polyfill-ts";
import { enableStorageApiLogger, getUsers, updateUser, getPreferences } from "../common/storage";
import { getUserStatus, getUserData } from "../common/lichess";
import { User, NotificationType } from "../types";
import { delay } from "lodash";
import { clearBadgeTextMessage, GITHUB } from "../constants";

console.log(`LiNotify is open source! ${GITHUB}`);

if (process.env.NODE_ENV === "development") {
    enableStorageApiLogger();
}

const userDataPollPeriodInMinutes = 30; // request all user data from the lichess api (ratings, lastSeen, ...)
const statusPollPeriodInMinutes = 1; // only request the user status (online, playing)
const notificationCooldownInMinutes = 10;
const statusPersistenceThreshold = 3;

browser.alarms.create('apiStatusPollAlarm', { periodInMinutes: statusPollPeriodInMinutes });

browser.notifications.onClicked.addListener((id) => {
    //console.log('Notification ' + id + ' was clicked by the user');
    browser.tabs.create({ url: `https://lichess.org/@/${id}/tv` });
});

const notificationCooldownElapsed = (user: User): boolean => {
    const diff = Date.now() - user.lastNotification;
    const diffInMinutes = Math.floor(diff / (1000 * 60));

    //console.log(`%cLast notification trigger for ${user.id} was ${diffInMinutes} min ago`, 'font-size: 1em; color: blue');

    return diffInMinutes >= notificationCooldownInMinutes;
}

const clearNotification = (user: User): void => {
    browser.notifications.clear(user.id);
}

const createNotification = (user: User, notificationType: NotificationType = 'playing'): User => {
    if (((notificationType === 'online' && user.notifyWhenOnline) || (notificationType === 'playing' && user.notifyWhenPlaying))
        && notificationCooldownElapsed(user)) {
        //console.log(`%cTriggering notification for ${user.id}; type: ${notificationType}`, 'font-size: 2em; font-weight: bold; color: red');

        clearNotification(user);

        browser.notifications.create(user.id, {
            "type": "basic",
            "iconUrl": browser.runtime.getURL("assets/images/linotify_icon.svg"),
            "title": "LiNotify!",
            "message": (notificationType == 'playing') ? `${(user.username && user.username.length > 0) ? user.username : user.id} is playing on lichess.org!` :
                `${(user.username && user.username.length > 0) ? user.username : user.id} is now online on lichess.org.`
        });
    }

    return { ...user, lastNotification: Date.now() };
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

const updateUserStatuses = async (): Promise<void> => {
    try {
        const users = await getUsers();

        const userIds = users.map(u => u.id);
        const userRecord = users.map(u => { return { [u.id.toLowerCase()]: { ...u } } }).reduce((a, b) => Object.assign(a, b), {});

        const [prefs, userStatuses] = await Promise.all([getPreferences(), getUserStatus(userIds)]);

        let statusChangedCnt = 0;

        for (const status of userStatuses) {
            if (status.id) {
                let user: User = userRecord[status.id];

                if (user) {
                    if (!status.online && !user.online && user.statusPersistence >= statusPersistenceThreshold) {
                        user.statusChanged = false;
                        clearNotification(user);
                    }
                    else if ((!user.playing && status.playing || !user.online && status.online) && user.statusPersistence >= statusPersistenceThreshold) {
                        user.statusChanged = true;
                        statusChangedCnt++;

                        if (prefs.notificationsEnabled) {
                            if (status.playing)
                                user = createNotification(user, 'playing');
                            else if (status.online)
                                user = createNotification(user, 'online');
                        }
                    }

                    user = (user.online === status.online && user.playing === status.playing) ?
                        { ...user, statusPersistence: user.statusPersistence + 1 } : { ...user, statusPersistence: 0 };
                    updateUser({ ...user, ...status });
                }
            }
        }

        if (statusChangedCnt > 0 && prefs.displayBadgeTextEnabled)
            updateBadgeText(statusChangedCnt.toString());
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