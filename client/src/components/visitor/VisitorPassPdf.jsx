import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { divisionName } from "../../config/divisions";
import { DEFAULT_LAYOUT, getLayout } from "./passLayouts";

/* ------------------------------------------------------------------
   Pass configuration - edit the heading or typography here.
------------------------------------------------------------------- */
const COMPANY = {
  name: "K H EXPORTS INDIA PRIVATE LIMITED",
  unit: "(FOOTWEAR DIVISION), RANIPET VLR. DT.",
};

const PASS_TITLES = {
  Suppliers: "SUPPLIER PASS",
  Audit: "AUDIT PASS",
  Relative: "RELATIVE PASS",
  Others: "VISITOR PASS",
};

const NOTICE =
  "Company will not be responsible for any injury / accident / loss of personal belongings, if any, during the visitor's stay inside the factory premises.";

const FONT = "Helvetica";
const FONT_BOLD = "Helvetica-Bold";

// Pure black on white: prints cleanly on thermal and laser printers alike.
const INK = "#000000";
const RULE = "#9A9A9A";

const mm = (value) => (value * 72) / 25.4;

/* ------------------------------------------------------------------
   Formatting helpers
------------------------------------------------------------------- */
const upper = (value) => (value ? String(value).toUpperCase() : "");

const istParts = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(date)
    .reduce((acc, part) => ({ ...acc, [part.type]: part.value }), {});
};

// 10:53 AM  (12-hour clock, always with AM / PM)
const clock = (p) => {
  const hour = Number(p.hour);
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = String(hour % 12 || 12).padStart(2, "0");
  return `${hour12}:${p.minute} ${suffix}`;
};

// 15-10-26 10:53 AM
const formatDateTime = (value) => {
  const p = istParts(value);
  return p ? `${p.day}-${p.month}-${p.year} ${clock(p)}` : "";
};

// 10:53 AM
const formatTime = (value) => {
  const p = istParts(value);
  return p ? clock(p) : "";
};

const ID_LABELS = {
  AADHAAR: "AADHAAR",
  PASSPORT: "PASSPORT",
  DRIVING_LICENCE: "DRIVING LICENCE",
  VOTER_ID: "VOTER ID",
  OTHER: "OTHER ID",
};

/** Normalises the API payload into display-ready strings. */
const buildPassData = (visitor = {}) => {
  const host = visitor.visitingEmployee || {};
  const active = visitor.isPassActive === true;

  const status =
    visitor.status === "CHECKED_OUT"
      ? "CHECKED OUT"
      : visitor.passExpired
        ? "EXPIRED"
        : active
          ? "CHECKED IN"
          : "INACTIVE";

  const place = [upper(visitor.state), visitor.pinCode]
    .filter(Boolean)
    .join(" - ");
  const country = upper(visitor.country);
  const region =
    country && country !== "INDIA"
      ? [place, country].filter(Boolean).join(", ")
      : place;

  const idType = ID_LABELS[visitor.idProofType] || "";
  const idValue = [idType, visitor.idProofMasked].filter(Boolean).join("  ");

  return {
    visitorId: visitor.visitorId || "",
    qrCode: visitor.qrCode || "",
    photo: visitor.profilePhoto || "",
    signature: host.signature || host.signatureUrl || "",
    active,
    status,
    passTitle:
      PASS_TITLES[visitor.visitingPurpose] || PASS_TITLES.Others,
    party: visitor.visitingPurpose === "Suppliers" ? "Supplier" : "Visitor",
    issued: formatDateTime(visitor.passIssuedAt || visitor.inTime),
    expires: formatDateTime(visitor.passExpiresAt),
    name: upper(visitor.name),
    organization: upper(visitor.organization),
    address: upper(visitor.address),
    region,
    idValue,
    employeeName: upper(host.name),
    employeeMeta: [host.employeeId, host.department]
      .filter(Boolean)
      .join("  ·  "),
    division: visitor.visitingDivision
      ? upper(divisionName(visitor.visitingDivision))
      : "",
    purpose: upper(visitor.visitingPurpose),
    inTime: formatTime(visitor.inTime),
    outTime: formatTime(visitor.outTime),
  };
};

