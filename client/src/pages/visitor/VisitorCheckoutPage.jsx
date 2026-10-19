import { useCallback, useRef, useState } from "react";
import { CheckCircle2, Keyboard, RotateCcw, ScanLine, Camera } from "lucide-react";

import QRScanner from "../../components/visitor/QRScanner";
import { checkOutVisitorByQR } from "../../api/visitor.api";
import Alert from "../../components/common/Alert";
import Avatar from "../../components/common/Avatar";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";

const Row = ({ label, children }) => (
  <div className="flex items-center justify-between gap-4 py-1.5 text-[13px]">
    <dt className="text-emerald-800/70">{label}</dt>
    <dd className="text-right font-medium text-emerald-950">{children}</dd>
  </div>
);

const VisitorCheckoutPage = () => {
  const [qrToken, setQrToken] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [scannerSession, setScannerSession] = useState(0);
  const processingRef = useRef(false);

  const handleScan = useCallback(async (token) => {
    const scannedToken = token?.trim();

    if (!scannedToken || processingRef.current) return;

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
          "QR check-out failed. Please verify the visitor pass."
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
    setScannerSession((previous) => previous + 1);
  };

  const visitor = result?.visitor;
  const locked = processing || Boolean(result) || Boolean(error);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <PageHeader
        title="Visitor check-out"
        description="Scan the QR code on a visitor pass to record their exit."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          title="Camera scanner"
          icon={Camera}
          className="rise"
          style={{ "--i": 1 }}
        >
          <QRScanner
            key={scannerSession}
            onScan={handleScan}
            disabled={locked}
          />
          <p className="mt-3 text-xs text-slate-500">
            Hold the pass QR code inside the frame.
          </p>
        </Card>

        <div className="space-y-4">
          <Card
            title="USB scanner / manual input"
            icon={Keyboard}
            className="rise"
            style={{ "--i": 2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-2.5">
              <label
                htmlFor="qr-token"
                className="block text-xs font-medium text-slate-600"
              >
                Scanned QR token
              </label>

              <input
                id="qr-token"
                type="password"
                autoComplete="off"
                value={qrToken}
                onChange={(event) => setQrToken(event.target.value)}
                placeholder="Scan QR code and press Enter"
                disabled={locked}
                className="field"
              />

              <Button
                type="submit"
                className="w-full"
                disabled={!qrToken.trim() || locked}
                loading={processing}
                loadingText="Processing..."
              >
                <ScanLine size={14} />
                Check out visitor
              </Button>
            </form>
          </Card>

          {processing && (
            <div
              role="status"
              className="animate-pop flex items-center gap-2.5 rounded-card border border-blue-200 bg-blue-50 px-3 py-2.5 text-[13px] text-blue-700"
            >
              <Spinner size={15} />
              Verifying QR code and recording exit...
            </div>
          )}

          {result && (
            <div
              role="status"
              className="animate-pop rounded-card border border-emerald-200 bg-emerald-50 p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <CheckCircle2 size={17} className="text-emerald-600" />
                <h3 className="text-[13px] font-semibold text-emerald-900">
                  Checked out successfully
                </h3>
              </div>

              <div className="mb-2 flex items-center gap-2.5 border-b border-emerald-200/70 pb-3">
                <Avatar name={visitor?.name || ""} size={30} />
                <div>
                  <p className="text-[13px] font-semibold text-emerald-950">
                    {visitor?.name || "—"}
                  </p>
                  <p className="font-mono text-[11px] text-emerald-800/70">
                    {visitor?.visitorId || "—"}
                  </p>
                </div>
              </div>

              <dl>
                <Row label="Status">
                  {String(visitor?.status || "CHECKED_OUT").replaceAll("_", " ")}
                </Row>
                <Row label="Out time">
                  {visitor?.outTime
                    ? new Date(visitor.outTime).toLocaleString("en-IN")
                    : "Recorded"}
                </Row>
              </dl>
            </div>
          )}

          {error && <Alert tone="error">{error}</Alert>}

          {(result || error) && (
            <Button variant="secondary" onClick={handleReset}>
              <RotateCcw size={13} />
              Scan another visitor
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitorCheckoutPage;
