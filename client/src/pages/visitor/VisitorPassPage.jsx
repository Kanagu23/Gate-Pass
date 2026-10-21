import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";
import { Download, Printer } from "lucide-react";

import { getVisitorPass } from "../../api/visitor.api";
import { useAuth } from "../../context/AuthContext";
import VisitorPassPDF from "../../components/visitor/VisitorPassPdf";
import {
  DEFAULT_LAYOUT,
  PASS_LAYOUTS,
  getLayout,
} from "../../components/visitor/passLayouts";
import Button from "../../components/common/Button";
import Alert from "../../components/common/Alert";
import Avatar from "../../components/common/Avatar";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import Skeleton from "../../components/common/Skeleton";
import { buttonStyles } from "../../components/common/buttonStyles";

const LAYOUT_KEY = "gatepass:pass-layout";

const readLayout = () => {
  try {
    return getLayout(localStorage.getItem(LAYOUT_KEY)).id;
  } catch {
    return DEFAULT_LAYOUT;
  }
};

const Info = ({ label, value, mono = false }) => (
  <div className="flex items-baseline justify-between gap-4 py-2 text-[13px] first:pt-0 last:pb-0 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-line">
    <dt className="shrink-0 text-slate-500">{label}</dt>
    <dd
      className={`min-w-0 break-words text-right font-medium text-slate-800 ${
        mono ? "font-mono text-xs" : ""
      }`}
    >
      {value || "—"}
    </dd>
  </div>
);

const VisitorPassPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
const location = useLocation();

const backTo = location.pathname.startsWith("/admin/")
  ? "/admin/visitors"
  : location.pathname.startsWith("/gate/")
    ? "/gate/visitors"
    : ["SYSTEM_ADMIN", "ADMIN", "DIVISION_HR"].includes(user?.role)
      ? "/admin/visitors"
      : "/gate/visitors";
  const [visitor, setVisitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [layout, setLayout] = useState(readLayout);
  const [printing, setPrinting] = useState(false);
  const [printError, setPrintError] = useState("");

  const chooseLayout = (event) => {
    const next = event.target.value;
    setLayout(next);
    try {
      localStorage.setItem(LAYOUT_KEY, next);
    } catch {
      /* preference only; ignore storage failures */
    }
  };

  // Open the PDF in a new tab so the browser's print dialog is one click away.
  const handlePrint = async () => {
    setPrintError("");
    setPrinting(true);

    // Opened synchronously so the pop-up blocker treats it as a user action.
    const tab = window.open("", "_blank");

    try {
      const blob = await pdf(
        <VisitorPassPDF visitor={visitor} layout={layout} />
      ).toBlob();
      const url = URL.createObjectURL(blob);

      if (tab) tab.location.href = url;
      else window.location.assign(url);

      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      tab?.close();
      setPrintError("Unable to prepare the pass for printing.");
    } finally {
      setPrinting(false);
    }
  };

  useEffect(() => {
    let active = true;

    const loadVisitorPass = async () => {
      try {
        setLoading(true);
        setError("");
        setVisitor(null);

        const response = await getVisitorPass(id);
        if (active) setVisitor(response.visitor);
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message || "Unable to retrieve visitor pass."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadVisitorPass();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      </div>
    );
  }

  if (error || !visitor) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <PageHeader backTo={backTo} backLabel="Visitors" title="Visitor pass" />
        <Alert tone="error">{error || "Visitor pass not found."}</Alert>
      </div>
    );
  }

  const employee = visitor.visitingEmployee;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <PageHeader backTo={backTo} backLabel="Visitors" title="Visitor pass" />

      {printError && <Alert tone="error">{printError}</Alert>}

      {/* Pass summary */}
      <div
        className="rise flex flex-col gap-4 rounded-card border border-line bg-white p-4 shadow-card sm:flex-row sm:items-center"
        style={{ "--i": 1 }}
      >
        <Avatar name={visitor.name} size={44} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-base font-semibold text-ink">
              {visitor.name}
            </h2>
            <StatusBadge status={visitor.status} />
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Pass ID <span className="font-mono">{visitor.visitorId}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={layout}
            onChange={chooseLayout}
            aria-label="Print size"
            title={getLayout(layout).description}
            className="field w-auto"
          >
            {PASS_LAYOUTS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>

          <Button
            variant="secondary"
            onClick={handlePrint}
            loading={printing}
            loadingText="Preparing..."
          >
            <Printer size={14} />
            Print
          </Button>

          <PDFDownloadLink
            key={layout}
            document={<VisitorPassPDF visitor={visitor} layout={layout} />}
            fileName={`GatePass-${visitor.visitorId}-${layout}.pdf`}
            className={buttonStyles("primary", "md")}
          >
            {({ loading: pdfLoading, error: pdfError }) => (
              <>
                <Download size={14} />
                {pdfError
                  ? "PDF failed"
                  : pdfLoading
                    ? "Preparing..."
                    : "Download"}
              </>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Visitor" className="rise" style={{ "--i": 2 }}>
          <dl>
            <Info label="Visitor ID" value={visitor.visitorId} mono />
            <Info label="Name" value={visitor.name} />
            <Info label="Mobile" value={visitor.mobile} />
            <Info label="Organization" value={visitor.organization} />
            <Info label="Purpose" value={visitor.visitingPurpose} />
          </dl>
        </Card>

        <Card title="Visiting employee" className="rise" style={{ "--i": 3 }}>
          <dl>
            <Info label="Name" value={employee?.name} />
            <Info label="Employee ID" value={employee?.employeeId} mono />
            <Info label="Department" value={employee?.department} />
            <Info label="Phone" value={employee?.phone} />
            <Info label="Email" value={employee?.email} />
          </dl>
        </Card>
      </div>

      
<Card
  title={visitor.isPassActive ? "Pass verification" : "Pass history"}
  className="rise"
  style={{ "--i": 4 }}
>
  {visitor.isPassActive && visitor.qrCode ? (
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
      <img
        src={visitor.qrCode}
        alt="Visitor checkout QR code"
        className="h-28 w-28 rounded-control border border-line bg-white p-1.5"
      />

      <div>
        <p className="text-[13px] font-medium text-ink">
          Scan this QR code at the gate during exit.
        </p>

        <p className="mt-1 text-xs text-slate-500">
          This code is valid only while the pass is active.
        </p>
      </div>
    </div>
  ) : (
    <div className="space-y-2">
      <p className="text-[13px] font-semibold text-ink">
        {visitor.status === "CHECKED_OUT"
          ? "Visitor has checked out"
          : "Visitor pass has expired"}
      </p>

      <p className="text-xs leading-5 text-slate-500">
        This is a historical visitor record. You may view
        and download the PDF, but the pass is no longer
        valid for checkout.
      </p>
    </div>
  )}
</Card>

    </div>
  );
};

export default VisitorPassPage;