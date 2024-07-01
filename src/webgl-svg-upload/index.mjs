import { inlineSVG } from './inlineSvg.mjs';
import { WebglApp } from './webglApp.mjs';


/**
 * This is a main function we try to optimize
 */
async function createImageSourceForSvg(svgElement, mode) {
    switch (mode) {
        case 'image':
            return await createImageSourceFromSvgVerySlow(svgElement);
        case 'newCanvasForEveryFrame':
            return await createImageResourceFromSvgFaster(svgElement);
        case 'oneCanvasForAllFrames':
            return await createImageResourceFromSvgTheFastest(svgElement);
    }
}


/**
 * This what we do now - we create a texture based on ImageResource
 */
async function createImageSourceFromSvgVerySlow(svg) {
    return await getImageFromSvg(svg);
}

/**
 * Faster solution is to create a texture based on canvas
 * Becuase uploading canvas to GPU is faster than uploading image
 */
 async function createImageResourceFromSvgFaster(svg) {
    const img = await getImageFromSvg(svg);

    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    return canvas;
}


let canvas;

/**
 * Faster solution is the same as previous one, but we create canvas only once
 * If you look at perfomance flamegraph you will see that garbage collection of canvas is pretty expensive
 * which makes sense
 */
async function createImageResourceFromSvgTheFastest(svg) {
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.width = 1920;
        canvas.height = 1080;
    }
    const img = await getImageFromSvg(svg);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return canvas;
}


/**
 * We can not pass svg element directly to canvas or to webgl
 * We need to rasterize it first
 * For that we create an image from svg and then create a texture from that image
*/
async function getImageFromSvg(svgElement) {
    const serializedSvg = new XMLSerializer().serializeToString(svgElement);
    const imageSrc = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(serializedSvg)))}`;
    const img = new Image();
    
    return new Promise((resolve, reject) => {
        img.onload = () => {
            resolve(img);
        }
        img.src = imageSrc;
    });
}


async function run() {
    const svgContainer = document.querySelector('#svgContainer');

    const app = new WebglApp({
        width: 1920,
        height: 1080,
    });

    document.body.appendChild(app.canvas);
    const modeElement = document.querySelector('#mode');

    function tick() {
        const mode = modeElement.value;
        const svgElement = svgContainer.querySelector('svg');
        createImageSourceForSvg(svgElement, mode).then(texture => {
            app.renderImageSource(texture)
            requestAnimationFrame(tick);
        });
    }
    
    inlineSVG('tiger.svg', svgContainer).then(svgElement => {
        tick();
    });
}

run();
