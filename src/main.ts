// use npm run dev to use it

import { Transform2D, bootstrapCameraKit, createMediaStreamSource } from '@snap/camera-kit';

(async function () {
  const cameraKit = await bootstrapCameraKit({ apiToken: 'eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzE1Njk5NDk0LCJzdWIiOiIwZWRlODEwMC1jMDc2LTQ2NWYtYjU2MC1lMzcyYzE3NmYyNGJ-U1RBR0lOR35jOGE0MjA3My1jYjYyLTQ0YTEtODdhNS1iZjAxZTYzNzc2MmMifQ.MjWS4i_JSCrUWgUAkcKrqdZcmenuyHjlof2ghTmledg' });

  const liveRenderTarget = document.getElementById('canvas') as HTMLCanvasElement;
  const session = await cameraKit.createSession({ liveRenderTarget });

  // Get camera stream and play
  const mediaStream = await navigator.mediaDevices.getUserMedia({
    video: true,
  });

  const transformMedia = createMediaStreamSource(mediaStream, {
    transform: Transform2D.MirrorX,
    cameraType: 'user',
  });

  await session.setSource(transformMedia);
  transformMedia.setRenderSize(window.innerWidth, window.innerHeight);
  await session.play();

  // Apply a lens from My Lenses
  // Use one you published and add it to a cam kit section group
  const lens = await cameraKit.lensRepository.loadLens(
    'b49e4136-c58d-43d9-be48-ae3c5f68a053',//'<YOUR_LENS_ID>',
    '0593275d-e430-4b03-b7e3-cc1eb195fdf4'//'<YOUR_LENS_GROUP_ID>'
  );
  
  await session.applyLens(lens);

})();