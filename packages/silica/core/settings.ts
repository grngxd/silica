import { type WritableAtom, atom } from 'nanostores';

const LOCAL_KEY = "SILICA_SETTINGS";

export const settings = {
    $logDispatches: atom<boolean>(false) as WritableAtom<boolean>,
};

const defaultSettings = Object.fromEntries(Object.entries(settings).map(([k, v]) => [k, v.get()]));

export const init = () => {
    let parsed = JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");

    if (Object.keys(parsed).length === 0) {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(defaultSettings));
        parsed = defaultSettings;
    }

    for (const [key, config] of Object.entries(settings)) {
        (config as WritableAtom<any>).set(parsed[key]);
    }

    for (const [key, config] of Object.entries(settings)) {
        (config as WritableAtom<any>).listen((value) => {
            save(value);
        });
    }
}

export const save = (value: any) => {
    const kv = Object.fromEntries(Object.entries(settings).map(([k, _]) => [k, value]));
    localStorage.setItem(LOCAL_KEY, JSON.stringify(kv));
}

export default settings;