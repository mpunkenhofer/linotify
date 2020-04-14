Contributing
============

You want to contribute to LiNotify? Awesome! Any form of help is greatly appreciated 
(contributions/pull requests, suggestions, tips, bug reports,...).

Join the [Litags Discord](https://discord.gg/4d7QWUK) to get in touch (LiTags is another browser extension for lichess.org I implemented).

## I want to report a bug or a problem about LiNotify

[__Make an issue__](https://github.com/mpunkenhofer/linotify/issues/new). Make sure you list the steps to reproduce the 
problem and it is not a trivial problem or demands unrealistic dev time to fix. Issues reports of very minimal effort 
may be closed. 

## I want to suggest a feature for LiNotify

Issue tickets on features that lack potential or effectiveness are not useful and may be closed. Before creating a 
ticket, please first try to discuss it on the [Litags Discord](https://discord.gg/4d7QWUK) in appropriate channels to
gauge feedback. When ready: [make an issue ticket](https://github.com/mpunkenhofer/linotify/issues/new).

## Building development versions of the extension

### First time installation

1. Install [git](https://git-scm.com/).
2. Install [node.js](https://nodejs.org)
3. Install [npm](https://www.npmjs.com/get-npm)
4. [Clone](https://help.github.com/articles/cloning-a-repository/) this repository 
5. Run `npm install` in that folder.

### Build commands

**`npm run dev`** will clean `dist/`, then build LiNotify (dev mode), and start a watch task that will rebuild LiNotify when 
you make changes. Only changed files will be rebuilt.

**`npm run build`** will clean `dist/`, then build LiNotify (prod mode) and create a .zip file in `dist/zip/`

### Lint commands

**`npm run lint`** will verify the code style (and point out any errors) of all `.ts .js` and files in `src/` 
using  [ESLint](http://eslint.org/) with typescript support by 
[TypeScript ESLint](https://github.com/typescript-eslint/typescript-eslint).

### Loading LiNotify into your browser

#### Chrome

1. `Menu->More tools->Extensions` and tick the `Developer Mode` checkbox.
2. Click `Load unpacked extension` and select the `/dist` folder.
3. On the `Menu->More tools->Extensions` page use `Reload` if you need to.

#### Firefox

1. `about:debugging` and tick the `Enable add-on debugging` checkbox.
2. Click `Load Temporary Add-on` and select `/dist/manifest.json`.
3. On  the `about:debugging` page use `Reload` if you need to.

### Resources

A collection of useful links regarding this project.
- [Building a cross-browser extension](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Build_a_cross_browser_extension)
- [Bootstrap](https://getbootstrap.com/)
  