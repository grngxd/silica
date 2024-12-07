export type SilicaApi = typeof api;

declare global {
    interface Window {
        silica: SilicaApi | undefined;
        webpackChunkdiscord_app: any;
        DiscordNative: any;
    }

    const silica: SilicaApi | null;
    const DiscordNative: any;

    interface Object {
        _dispatcher: undefined;
    }
}