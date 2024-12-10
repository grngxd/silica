import type { React, ReactDOM, ReactFiber } from "+silica/types/react";
import { type Attributes, type ComponentType, type VNode, h, render } from "preact";
import { getWebpackChunkByExports } from "./webpack";

export let react: React | undefined;
export let reactDOM: ReactDOM | undefined;
const fibers: Map<Element, [string, ReactFiber]> = new Map();

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

export const getFiber = (element: Element, force = false): [string, ReactFiber] | undefined => {
    if (!react || !reactDOM) throw new Error("React or ReactDOM not found");

    if (fibers.has(element) && !force) {
        return fibers.get(element);
    }

    const fiber = Object.entries(element).find(([k, v]) => k.startsWith("__reactFiber$"));
    if (fiber) {
        fibers.set(element, fiber);
        return fiber;
    }
    
    return undefined;
};


const api = {
    react,
    reactDOM,
    renderPreactInReact,
    getFiber
}

export const fiberAPI = {
    getFiber
}

export default api;