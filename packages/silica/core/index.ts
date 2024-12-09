if (window.silica) {
    window.silica.unload();
}

// all *API are exposed to the window & plugins
import dispatcherAPI, * as dispatcher from "./flux/dispatcher";
import webpackAPI from "./webpack";

const start = performance.now() / 1000;

dispatcher.init();
    
export const api = {
    webpack: webpackAPI,
    dispatcher: dispatcherAPI,
    unload: () => {
        window.silica = undefined;

        Promise.all([
            dispatcher.unload(),
        ]).then(() => {
            console.log('silica unloaded!');
        });
    }
}

export type SilicaApi = {
    webpack: typeof import("./webpack").default;
    dispatcher: typeof import("./flux/dispatcher").default;
    unload: () => void;
};

window.silica = api;

const now = performance.now() / 1000;
alert(`silica loaded in ${Number.parseFloat((now - start).toFixed(2))}s`);
console.log(`silica loaded in ${Number.parseFloat((now - start).toFixed(2))}s`);