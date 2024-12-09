import { generate } from 'short-uuid';

export class Patcher {
    private patches: Map<string, () => void>;

    constructor() {
        this.patches = new Map();
    }

    /**
     * applyPatch
     * @param target Object to patch
     * @param fnName Function to be patched
     * @param patchedFn Your patched function
    * @example
    * const obj = {
    *     greet(name: string) {
    *         return `Hello, ${name}!`;
    *     }
    * };
    * 
    * const patches = new Patches();
    * const unpatch = patches.applyPatch(obj, 'greet', (originalMethod) => {
    *     // IMPORTANT!!! Use function instead of arrow function to keep the context of "this"
    *     return function(name: string) {
    *         return originalMethod.call(this, name).toUpperCase();
    *     };
    * });
    * 
    * console.log(obj.greet('world')); // Outputs: HELLO, WORLD!
    * 
    * unpatch();
    * console.log(obj.greet('world')); // Outputs: Hello, world!
     * @returns Unpatch function
     */
    applyPatch<T, K extends keyof T>(
        target: T,
        fnName: K,
        patchedFn: T[K] extends (...args: any[]) => any ? (originalMethod: T[K]) => T[K] : never
    ): () => void {
        const patchName = `${String(fnName)}_${generate()}_${Date.now()}`;

        if (this.patches.has(patchName)) {
            return this.applyPatch(target, fnName, patchedFn);
        }

        const originalMethod = target[fnName];
        if (typeof originalMethod !== "function") {
            console.error(`Method "${String(fnName)}" is not a function on target object.`);
            throw new Error(`Method "${String(fnName)}" is not a function on target object.`);
        }

        // Apply the patch
        target[fnName] = patchedFn(originalMethod as T[K] & ((...args: any[]) => any));

        // Store the unpatch function
        const unpatch = () => {
            target[fnName] = originalMethod;
            this.patches.delete(patchName);
        };

        this.patches.set(patchName, unpatch);
        return unpatch;
    }

    removeAllPatches(): void {
        for (const [_, unpatch] of this.patches.entries()) {
            unpatch();
        }
        this.patches.clear();
    }
}