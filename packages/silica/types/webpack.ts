export type WebpackChunk = {
    [key: number]: WebpackModule;
}

export type WebpackModule = {
    id: number;
    loaded: boolean;
    default: any;
    exports: { [key: string]: ((...args: any[]) => any) | undefined }; // idk the actual type so im guessing
}

// this was so fun to type (no it wasnt)
export type WebpackBundle = [
    string[],
    Record<string, any>,
    (r: { c: any }) => WebpackChunk
];