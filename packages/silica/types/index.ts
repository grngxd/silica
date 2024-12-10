import type { SilicaApi } from "+silica/core";
import type { ReactFiber } from "./react";
import type { WebpackBundle } from "./webpack";

declare global {
    interface Window {
        silica: SilicaApi | undefined;
        webpackChunkdiscord_app: WebpackBundle;
        DiscordNative: any;
    }

    interface Element {
        [f: `__reactFiber$${string}`]: ReactFiber;
    }

    const silica: SilicaApi | null;
    const DiscordNative: any;
    const webpackChunkdiscord_app: WebpackBundle;

    interface Object {
        _dispatcher: undefined;
    }
}