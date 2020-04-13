import { browser } from "webextension-polyfill-ts";
import { User, Preferences } from "./types";
import { getUserData } from "./lichess";
import { topPerformance } from "./util";

const defaultPreferences: Preferences = {
    collapsibleStatuses: {
        playing: true,
        online: true,
        offline: false,
    }
}

const setPreferences = async (preferences: Preferences): Promise<void> => {
    try {
        await browser.storage.local.set({'preferences': preferences});
    } catch(err) {
        console.error(err);
    }

    return;
}

export const getPreferences = async (): Promise<Preferences> => {
    try {
        const prefs = await browser.storage.local.get('preferences');

        if(prefs && prefs['preferences'] !== undefined)
            return prefs['preferences'];
        else
            setPreferences(defaultPreferences);
    } catch(err) {
        console.error(err);
    }

    return defaultPreferences;
}

export const setCollapsibleStatus = async (status: 'playing' | 'online' | 'offline', value: boolean): Promise<void> => {
    const prefs = await getPreferences();
    const updatedPrefs = {...prefs, collapsibleStatuses: {...prefs.collapsibleStatuses, [status]: value}};
    await setPreferences(updatedPrefs);
    return;
}

export const toggleCollapsibleStatus = async(status: 'playing' | 'online' | 'offline'): Promise<void> => {
    const prefs = await getPreferences();
    const updatedPrefs = {...prefs, collapsibleStatuses: {...prefs.collapsibleStatuses, [status]: !prefs.collapsibleStatuses[status]}};
    await setPreferences(updatedPrefs);
    return;
}

// const setUsers = async (users: User[]): Promise<void> => {
//     try {
//         // TODO: can fail if storage full
//         const usersObj = users.reduce((a, b) => Object.assign(a, { [b.id]: b }), {});
//         await browser.storage.sync.set(usersObj);
//     } catch (err) {
//         console.error(err);
//     }

//     return;
// }

const setUser = async (user: User): Promise<void> => {
    try {
        // TODO: can fail if storage full
        await browser.storage.sync.set({[user.id]: user});
    } catch (err) {
        console.error(err);
    }

    return;
}

export const getUsers = async (): Promise<User[]> => {
    try {
        const usersObj = await browser.storage.sync.get(null);

        if (usersObj !== undefined) {
            const users: User[] = Object.values(usersObj);

            if (users) {
                users.sort((a, b) => {
                    if (a.playing) {
                        if (b.playing)
                            return topPerformance(b).rating - topPerformance(a).rating;
                        else
                            return -1;
                    } else if (b.playing) {
                        return 1;
                    } else if (a.online) {
                        if (b.online)
                            return topPerformance(b).rating - topPerformance(a).rating;
                        else
                            return -1;
                    } else if (b.online) {
                        return 1;
                    } else {
                        return topPerformance(b).rating - topPerformance(a).rating;
                    }
                });

                return users;
            }
        }
    } catch (err) {
        console.error(err);
    }

    return [];
}

export const removeUser = (id: string): Promise<void> => {
    try {
        return browser.storage.sync.remove(id);
    } catch(err) {
        console.error(err);
    }

    return Promise.resolve();
}

export const getUser = async (id: string): Promise<User | null> => {
    try {
        const user = await browser.storage.sync.get(id);

        if(user && user[id] != undefined)
            return user[id];
    } catch(err) {
        console.error(err);
    }

    return null;
}

export const updateUser = (user: User): Promise<void> => {
    return setUser(user);
}

const createUser = (id: string): User => (
    {
        id,
        username: id,
        title: '',
        online: false,
        playing: false,
        patron: false,
        perfs: {},
        seenAt: 0,
        lastApiUpdate: 0,
    }
);

export const addUser = async (id: string): Promise<void> => {
    const newUser = createUser(id);
    await setUser(newUser);
    getUserData(id).then(user => updateUser(user)).catch(err => console.error(err));
    return;
}

export const enableStorageApiLogger = (): void => {
    browser.storage.onChanged.addListener((changes, area) => {
        console.group('%cStorage area ' + `%c${area} ` + '%cchanged.',
            'font-size: 1.3em; font-weight: bold; color: gray', 'font-size: 1.3em; font-weight: bold; color: red',
            'font-size: 1.3em; font-weight: bold; color: gray');

        const changedItems = Object.keys(changes);

        for (const item of changedItems) {
            console.log('item:' + `%c${item}`, 'font-size: 1.1em; font-weight: bold; color: blue');
            console.log('prev value\n', changes[item].oldValue);
            console.log('new value\n', changes[item].newValue);
        }
        console.groupEnd();
    });
};
