import type { WebpackChunk } from "+silica/types/webpack";
import { getNestedProperty } from "+silica/util";
import { generate } from "short-uuid";

type ChunkFilters = {
    exports: string[];
};

export const getWebpackChunk = (
    func?: (chunk: WebpackChunk) => any,
): WebpackChunk | null => {
    let _: any;
    const bundleId = `SILICA_${generate()}`;

    const junk = [
        [bundleId],
        {},
        (r: any) => {
            if (func) _ = func(r.c);
            else _ = r;
        },
    ];

    window.webpackChunkdiscord_app.push(junk);

    // remove this line and watch your mem usage go up by 1mb lmao (probably even less)
    window.webpackChunkdiscord_app.splice(
        window.webpackChunkdiscord_app.indexOf(junk),
        1
    );

    return _;
};

// exports
export const getWebpackChunkByExports = (...exports: string[]) => {
    return getWebpackChunk((c) => {
        for (const chunk of Object.values(c)) {
            if (chunk.exports) {
                const match = exports.every(
                    (exp) => getNestedProperty(chunk.exports, exp) !== undefined,
                );
                if (match) return chunk.exports;
            }
        }
        return null;
    });
};

export const getWebpackChunkByFilters = (
    f: Partial<ChunkFilters>,
): WebpackChunk | null => {
    const filters = Object.fromEntries(
        Object.entries(f).filter(([_, v]) => v !== null),
    );

    const chunksGotten: { [k: string]: WebpackChunk | null } = Object.fromEntries(
        Object.keys(filters).map((k) => [k, null]),
    );

    for (const [k, v] of Object.entries(filters)) {
        switch (k) {
            case "exports":
                chunksGotten[k] = getWebpackChunkByExports(...v);
                break;
            default:
                break;
        }
    }

    const equal = Object.values(chunksGotten).every(
        (val, i, arr) => val === arr[0],
    );
    if (equal) return chunksGotten[Object.keys(chunksGotten)[0]];
    return null;
};

// api that is exposed to silica plugins
const api = {
    getWebpackChunk,
    getWebpackChunkByExports,
    getWebpackChunkByFilters,
};

export default api;