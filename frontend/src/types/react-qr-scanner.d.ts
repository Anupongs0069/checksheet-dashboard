// ./src/types/react-qr-scanner.d.ts

declare module 'qr-scanner' {
  export default class QrScanner {
    constructor(
      video: HTMLVideoElement,
      onDecode: (result: { data: string }) => void,
      options?: {
        preferredCamera?: string;
        highlightScanRegion?: boolean;
        highlightCodeOutline?: boolean;
      }
    );
    start(): Promise<void>;
    destroy(): void;
    static listCameras(): Promise<{ id: string; label: string }[]>;
  }
}