/* ------------------------------------------------------------------
   A6 card (1/4 of A4)
------------------------------------------------------------------- */
const NAVY = "#10132E";
const BRAND = "#4169E8";
const LABEL = "#5B6478";
const HAIR = "#D9DEEA";
const TINT = "#F3F5FB";

const STATUS_TONES = {
  "CHECKED IN": { color: "#047857", bg: "#ECFDF5", border: "#A7F3D0" },
  "CHECKED OUT": { color: "#475569", bg: "#F1F5F9", border: "#CBD5E1" },
  EXPIRED: { color: "#B91C1C", bg: "#FEF2F2", border: "#FECACA" },
  INACTIVE: { color: "#B91C1C", bg: "#FEF2F2", border: "#FECACA" },
};

const card = StyleSheet.create({
  page: { padding: 12, fontFamily: FONT, color: NAVY, backgroundColor: "#fff" },
  guide: {
    width: mm(105),
    height: mm(148),
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: RULE,
    borderStyle: "dashed",
  },
  box: {
    flexGrow: 1,
    borderWidth: 0.9,
    borderColor: NAVY,
    borderRadius: 7,
    overflow: "hidden",
  },

  /* Brand header */
  head: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: NAVY,
    paddingVertical: 7,
    paddingHorizontal: 11,
  },
  mark: {
    width: 27,
    height: 27,
    borderWidth: 1.1,
    borderColor: "#FFFFFF",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  markText: { fontFamily: FONT_BOLD, fontSize: 10.5, color: "#FFFFFF", letterSpacing: 0.4 },
  headText: { flex: 1, marginLeft: 9 },
  company: { fontFamily: FONT_BOLD, fontSize: 8.4, color: "#FFFFFF", letterSpacing: 0.2 },
  unit: { fontSize: 6.1, color: "#B9C3E3", marginTop: 2.5, letterSpacing: 0.15 },
  accent: { height: 2.2, backgroundColor: BRAND },

  /* Pass type ribbon */
  ribbon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: TINT,
    borderBottomWidth: 0.5,
    borderBottomColor: HAIR,
    paddingVertical: 4.2,
    paddingHorizontal: 11,
  },
  title: { fontFamily: FONT_BOLD, fontSize: 8.4, letterSpacing: 1.9, color: NAVY },
  chip: {
    borderWidth: 0.7,
    borderRadius: 8,
    paddingVertical: 1.8,
    paddingHorizontal: 6,
  },
  chipText: { fontFamily: FONT_BOLD, fontSize: 5.6, letterSpacing: 0.7 },
  inactive: {
    marginHorizontal: 11,
    marginTop: 4,
    borderWidth: 0.8,
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
    borderRadius: 3,
    paddingVertical: 2,
    alignItems: "center",
  },
  inactiveText: { fontFamily: FONT_BOLD, fontSize: 6.2, letterSpacing: 0.6, color: "#B91C1C" },

  /* Serial + date */
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 11,
    paddingTop: 5,
    paddingBottom: 1,
  },
  metaBlock: {},
  metaLabel: { fontSize: 5.2, color: LABEL, letterSpacing: 0.6 },
  metaValue: { fontFamily: FONT_BOLD, fontSize: 8.4, marginTop: 1 },

  /* Details */
  body: { flexDirection: "row", paddingHorizontal: 11 },
  rows: { flex: 1 },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: 14,
    paddingVertical: 2.7,
    borderBottomWidth: 0.4,
    borderBottomColor: HAIR,
  },
  pair: { flexDirection: "row" },
  pairCell: { flex: 1, flexDirection: "row" },
  label: { width: 44, fontFamily: FONT_BOLD, fontSize: 5.3, color: LABEL, letterSpacing: 0.35, paddingTop: 1.3 },
  pairLabel: { width: 34, fontFamily: FONT_BOLD, fontSize: 5.3, color: LABEL, letterSpacing: 0.35, paddingTop: 1.3 },
  value: { flex: 1, fontFamily: FONT_BOLD, fontSize: 7.3, color: NAVY },

  aside: { width: 68, marginLeft: 9, paddingTop: 3, alignItems: "center" },
  photo: {
    width: 56,
    height: 58,
    objectFit: "cover",
    borderWidth: 0.7,
    borderColor: HAIR,
    borderRadius: 3,
    marginBottom: 4,
  },
  qrFrame: {
    width: 68,
    height: 68,
    borderWidth: 0.7,
    borderColor: HAIR,
    borderRadius: 4,
    padding: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  qr: { width: 60, height: 60 },
  qrCaption: { fontSize: 5.1, color: LABEL, marginTop: 2.5, textAlign: "center", letterSpacing: 0.2 },
  noQr: { borderStyle: "dashed", borderColor: LABEL },
  noQrText: { fontFamily: FONT_BOLD, fontSize: 5.6, textAlign: "center", color: LABEL, lineHeight: 1.4 },

  /* Visiting employee */
  host: {
    marginHorizontal: 11,
    marginTop: 5,
    borderWidth: 0.7,
    borderColor: "#C5CCDD",
    borderRadius: 4,
    overflow: "hidden",
  },
  hostTop: {
    backgroundColor: TINT,
    borderBottomWidth: 0.5,
    borderBottomColor: HAIR,
    paddingVertical: 2.8,
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hostHeading: { fontFamily: FONT_BOLD, fontSize: 5.3, letterSpacing: 0.9, color: LABEL },
  hostMeta: { fontSize: 5.8, color: LABEL },
  hostBody: { paddingHorizontal: 8, paddingTop: 3, paddingBottom: 3 },
  hostName: { fontFamily: FONT_BOLD, fontSize: 8, color: NAVY },
  signRow: { flexDirection: "row", marginTop: 1 },
  signMain: { flex: 1 },
  signTime: { width: 64, marginLeft: 10 },
  signSpace: {
    height: 20,
    borderBottomWidth: 0.7,
    borderBottomColor: NAVY,
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
  signImage: { height: 19, width: 90, objectFit: "contain" },
  signCaption: { fontSize: 5.5, color: LABEL, marginTop: 2, letterSpacing: 0.2 },

  notice: { marginHorizontal: 11, marginTop: 5, fontSize: 5.4, lineHeight: 1.45, color: LABEL },
  noticeBold: { fontFamily: FONT_BOLD, color: NAVY },

  signs: { flexDirection: "row", flexGrow: 1, marginHorizontal: 11, marginTop: 4 },
  signCol: { flex: 1 },
  signColGap: { flex: 1, marginLeft: 16 },
  visitorSpace: { flexGrow: 1, minHeight: 20 },
  line: { borderTopWidth: 0.7, borderTopColor: NAVY, paddingTop: 2.5 },
  lineTitle: { fontFamily: FONT_BOLD, fontSize: 6.5, color: NAVY },
  lineSub: { fontSize: 5.6, color: LABEL, marginTop: 0.5 },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
    paddingVertical: 4.5,
    paddingHorizontal: 11,
    backgroundColor: NAVY,
  },
  footerText: { fontSize: 5.4, color: "#C9D1EA", letterSpacing: 0.2 },
  footerStrong: { fontFamily: FONT_BOLD, color: "#FFFFFF" },
});

