import { enableStorageApiLogger, getUser, addUser, removeUser } from "../common/storage";
import { browser } from "webextension-polyfill-ts";
import { i18n } from "../constants/i18n";

console.log('LiNotify is open source! https://github.com/mpunkenhofer/linotify');

if (process.env.NODE_ENV === "development") {
    enableStorageApiLogger();
}

const createFontStyleNode = (): void => {
    const node = document.createElement('style');
    node.type = "text/css";
    node.textContent = `@font-face { 
        font-family: linotify; 
        src: url('${browser.extension.getURL("assets/fonts/linotify.woff2")}');
        font-display: block;
        font-weight: normal;
        font-style: normal;
    }`;
    document.head.appendChild(node);
}

const createNotifyButton = (userId: string): HTMLElement => {
    const button = document.createElement('a');
    button.classList.add('btn-rack__btn', 'linotify__btn');
    button.setAttribute('data-icon', 'A');

    const check = document.createElement('i');
    check.classList.add('linotify_symbol', 'linotify_check', 'linotify_display_none');
    getUser(userId).then(user => user && check.classList.remove('linotify_display_none')).catch(err => console.error(err));
    check.setAttribute('data-icon', 'E');

    button.appendChild(check);

    button.onmouseover = (): void => {
        check.setAttribute('data-icon', 'L');
        check.classList.remove('linotify_check');
        check.classList.add('linotify_times');
    }
    button.onmouseout = (): void => {
        check.setAttribute('data-icon', 'E');
        check.classList.remove('linotify_times');
        check.classList.add('linotify_check');
    }


    button.onclick = (): void => {
        const user = getUser(userId);
        user.then(user => {
            if (user) {
                removeUser(user.id);
                check.classList.toggle('linotify_display_none', true);
                button.title = i18n.liNotifyButtonActivate;
            } else {
                addUser(userId);
                check.classList.toggle('linotify_display_none', false);
                button.title = i18n.liNotifyButtonDeactivate;
            }
        }).catch(err => console.error(err));
    }

    return button;
}

const removeTitle = (name: string): string => {
    if (!name)
        return '';

    const s = name.split(/(\s+)/);
    return s ? s[s.length - 1] : '';
};

const getUserId = (element: HTMLElement | null): string | null => {
    if (!element)
        return null;

    const userLink = element.querySelector('.user-link');
    return (userLink && userLink.textContent) ? removeTitle(userLink.textContent) : null;
}

const removeInnerText = (nodes: NodeList): void => {
    for (const node of nodes) {
        (node as HTMLElement).innerText = '';
    }
}

const addNotifyButtonToPowerTip = (powerTip: HTMLElement | null): void => {
    if (!powerTip)
        return;

    new MutationObserver(() => {
        const rack = powerTip.querySelector('.btn-rack');
        const linotifyButton = powerTip.querySelector('.linotify__btn');
        if (rack && !linotifyButton) {
            removeInnerText(rack.childNodes);

            const userId = getUserId(powerTip);
            userId && rack.insertAdjacentElement('beforeend', createNotifyButton(userId));
        }
    }).observe(powerTip, { childList: true });
}

createFontStyleNode();

const rack = document.querySelector('.btn-rack');

// check if there is a button rack (e.g. profile page)
if (rack) {
    const userId = getUserId(document.querySelector('.user-link'));
    userId && rack.insertAdjacentElement('beforeend', createNotifyButton(userId));
}

const powerTip = document.getElementById('powerTip');

// add notify button powerTip btn rack
if (powerTip) {
    addNotifyButtonToPowerTip(powerTip);
} else {
    // powerTip doesn't exist in dom
    new MutationObserver((mutations, observerInstance) => {
        if (mutations.find(record => Array.from(record.addedNodes).find(node => (node as HTMLElement).id == 'powerTip'))) {
            addNotifyButtonToPowerTip(document.getElementById('powerTip'));
            observerInstance.disconnect();
        }
    }).observe(document.body, { childList: true });
}
