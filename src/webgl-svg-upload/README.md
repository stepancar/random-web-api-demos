THIS DEMO demostrates how to optimize svg uploading into webgl

TLTR: We need to draw svg on a canvas and uploadTexture from canvas to webgl


[This demo](https://stepancar.github.io/random-web-api-demos/src/webgl-svg-upload/index.html) 
It downloads svg, embeds it to the page, creates webgl Application
For every frame it uploads svg to webgl
On the top of demo you can select 3 options which change the way how svg is uploaded to webgl

If you play with it you will notice performance difference between options

![image](./flamechart.png)