const CardRow = ({ label, value }) => (
  <View style={card.row} wrap={false}>
    <Text style={card.label}>{label.toUpperCase()}</Text>
    <Text style={card.value}>{value || " "}</Text>
  </View>
);

const CardPair = ({ left, right }) => (
  <View style={[card.row, card.pair]} wrap={false}>
    {[left, right].map(([label, value]) => (
      <View key={label} style={card.pairCell}>
        <Text style={card.pairLabel}>{label.toUpperCase()}</Text>
        <Text style={card.value}>{value || " "}</Text>
      </View>
    ))}
  </View>
);

const CardPass = ({ d }) => {
  const tone = STATUS_TONES[d.status] || STATUS_TONES.INACTIVE;

  return (
    <View style={card.box}>
      {/* Brand header */}
      <View style={card.head}>
        <View style={card.mark}>
          <Text style={card.markText}>KH</Text>
        </View>
        <View style={card.headText}>
          <Text style={card.company}>{COMPANY.name}</Text>
          <Text style={card.unit}>{COMPANY.unit}</Text>
        </View>
      </View>
      <View style={card.accent} />

      {/* Pass type + status */}
      <View style={card.ribbon}>
        <Text style={card.title}>{d.passTitle}</Text>
        <View
          style={[card.chip, { backgroundColor: tone.bg, borderColor: tone.border }]}
        >
          <Text style={[card.chipText, { color: tone.color }]}>{d.status}</Text>
        </View>
      </View>

      {!d.active && (
        <View style={card.inactive}>
          <Text style={card.inactiveText}>NOT VALID FOR EXIT</Text>
        </View>
      )}

      {/* Serial + date */}
      <View style={card.meta}>
        <View style={card.metaBlock}>
          <Text style={card.metaLabel}>PASS NO.</Text>
          <Text style={card.metaValue}>{d.visitorId}</Text>
        </View>
        <View style={[card.metaBlock, { alignItems: "flex-end" }]}>
          <Text style={card.metaLabel}>ISSUED</Text>
          <Text style={card.metaValue}>{d.issued}</Text>
        </View>
      </View>

      {/* Details + photo / QR */}
      <View style={card.body}>
        <View style={card.rows}>
          <CardRow label="Name" value={d.name} />
          <CardRow label="Company" value={d.organization} />
          <CardRow label="Address" value={d.address} />
          <CardRow label="State / PIN" value={d.region} />
          <CardRow label="ID No" value={d.idValue} />
          <CardRow label="To See" value={d.employeeName} />
          <CardPair left={["Division", d.division]} right={["Purpose", d.purpose]} />
          <CardPair left={["In Time", d.inTime]} right={["Out Time", d.outTime]} />
        </View>

        <View style={card.aside}>
          {d.photo ? <Image src={d.photo} style={card.photo} /> : null}

          {d.active && d.qrCode ? (
            <>
              <View style={card.qrFrame}>
                <Image src={d.qrCode} style={card.qr} />
              </View>
              <Text style={card.qrCaption}>Scan at gate on exit</Text>
            </>
          ) : (
            <View style={[card.qrFrame, card.noQr]}>
              <Text style={card.noQrText}>NO EXIT{"\n"}QR</Text>
            </View>
          )}
        </View>
      </View>

      {/* Visiting employee signature */}
      <View style={card.host} wrap={false}>
        <View style={card.hostTop}>
          <Text style={card.hostHeading}>VISITING EMPLOYEE</Text>
          {d.employeeMeta ? <Text style={card.hostMeta}>{d.employeeMeta}</Text> : null}
        </View>

        <View style={card.hostBody}>
          <Text style={card.hostName}>{d.employeeName || "—"}</Text>

          <View style={card.signRow}>
            <View style={card.signMain}>
              <View style={card.signSpace}>
                {d.signature ? <Image src={d.signature} style={card.signImage} /> : null}
              </View>
              <Text style={card.signCaption}>Signature of the person seen</Text>
            </View>
            <View style={card.signTime}>
              <View style={card.signSpace} />
              <Text style={card.signCaption}>With time</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={card.notice}>
        <Text style={card.noticeBold}>N.B. :- </Text>
        {NOTICE}
      </Text>

      {/* Visitor signatures */}
      <View style={card.signs} wrap={false}>
        <View style={card.signCol}>
          <View style={card.visitorSpace} />
          <View style={card.line}>
            <Text style={card.lineTitle}>{d.party} Signature</Text>
            <Text style={card.lineSub}>With time of entry</Text>
          </View>
        </View>
        <View style={card.signColGap}>
          <View style={card.visitorSpace} />
          <View style={card.line}>
            <Text style={card.lineTitle}>{d.party} Signature</Text>
            <Text style={card.lineSub}>With time out</Text>
          </View>
        </View>
      </View>

      <View style={card.footer}>
        <Text style={card.footerText}>
          Valid until <Text style={card.footerStrong}>{d.expires || "—"}</Text>
        </Text>
        <Text style={card.footerText}>Gate Pass · {d.visitorId}</Text>
      </View>
    </View>
  );
};

