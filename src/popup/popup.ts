import { getUsers, getPreferences, toggleCollapsibleStatus, enableStorageApiLogger } from "../common/storage";
import { User } from "../common/types";
import { TITLES, ICONS, GITHUB, clearBadgeTextMessage } from "../constants";
import { topPerformance } from "../common/util";
import { isString } from "lodash";
import { browser } from "webextension-polyfill-ts";
import pkg from "../../package.json"
import { i18n } from "../constants/i18n";

console.log('LiNotify is open source! https://github.com/mpunkenhofer/linotify');

if (process.env.NODE_ENV === "development") {
    enableStorageApiLogger();
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
            // TODO: i18n
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

const createCollapsible = ({element, title, show, onShow}: CollapsibleProps): HTMLElement => {
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

        if(onShow !== undefined)
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

const createFooter = (): HTMLElement => {
    const footer = document.createElement('div');
    footer.classList.add('footer');

    const options = document.createElement('a');
    options.classList.add('options-link');
    options.href = browser.runtime.getURL('options.html');
    options.textContent = i18n.options;
    options.target = '_blank';
    options.rel = 'noopener noreferrer'

    const github = document.createElement('a');
    github.classList.add('github-link');
    github.href = GITHUB;
    github.textContent = 'GitHub';
    github.target = '_blank';
    github.rel = 'noopener noreferrer'

    const version = document.createElement('span');
    version.classList.add('version');
    version.textContent = `v${pkg.version}`;

    footer.appendChild(options);
    footer.appendChild(github);
    footer.appendChild(version);

    return footer;
}

const requestClearBadgeText = (): void => {
    browser.runtime.sendMessage({ 'request': clearBadgeTextMessage }).catch(err => console.log(err));
}

const root = document.getElementById('root');

getPreferences()
    .then(prefs => {
        getUsers()
            .then(users => {
                // clear badge
                requestClearBadgeText();
                
                console.log(prefs);

                const playing = users.filter(u => u.playing);
                const online = users.filter(u => !u.playing && u.online);
                const offline = users.filter(u => !u.playing && !u.online);

                offline.length > 0 &&
                    root?.insertAdjacentElement('afterbegin',
                        createCollapsible({
                            element: createUserTable(offline), 
                            title: `Offline (${offline.length})`,
                            show: prefs.collapsibleStatuses.offline,
                            onShow: () => toggleCollapsibleStatus('offline')
                        }));
                online.length > 0 &&
                    root?.insertAdjacentElement('afterbegin',
                        createCollapsible({
                            element: createUserTable(online), 
                            title: `Online (${online.length})`,
                            show: prefs.collapsibleStatuses.online,
                            onShow: () => toggleCollapsibleStatus('online')
                        }));
                playing.length > 0 &&
                    root?.insertAdjacentElement('afterbegin',
                        createCollapsible({
                            element: createUserTable(playing), 
                            title: `Playing (${playing.length})`,
                            show: prefs.collapsibleStatuses.playing,
                            onShow: () => toggleCollapsibleStatus('playing')
                        }));
            })
    }).catch(err => console.log(err));

root?.insertAdjacentElement('beforeend', createFooter());

