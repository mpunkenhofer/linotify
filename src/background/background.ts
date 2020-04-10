import { browser } from "webextension-polyfill-ts";
import { enableStorageApiLogger, getUsers, updateUser } from "../common/storage";
import { getUserStatus } from "../common/lichess";
import { User, UserStatus } from "../common/types";

console.log('LiNotify is open source! https://github.com/mpunkenhofer/linotify');

if (process.env.NODE_ENV === "development") {
    enableStorageApiLogger();
}

const periodInMinutes = 1;
browser.alarms.create('apiPollAlarm', { periodInMinutes })

const updateUserStatuses = async (): Promise<void> => {
    const users = await getUsers();

    if (!users || users.length < 1)
        return;

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
            updatedUsers.push(updated);
            browser.notifications.create('test', {
                "type": "basic",
                "iconUrl": browser.runtime.getURL("assets/linotify_icon96.png"),
                "title": "Something changed!",
                "message": `${updated.id}: online: ${updated.online}; playing: ${updated.playing}`
              });
            //alert('Hello??');
        }
    }

    console.log(updatedUsers);
}

browser.alarms.onAlarm.addListener(() => {
    browser.browserAction.setBadgeText({ text: Math.floor(Math.random() * 100).toString() });

    updateUserStatuses();
});