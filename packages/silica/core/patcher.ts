import { generate } from 'short-uuid';

export class Patcher {
    private patches: Map<string, () => void>;

    constructor() {
        this.patches = new Map();
    }

    /**
     * Applies a patch to an existing method of the target object.
     *
     * @param target - The object containing the method to patch.
     * @param fnName - The name of the method to patch.
     * @param patchedFn - A function that takes the original method and returns the patched method.
     * @returns A function to unpatch the method.
     *
     * @example
     * ```typescript
     * const patcher = new Patcher();
     * 
     * const obj = {
     *     greet(name: string): string {
     *         return `Hello, ${name}!`;
     *     }
     * };
     * 
     * // Patch the existing 'greet' method
     * patcher.applyPatch(obj, 'greet', (original) => {
     *     return function(name: string) {
     *         return original(name).toUpperCase();
     *     };
     * });
     * 
     * console.log(obj.greet('world')); // Outputs: HELLO, WORLD!
     * ```
     */
    applyPatch<T, K extends keyof T>(
        target: T,
        fnName: K,
        patchedFn: T[K] extends (...args: any[]) => any
            ? (originalMethod: T[K]) => T[K]
            : never
    ): () => void;

    /**
     * Adds a new method to the target object.
     *
     * @param target - The object to add the new method to.
     * @param fnName - The name of the new method.
     * @param patchedFn - A function that returns the new method.
     * @returns A function to remove the added method.
     *
     * @example
     * ```typescript
     * const patcher = new Patcher();
     * 
     * const obj = {
     *     greet(name: string): string {
     *         return `Hello, ${name}!`;
     *     }
     * };
     * 
     * // Add a new method 'farewell'
     * patcher.applyPatch(obj, 'farewell', () => {
     *     return function(name: string) {
     *         return `Goodbye, ${name}!`;
     *     };
     * });
     * 
     * console.log((obj as any).farewell('world')); // Outputs: Goodbye, world!
     * ```
     */
    applyPatch<T>(
        target: T,
        fnName: string,
        patchedFn: (originalMethod: undefined) => any
    ): () => void;

    applyPatch<T>(
        target: T,
        fnName: string,
        patchedFn: any
    ): () => void {
        const patchName = `${fnName}_${generate()}_${Date.now()}`;

        if (this.patches.has(patchName)) {
            return this.applyPatch(target, fnName, patchedFn);
        }

        const originalMethod = (target as any)[fnName];
        const isFunction = typeof originalMethod === "function";

        (target as any)[fnName] = patchedFn(isFunction ? originalMethod : undefined);

        const unpatch = () => {
            if (isFunction) {
                (target as any)[fnName] = originalMethod;
            } else {
                delete (target as any)[fnName];
            }
            this.patches.delete(patchName);
        };

        this.patches.set(patchName, unpatch);
        return unpatch;
    }

    /**
     * Removes all applied patches from the target objects.
     */
    removeAllPatches(): void {
        for (const unpatch of this.patches.values()) {
            unpatch();
        }
        this.patches.clear();
    }
}