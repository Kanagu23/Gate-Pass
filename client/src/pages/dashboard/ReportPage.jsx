import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { DIVISIONS } from "../../config/divisions";
import { getVisitorReport } from "../../api/report.api";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Alert from "../../components/common/Alert";

const localDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const ReportPage = () => {
  const { user } = useAuth();
  const privileged = user?.role === "SYSTEM_ADMIN" || (user?.role === "ADMIN" && !user?.division);
  const [from, setFrom] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 6); return localDate(d); });
  const [to, setTo] = useState(() => localDate(new Date()));
  const [division, setDivision] = useState(() => localStorage.getItem("gatepass:division") || "");
  useEffect(() => {
    if (!privileged) return undefined;
    const onDivisionChange = (event) => setDivision(event.detail || "");
    window.addEventListener("gatepass:division-changed", onDivisionChange);
    return () => window.removeEventListener("gatepass:division-changed", onDivisionChange);
  }, [privileged]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const load = async () => {
    if (from > to) { setError("From date must not be after To date"); return; }
    try { setLoading(true); setError(""); setReport(await getVisitorReport({ from, to, division: privileged ? division : user?.division })); }
    catch (err) { setError(err.response?.data?.message || "Unable to load report"); }
    finally { setLoading(false); }
  };
  useEffect(() => { let active = true; const fetchReport = async () => { try { const data = await getVisitorReport({ from, to, division: privileged ? division : user?.division || "" }); if (active) setReport(data); } catch (err) { if (active) setError(err.response?.data?.message || "Unable to load report"); } }; fetchReport(); return () => { active = false; }; }, [user?.division, privileged, division]);
  const totals = report?.totals || { total: 0, byStatus: {}, byDivision: {} };
  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <PageHeader title="VISITOR REPORTS" description="Date-wise visitor activity and division reporting." />
      {error && <Alert tone="error">{error}</Alert>}
      <Card title="Filters"><div className="grid gap-3 sm:grid-cols-4">
        <label className="text-xs font-medium text-slate-600">From<input className="field mt-1" type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
        <label className="text-xs font-medium text-slate-600">To<input className="field mt-1" type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
        <label className="text-xs font-medium text-slate-600">Division<select className="field mt-1" disabled={!privileged} value={privileged ? division : user?.division || ""} onChange={(e) => setDivision(e.target.value)}>{privileged && <option value="">All divisions</option>}{DIVISIONS.map((d) => <option key={d.code} value={d.code}>{d.name}</option>)}</select></label>
        <div className="self-end"><Button type="button" disabled={loading} onClick={load}>{loading ? "Loading..." : "Generate report"}</Button></div>
      </div></Card>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[["Total visitors", totals.total],["Checked in",totals.byStatus.CHECKED_IN || 0],["Checked out",totals.byStatus.CHECKED_OUT || 0],["Rejected",totals.byStatus.REJECTED || 0]].map(([label,value]) => <div key={label} className="rounded-card border border-line bg-white p-4 shadow-card"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold text-ink">{value}</p></div>)}</div>
      <Card title="Division totals"><div className="overflow-x-auto"><table className="tbl w-full"><thead><tr><th>Division</th><th>Visitor count</th></tr></thead><tbody>{Object.entries(totals.byDivision).map(([code,count]) => <tr key={code}><td>{DIVISIONS.find((d) => d.code === code)?.name || code}</td><td>{count}</td></tr>)}</tbody></table></div></Card>
      <Card title="Date-wise records"><div className="overflow-x-auto"><table className="tbl w-full"><thead><tr><th>Date</th><th>Division</th><th>Status</th><th>Count</th></tr></thead><tbody>{(report?.rows || []).map((row, i) => <tr key={i}><td>{row.date}</td><td>{DIVISIONS.find((d) => d.code === row.division)?.name || row.division}</td><td>{row.status}</td><td>{row.count}</td></tr>)}</tbody></table></div></Card>
    </div>
  );
};
export default ReportPage;
