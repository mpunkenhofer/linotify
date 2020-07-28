import * as storage from "../common/storage";
import { User, PopupThemeType } from "../types";
import { TITLES, ICONS, GITHUB, clearBadgeTextMessage } from "../constants";
import { topPerformance, sortByRating } from "../common/util";
import { isString } from "lodash";
import { browser } from "webextension-polyfill-ts";
import pkg from "../../package.json"
import { i18n } from "../constants/i18n";
import { markUserStatusChangeNoticed } from "../common/storage";

console.log('LiNotify is open source! https://github.com/mpunkenhofer/linotify');

if (process.env.NODE_ENV === "development") {
    storage.enableStorageApiLogger();
}

const createUserCellElement = (user: User): HTMLElement => {
    const userLink = document.createElement('a');
    userLink.classList.add(user.online ? 'online' : 'offline', 'user-link');
    userLink.href = `https://lichess.org/@/${user.id}`;
    userLink.target = '_blank';
    userLink.rel = 'noopener noreferrer'
    userLink.innerText = (user.username && user.username.length > 0) ? user.username : user.id;

    const line = document.createElement('i');
    line.classList.add('line');

    if (user.title) {
        const title = document.createElement('span');
        title.classList.add('title');
        title.innerText = user.title;

        if (user.title) {
            title.title = TITLES[user.title];
        }

        userLink.insertAdjacentElement('afterbegin', title);
    }

    if (user.patron) {
        line.title = i18n.patron;
        line.classList.add('patron');
    }

    userLink.insertAdjacentElement('afterbegin', line);

    return userLink;
}

const createRatingCellElement = (user: User): HTMLElement => {
    const rating = document.createElement('span');
    const topPerf = topPerformance(user);
    rating.innerText = topPerf.rating.toString() || '?';
    rating.setAttribute('data-icon', ICONS[topPerf.mode] || ICONS['bullet']);
    return rating;
}

const createRatingProgressionElement = (user: User): HTMLElement => {
    const topPerf = topPerformance(user);
    const progression = document.createElement(topPerf.prog < 0 ? 'bad' : 'good');
    progression.classList.add('rp');
    progression.innerText = topPerf.prog.toString();

    return progression;
}

const createTvLinkCellElement = (user: User): HTMLElement => {
    const gameLink = document.createElement('a');
    gameLink.classList.add('game-link');
    gameLink.href = `https://lichess.org/@/${user.id}/tv`;
    gameLink.target = '_blank';
    gameLink.rel = 'noopener noreferrer'
    gameLink.title = i18n.spectate;

    return gameLink;
}

const createUserTable = (users: User[]): HTMLElement => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('user-table');

    const table = document.createElement('table');

    for (const user of users) {
        if (!user || !user.id || !(user.id.length > 0))
            continue;

        const row = table.insertRow();
        row.insertCell().appendChild(createUserCellElement(user));
        row.insertCell().appendChild(createRatingCellElement(user));
        row.insertCell().appendChild(createRatingProgressionElement(user));

        if (user.playing)
            row.insertCell().appendChild(createTvLinkCellElement(user));
        else
            row.insertCell();

    }

    wrapper.appendChild(table);

    return wrapper;
}

interface CollapsibleProps {
    element: HTMLElement;
    title: HTMLElement | string;
    show?: boolean;
    onShow?: () => void;
}

const createCollapsible = ({ element, title, show, onShow }: CollapsibleProps): HTMLElement => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('collapsible');

    const header = document.createElement('a');
    header.classList.add('collapsible-btn');
    header.setAttribute('data-icon', show ? 'C' : 'E');

    const elementWrapper = document.createElement('div');
    elementWrapper.classList.add('collapsible-content');
    show && elementWrapper.classList.add('show');

    header.onclick = (): void => {
        if (!elementWrapper.classList.contains('show')) {
            elementWrapper.appendChild(element);
            header.setAttribute('data-icon', 'C');
        } else {
            elementWrapper.innerHTML = '';
            header.setAttribute('data-icon', 'E');
        }

        if (onShow !== undefined)
            onShow();

        elementWrapper.classList.toggle('show');
    }

    if (isString(title))
        header.innerText = title;
    else
        header.appendChild(title);


    wrapper.appendChild(header);
    wrapper.appendChild(elementWrapper);

    if (show) {
        elementWrapper.appendChild(element);
    }

    return wrapper;
}

const setTheme = (theme: PopupThemeType): void => {
    document.body.classList.remove('theme--light', 'theme--dark');

    switch (theme) {
        case 'dark': {
            document.body.classList.add('theme--dark');
            break;
        }
        case 'light':
        default: {
            document.body.classList.add('theme--light');
        }
    }
}

