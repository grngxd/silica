import type { SilicaApi } from "+silica/core";
import type { WebpackBundle } from "./webpack";

declare global {
    interface Window {
        silica: SilicaApi | undefined;
        webpackChunkdiscord_app: WebpackBundle;
        DiscordNative: any;
    }

    const silica: SilicaApi | null;
    const DiscordNative: any;
    const webpackChunkdiscord_app: WebpackBundle;

    interface Object {
        _dispatcher: undefined;
    }
}