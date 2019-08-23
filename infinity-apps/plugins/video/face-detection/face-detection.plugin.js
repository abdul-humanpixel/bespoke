(function() {
    const canvas = document.createElement('canvas');
    let tempCanvas;
    let tempCanvasCtx;
    let worker;
    let videoWidth;
    let videoHeight;

    let stream;
    let raf;
    let processedStream;
    let processedTrack;
    const video = document.createElement('video');
    video.autoplay = true;

    const FPS = 9;
    let fpsInterval;
    let nowThen;
    let now;
    let startTime;
    let elapsed;
    let receiveOb;

    function load() {
        receiveOb = window.PEX.actions$
            .ofType('[Media Device] Set Local Media Stream')
            .subscribe(action => {
                if (!action.payload.stream) return;

                stream = action.payload.stream;
                const clonedStream = stream.clone();
                clonedStream.removeTrack(clonedStream.getAudioTracks()[0]);
                video.srcObject = clonedStream;
                const track = stream.getVideoTracks()[0];
                stream.removeTrack(track);

                if (!raf) {
                    const { width, height } = track.getSettings();
                    videoWidth = width;
                    videoHeight = height;
                    canvas.width = width;
                    canvas.height = height;
                    tempCanvas = new OffscreenCanvas(width, width);
                    tempCanvasCtx = tempCanvas.getContext('2d');

                    worker = new Worker(
                        './custom_configuration/plugins/face-detection/face-detection.worker.js'
                    );
                    const offscreenCanvas = canvas.transferControlToOffscreen();
                    worker.postMessage(
                        {
                            type: 'init',
                            canvas: offscreenCanvas,
                            width,
                            height
                        },
                        [offscreenCanvas]
                    );
                    fpsInterval = 1000 / FPS;
                    then = Date.now();
                    startTime = then;
                    raf = requestAnimationFrame(render);
                }

                processedStream = canvas.captureStream();
                processedTrack = processedStream.getTracks()[0];
                stream.addTrack(processedTrack);
            });
    }

    function render() {
        raf = requestAnimationFrame(render);
        now = Date.now();
        elapsed = now - then;
        if (elapsed > fpsInterval) {
            then = now - (elapsed % fpsInterval);
            tempCanvasCtx.drawImage(video, 0, 0, videoWidth, videoHeight);
            const { data: frame } = tempCanvasCtx.getImageData(
                0,
                0,
                videoWidth,
                videoHeight
            );

            const msg = {
                type: 'update',
                frame
            };

            worker.postMessage(msg, [msg.frame.buffer]);
        }
    }

    function unload() {
        cancelAnimationFrame(raf);
        receiveOb.unsubscribe();
    }

    window.PEX.pluginAPI.registerPlugin({
        id: 'face-detection-plugin',
        load: load,
        unload: unload
    });
})();
