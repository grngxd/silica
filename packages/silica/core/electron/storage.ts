let iframe: HTMLIFrameElement;

export const init = () => {
    iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.documentElement.append(iframe);

    const { localStorage, sessionStorage } = iframe.contentWindow as Window;
    
    return [
        localStorage,
        sessionStorage
    ];   
}

export const unload = () => {
    iframe.remove();
}

const [localStorage, sessionStorage] = init();

export default {
    localStorage,
    sessionStorage
}