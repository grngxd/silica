if (window.silica) {
    window.silica.unload();
}

const start = performance.now() / 1000;
    
const api = {
    unload: () => {
        Promise.all([ /* ... */ ]).then(() => {
            window.silica = undefined;
            console.log('silica unloaded!');
        });
    }
}

window.silica = api;
alert(`silica loaded in ${parseFloat(((performance.now() / 1000) - start).toFixed(2))}s`);
console.log(`silica loaded in ${parseFloat(((performance.now() / 1000) - start).toFixed(2))}s`);