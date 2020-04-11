import { getUsers } from "../common/storage";
import { User } from "../common/types";
import { TITLES, ICONS } from "../constants";
import { topPerformance } from "../common/util";

console.log('LiNotify is open source! https://github.com/mpunkenhofer/linotify');

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
        line.title = 'Lichess Patron';
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

const createUserTable = (): HTMLElement => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('user-table');

    const table = document.createElement('table');

    getUsers()
        .then(users => {
            console.log(users);

            for (const user of users) {
                if (!user || !user.id || !(user.id.length > 0))
                    continue;

                const row = table.insertRow();
                row.insertCell().appendChild(createUserCellElement(user));
                row.insertCell().appendChild(createRatingCellElement(user));
                row.insertCell().appendChild(createRatingProgressionElement(user));

                if(user.playing)
                    row.insertCell().appendChild(createTvLinkCellElement(user));
                else
                    row.insertCell();

            }
        })
        .catch(err => console.error(err));

    wrapper.appendChild(table);

    return wrapper;
}

const createCollapseAble  = (content: HTMLElement): HTMLElement => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('collapseable');

    wrapper.appendChild(content);
    return wrapper;
}

const root = document.getElementById('root');

root?.appendChild(createCollapseAble(createUserTable()));