import { Patcher } from "+silica/core/patcher";
import { CancelablePromise, type Dispatcher } from "+silica/types/flux/dispatcher";
import settings from "../settings";
import { getWebpackChunkByExports } from "../webpack";

const p = new Patcher();
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

    p.applyPatch(
        dispatcher,
        "dispatch",
        (originalMethod) => {
            return function (this: Dispatcher, action: any) {
                if (settings.$logDispatches.get()) console.log(`[DISPATCHER] ${action.type}`, action);
                return originalMethod.call(this, action);   
            };
        }
    );

    p.applyPatch(
        dispatcher,
        "waitForDispatch",
        (originalMethod) => {
            return function (this: Dispatcher, event: string) {
                let unsubscribeFn: () => void;
                let rejectFn!: (reason?: any) => void;
    
                const promise = new CancelablePromise<unknown>(
                    (resolve, reject) => {
                        rejectFn = reject;
                        const callback = (data: unknown) => {
                            resolve(data);
                            if (unsubscribeFn) unsubscribeFn();
                        };
                        this.subscribe(event, callback);
                        unsubscribeFn = () => this.unsubscribe(event, callback);
                    },
                    () => {
                        if (unsubscribeFn) unsubscribeFn();
                    }
                );
    
                return promise;
            };
        }
    ); 

    return dispatcher;
};

export const unload = () => {
    p.removeAllPatches(); 
}; 

const api = getDispatcher;

export default api;