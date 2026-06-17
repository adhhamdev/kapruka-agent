export type MicPermissionStatus = 'unknown' | 'prompt' | 'granted' | 'denied';

export interface MicAccessResult {
  granted: boolean;
  stream?: MediaStream;
  error?: string;
}

export async function queryMicPermission(): Promise<MicPermissionStatus> {
  if (typeof navigator === 'undefined' || !navigator.permissions?.query) {
    return 'unknown';
  }

  try {
    const status = await navigator.permissions.query({
      name: 'microphone' as PermissionName,
    });
    return status.state as MicPermissionStatus;
  } catch {
    return 'unknown';
  }
}

export async function requestMicAccess(): Promise<MicAccessResult> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return {
      granted: false,
      error: 'Microphone is not available in this browser.',
    };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
    return { granted: true, stream };
  } catch (error: unknown) {
    if (error instanceof DOMException) {
      if (
        error.name === 'NotAllowedError' ||
        error.name === 'PermissionDeniedError'
      ) {
        return {
          granted: false,
          error:
            'Microphone access was denied. Allow the microphone in your browser site settings, then try again.',
        };
      }
      if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        return {
          granted: false,
          error: 'No microphone found. Connect a mic and try again.',
        };
      }
    }

    return {
      granted: false,
      error: 'Could not access the microphone. Please try again.',
    };
  }
}

export function releaseMicStream(stream: MediaStream | null | undefined): void {
  stream?.getTracks().forEach((track) => track.stop());
}
