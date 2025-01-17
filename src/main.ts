// use npm run dev to use it

import { 
  Transform2D, 
  bootstrapCameraKit, 
  createMediaStreamSource,
  CameraKitSession,
} from '@snap/camera-kit';

const liveRenderTarget = document.getElementById('canvas') as HTMLCanvasElement;
const flipCamera = document.getElementById('flip') as HTMLButtonElement;
const videoContainer = document.getElementById('video-container') as HTMLElement;
const videoTarget = document.getElementById('video') as HTMLVideoElement;
const startRecordingButton = document.getElementById('start') as HTMLButtonElement;
const stopRecordingButton = document.getElementById('stop') as HTMLButtonElement;
const downloadButton = document.getElementById('download') as HTMLButtonElement;

let mediaRecorder: MediaRecorder;
let downloadUrl: string;

let isBackFacing = true;
let mediaStream: MediaStream;


async function init() {
  const cameraKit = await bootstrapCameraKit({ 
    apiToken: 'eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzE1Njk5NDk0LCJzdWIiOiIwZWRlODEwMC1jMDc2LTQ2NWYtYjU2MC1lMzcyYzE3NmYyNGJ-U1RBR0lOR35jOGE0MjA3My1jYjYyLTQ0YTEtODdhNS1iZjAxZTYzNzc2MmMifQ.MjWS4i_JSCrUWgUAkcKrqdZcmenuyHjlof2ghTmledg' 
  });

  const session = await cameraKit.createSession({ liveRenderTarget });
  // Apply a lens from My Lenses
  // Use one you published and add it to a cam kit section group
  const lens = await cameraKit.lensRepository.loadLens(
    'b49e4136-c58d-43d9-be48-ae3c5f68a053',//'<YOUR_LENS_ID>',
    '0593275d-e430-4b03-b7e3-cc1eb195fdf4'//'<YOUR_LENS_GROUP_ID>'
  );

  session.applyLens(lens);
  bindFlipCamera(session);
  bindRecorder();
}
  
function bindFlipCamera(session: CameraKitSession) {
  flipCamera.style.cursor = 'pointer';

  flipCamera.addEventListener('click', () => {
    updateCamera(session, flipCamera);
  });

  // updateCamera(session, flipCamera);
}

async function updateCamera(session: CameraKitSession, flipCamera: HTMLButtonElement) {
  isBackFacing = !isBackFacing;

  flipCamera.innerText = isBackFacing
    ? 'Switch to Front Camera'
    : 'Switch to Back Camera';

  if (mediaStream) {
    session.pause();
    mediaStream.getVideoTracks()[0].stop();
  }

  mediaStream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: isBackFacing ? 'environment' : 'user',
    },
  });

  




  const source = createMediaStreamSource(mediaStream, {
    transform: Transform2D.MirrorX,
    cameraType: isBackFacing ? 'environment' : 'user',
  });

  await session.setSource(source);
  source.setRenderSize(window.innerWidth, window.innerHeight);
  await session.play();

}

function bindRecorder() {
  startRecordingButton.addEventListener('click', () => {
    startRecordingButton.disabled = true;
    stopRecordingButton.disabled = false;
    downloadButton.disabled = true;
    videoContainer.style.display = 'none';

    const mediaStream = liveRenderTarget.captureStream(30);

    mediaRecorder = new MediaRecorder(mediaStream);
    mediaRecorder.addEventListener('dataavailable', (event) => {
      if (!event.data.size) {
        console.warn('No recorded data available');
        return;
      }

      const blob = new Blob([event.data]);

      downloadUrl = window.URL.createObjectURL(blob);
      downloadButton.disabled = false;

      videoTarget.src = downloadUrl;
      videoContainer.style.display = 'block';
    });

    mediaRecorder.start();
  });

  stopRecordingButton.addEventListener('click', () => {
    startRecordingButton.disabled = false;
    stopRecordingButton.disabled = true;

    mediaRecorder?.stop();
  });

  downloadButton.addEventListener('click', () => {
    const link = document.createElement('a');

    link.setAttribute('style', 'display: none');
    link.href = downloadUrl;
    link.download = 'camera-kit-web-recording.mp4';
    link.click();
    link.remove();
  });
}


init();
