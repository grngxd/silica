import type { React, ReactDOM } from "+silica/types/react";
import { getWebpackChunkByExports } from "./webpack";

// TODO: type react & rdom
export let react: React | undefined = undefined;
export let reactDOM: ReactDOM | undefined = undefined;

export const init = (force = false) => {
    if (react && reactDOM && !force) return;

    const r = getWebpackChunkByExports("useState", "useEffect");
    const d = getWebpackChunkByExports("render", "createPortal");

    if (r && d) {
        react = r;
        reactDOM = d;
        return [r, d];
    }

    throw new Error("Failed to find React / ReactDOM");
}

const api = {
    react,
    reactDOM,
}

export default api;