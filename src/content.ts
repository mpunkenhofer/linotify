console.log('LiNotify is open source! https://github.com/mpunkenhofer/linotify');

const createNotifyButton = (username: string): HTMLElement => {
    const button = document.createElement('a');
    button.classList.add('btn-rack__btn');
    button.setAttribute('data-icon', 'x');
    button.onclick = () => console.log(`Notify for ${username}.`);
    return button;
}

const removeTitle = (name: string): string => {
    if(!name)
        return '';

    const s = name.split(/(\s+)/);
    return s ? s[s.length - 1] : '';
};

const getUserName = (element: HTMLElement | null): string | null => {
    if(!element)
        return null;

    const userLink = element.querySelector('.user-link');
    return (userLink && userLink.textContent) ? removeTitle(userLink.textContent) : null;
}

const removeInnerText = (nodes: NodeList) => {
    for (const node of nodes) {
        (node as HTMLElement).innerText = '';
    }
}

const addNotifyButtonToPowerTip = (powerTip: HTMLElement | null) => {
    if(!powerTip)
        return;

    new MutationObserver((mutations, observerInstance) => {
        const rack = powerTip.querySelector('.btn-rack');
        if(rack) {
            const username = getUserName(powerTip);
            username && rack.insertAdjacentElement('afterbegin', createNotifyButton(username));
            removeInnerText(rack.childNodes);
        }
    }).observe(powerTip, { childList: true});
}

const rack = document.querySelector('.btn-rack');

// check if there is a button rack (e.g. profile page)
if(rack) {
    const username = getUserName(document.querySelector('.user-link'));
    username && rack.insertAdjacentElement('afterbegin', createNotifyButton(username));
}

const powerTip = document.getElementById('powerTip');

// add notify button powerTip btn rack
if (powerTip) {
    addNotifyButtonToPowerTip(powerTip); 
} else {
    // powerTip doesn't exist in dom
    new MutationObserver((mutations, observerInstance) => {
        if(mutations.find(record => Array.from(record.addedNodes).find(node => (node as HTMLElement).id == 'powerTip'))) {
            addNotifyButtonToPowerTip(document.getElementById('powerTip')); 
            observerInstance.disconnect();
        }
    }).observe(document.body, { childList: true});
}

