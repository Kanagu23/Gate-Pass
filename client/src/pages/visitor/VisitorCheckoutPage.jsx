import { useCallback, useRef, useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  ScanLine,
  Keyboard,
  Loader2,
  RotateCcw,
} from "lucide-react";

import QRScanner from "../../components/visitor/QRScanner";
import { checkOutVisitorByQR } from "../../api/visitor.api";

const VisitorCheckoutPage = () => {
  const [qrToken, setQrToken] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [scannerSession, setScannerSession] = useState(0);
  const processingRef = useRef(false);

  const handleScan = useCallback(async (token) => {
    const scannedToken = token?.trim();

    if (!scannedToken || processingRef.current) {
      return;
    }

    processingRef.current = true;
    setProcessing(true);
    setError("");
    setResult(null);

    try {
      const response = await checkOutVisitorByQR(scannedToken);

      setResult(response);
      setQrToken("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "QR check-out failed. Please verify the visitor pass.",
      );
    } finally {
      setProcessing(false);
      // Remain locked until the operator starts another scan.
    }
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    handleScan(qrToken);
  };

  const handleReset = () => {
    if (processingRef.current && processing) return;

    processingRef.current = false;

    setResult(null);
    setError("");
    setQrToken("");

    // Remount the scanner for a fresh scanning session.
    setScannerSession((previous) => previous + 1);
  };

  const visitor = result?.visitor;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-2 text-[#4169e8]">
          <ScanLine size={19} />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Visitor Management
          </span>
        </div>

        <h1 className="text-2xl font-semibold text-[#10132e]">
          Visitor Check-Out
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Scan the QR code on a visitor pass to record their exit.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-[#10132e]">
            Camera Scanner
          </h2>

          <QRScanner
            key={scannerSession}
            onScan={handleScan}
            disabled={processing || Boolean(result) || Boolean(error)}
          />

          <p className="mt-4 text-xs text-slate-500">
            Position the visitor pass QR code inside the camera frame.
          </p>
        </div>

        <div className="space-y-5">
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Keyboard size={18} className="text-[#4169e8]" />
              <h2 className="text-sm font-semibold text-[#10132e]">
                USB Scanner / Manual Input
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <label
                htmlFor="qr-token"
                className="block text-xs font-medium text-slate-600"
              >
                Scanned QR Token
              </label>

              <input
                id="qr-token"
                type="password"
                autoComplete="off"
                value={qrToken}
                onChange={(event) => setQrToken(event.target.value)}
                placeholder="Scan QR code and press Enter"
                disabled={processing || Boolean(result) || Boolean(error)}
                className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-[#4169e8] disabled:bg-slate-50"
              />

              <button
                type="submit"
                disabled={
                  !qrToken.trim() ||
                  processing ||
                  Boolean(result) ||
                  Boolean(error)
                }
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#4169e8] px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {processing ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <ScanLine size={17} />
                )}
                {processing ? "Processing..." : "Check Out Visitor"}
              </button>
            </form>
          </div>

          {processing && (
            <div
              role="status"
              className="flex items-center gap-3 rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700"
            >
              <Loader2 size={19} className="animate-spin" />
              Verifying QR code and recording exit...
            </div>
          )}

          {result && (
            <div
              role="status"
              className="rounded-md border border-green-200 bg-green-50 p-5"
            >
              <div className="mb-3 flex items-center gap-2 text-green-700">
                <CheckCircle2 size={22} />
                <h3 className="font-semibold">
                  Visitor Checked Out Successfully
                </h3>
              </div>

              <div className="space-y-2 text-sm text-green-900">
                <p>
                  <span className="font-medium">Visitor:</span>{" "}
                  {visitor?.name || "—"}
                </p>

                <p>
                  <span className="font-medium">Visitor ID:</span>{" "}
                  {visitor?.visitorId || "—"}
                </p>

                <p>
                  <span className="font-medium">Status:</span>{" "}
                  {visitor?.status || "CHECKED_OUT"}
                </p>

                <p>
                  <span className="font-medium">Out Time:</span>{" "}
                  {visitor?.outTime
                    ? new Date(visitor.outTime).toLocaleString("en-IN")
                    : "Recorded"}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle size={20} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {(result || error) && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw size={16} />
              Scan Another Visitor
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitorCheckoutPage;
