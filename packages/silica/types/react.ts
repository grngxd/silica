export type ReactRef<T> = { current: T | null };
export type ReactElement = { type: any, props: any, key: any | null };

export interface React {
    useRef<T>(initialValue: T | null): ReactRef<T>;
    useEffect(effect: () => undefined | (() => void), deps?: any[]): void;
    createElement(type: any, props?: any, ...children: any[]): ReactElement;
    version: string;
}

export interface ReactDOM {
    findDOMNode(element: any): Element | null;
    createPortal(children: any, container: Element): ReactElement;
    render(element: ReactElement, container: Element): void;
    unmountComponentAtNode(container: Element): boolean;
}

export type ReactFiber = {
    type: string;
    stateNode?: any;
    return?: ReactFiber;
    child?: ReactFiber;
    sibling?: ReactFiber;
    pendingProps?: any;
}

export type ReactFiberOwner = {
    stateNode: any;
    forceUpdate: () => void;
    props: any;
}