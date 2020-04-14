import { enableStorageApiLogger, getPreferences, toggleNotificationsEnabled, toggleDisplayBadgeTextEnabled, getUsers, removeUser, toggleNotifyWhenOnline, toggleNotifyWhenPlaying } from "../common/storage";
import pkg from "../../package.json"
import { i18n } from "../constants/i18n";
import { User } from "../common/types";
import { debounce } from "lodash";
import { sortByName } from "../common/util";

console.log('LiNotify is open source! https://github.com/mpunkenhofer/linotify');

if (process.env.NODE_ENV === "development") {
    enableStorageApiLogger();
}

interface SwitchProps {
    title: string;
    description: string;
    status: boolean;
    onToggle: () => void;
}

let switchCount = 0;

const createSwitch = ({ title, description, status, onToggle }: SwitchProps): HTMLElement => {
    const switchId = `switch-${switchCount++}`;

    const switchWrapper = document.createElement('div');
    switchWrapper.classList.add('d-flex', 'flex-column', 'custom-control', 'custom-switch');

    const switchElement = document.createElement('input');
    switchElement.classList.add('custom-control-input');
    switchElement.id = switchId;
    switchElement.type = 'checkbox';
    switchElement.checked = status;
    switchElement.onchange = (): void => {
        onToggle();
    }

    switchWrapper.appendChild(switchElement);

    const switchLabel = document.createElement('label');
    switchLabel.classList.add('custom-control-label');
    switchLabel.setAttribute('for', switchId);
    switchLabel.innerText = title;

    switchWrapper.insertAdjacentElement('beforeend', switchLabel);

    const switchDescription = document.createElement('p');
    switchDescription.classList.add('text-muted');
    switchDescription.innerText = description;

    switchWrapper.insertAdjacentElement('beforeend', switchDescription);

    return switchWrapper;
}

const createUserSearch = (onInput: (content: string) => void): HTMLElement => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('pb-1', 'pb-md-3');

    const userCount = document.createElement('div');
    userCount.id = 'user-count';
    userCount.classList.add('text-muted');
    userCount.innerText = `${i18n.userCount}: 0`

    const inputElement = document.createElement('input');
    inputElement.classList.add('form-control', 'mt-2');
    inputElement.type = 'search';
    inputElement.autocapitalize = "off";
    inputElement.autocomplete = "off";
    inputElement.spellcheck = false;
    inputElement.placeholder = i18n.searchUsersInputPlaceholder;
    inputElement.oninput = (ev: Event): void => {
        if (ev.target) {
            const el = ev.target as HTMLInputElement;
            onInput(el.value);
        }
    }

    wrapper.appendChild(userCount);
    wrapper.appendChild(inputElement);

    return wrapper;
}

const updateUserCount = (count: number): void => {
    const userCountElement = document.getElementById('user-count');
    if (userCountElement) {
        userCountElement.innerText = `${i18n.userCount}: ${count}`
    }
}

const createUserCellElement = (user: User): HTMLElement => {
    const userLink = document.createElement('a');
    userLink.classList.add(user.online ? 'online' : 'offline', 'user-link');
    userLink.href = `https://lichess.org/@/${user.id}`;
    userLink.target = '_blank';
    userLink.rel = 'noopener noreferrer'
    userLink.innerText = (user.username && user.username.length > 0) ? user.username : user.id;

    return userLink;
}

const createNotifyWhenOnlineSettingCell = (user: User): HTMLElement => {
    const button = document.createElement('a');
    button.classList.add('notify-online-btn', user.notifyWhenOnline ? 'check-icon' : 'times-icon');
    button.onclick = (): void => {
        if(button.classList.contains('check-icon')) {
            button.classList.replace('check-icon', 'times-icon');
        } else {
            button.classList.remove('times-icon');
            button.classList.add('check-icon');
        }

        toggleNotifyWhenOnline(user.id);
    }

    return button;
}

const createNotifyWhenPlayingSettingCell = (user: User): HTMLElement => {
    const button = document.createElement('a');
    button.classList.add('notify-playing-btn', user.notifyWhenPlaying ? 'check-icon' : 'times-icon');
    button.onclick = (): void => {
        if(button.classList.contains('check-icon')) {
            button.classList.replace('check-icon', 'times-icon');
        } else {
            button.classList.remove('times-icon');
            button.classList.add('check-icon');
        }

        toggleNotifyWhenPlaying(user.id);
    }

    return button;
}

