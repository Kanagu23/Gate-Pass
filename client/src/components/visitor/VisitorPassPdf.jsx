import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

// Existing Gate Pass palette; styled to match VisitorPassPage.jsx.
const COLORS = {
  background: "#F5F7FB",
  white: "#FFFFFF",
  navy: "#10132E",
  blue: "#4169E8",
  muted: "#64748B",
  border: "#E2E8F0",
  softBlue: "#EFF6FF",
  softCyan: "#CFFAFE",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 31,
    paddingHorizontal: 34,
    paddingBottom: 26,
    backgroundColor: COLORS.background,
    fontFamily: "Helvetica",
    color: COLORS.navy,
    fontSize: 9,
  },
  overline: { fontSize: 8, color: COLORS.muted, marginBottom: 6 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  headerDivision: { fontSize: 9, color: COLORS.muted, marginBottom: 14 },
  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 7,
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 13,
  },
  avatar: {
    height: 60,
    width: 54,
    borderRadius: 5,
    backgroundColor: COLORS.softCyan,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  initials: { fontSize: 15, fontWeight: "bold", color: "#0E7490" },
  visitorPhoto: { height: 60, width: 54, objectFit: "cover", borderRadius: 5, marginRight: 12 },
  statusColumn: { alignItems: "flex-end", marginLeft: 8, maxWidth: 150 },
  checkedInTime: { color: COLORS.muted, fontSize: 8, marginTop: 6, textAlign: "right", lineHeight: 1.35 },
  summaryContent: { flex: 1 },
  visitorName: { fontSize: 12, fontWeight: "bold", marginBottom: 5 },
  passId: { fontSize: 9, color: COLORS.muted },
  status: {
    color: COLORS.blue,
    fontSize: 8,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 10,
    backgroundColor: COLORS.softBlue,
    alignSelf: "flex-start",
  },
  columns: { flexDirection: "row", marginBottom: 13 },
  halfCard: { flex: 1 },
  columnGap: { width: 13 },
  cardTitle: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 10,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cardBody: { paddingHorizontal: 14, paddingVertical: 5 },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 9,
    borderBottomWidth: 0.6,
    borderBottomColor: COLORS.border,
  },
  noBorder: { borderBottomWidth: 0 },
  detailLabel: { width: "38%", fontSize: 8, color: COLORS.muted, paddingRight: 6 },
  detailValue: {
    width: "62%",
    fontSize: 9,
    color: COLORS.navy,
    textAlign: "right",
    fontWeight: "bold",
    lineHeight: 1.3,
  },
  verification: { padding: 14, flexDirection: "row", alignItems: "center" },
  qrFrame: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 5,
    padding: 5,
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  qr: { width: 88, height: 88 },
  verifyText: { flex: 1 },
  verifyHeading: { fontSize: 10, fontWeight: "bold", marginBottom: 6 },
  verifyCaption: { fontSize: 8, color: COLORS.muted, lineHeight: 1.5 },
  signatureRow: { flexDirection: "row", alignItems: "flex-end", marginTop: 21 },
  signatureBlock: { width: "48%", marginRight: "4%", alignItems: "center" },
  signatureRule: {
    width: "100%",
    height: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#94A3B8",
    marginBottom: 6,
  },
  signatureImage: { width: 120, height: 30, objectFit: "contain", marginBottom: 6 },
  signatureLabel: { fontSize: 8, color: COLORS.muted },
  footer: {
    marginTop: 18,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    fontSize: 7,
    color: COLORS.muted,
    lineHeight: 1.5,
  },
});

const display = (value) =>
  value === undefined || value === null || value === "" ? "—" : String(value);

const dateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
      });
};

