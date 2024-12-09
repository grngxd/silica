import { Patcher } from "+silica/core/patcher";
import type { Dispatcher } from "+silica/types/flux/dispatcher";
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
                console.log(`[DISPATCHER] ${action.type}`, action);
                return originalMethod.call(this, action);   
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