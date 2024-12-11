import type { CancelablePromise } from "+silica/types/flux/dispatcher";
import { type VNode, h } from "preact";
import { getDispatcher } from "../flux/dispatcher";
import { Patcher } from "../patcher";
import { getFiberOwner, renderPreactInReact } from "../react";
import { getWebpackChunkByExports } from "../webpack";

// IN VEIL THIS WHOLE FILE WOULDVE BEEN 140 LINES LONG
// IM NOT JOKING
// https://github.com/grngxd/veil/blob/f8ca7a3243829d73c202b15bd641293fb9f35891/packages/core/settings/index.tsx

// TODO: type this
let SettingsView: any;

type CustomElement = {
    section: string;
    searchableTitles?: string[];
    label?: string;
    ariaLabel?: string;
    element?: () => VNode;
};

let p: Patcher | null = null;

let settingsDispatch: CancelablePromise<unknown>;

export const init = () => {
    settingsDispatch = getDispatcher()
        .waitForDispatch("USER_SETTINGS_MODAL_OPEN")
        .then(async () => {
            console.log("Settings modal opened!");
            SettingsView = (getWebpackChunkByExports("ZP.prototype.getPredicateSections") as any)?.ZP

            p = new Patcher();

            p?.applyPatch(
                SettingsView.prototype,
                "getPredicateSections",
                (originalMethod) => {
                    return function (this: any) {
                        const sections = originalMethod.call(this);

                        // TODO: actually add custom sections
                        sections.push({
                            section: "silica",
                            searchableTitles: ["silica"],
                            label: "silica",
                            ariaLabel: "silica",
                            element: () => renderPreactInReact(() => <h1>hi</h1>)
                        } as CustomElement);
                        return sections;
                    };
                }
            );

            rerenderSidebar();
        });
}

const rerenderSidebar = () => {
    const sidebarParent = document.querySelector(`nav[class^="sidebar"]`);
    getFiberOwner(sidebarParent as Element, true)?.forceUpdate(); 
}

export const unload = () => {
    settingsDispatch?.cancel();
    p?.removeAllPatches();
    rerenderSidebar();
};