if (window.silica) {
    window.silica.unload();
}

// all *API are exposed to the window & plugins
import storageAPI, * as storage from "./electron/storage";
import dispatcherAPI, * as dispatcher from "./flux/dispatcher";
import settingsAPI, * as settings from "./settings";
import webpackAPI from "./webpack";


const start = performance.now() / 1000;

storage.init();
dispatcher.init();
settings.init();
    
export const api: SilicaApi = {
    webpack: webpackAPI,
    dispatcher: dispatcherAPI,
    storage: storageAPI,
    settings: settingsAPI,
    unload: () => {
        window.silica = undefined;
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
    unload: () => void
};

window.silica = api;

const now = performance.now() / 1000;
alert(`silica loaded in ${Number.parseFloat((now - start).toFixed(2))}s`);
console.log(`silica loaded in ${Number.parseFloat((now - start).toFixed(2))}s`);