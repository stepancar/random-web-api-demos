// START OF IMPORTANT CODE

/**
 * This is a main function we try to optimize
 */
async function createPixiTextureForLottieFrame(animationItem, mode) {
    const svg = animationItem.renderer.svgElement;

    switch (mode) {
        case 'image':
            return await createPixiTextureFromSvgVerySlow(svg);
        case 'newCanvasForEveryFrame':
            return await createPixiTextureFromSvgFaster(svg);
        case 'oneCanvasForAllFrames':
            return await createPixiTextureFromSvgTheFastest(svg);
    }
}


/**
 * This what we do now - we create a texture based on ImageResource
 */
async function createPixiTextureFromSvgVerySlow(svg) {
    const img = await getImageFromSvg(svg);
    const texture = PIXI.Texture.from(img);

    return texture;
}

/**
 * Faster solution is to create a texture based on canvas
 * Becuase uploading canvas to GPU is faster than uploading image
 */
 async function createPixiTextureFromSvgFaster(svg) {
    const img = await getImageFromSvg(svg);

    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    let texture = PIXI.Texture.from(canvas);

    return texture;
}


const canvas = document.createElement('canvas');
canvas.width = 1920;
canvas.height = 1080;
const ctx = canvas.getContext('2d');


/**
 * Faster solution is the same as previous one, but we create canvas only once
 * If you look at perfomance flamegraph you will see that garbage collection of canvas is pretty expensive
 * which makes sense
 */
async function createPixiTextureFromSvgTheFastest(svg) {
    const img = await getImageFromSvg(svg);

    ctx.drawImage(img, 0, 0);

    let texture = PIXI.Texture.from(canvas);

    // this is important, because for the same canvas element pixi will return existing texture
    // we need to trigger texture uploading
    texture.update();

    return texture;
}


// END OF IMPORTANT CODE
















async function getLottieData() {
    const url = 'https://storage.googleapis.com/lumen5-prod-lottie/Origin/Origin-Text9-Land.json'
    return fetch(url).then((response) => {
        return response.json();
    });
}

async function loadLottieDataAndRunPlayback({ container }) {
    const lottieData = await getLottieData();

    const animationItem = lottie.loadAnimation({
        container,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: lottieData
    });

    return animationItem;
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
