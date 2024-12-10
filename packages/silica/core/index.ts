if (window.silica) {
    window.silica.unload();
}

import * as preact from "preact";
import * as discordSettings from "./discord/settings";
// all *API are exposed to the window & plugins
import storageAPI, * as storage from "./electron/storage";
import dispatcherAPI, * as dispatcher from "./flux/dispatcher";
import reactAPI, * as react from "./react";
import settingsAPI, * as settings from "./settings";
import webpackAPI from "./webpack";

const start = performance.now() / 1000;

storage.init();
dispatcher.init();
react.init();
settings.init();
discordSettings.init();
    
export const api: SilicaApi = {
    webpack: webpackAPI,
    dispatcher: dispatcherAPI,
    storage: storageAPI,
    settings: settingsAPI,
    react: reactAPI.react,
    reactDOM: reactAPI.reactDOM,
    preact: {
        ...preact,
        renderPreactInReact: reactAPI.renderPreactInReact
    },
    fiber: react.fiberAPI,
    unload: () => {
        window.silica = undefined;
        discordSettings.unload();
        dispatcher.unload();
        Promise.all([
            storage.unload()
        ]).then(() => {
            console.log('silica unloaded!');
        });
    }
}

export type SilicaApi = {
    webpack: typeof webpackAPI,
    dispatcher: typeof dispatcherAPI,
    storage: typeof storageAPI,
    settings: typeof settingsAPI,
    react: typeof reactAPI.react,
    reactDOM: typeof reactAPI.reactDOM,
    preact: typeof preact & { renderPreactInReact: typeof reactAPI.renderPreactInReact },
    fiber: typeof react.fiberAPI,
    unload: () => void
};


window.silica = api;

const now = performance.now() / 1000;
alert(`silica loaded in ${Number.parseFloat((now - start).toFixed(2))}s`);
console.log(`silica loaded in ${Number.parseFloat((now - start).toFixed(2))}s`);