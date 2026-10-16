
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

const colors = {
  navy: "#10132E",
  blue: "#4169E8",
  white: "#FFFFFF",
  background: "#F5F7FB",
  text: "#222B3D",
  muted: "#64748B",
  border: "#E2E8F0",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.background,
    padding: 32,
    fontFamily: "Helvetica",
    color: colors.text,
  },
  pass: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    backgroundColor: colors.navy,
    padding: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: 9,
    color: "#CBD5E1",
    marginTop: 5,
  },
  headerLabel: {
    fontSize: 9,
    color: colors.white,
    backgroundColor: colors.blue,
    padding: 8,
  },
  accent: {
    height: 4,
    backgroundColor: colors.blue,
  },
  content: {
    padding: 22,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.navy,
    marginBottom: 13,
    paddingBottom: 7,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  visitorRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  photo: {
    width: 80,
    height: 95,
    objectFit: "cover",
    marginRight: 18,
    backgroundColor: colors.background,
  },
  details: {
    flex: 1,
  },
  visitorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.navy,
    marginBottom: 9,
  },
  field: {
    marginBottom: 8,
  },
  label: {
    fontSize: 8,
    color: colors.muted,
    marginBottom: 3,
  },
  value: {
    fontSize: 10,
    color: colors.text,
  },
  grid: {
    flexDirection: "row",
    marginBottom: 15,
  },
  gridItem: {
    flex: 1,
    paddingRight: 12,
  },
  employeeSection: {
    padding: 15,
    backgroundColor: colors.background,
    marginBottom: 20,
  },
  qrSection: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 18,
  },
  qrImage: {
    width: 110,
    height: 110,
    marginRight: 20,
  },
  qrDetails: {
    flex: 1,
  },
  qrTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.navy,
    marginBottom: 8,
  },
  qrDescription: {
    fontSize: 9,
    color: colors.muted,
    lineHeight: 1.5,
    marginBottom: 10,
  },
  footer: {
    marginTop: 18,
    textAlign: "center",
    fontSize: 8,
    color: colors.muted,
  },
});

const Field = ({ label, value }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || "—"}</Text>
  </View>
);

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
};

const VisitorPassPDF = ({ visitor }) => {
  const employee = visitor.visitingEmployee || {};

  return (
    <Document
      title={`Visitor Pass - ${visitor.visitorId}`}
      author="Gate Pass Management System"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.pass}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>
                GATE PASS
              </Text>
              <Text style={styles.headerSubtitle}>
                KHGROUP | Visitor Management System
              </Text>
            </View>

            <Text style={styles.headerLabel}>
              VISITOR PASS
            </Text>
          </View>

          <View style={styles.accent} />

          <View style={styles.content}>
            <Text style={styles.sectionTitle}>
              VISITOR INFORMATION
            </Text>

            <View style={styles.visitorRow}>
              {visitor.profilePhoto ? (
                <Image
                  src={visitor.profilePhoto}
                  style={styles.photo}
                />
              ) : null}

              <View style={styles.details}>
                <Text style={styles.visitorName}>
                  {visitor.name}
                </Text>

                <Field
                  label="Visitor ID"
                  value={visitor.visitorId}
                />

                <Field
                  label="Mobile"
                  value={visitor.mobile}
                />
              </View>
            </View>

            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Field
                  label="Organization"
                  value={visitor.organization}
                />
              </View>

              <View style={styles.gridItem}>
                <Field
                  label="Purpose of Visit"
                  value={visitor.visitingPurpose}
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>
              VISITING EMPLOYEE
            </Text>

            <View style={styles.employeeSection}>
              <View style={styles.grid}>
                <View style={styles.gridItem}>
                  <Field
                    label="Employee Name"
                    value={employee.name}
                  />
                </View>

                <View style={styles.gridItem}>
                  <Field
                    label="Employee ID"
                    value={employee.employeeId}
                  />
                </View>
              </View>

              <View style={styles.grid}>
                <View style={styles.gridItem}>
                  <Field
                    label="Department"
                    value={employee.department}
                  />
                </View>

                <View style={styles.gridItem}>
                  <Field
                    label="Phone"
                    value={employee.phone}
                  />
                </View>
              </View>

              <Field
                label="Email"
                value={employee.email}
              />
            </View>

            <Text style={styles.sectionTitle}>
              PASS VALIDITY
            </Text>

            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Field
                  label="Check-In Time"
                  value={formatDate(visitor.inTime)}
                />
              </View>

              <View style={styles.gridItem}>
                <Field
                  label="Valid Until"
                  value={formatDate(visitor.passExpiresAt)}
                />
              </View>
            </View>

            <View style={styles.qrSection}>
              <Image
                src={visitor.qrCode}
                style={styles.qrImage}
              />

              <View style={styles.qrDetails}>
                <Text style={styles.qrTitle}>
                  SCAN FOR VERIFICATION
                </Text>

                <Text style={styles.qrDescription}>
                  Present this QR code to the gate
                  employee during exit verification.
                </Text>

                <Field
                  label="Pass Number"
                  value={visitor.visitorId}
                />
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          This pass is issued for authorized visitor
          access only. Please return or dispose of
          it securely after your visit.
        </Text>
      </Page>
    </Document>
  );
};

export default VisitorPassPDF;
