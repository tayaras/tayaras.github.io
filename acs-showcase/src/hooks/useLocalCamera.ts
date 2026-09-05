import { useCallback, useEffect, useRef, useState } from 'react';

export type CameraStatus = 'off' | 'starting' | 'on' | 'denied' | 'error';

/**
 * The UI Library treats `renderElement` as the container the SDK returns and
 * skips it when it has no children, so the <video> goes inside a wrapper div.
 */
const createVideoElement = (): { host: HTMLDivElement; video: HTMLVideoElement } => {
  const host = document.createElement('div');
  host.style.width = '100%';
  host.style.height = '100%';
  host.style.position = 'relative';

  const video = document.createElement('video');
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('aria-hidden', 'true');
  video.style.width = '100%';
  video.style.height = '100%';
  video.style.objectFit = 'cover';
  video.style.borderRadius = '0.25rem';
  // Selfie view: the ACS SDK hands back a pre-inverted element, so we mirror
  // here and report `isMirrored: true` to match that contract.
  video.style.transform = 'scaleX(-1)';

  host.appendChild(video);
  return { host, video };
};

/**
 * Drives the visitor's real webcam via getUserMedia and exposes the resulting
 * <video> element for the VideoGallery's local tile. There is no ACS call here —
 * the stream is rendered locally and never transmitted anywhere.
 */
export const useLocalCamera = (
  selectedCameraId: string | undefined,
  onPermissionGranted?: () => void,
): {
  status: CameraStatus;
  /** Short enough for the local video tile. */
  errorSummary: string | undefined;
  /** The full explanation, including the iframe caveat. */
  errorMessage: string | undefined;
  videoElement: HTMLDivElement | undefined;
  toggle: () => Promise<void>;
  turnOff: () => void;
} => {
  const [status, setStatus] = useState<CameraStatus>('off');
  const [errorSummary, setErrorSummary] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [videoElement, setVideoElement] = useState<HTMLDivElement | undefined>();

  const streamRef = useRef<MediaStream | undefined>(undefined);
  const hostRef = useRef<{ host: HTMLDivElement; video: HTMLVideoElement } | undefined>(undefined);
  const grantedRef = useRef(onPermissionGranted);
  grantedRef.current = onPermissionGranted;

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = undefined;
    if (hostRef.current) {
      hostRef.current.video.srcObject = null;
    }
    hostRef.current = undefined;
    setVideoElement(undefined);
  }, []);

  const start = useCallback(
    async (deviceId: string | undefined) => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('error');
        setErrorSummary('No camera API');
        setErrorMessage('This browser does not expose a camera API.');
        return;
      }
      setStatus('starting');
      setErrorSummary(undefined);
      setErrorMessage(undefined);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: deviceId ? { deviceId: { exact: deviceId } } : true,
        });
        // Tear down any previous stream before swapping in the new one.
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = stream;

        const elements = hostRef.current ?? createVideoElement();
        elements.video.srcObject = stream;
        hostRef.current = elements;
        setVideoElement(elements.host);
        setStatus('on');
        grantedRef.current?.();
      } catch (error) {
        stop();
        const name = error instanceof DOMException ? error.name : '';
        if (name === 'NotAllowedError' || name === 'SecurityError') {
          setStatus('denied');
          setErrorSummary('Camera blocked');
          setErrorMessage(
            'Camera access is blocked. Allow it in your browser settings. If this page is embedded, the iframe also needs allow="camera".'
          );
        } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
          setStatus('error');
          setErrorSummary('No camera found');
          setErrorMessage('No camera matching that selection was found.');
        } else {
          setStatus('error');
          setErrorSummary('Camera unavailable');
          setErrorMessage('The camera could not be started.');
        }
      }
    },
    [stop]
  );

  const turnOff = useCallback(() => {
    stop();
    setStatus('off');
    setErrorSummary(undefined);
    setErrorMessage(undefined);
  }, [stop]);

  const toggle = useCallback(async () => {
    if (status === 'on' || status === 'starting') {
      turnOff();
      return;
    }
    await start(selectedCameraId);
  }, [selectedCameraId, start, status, turnOff]);

  // Re-acquire the stream when the visitor picks a different camera.
  const isOn = status === 'on';
  useEffect(() => {
    if (isOn) {
      void start(selectedCameraId);
    }
    // Intentionally keyed on the device only: `start` re-running on its own
    // would restart the stream in a loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCameraId]);

  useEffect(() => stop, [stop]);

  return { status, errorSummary, errorMessage, videoElement, toggle, turnOff };
};
