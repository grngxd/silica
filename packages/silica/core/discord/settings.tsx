import type { CancelablePromise } from "+silica/types/flux/dispatcher";
import { css } from "@emotion/css";
import { Fragment, type VNode, h } from "preact";
import { generate } from "short-uuid";
import { getDispatcher } from "../flux/dispatcher";
import { Patcher } from "../patcher";
import { getFiberOwner, renderPreactInReact } from "../react";
import { getWebpackChunkByExports } from "../webpack";

// IN VEIL THIS WHOLE FILE WOULDVE BEEN 140 LINES LONG
// IM NOT JOKING
// https://github.com/grngxd/veil/blob/f8ca7a3243829d73c202b15bd641293fb9f35891/packages/core/settings/index.tsx
// i have almost surpassed the original code length... fuk

let SettingsView: any;

type CustomSetting = {
    section: string;
    searchableTitles?: string[];
    label?: string;
    ariaLabel?: string;
    element?: () => VNode;
};

let p: Patcher | null = null;

let settingsDispatch: CancelablePromise<unknown>;

const customSettings: CustomSetting[] = [];

export const init = () => {
    settingsDispatch = getDispatcher()
        .waitForDispatch("USER_SETTINGS_MODAL_OPEN")
        .then(async () => {
            // TODO: webpack lazy-loads the settings component, so we need a better way to wait for it to load
            await new Promise((resolve) => setTimeout(resolve, 1500));

            SettingsView = (getWebpackChunkByExports("ZP.prototype.getPredicateSections") as any)?.ZP;

            p = new Patcher();

            p?.applyPatch(
                SettingsView.prototype,
                "getPredicateSections",
                (originalMethod) => {
                    return function (this: any) {
                        const sections = originalMethod.call(this) as CustomSetting[];

                        const i = sections.findIndex((section) => section.section === "DIVIDER");

                        if (i !== -1) sections.splice(i, 0, ...customSettings);
                        else sections.push(...customSettings);

                        return sections;
                    };
                }
            );

            createSettingsSection("silica (alpha)")
                .addSetting({
                    label: "Settings",
                    element: () => {
                        return (
                            <>
                                <h1 class={css({
                                    color: "white",
                                })}>coming soon :3</h1>
                            </>
                        );
                    }
                })
        });
};

const rerenderSidebar = () => {
    const sidebarParent = document.querySelector(`nav[class^="sidebar"]`);
    getFiberOwner(sidebarParent as Element, true)?.forceUpdate(); 
};

// TODO: this is such a big mess (i need to fix this NOW) (ill just make a class or something fr)
export const createSettingsSection = (
    label: string,
) => {
    const setting: CustomSetting = {
        section: "HEADER",
        label
    };
    const divider: CustomSetting = {
        section: "DIVIDER"
    };
    
    customSettings.push(divider, setting);
    rerenderSidebar();

    return {
        addSetting: (setting: {
            label: string;
            element: () => VNode;
        }) => {
            const uid = `label-${generate()}`
            customSettings.push({
                section: uid,
                label: setting.label,
                element: () => renderPreactInReact(() => setting.element())
            });

            rerenderSidebar();
            return uid
        },
        removeSetting: (uid: string) => {
            const index = customSettings.findIndex((setting) => setting.section === uid);
            if (index !== -1) {
                customSettings.splice(index, 1);
                rerenderSidebar();
            }
        }
    }
}

export const unload = () => {
    settingsDispatch?.cancel();
    p?.removeAllPatches();
    rerenderSidebar();
};

const api = {
    createSettingsSection,
}

export default api;