const initialsFor = (name) => {
  const parts = String(name || "V").trim().split(/\s+/).filter(Boolean);
  return parts.length === 1
    ? parts[0].slice(0, 2).toUpperCase()
    : `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const DetailRow = ({ label, value, last = false }) => (
  <View style={[styles.detailRow, last ? styles.noBorder : {}]}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{display(value)}</Text>
  </View>
);

const VisitorPassPDF = ({ visitor }) => {
  const host = visitor?.visitingEmployee || {};
  const isActive = visitor?.isPassActive === true;

const passLabel =
  visitor?.status === "CHECKED_OUT"
    ? "CHECKED OUT"
    : visitor?.passExpired
      ? "EXPIRED"
      : isActive
        ? "CHECKED IN"
        : "INACTIVE";
  const maskedProof = visitor?.idProofMasked || "—";
  const signature = host.signature || host.signatureUrl || "";

  return (
    <Document
      title={`Visitor Pass - ${display(visitor?.visitorId)}`}
      author="Gate Pass Visitor Management System"
    >
      <Page size="A4" style={styles.page} wrap={false}>
        <Text style={styles.overline}>KH EXPORTS INDIA PRIVATE LIMITED</Text>
        <Text style={styles.title}>Visitor Pass</Text>
        <Text style={styles.headerDivision}>
          Visiting division: {display(visitor?.visitingDivision)}
        </Text>

        <View style={[styles.card, styles.summary]}>
          {visitor?.profilePhoto ? (
            <Image src={visitor.profilePhoto} style={styles.visitorPhoto} />
          ) : (
            <View style={[styles.avatar, { marginRight: 12 }]}>
              <Text style={styles.initials}>{initialsFor(visitor?.name)}</Text>
            </View>
          )}
          <View style={styles.summaryContent}>
            <Text style={styles.visitorName}>{display(visitor?.name)}</Text>
            <Text style={styles.passId}>Pass ID  {display(visitor?.visitorId)}</Text>
          </View>
          <View style={styles.statusColumn}>
           <Text style={styles.status}>
  {passLabel}
</Text>
            <Text style={styles.checkedInTime}>
              Checked in: {dateTime(visitor?.inTime)}
            </Text>
          </View>
        </View>

        <View style={styles.columns}>
          <View style={[styles.card, styles.halfCard]}>
            <Text style={styles.cardTitle}>Visitor</Text>
            <View style={styles.cardBody}>
              <DetailRow label="Visitor ID" value={visitor?.visitorId} />
              <DetailRow label="Name" value={visitor?.name} />
              <DetailRow label="Mobile" value={visitor?.mobile} />
              <DetailRow label="Organization" value={visitor?.organization} />
              <DetailRow label="Purpose" value={visitor?.visitingPurpose} />
              <DetailRow
                label="ID proof"
                value={`${display(visitor?.idProofType)}${maskedProof !== "—" ? ` · ${maskedProof}` : ""}`}
                last
              />
            </View>
          </View>

          <View style={styles.columnGap} />

          <View style={[styles.card, styles.halfCard]}>
            <Text style={styles.cardTitle}>Visiting employee</Text>
            <View style={styles.cardBody}>
              <DetailRow label="Name" value={host.name} />
              <DetailRow label="Employee ID" value={host.employeeId} />
              <DetailRow label="Department" value={host.department} />
              <DetailRow label="Phone" value={host.phone} />
              <DetailRow label="Email" value={host.email} />
              <DetailRow label="Valid until" value={dateTime(visitor?.passExpiresAt)} last />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pass verification</Text>
          <View style={styles.verification}>
            <View style={styles.qrFrame}>
              {visitor?.qrCode ? (
                <Image src={visitor.qrCode} style={styles.qr} />
              ) : (
               <Text style={styles.verifyCaption}>
  {isActive ? "QR unavailable" : "PASS INACTIVE"}
</Text>
              )}
            </View>
            <View style={styles.verifyText}>
<Text style={styles.verifyHeading}>
  {isActive
    ? "Scan this QR code at the gate during exit."
    : "Historical visitor pass — not valid for checkout."}
</Text>           
   <Text style={styles.verifyCaption}>
  {isActive
    ? "This secure QR code is used for visitor checkout."
    : "Archived copy for record keeping. This pass cannot be used for gate authorization."}
</Text>
              <Text style={styles.verifyCaption}>
                Expiry: {dateTime(visitor?.passExpiresAt)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.signatureRow}>
          <View style={styles.signatureBlock}>
            {signature ? (
              <Image src={signature} style={styles.signatureImage} />
            ) : (
              <View style={styles.signatureRule} />
            )}
            <Text style={styles.signatureLabel}>Visiting employee signature</Text>
          </View>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureRule} />
            <Text style={styles.signatureLabel}>Gate officer / verification</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          This pass is issued for the stated visit only and must be verified at exit.
          Follow all site safety and security instructions. Do not share the QR code.
        </Text>
      </Page>
    </Document>
  );
};

export default VisitorPassPDF;
