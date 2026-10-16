
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PDFDownloadLink } from "@react-pdf/renderer";
import {
  ArrowLeft,
  Download,
  FileText,
  AlertCircle,
} from "lucide-react";

import { getVisitorPass } from "../../api/visitor.api";
import VisitorPassPDF from "../../components/visitor/VisitorPassPdf";

const VisitorPassPage = () => {
  const { id } = useParams();

  const [visitor, setVisitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadVisitorPass = async () => {
      try {
        setLoading(true);
        setError("");
        setVisitor(null);

        const response = await getVisitorPass(id);

        if (active) {
          setVisitor(response.visitor);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to retrieve visitor pass."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadVisitorPass();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="border border-slate-200 bg-white p-8 text-sm text-slate-500">
        Loading visitor pass...
      </div>
    );
  }

  if (error || !visitor) {
    return (
      <div className="rounded-md border border-red-200 bg-white p-6">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle size={20} />
          <p className="font-medium">
            {error || "Visitor pass not found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        to="/gate"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600"
      >
        <ArrowLeft size={17} />
        Back to Dashboard
      </Link>

      <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-blue-600">
              <FileText size={20} />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Visitor Pass
              </span>
            </div>

            <h1 className="text-2xl font-semibold text-[#10132e]">
              {visitor.name}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Pass ID: {visitor.visitorId}
            </p>
          </div>

          <PDFDownloadLink
            document={<VisitorPassPDF visitor={visitor} />}
            fileName={`GatePass-${visitor.visitorId}.pdf`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#4169e8] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#3455c4]"
          >
            {({ loading: pdfLoading, error: pdfError }) => (
              <>
                <Download size={17} />
                {pdfError
                  ? "PDF generation failed"
                  : pdfLoading
                    ? "Preparing PDF..."
                    : "Download PDF"}
              </>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-md border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-base font-semibold text-[#10132e]">
            Visitor Information
          </h2>

          <Info label="Visitor ID" value={visitor.visitorId} />
          <Info label="Name" value={visitor.name} />
          <Info label="Mobile" value={visitor.mobile} />
          <Info label="Organization" value={visitor.organization} />
          <Info label="Purpose" value={visitor.visitingPurpose} />
          <Info label="Status" value={visitor.status} />
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-6">
          <h2 className="mb-5 text-base font-semibold text-[#10132e]">
            Visiting Employee
          </h2>

          <Info
            label="Employee Name"
            value={visitor.visitingEmployee?.name}
          />
          <Info
            label="Employee ID"
            value={visitor.visitingEmployee?.employeeId}
          />
          <Info
            label="Department"
            value={visitor.visitingEmployee?.department}
          />
          <Info
            label="Phone"
            value={visitor.visitingEmployee?.phone}
          />
          <Info
            label="Email"
            value={visitor.visitingEmployee?.email}
          />
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-[#10132e]">
          Pass Verification
        </h2>

        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <img
            src={visitor.qrCode}
            alt="Visitor verification QR code"
            className="h-36 w-36 border border-slate-200 p-2"
          />

          <div>
            <p className="text-sm font-medium text-slate-800">
              Scan this QR code at the gate during exit.
            </p>

            <p className="mt-2 text-sm text-slate-500">
              The QR code is associated with this visitor's
              approved pass.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="mb-4 border-b border-slate-100 pb-3 last:mb-0 last:border-0 last:pb-0">
    <p className="mb-1 text-xs font-medium text-slate-500">
      {label}
    </p>
    <p className="break-words text-sm font-medium text-slate-800">
      {value || "—"}
    </p>
  </div>
);

export default VisitorPassPage;
