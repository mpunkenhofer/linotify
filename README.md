# LiNotify

LiNotify (li[chess] notify{notifications}) is a cross browser extension that notifies you if a certain player is online and/or playing on [lichess.org](https://www.lichess.org).

## LiNotify Buttons

![LiNotify Button Example Image 1](https://raw.githubusercontent.com/mpunkenhofer/linotify/master/assets/promo/promo-github-1.png)
![LiNotify Button Example Image 2](https://raw.githubusercontent.com/mpunkenhofer/linotify/master/assets/promo/promo-github-2.png)

## LiNotify Extension Popup

![LiNotify Popup Example Image](https://raw.githubusercontent.com/mpunkenhofer/linotify/master/assets/promo/promo-github-3.png)

## LiNotify Options

![LiNotify Options Example Image](https://raw.githubusercontent.com/mpunkenhofer/linotify/master/assets/promo/promo-github-4.png)

LiNotify is written in [Typescript](https://www.typescriptlang.org/), uses [Webpack](https://webpack.js.org/) for module
bundling. Lichess [API](https://lichess.org/api) requests are made with [Axios](https://github.com/axios/axios), CSS is generated with [Sass](https://sass-lang.com/), making use of [Bootstrap](https://getbootstrap.com/), for cross browser support [webextension-polyfill-ts](https://github.com/Lusito/webextension-polyfill-ts) is used. System notifications are displayed by using the browser [notifications api](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/notifications) which is supported by most modern browsers.

This extension requires the following permissions:

* Notifications: to display system notifications if a player comes online or starts playing.
* Alarms: to periodically poll the lichess api for any player status changes.
* Storage: to store player data and extension settings.

### LiNotify in Stores

* [Chrome](https://chrome.google.com/webstore/detail/linotify/dpfdenddcngojnndogbfhpampiplllpj)
* [Firefox](https://addons.mozilla.org/en-US/firefox/addon/linotify/)

## Building and contributing

See [CONTRIBUTING.md](/CONTRIBUTING.md).

## License

See [LICENSE](/LICENSE).

## Attributions

Files | Author(s) | Licence
---|---|---
/assets/fonts/lichess.woff2 | [ornicar/lila](https://github.com/ornicar/lila/blob/master/public/font/lichess.woff2) | [OFL](http://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL), [MIT](https://github.com/primer/octicons/blob/master/LICENSE), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), AGPLv3+
/assets/images/*.svg | [fontawesome](https://fontawesome.com/) | [OFL](http://scripts.sil.org/cms/scripts/page.php?site_id=nrsi&id=OFL), [MIT](https://github.com/primer/octicons/blob/master/LICENSE), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
