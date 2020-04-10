import { browser } from "webextension-polyfill-ts";
import { User } from "./types";
import { getUserData } from "./lichess";

const setUsers = async (users: User[]): Promise<void> => {
    try {
        await browser.storage.sync.set({ ['users']: users });
    } catch (err) {
        console.error(err);
    }

    return;
}

export const getUsers = async (): Promise<User[]> => {
    try {
        const users = (await browser.storage.sync.get('users'))['users'];

        if (users === undefined) {
            setUsers([]);
            return []
        } else {
            return users;
        }
    } catch (err) {
        console.error(err);
        return [];
    }

}

export const getUser = async (id: string): Promise<User | null> => {
    const users = await getUsers();
    return users.find(u => u.id.toLowerCase() === id.toLowerCase()) || null;
}

export const updateUser = async (user: User): Promise<User[]> => {
    const users = await getUsers();

    const updatedUsers = users.map(u => {
        if (u.id.toLowerCase() === user.id.toLowerCase()) {
            return user;
        } else {
            return u;
        }
    });

    await setUsers(updatedUsers);
    return updatedUsers;
}

const createUser = (id: string): User => (
    {
        id,
        username: '',
        title: '',
        online: false,
        playing: false,
        patron: false,
        perfs: {},
        seenAt: 0,
    }
);

export const addUser = async (id: string): Promise<void> => {
    const users = await getUsers();
    const newUser = createUser(id);
    const updatedUsers = [...users, newUser];
    await setUsers(updatedUsers);
    getUserData(id).then(user => updateUser(user)).catch(err => console.error(err));
}

export const removeUser = async (id: string): Promise<void> => {
    const users = await getUsers();
    const updatedUsers = users.filter(u => u.id.toLowerCase() != id.toLowerCase());
    await setUsers(updatedUsers);
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
