import { Patcher } from "+silica/core/patcher";
import type { Dispatcher } from "+silica/types/flux/dispatcher";
import settings from "../settings";
import { getWebpackChunkByExports } from "../webpack";

const patcher = new Patcher();
let patched = false;
let dispatcher: Dispatcher;

export const init = () => {
    getDispatcher();
};

export const getDispatcher = (force = false): Dispatcher => {
    if (dispatcher && !force) return dispatcher;

    dispatcher = (getWebpackChunkByExports("Z.flushWaitQueue") as any).Z;

    if (patched) return dispatcher;

    patched = true;

    patcher.applyPatch(
        dispatcher,
        "dispatch",
        (originalMethod) => {
            return function (this: Dispatcher, action: any) {
                if (settings.$logDispatches.get()) console.log(`[DISPATCHER] ${action.type}`, action);
                return originalMethod.call(this, action);   
            };
        }
    );

    patcher.applyPatch(
        dispatcher,
        "waitForDispatch",
        (originalMethod) => {
            return async function (this: Dispatcher, event: string) {
                return new Promise((resolve) => {
                    const callback = (data: unknown) => {
                        resolve(data);
                        this.unsubscribe(event, callback);
                    };
                    this.subscribe(event, callback);
                });
            };
        }
    );

    return dispatcher;
};

export const unload = () => {
    patcher.removeAllPatches(); 
}; 

const api = getDispatcher;

export default api;