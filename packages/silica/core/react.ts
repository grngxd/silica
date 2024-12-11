import type { React, ReactDOM, ReactFiber, ReactFiberOwner } from "+silica/types/react";
import { type Attributes, type ComponentType, type VNode, h, render } from "preact";
import { getWebpackChunkByExports } from "./webpack";

export let react: React | undefined;
export let reactDOM: ReactDOM | undefined;
const fibers: Map<Element, ReactFiber> = new Map();
const fiberOwners: Map<Element | ReactFiber, ReactFiberOwner> = new Map();

export const init = (force = false) => {
    if ((react && reactDOM) && !force) return [react, reactDOM];

    const r = getWebpackChunkByExports("useState", "useEffect") as unknown as React | undefined;
    const d = getWebpackChunkByExports("render", "createPortal") as unknown as ReactDOM | undefined;

    if (r && d) {
        react = r;
        reactDOM = d;

        api.react = r;
        api.reactDOM = d;

        return [r, d];
    }

    throw new Error("Failed to find React / ReactDOM");
}

// biome-ignore lint/complexity/noBannedTypes: <explanation>
type PreactBridgeProps<P = {}> = {
    component: ComponentType<P>;
    props?: P; 
};

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export const PreactInReactBridge = <P extends {} = {}>(props: PreactBridgeProps<P>) => {
    if (!react || !reactDOM) throw new Error("React or ReactDOM not found");

    const container = react.useRef<HTMLDivElement | null>(null);

    react.useEffect(() => {
        if (!container.current) return;
        const componentProps = (props.props || {}) as Attributes & P;
        render(h(props.component, componentProps), container.current);
        return () => {
            if (container.current) {
                render(null, container.current);
            }
        };
    }, [props.component, props.props]);

    return react.createElement('div', {
        ref: container,
        style: { display: 'contents' }
    });
};

// reactDOM.render(
//     react.renderPreactInReact(
//         () => <div>component</div>
//     ),
//     document.body
// )

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export const renderPreactInReact = <P extends {} = {}>(
    component: ComponentType<P>,
    props?: P
): VNode => {
    if (!react || !reactDOM) throw new Error("React or ReactDOM not found");
    
    return react.createElement(PreactInReactBridge, {
        component,
        props
    });
};

export const getFiber = (element: Element, force = false): ReactFiber | undefined => {
    if (!react || !reactDOM) throw new Error("React or ReactDOM not found");

    if (fibers.has(element) && !force) {
        return fibers.get(element);
    }

    const fiber = Object.entries(element).find(([k, v]) => k.startsWith("__reactFiber$"))?.[1] as ReactFiber;
    if (fiber) {
        fibers.set(element, fiber);
        return fiber;
    }
    
    return undefined;
};

export const getFiberOwner = (n: Element | ReactFiber, refresh = false): ReactFiberOwner | undefined | null => {
    if (fiberOwners.has(n) && !refresh) return fiberOwners.get(n);

    const filter = (node: ReactFiber) => node.stateNode && !(node.stateNode instanceof Element);
    const fiber = n instanceof Element ? getFiber(n, refresh) : n;

    if (!fiber) return undefined;

    const ownerFiber = reactFiberWalker(fiber, filter, true, false, 100);
    const owner = ownerFiber?.stateNode as ReactFiberOwner | undefined | null;

    if (owner) {
        fiberOwners.set(n, owner);
    }

    return owner;
};

export function reactFiberWalker(
    node: ReactFiber,
    filter: string | symbol | ((node: ReactFiber) => boolean),
    goUp = false,
    ignoreStringType = false,
    recursionLimit = 100,
): ReactFiber | undefined | null {
    if (recursionLimit === 0) return undefined;

    if (typeof filter !== "function") {
        const prop = filter;
        filter = (n: ReactFiber) => n?.pendingProps?.[prop] !== undefined;
    }

    if (!node) return undefined;
    if (filter(node) && (ignoreStringType ? typeof node.type !== "string" : true)) return node;

    const nextNode = goUp ? node.return : node.child;
    if (nextNode) {
        const result = reactFiberWalker(nextNode, filter, goUp, ignoreStringType, recursionLimit - 1);
        if (result) return result;
    }

    if (node.sibling) {
        const result = reactFiberWalker(node.sibling, filter, goUp, ignoreStringType, recursionLimit - 1);
        if (result) return result;
    }

    return undefined;
}


const api = {
    react,
    reactDOM,
    renderPreactInReact,
}

export const fiberAPI = {
    getFiber,
    getFiberOwner
}

export default api;