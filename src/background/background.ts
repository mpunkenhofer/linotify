import { browser } from "webextension-polyfill-ts";
import { enableStorageApiLogger, getUsers, updateUser, getPreferences } from "../common/storage";
import { getUserStatus, getUserData } from "../common/lichess";
import { User, UserStatus } from "../common/types";
import { delay } from "lodash";
import { clearBadgeTextMessage } from "../constants";

console.log('LiNotify is open source! https://github.com/mpunkenhofer/linotify');

if (process.env.NODE_ENV === "development") {
    enableStorageApiLogger();
}

let updateCount = 0;

const userDataPollPeriodInMinutes = 30;
const statusPollPeriodInMinutes = 1;
browser.alarms.create('apiStatusPollAlarm', { periodInMinutes: statusPollPeriodInMinutes })

// const playNotificationSound = (): void => {
//     const notificationSound = new Audio("assets/sounds/GenericNotify.mp3");
//     notificationSound.play();
// }

const createOnlineNotification = (user: User): void => {
    if (user.notifyWhenOnline) {
        getPreferences()
            .then(prefs => {
                if (prefs.notificationsEnabled) {
                    browser.notifications.create('test', {
                        "type": "basic",
                        "iconUrl": browser.runtime.getURL("assets/linotify_icon.svg"),
                        "title": "LiNotify!",
                        "message": `${(user.username && user.username.length > 0) ? user.username : user.id} is now online on lichess.org.`
                    });
                }
                // playNotificationSound();
            })
            .catch(err => console.error(err));
    }
}

const createPlayingNotification = (user: User): void => {
    if (user.notifyWhenPlaying) {
        getPreferences()
            .then(prefs => {
                if (prefs.notificationsEnabled) {
                    browser.notifications.create('test', {
                        "type": "basic",
                        "iconUrl": browser.runtime.getURL("assets/linotify_icon.svg"),
                        "title": "LiNotify!",
                        "message": `${(user.username && user.username.length > 0) ? user.username : user.id} is playing on lichess.org!`,
                    });
                }
            })
            .catch(err => console.error(err));
        // playNotificationSound();
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
    getPreferences()
        .then(prefs => {
            if (prefs.displayBadgeTextEnabled) {
                browser.browserAction.setBadgeText({ text });
            } else {
                clearBadgeText();
            }
        })
        .catch(err => console.error(err));
}

const updateUserStatuses = async (): Promise<{ prev: User; new: User }[]> => {
    const users = await getUsers();

    if (!users || users.length < 1)
        return [];

    const userRecord = users
        .map(u => {
            return { [u.id.toLowerCase()]: { ...u } }
        })
        .reduce((a, b) => Object.assign(a, b), {});
    const userIds = users.map(u => u.id);

    const userStatuses = await getUserStatus(userIds);
    const userStatusesRecord = userStatuses
        .map(us => {
            return { [us.id.toLowerCase()]: { ...us } }
        })
        .reduce((a, b) => Object.assign(a, b), {});

    const updatedUsers = [];

    for (const userId in userRecord) {
        const u: User = userRecord[userId];
        const us: UserStatus = userStatusesRecord[userId];

        if (u != undefined && us != undefined && u.online != us.online || u.playing != us.playing) {
            const updated = { ...u, playing: us.playing, online: us.online };
            updateUser(updated);
            updatedUsers.push({ prev: u, new: updated });

            //check if a user started playing or came online and display notification
            if (!u.playing && us.playing) {
                createPlayingNotification(updated);
                updateCount++;
            } else if (!u.online && us.online) {
                createOnlineNotification(updated);
                updateCount++;
            }
        }
    }

    if (updateCount > 0)
        updateBadgeText(updateCount.toString())

    return updatedUsers;
}

const messageHandler = (message: { [_: string]: string }): void => {
    if (message && message.request !== undefined) {
        if (message.request === clearBadgeTextMessage) {
            clearBadgeText();
            updateCount = 0;
        }
    }
}

browser.alarms.onAlarm.addListener(() => {
    updateUserStatuses();
    updateUserData();
});

browser.runtime.onMessage.addListener(messageHandler);