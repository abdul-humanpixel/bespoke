let isWasmLoaded = false;
let isMemorySet = false;
var Module = {
    preRun: [],
    onRuntimeInitialized: () => {
        isWasmLoaded = true;
    }
};
importScripts('wasmpico.js');

let context;
let imageData;
let width;
let height;
let videoMem;
let facesMem;

const MAX_FACES = 8;
let facesArray;
let videoArray;

self.addEventListener('message', ev => {
    switch (ev.data.type) {
        case 'init': {
            const offscreenCanvas = ev.data.canvas;
            width = ev.data.width;
            height = ev.data.height;
            context = offscreenCanvas.getContext('2d');
            imageData = context.getImageData(0, 0, width, height);
            return;
        }

        case 'update': {
            const frame = ev.data.frame;

            if (isWasmLoaded) {
                if (!isMemorySet) {
                    if (!videoMem) {
                        videoMem = Module._malloc(width * height);
                        videoArray = new Uint8Array(
                            Module.HEAPU8.buffer,
                            videoMem,
                            width * height
                        );
                    }

                    if (!facesMem) {
                        facesMem = Module._malloc(4 * 4 * MAX_FACES);
                        facesArray = new Float32Array(
                            Module.HEAPU8.buffer,
                            facesMem,
                            MAX_FACES
                        );
                    }
                    isMemorySet = true;
                }
                toGrayScale(frame, height, width);
                let detectedFaces = Module._find_faces(
                    facesMem,
                    MAX_FACES,
                    videoMem,
                    height,
                    width,
                    width,
                    1.1,
                    0.1,
                    100,
                    1000
                );

                detectedFaces = Module._cluster_detections(
                    facesMem,
                    detectedFaces
                );
                imageData.data.set(frame);
                context.putImageData(imageData, 0, 0);
                for (let i = 0; i < detectedFaces; ++i) {
                    if (facesArray[4 * i + 3] > 3.0) {
                        context.beginPath();
                        context.arc(
                            facesArray[4 * i + 1],
                            facesArray[4 * i + 0],
                            facesArray[4 * i + 2] / 2,
                            0,
                            2 * Math.PI,
                            false
                        );
                        context.lineWidth = 3;
                        context.strokeStyle = 'red';
                        context.stroke();
                    }
                }
            }
            return;
        }
    }
});

function toGrayScale(rgba, height, width) {
    // console.log(videoArray);
    for (let r = 0; r < height; ++r)
        for (let c = 0; c < width; ++c)
            // gray = 0.2*red + 0.7*green + 0.1*blue
            videoArray[r * width + c] =
                (2 * rgba[r * 4 * width + 4 * c + 0] +
                    7 * rgba[r * 4 * width + 4 * c + 1] +
                    1 * rgba[r * 4 * width + 4 * c + 2]) /
                10;
    return videoArray;
}
