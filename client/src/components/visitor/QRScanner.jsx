import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff, ScanLine } from "lucide-react";

import Alert from "../common/Alert";
import Button from "../common/Button";

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
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          if (disabledRef.current || scanningRef.current) return;

          scanningRef.current = true;
          onScanRef.current(decodedText);
        },
        () => {}
      );

      setCameraActive(true);
    } catch (err) {
      setError(err?.message || "Unable to access camera.");
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
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-card bg-slate-950">
        <div id="visitor-qr-reader" className="w-full" />

        {!cameraActive && (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 text-slate-400">
            <div className="relative flex h-14 w-14 items-center justify-center">
              {/* Corner brackets */}
              <span className="absolute left-0 top-0 h-3 w-3 rounded-tl border-l-2 border-t-2 border-slate-500" />
              <span className="absolute right-0 top-0 h-3 w-3 rounded-tr border-r-2 border-t-2 border-slate-500" />
              <span className="absolute bottom-0 left-0 h-3 w-3 rounded-bl border-b-2 border-l-2 border-slate-500" />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-br border-b-2 border-r-2 border-slate-500" />
              <ScanLine size={20} />
            </div>
            <p className="text-xs">Camera is off</p>
          </div>
        )}
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {!cameraActive ? (
        <Button onClick={startCamera} disabled={disabled}>
          <Camera size={14} />
          Start camera
        </Button>
      ) : (
        <Button variant="secondary" onClick={stopCamera}>
          <CameraOff size={14} />
          Stop camera
        </Button>
      )}
    </div>
  );
};

export default QRScanner;
