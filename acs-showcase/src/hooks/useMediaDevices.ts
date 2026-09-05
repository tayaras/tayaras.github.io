import { useCallback, useEffect, useState } from 'react';
import type { OptionsDevice } from '@azure/communication-react';

const toOptionsDevices = (
  devices: MediaDeviceInfo[],
  kind: MediaDeviceKind,
  fallbackLabel: string
): OptionsDevice[] =>
  devices
    .filter((device) => device.kind === kind)
    .map((device, index) => ({
      id: device.deviceId || `${kind}-${index}`,
      // Labels are empty until the user grants permission for that kind of device.
      name: device.label || `${fallbackLabel} ${index + 1}`,
    }));

/**
 * Enumerates the visitor's real cameras and microphones so the device pickers in
 * the ControlBar have something true to show. Re-enumerates when devices are
 * plugged in or out, and after permission is granted (labels arrive late).
 */
export const useMediaDevices = (): {
  cameras: OptionsDevice[];
  microphones: OptionsDevice[];
  refresh: () => Promise<void>;
} => {
  const [cameras, setCameras] = useState<OptionsDevice[]>([]);
  const [microphones, setMicrophones] = useState<OptionsDevice[]>([]);

  const refresh = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      return;
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setCameras(toOptionsDevices(devices, 'videoinput', 'Camera'));
      setMicrophones(toOptionsDevices(devices, 'audioinput', 'Microphone'));
    } catch {
      setCameras([]);
      setMicrophones([]);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const mediaDevices = navigator.mediaDevices;
    if (!mediaDevices?.addEventListener) {
      return;
    }
    const onChange = (): void => void refresh();
    mediaDevices.addEventListener('devicechange', onChange);
    return () => mediaDevices.removeEventListener('devicechange', onChange);
  }, [refresh]);

  return { cameras, microphones, refresh };
};