/* ------------------------------------------------------------------
   Thermal roll (80 mm / 58 mm)
------------------------------------------------------------------- */
const rollMetrics = (widthMm) => {
  const narrow = widthMm <= 60;
  const width = mm(widthMm);
  const pad = narrow ? 6 : 8;
  const fs = narrow ? 7 : 8;
  const inner = width - pad * 2;
  const labelW = narrow ? 40 : 48;

  return {
    narrow,
    width,
    pad,
    fs,
    inner,
    labelW,
    valueW: inner - labelW - 6,
    qr: narrow ? 74 : 92,
  };
};

const makeRollStyles = (m) =>
  StyleSheet.create({
    page: { padding: m.pad, fontFamily: FONT, color: INK, backgroundColor: "#fff", fontSize: m.fs },
    center: { alignItems: "center" },
    mark: {
      width: 24,
      height: 24,
      borderWidth: 1.3,
      borderColor: INK,
      borderRadius: 4,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      marginBottom: 5,
    },
    markText: { fontFamily: FONT_BOLD, fontSize: 10, letterSpacing: 0.4 },
    company: { fontFamily: FONT_BOLD, fontSize: m.narrow ? m.fs + 1 : m.fs + 1.6, textAlign: "center" },
    unit: { fontFamily: FONT_BOLD, fontSize: m.fs - 1, textAlign: "center", marginTop: 2 },
    dashed: { borderBottomWidth: 0.8, borderBottomColor: INK, borderStyle: "dashed", marginVertical: 5 },
    title: { fontFamily: FONT_BOLD, fontSize: m.fs + 1.6, letterSpacing: 1.6, textAlign: "center" },
    flag: { borderWidth: 1, borderColor: INK, paddingVertical: 2, alignItems: "center", marginTop: 4 },
    flagText: { fontFamily: FONT_BOLD, fontSize: m.fs - 1.2 },
    row: { flexDirection: "row", paddingVertical: 2 },
    label: { width: m.labelW, fontFamily: FONT_BOLD, fontSize: m.fs - 1 },
    colon: { width: 6, fontSize: m.fs },
    value: { width: m.valueW, fontFamily: FONT_BOLD, fontSize: m.fs },
    qr: { width: m.qr, height: m.qr, marginTop: 4 },
    qrCaption: { fontSize: m.fs - 2, marginTop: 2, textAlign: "center" },
    heading: { fontFamily: FONT_BOLD, fontSize: m.fs - 1.8, letterSpacing: 0.8 },
    hostName: { fontFamily: FONT_BOLD, fontSize: m.fs + 0.4, marginTop: 2 },
    hostMeta: { fontSize: m.fs - 1.4, marginTop: 1 },
    signSpace: { height: 26, borderBottomWidth: 0.8, borderBottomColor: INK, justifyContent: "flex-end" },
    signImage: { height: 24, width: m.inner * 0.7, objectFit: "contain" },
    caption: { fontSize: m.fs - 1.4, marginTop: 2 },
    notice: { fontSize: m.fs - 1.6, lineHeight: 1.35 },
    lineTitle: { fontFamily: FONT_BOLD, fontSize: m.fs - 0.6 },
    footer: { fontSize: m.fs - 1.8, textAlign: "center", marginTop: 1 },
  });