const createRemoveUserCell = (user: User, onRemove: (id?: string) => void): HTMLElement => {
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('remove-user-btn', 'btn', 'btn-outline-danger');
    button.innerText = i18n.remove;
    button.onclick = (): void => {
        removeUser(user.id);
        onRemove();
    }

    return button;
}

const createUserTable = (): HTMLElement => {
    const wrapper = document.createElement('div');
    const tableWrapper = document.createElement('div');

    const createTable = (users: User[]): HTMLElement => {
        updateUserCount(users.length);

        if(users.length < 1)
            return document.createElement('div');

        const table = document.createElement('table');
        table.classList.add('user-table', 'table');
        const tableHead = table.createTHead();

        if(tableHead) {
            const row = tableHead.insertRow();
            
            const nameHeader = document.createElement('th');
            nameHeader.scope = 'col';
            nameHeader.appendChild(document.createTextNode(i18n.name));

            const noHeader = document.createElement('th');
            noHeader.scope = 'col';
            noHeader.appendChild(document.createTextNode(i18n.notifyWhenOnlineQuestion));

            const npHeader = document.createElement('th');
            npHeader.scope = 'col';
            npHeader.appendChild(document.createTextNode(i18n.notifyWhenPlayingQuestion));

            const emptyHeader = document.createElement('th');
            emptyHeader.scope = 'col';
            
            row.appendChild(nameHeader);
            row.appendChild(noHeader);
            row.appendChild(npHeader);
            // insert empty cell for last col
            row.appendChild(emptyHeader);
        }

        const updateTable = (): void => {
            getUsers()
                .then(users => tableWrapper.firstChild?.replaceWith(createTable(users)))
                .catch(err => console.error(err));
        }

        for (const user of sortByName(users)) {
            const row = table.insertRow();

            row.insertCell().appendChild(createUserCellElement(user));
            row.insertCell().appendChild(createNotifyWhenOnlineSettingCell(user));
            row.insertCell().appendChild(createNotifyWhenPlayingSettingCell(user));
            row.insertCell().appendChild(createRemoveUserCell(user, updateTable));
        }

        return table;
    }

    const onInput = (content: string): void => {
        const term = content.toLowerCase();

        getUsers()
            .then(users => {
                const filtered = users.filter(u => u.username.toLowerCase().includes(term) || u.id.toLowerCase().includes(term));
                tableWrapper.firstChild?.replaceWith(createTable(filtered));
            })
            .catch(err => console.error(err));
        return;
    }

    const debouncedOnInput = debounce(onInput, 200);

    wrapper.appendChild(createUserSearch(debouncedOnInput));
    wrapper.appendChild(tableWrapper);

    getUsers().then(users => tableWrapper.appendChild(createTable(users))).catch(err => console.error(err));

    return wrapper;
}

const createBoxWrapper = (title: string, ...elements: HTMLElement[]): HTMLElement => {
    const box = document.createElement('div');
    box.classList.add('bg-light', 'border', 'py-2', 'py-md-3', 'px-2', 'px-md-3', 'mr-1', 'mr-md-2', 'mr-lg-4', 'my-1', 'my-md-3', 'my-lg-5', 'col');

    if (title && title.length > 0) {
        const titleElement = document.createElement('h2');
        titleElement.classList.add('h4');
        titleElement.innerText = title;
        box.appendChild(titleElement);
    }

    const content = document.createElement('div');
    content.classList.add('d-flex', 'flex-column', 'py-3');

    for (const element of elements) {
        content.appendChild(element);
    }

    box.appendChild(content);

    return box;
}

const version = document.getElementById('ln-version');

if (version)
    version.innerText = `v${pkg.version}`;

const content = document.getElementById('content');

if (content) {
    getPreferences()
        .then(prefs => {
            content.appendChild(
                createBoxWrapper(i18n.settings,
                    createSwitch({
                        title: i18n.enableSystemNotificationsSettingTitle,
                        description: i18n.enableSystemNotificationsSettingDescription,
                        status: prefs.notificationsEnabled,
                        onToggle: toggleNotificationsEnabled
                    }),
                    createSwitch({
                        title: i18n.displayBadgeTextSettingTitle,
                        description: i18n.displayBadgeTextSettingDescription,
                        status: prefs.displayBadgeTextEnabled,
                        onToggle: toggleDisplayBadgeTextEnabled
                    }),
                )
            );

            content.appendChild(createBoxWrapper(i18n.users, createUserTable()));
        })
        .catch(err => console.error(err));
} 