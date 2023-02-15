# whats-up-home-iot-web-app
Web app for home IoT using Raspberry Pi

<a href="https://tareqnewazshahriar.github.io/whats-up-home-iot-web-app/dist">App</a>


## Post Build
To serve the app from a directory (like now it is served from `dist` directory), after app build, change coulple of paths:
1. index.html: remove starting `/` from favicon, css, js file url.
2. index.&lt;hash&gt;.css: find and replace `url(assets/` with `url(`.