const rollRows = (d) => [
  ["Name", d.name],
  ["Company", d.organization],
  ["Address", d.address],
  ["State / PIN", d.region],
  ["ID NO", d.idValue],
  ["To See", d.employeeName],
  ["Division", d.division],
  ["Purpose", d.purpose],
  ["In Time", d.inTime],
  ["Out Time", d.outTime],
];

const RollPass = ({ d, m, s }) => (
  <>
    <View style={s.mark}>
      <Text style={s.markText}>KH</Text>
    </View>
    <Text style={s.company}>
      {m.narrow ? COMPANY.name.replace(" PRIVATE", "\nPRIVATE") : COMPANY.name}
    </Text>
    <Text style={s.unit}>{COMPANY.unit}</Text>
    <View style={s.dashed} />
    <Text style={s.title}>{d.passTitle}</Text>
    <View style={s.dashed} />

    {!d.active && (
      <View style={s.flag}>
        <Text style={s.flagText}>{d.status} · NOT VALID FOR EXIT</Text>
      </View>
    )}

    {[
      ["Pass No", d.visitorId],
      ["Issued", d.issued],
    ].map(([label, value]) => (
      <View key={label} style={s.row} wrap={false}>
        <Text style={s.label}>{label}</Text>
        <Text style={s.colon}>:</Text>
        <Text style={s.value}>{value || " "}</Text>
      </View>
    ))}

    <View style={s.dashed} />

    {rollRows(d).map(([label, value]) => (
      <View key={label} style={s.row} wrap={false}>
        <Text style={s.label}>{label}</Text>
        <Text style={s.colon}>:</Text>
        <Text style={s.value}>{value || " "}</Text>
      </View>
    ))}

    {d.active && d.qrCode ? (
      <View style={s.center}>
        <Image src={d.qrCode} style={s.qr} />
        <Text style={s.qrCaption}>Scan at gate on exit</Text>
      </View>
    ) : null}

    <View style={s.dashed} />

    <View wrap={false}>
      <Text style={s.heading}>VISITING EMPLOYEE</Text>
      <Text style={s.hostName}>{d.employeeName || "—"}</Text>
      {d.employeeMeta ? <Text style={s.hostMeta}>{d.employeeMeta}</Text> : null}

      <View style={[s.signSpace, { marginTop: 8 }]}>
        {d.signature ? <Image src={d.signature} style={s.signImage} /> : null}
      </View>
      <Text style={s.caption}>Signature of the person seen</Text>

      <View style={[s.signSpace, { marginTop: 6 }]} />
      <Text style={s.caption}>With time</Text>
    </View>

    <View style={s.dashed} />

    <Text style={s.notice}>
      <Text style={{ fontFamily: FONT_BOLD }}>N.B. :- </Text>
      {NOTICE}
    </Text>

    {["With Time of Entry", "With Time Out"].map((caption) => (
      <View key={caption} wrap={false} style={{ marginTop: 4 }}>
        <View style={{ height: 36 }} />
        <View style={{ borderTopWidth: 0.8, borderTopColor: INK, paddingTop: 2 }}>
          <Text style={s.lineTitle}>
            {d.party} Signature - {caption}
          </Text>
        </View>
      </View>
    ))}

    <View style={s.dashed} />
    <Text style={s.footer}>Valid until {d.expires || "—"}</Text>
    <Text style={s.footer}>Gate Pass · {d.visitorId}</Text>
  </>
);

