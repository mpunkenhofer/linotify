import { browser } from "webextension-polyfill-ts";
import {
  User,
  Preferences,
  PopupThemeType,
  PopupCollapsibleStatusesType,
} from "../types";
import { getUserData } from "./lichess";
import { defaultPreferences } from "../constants";
import { createUser } from "./util";

const setPreferences = async (preferences: Preferences): Promise<void> => {
  try {
    await browser.storage.local.set({ preferences: preferences });
  } catch (err) {
    console.error(err);
  }

  return;
};

export const getPreferences = async (): Promise<Preferences> => {
  try {
    const prefs = await browser.storage.local.get("preferences");

    if (prefs && prefs["preferences"] !== undefined)
      return Promise.resolve<Preferences>(prefs["preferences"]);
    else void setPreferences(defaultPreferences);
  } catch (err) {
    console.error(err);
  }

  return Promise.resolve<Preferences>(defaultPreferences);
};

const setUser = async (user: User): Promise<void> => {
  try {
    // TODO: can fail if storage full
    if (user.id !== undefined)
      await browser.storage.sync.set({ [user.id.toLowerCase()]: user });
  } catch (err) {
    return Promise.reject(err);
  }
};

export const getUsers = async (): Promise<User[]> => {
  try {
    const usersObj = await browser.storage.sync.get(null);

    if (usersObj !== undefined) {
      const users: User[] = Object.values(usersObj) as User[];

      if (users) {
        return Promise.resolve(
          users.map((u: User) => {
            return { ...createUser(u.id), ...u };
          })
        );
      }
    }
  } catch (err) {
    return Promise.reject(err);
  }

  return Promise.resolve([]);
};

export const getUser = async (id_: string): Promise<User | null> => {
  try {
    const id = id_.toLowerCase();
    const user = await browser.storage.sync.get(id);

    if (user && user[id] != undefined)
      return Promise.resolve<User>({ ...createUser(id), ...user[id] });
  } catch (err) {
    return Promise.reject(err);
  }

  return Promise.resolve(null);
};

export const removeUser = (id_: string): Promise<void> => {
  try {
    const id = id_.toLowerCase();
    return browser.storage.sync.remove(id);
  } catch (err) {
    return Promise.reject(err);
  }
};

export const updateUser = async (user: Partial<User>): Promise<void> => {
  if (user.id) {
    const u = (await getUser(user.id)) || createUser(user.id);
    const updated: User = { ...u, ...user } as User;
    return setUser(updated);
  } else {
    return Promise.reject("user missing id");
  }
};

export const addUser = async (id_: string): Promise<void> => {
  const id = id_.toLowerCase();
  const newUser = createUser(id);
  await setUser(newUser);
  getUserData(id)
    .then((userData) => updateUser(userData))
    .catch((err) => console.error(err));
};

export const setUserStatusChanged = async (
  users: User[],
  statusChanged: boolean
): Promise<void> => {
  for (const user of users) {
    if (!user.statusChanged) {
      await updateUser({ ...user, statusChanged: statusChanged });
    }
  }
};

export const setTheme = async (theme: PopupThemeType): Promise<void> => {
  const prefs = await getPreferences();
  const updatedPrefs: Preferences = { ...prefs, popupTheme: theme };
  await setPreferences(updatedPrefs);
};

export const setCollapsibleStatus = async (
  status: PopupCollapsibleStatusesType,
  value: boolean
): Promise<void> => {
  const prefs = await getPreferences();
  const updatedPrefs: Preferences = {
    ...prefs,
    popupCollapsibleStatuses: {
      ...prefs.popupCollapsibleStatuses,
      [status]: value,
    },
  };
  await setPreferences(updatedPrefs);
};

export const toggleCollapsibleStatus = async (
  status: PopupCollapsibleStatusesType
): Promise<void> => {
  const prefs = await getPreferences();
  const updatedPrefs: Preferences = {
    ...prefs,
    popupCollapsibleStatuses: {
      ...prefs.popupCollapsibleStatuses,
      [status]: !prefs.popupCollapsibleStatuses[status],
    },
  };
  await setPreferences(updatedPrefs);
};

export const toggleNotificationsEnabled = async (): Promise<void> => {
  const prefs = await getPreferences();
  const updatedPrefs: Preferences = {
    ...prefs,
    notificationsEnabled: !prefs.notificationsEnabled,
  };
  await setPreferences(updatedPrefs);
};

export const toggleDisplayBadgeTextEnabled = async (): Promise<void> => {
  const prefs = await getPreferences();
  const updatedPrefs: Preferences = {
    ...prefs,
    displayBadgeTextEnabled: !prefs.displayBadgeTextEnabled,
  };
  await setPreferences(updatedPrefs);
};

export const toggleNotifyWhenOnline = async (id: string): Promise<void> => {
  const user = await getUser(id);
  if (user) {
    const updatedUser = { ...user, notifyWhenOnline: !user.notifyWhenOnline };
    await setUser(updatedUser);
  }
};

export const toggleNotifyWhenPlaying = async (id: string): Promise<void> => {
  const user = await getUser(id);
  if (user) {
    const updatedUser = { ...user, notifyWhenPlaying: !user.notifyWhenPlaying };
    await setUser(updatedUser);
  }
};

export const enableStorageApiLogger = (): void => {
  browser.storage.onChanged.addListener((changes, area) => {
    console.group(
      "%cStorage area " + `%c${area} ` + "%cchanged.",
      "font-size: 1.3em; font-weight: bold; color: gray",
      "font-size: 1.3em; font-weight: bold; color: red",
      "font-size: 1.3em; font-weight: bold; color: gray"
    );

    const changedItems = Object.keys(changes);

    for (const item of changedItems) {
      console.log(
        "item:" + `%c${item}`,
        "font-size: 1.1em; font-weight: bold; color: blue"
      );
      console.log("prev value\n", changes[item].oldValue);
      console.log("new value\n", changes[item].newValue);
    }
    console.groupEnd();
  });
};