const createThemeSwitch = (active: PopupThemeType, onThemeSwitch?: (newTheme: PopupThemeType) => void): HTMLElement => {
    const themeSwitch = document.createElement('group');
    themeSwitch.classList.add('theme-switch');
    //themeSwitch.innerText = i18n.theme;

    const lightWrap = document.createElement('div');
    lightWrap.title = i18n.lightThemeButtonTitle;

    const darkWrap = document.createElement('div');
    darkWrap.title = i18n.darkThemeButtonTitle;

    const lightInput = document.createElement('input');
    lightInput.id = 'light-theme-btn';
    lightInput.type = 'radio';
    lightInput.checked = active == 'light';
    lightInput.name = 'theme-btn';
    lightInput.onchange = (): void => {
        setTheme('light');
        if (onThemeSwitch) {
            onThemeSwitch('light');
        }
    }

    lightWrap.appendChild(lightInput);
    lightWrap.insertAdjacentHTML('beforeend', '<label class="light-theme-icon" for="light-theme-btn"/>');

    const darkInput = document.createElement('input');
    darkInput.id = 'dark-theme-btn';
    darkInput.type = 'radio';
    darkInput.checked = active == 'dark';
    darkInput.name = 'theme-btn';
    darkInput.onchange = (): void => {
        setTheme('dark');
        if (onThemeSwitch) {
            onThemeSwitch('dark');
        }
    }

    darkWrap.appendChild(darkInput);
    darkWrap.insertAdjacentHTML('beforeend', '<label class="dark-theme-icon" for="dark-theme-btn"/>');

    themeSwitch.appendChild(lightWrap);
    themeSwitch.appendChild(darkWrap);

    return themeSwitch;
}

const createOptionsLink = (): HTMLElement => {
    const options = document.createElement('a');
    options.classList.add('options-link');
    options.href = browser.runtime.getURL('options.html');
    options.textContent = i18n.options;
    options.target = '_blank';
    options.rel = 'noopener noreferrer';

    return options;
}

// const createGitHubLink = (): HTMLElement => {
//     const github = document.createElement('a');
//     github.classList.add('github-link');
//     github.href = GITHUB;
//     github.textContent = 'GitHub';
//     github.target = '_blank';
//     github.rel = 'noopener noreferrer'

//     return github;
// }

const createSystemNotificationToggle = (active: boolean, onSystemNotificationToggleClicked?: () => Promise<void> | void): HTMLElement => {
    const toggleWrap = document.createElement('div');
    toggleWrap.classList.add('system-notifications-toggle');

    const toggle = document.createElement('a');
    toggle.classList.add(active ? 'notifications-enabled-icon' : 'notifications-disabled-icon');
    toggle.title = active ? i18n.disableSystemNotifications : i18n.enableSystemNotifications;
    toggle.onclick = (): void => {
        if (onSystemNotificationToggleClicked) {
            onSystemNotificationToggleClicked();
            if (toggle.classList.contains('notifications-enabled-icon')) {
                toggle.classList.replace('notifications-enabled-icon', 'notifications-disabled-icon');
                toggle.title = i18n.enableSystemNotifications;
            }
            else {
                toggle.classList.replace('notifications-disabled-icon', 'notifications-enabled-icon');
                toggle.title = i18n.disableSystemNotifications;
            }
        }
    }

    toggleWrap.appendChild(toggle);

    return toggleWrap;
}

const createVersionIndicator = (): HTMLElement => {
    const version = document.createElement('a');
    version.classList.add('version-link');
    version.textContent = `v${pkg.version}`;
    version.title = i18n.version;
    version.href = GITHUB + '/releases';
    version.target = '_blank';
    version.rel = 'noopener noreferrer';

    return version;
}

const createFooter = (...elements: HTMLElement[]): HTMLElement => {
    const footer = document.createElement('div');
    footer.classList.add('footer');


    for (const element of elements)
        footer.appendChild(element);

    return footer;
}

const createNoUsersInfo = (): HTMLElement => {
    const info = document.createElement('div');
    info.classList.add('info-text');
    info.textContent = i18n.noUsersInfo;
    return info;
}

const requestClearBadgeText = (): void => {
    browser.runtime.sendMessage({ 'request': clearBadgeTextMessage }).catch(err => console.error(err));
}

const root = document.getElementById('root');

if (root) {
    storage.getPreferences()
        .then(prefs => {
            setTheme(prefs.popupTheme);
            storage.getUsers()
                .then(users => {
                    requestClearBadgeText();
                    markUserStatusChangeNoticed(users);
                    
                    if (users.length > 0) {
                        const playing = users.filter(u => u.playing);
                        const online = users.filter(u => !u.playing && u.online);
                        const offline = users.filter(u => !u.playing && !u.online);

                        playing.length > 0 && root.appendChild(createCollapsible({
                            element: createUserTable(sortByRating(playing)),
                            title: `${i18n.playing} (${playing.length})`,
                            show: prefs.popupCollapsibleStatuses.playing,
                            onShow: () => storage.toggleCollapsibleStatus('playing')
                        }));

                        online.length > 0 && root.appendChild(createCollapsible({
                            element: createUserTable(sortByRating(online)),
                            title: `${i18n.online} (${online.length})`,
                            show: prefs.popupCollapsibleStatuses.online,
                            onShow: () => storage.toggleCollapsibleStatus('online')
                        }));

                        offline.length > 0 && root.appendChild(createCollapsible({
                            element: createUserTable(sortByRating(offline)),
                            title: `${i18n.offline} (${offline.length})`,
                            show: prefs.popupCollapsibleStatuses.offline,
                            onShow: () => storage.toggleCollapsibleStatus('offline')
                        }));
                    } else {
                        root.appendChild(createNoUsersInfo());
                    }

                    root.appendChild(createFooter(
                        createOptionsLink(),
                        // createGitHubLink(),
                        createSystemNotificationToggle(prefs.notificationsEnabled, storage.toggleNotificationsEnabled),
                        createThemeSwitch(prefs.popupTheme, (newTheme: PopupThemeType) => {
                            storage.setTheme(newTheme)
                        }),
                        createVersionIndicator()
                    ));
                })
        }).catch(err => console.error(err));
} else {
    console.error('missing root element?');
}