/* ------------------------------------------------------------------
   Document
------------------------------------------------------------------- */
const VisitorPassPDF = ({ visitor, layout = DEFAULT_LAYOUT }) => {
  const config = getLayout(layout);
  const d = buildPassData(visitor);
  const title = `${d.passTitle} - ${d.visitorId}`;

  if (config.kind === "roll") {
    const m = rollMetrics(config.widthMm);
    const s = makeRollStyles(m);

    return (
      <Document title={title} author="Gate Pass Visitor Management System">
        {/* A tall page with wrap={false} is trimmed to the content height,
            so the roll is exactly as long as the pass. */}
        <Page size={[m.width, 6000]} style={s.page} wrap={false}>
          <RollPass d={d} m={m} s={s} />
        </Page>
      </Document>
    );
  }

  // A6 page, or the same A6 pass in the top-left quarter of an A4 sheet.
  const isSheet = config.sheet === "A4";

  return (
    <Document title={title} author="Gate Pass Visitor Management System">
      <Page
        size={isSheet ? "A4" : "A6"}
        style={isSheet ? { padding: 0 } : card.page}
      >
        {isSheet ? (
          <View style={[card.guide, { padding: 12 }]}>
            <CardPass d={d} />
          </View>
        ) : (
          <CardPass d={d} />
        )}
      </Page>
    </Document>
  );
};

export default VisitorPassPDF;