
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
  Camera,
  CameraOff,
  AlertCircle,
  ScanLine,
} from "lucide-react";

const QRScanner = ({ onScan, disabled = false }) => {
  const scannerRef = useRef(null);
  const onScanRef = useRef(onScan);
  const disabledRef = useRef(disabled);
  const scanningRef = useRef(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    onScanRef.current = onScan;
    disabledRef.current = disabled;
  }, [onScan, disabled]);

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;

      if (scanner?.isScanning) {
        scanner.stop().catch(console.error);
      }
    };
  }, []);

  const startCamera = async () => {
    if (scannerRef.current || disabled) return;

    setError("");

    const scanner = new Html5Qrcode("visitor-qr-reader");
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
        },
        (decodedText) => {
          if (disabledRef.current || scanningRef.current) {
            return;
          }

          scanningRef.current = true;
          onScanRef.current(decodedText);
        },
        () => {}
      );

      setCameraActive(true);
    } catch (err) {
      setError(
        err?.message || "Unable to access camera."
      );

      scannerRef.current = null;
    }
  };

  const stopCamera = async () => {
    const scanner = scannerRef.current;

    if (!scanner) return;

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }

      scanner.clear();
    } catch (err) {
      console.error("Camera cleanup failed:", err);
    } finally {
      scannerRef.current = null;
      scanningRef.current = false;
      setCameraActive(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-950">
        <div
          id="visitor-qr-reader"
          className="min-h-[260px] w-full"
        />

        {!cameraActive && (
          <div className="flex items-center justify-center gap-2 border-t border-slate-800 p-4 text-sm text-slate-300">
            <ScanLine size={18} />
            Camera scanner is inactive
          </div>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {!cameraActive ? (
          <button
            type="button"
            onClick={startCamera}
            disabled={disabled}
            className="inline-flex items-center gap-2 rounded-md bg-[#4169e8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Camera size={17} />
            Start Camera
          </button>
        ) : (
          <button
            type="button"
            onClick={stopCamera}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <CameraOff size={17} />
            Stop Camera
          </button>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
