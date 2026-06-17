export function speechErrorMessage(code: string): string {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Microphone access was denied. Allow microphone permission in your browser settings.';
    case 'no-speech':
      return 'No speech detected. Tap the mic and try again.';
    case 'audio-capture':
      return 'No microphone found. Connect a mic and try again.';
    case 'network':
      return 'Voice input needs a network connection. Check your connection and try again.';
    case 'aborted':
      return '';
    default:
      return 'Voice input failed. Please try again.';
  }
}
