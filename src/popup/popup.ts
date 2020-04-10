import { getUsers } from "../common/storage";
import { User } from "../common/types";
import { TITLES } from "../constants";

console.log('LiNotify is open source! https://github.com/mpunkenhofer/linotify');

const createUserCellElement = (user: User): HTMLElement => {
    const userLink = document.createElement('a');
    userLink.classList.add(user.online ? 'online' : 'offline', 'user-link');
    userLink.href = `https://lichess.org/@/${user.id}`;
    userLink.target = '_blank';
    userLink.rel = 'noopener noreferrer'
    userLink.innerText = user.username;

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
        line.classList.add('patron');
        line.title = 'Lichess Patron';
    }

    userLink.insertAdjacentElement('afterbegin', line);

    return userLink;
}

const createRatingCellElement = (user: User): HTMLElement => {
    const rating = document.createElement('span');
    rating.innerText = user.perfs['bullet'].rating.toString() || '1500';
    return rating;
}

const createRatingProgressionElement = (user: User): HTMLElement => {
    const progression = document.createElement(user.perfs['bullet'].prog < 0 ? 'bad' : 'good');
    progression.innerText = user.perfs['bullet'].prog.toString();
    return progression;
}

const createLiveGameLinkCellElement = (user: User): HTMLElement => {
    const gameLink = document.createElement('a');
    gameLink.classList.add('game-link');
    gameLink.href = `https://lichess.org/@/${user.id}`;
    gameLink.target = '_blank';
    gameLink.rel = 'noopener noreferrer'

    console.log(user);
    
    return gameLink;
}

const createUserTable = (): HTMLTableElement => {
    const table = document.createElement('table');
    getUsers()
        .then(users => {
            for (const user of users) {
                const row = table.insertRow();
                row.insertCell().appendChild(createUserCellElement(user));
                row.insertCell().appendChild(createRatingCellElement(user));
                row.insertCell().appendChild(createRatingProgressionElement(user));
                if(user.playing) {
                    row.insertCell().appendChild(createLiveGameLinkCellElement(user));
                }
            }
        })
        .catch(err => console.error(err));

    return table;
}


const root = document.getElementById('root');

root?.appendChild(createUserTable());