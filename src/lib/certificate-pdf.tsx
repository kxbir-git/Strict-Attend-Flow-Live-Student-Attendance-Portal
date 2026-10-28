import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
  },
  watermark: {
    position: "absolute",
    top: 300,
    left: 40,
    right: 40,
    fontSize: 32,
    color: "#FEE2E2",
    fontWeight: "bold",
    textAlign: "center",
    transform: "rotate(-30deg)",
    zIndex: -1,
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: "#059669",
    paddingBottom: 15,
    marginBottom: 20,
    textAlign: "center",
  },
  institutionName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0F172A",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 10,
    color: "#64748B",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "#059669",
    marginVertical: 15,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  section: {
    marginVertical: 8,
  },
  studentInfo: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
    color: "#475569",
  },
  value: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0F172A",
  },
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderBottomWidth: 1,
    borderBottomColor: "#CBD5E1",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  colCode: { width: "20%", fontSize: 9, color: "#334155" },
  colName: { width: "45%", fontSize: 9, color: "#0F172A" },
  colHeld: { width: "15%", fontSize: 9, textAlign: "center", color: "#334155" },
  colAttended: { width: "10%", fontSize: 9, textAlign: "center", color: "#334155" },
  colPct: { width: "10%", fontSize: 9, textAlign: "right", fontWeight: "bold", color: "#059669" },
  footer: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 15,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  qrNotice: {
    fontSize: 8,
    color: "#64748B",
    maxWidth: 320,
  },
  signatureBox: {
    textAlign: "right",
  },
  signTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0F172A",
  },
  signDept: {
    fontSize: 8,
    color: "#64748B",
  },
});

interface CertPdfProps {
  studentName: string;
  rollNo: string;
  className: string;
  overallPercentage: number;
  totalHeld: number;
  totalAttended: number;
  isOfficial: boolean;
  subjects: {
    code: string;
    name: string;
    held: number;
    attended: number;
    percent: number;
  }[];
  verificationUrl: string;
  token: string;
  generatedDate: string;
}

export async function generateAttendanceCertificatePdf(props: CertPdfProps): Promise<Buffer> {
  const doc = (
    <Document title={`Attendance Certificate - ${props.rollNo}`}>
      <Page size="A4" style={styles.page}>
        {!props.isOfficial && (
          <Text style={styles.watermark}>UNOFFICIAL COPY (ATTENDANCE &lt; 75%)</Text>
        )}

        <View style={styles.header}>
          <Text style={styles.institutionName}>National Institute of Technology & Management</Text>
          <Text style={styles.subHeader}>Office of Academic Affairs • Office of Student Attendance Registry</Text>
        </View>

        <Text style={styles.title}>Official Attendance Certificate</Text>

        <View style={styles.studentInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Student Name:</Text>
            <Text style={styles.value}>{props.studentName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Roll Number:</Text>
            <Text style={styles.value}>{props.rollNo}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Class / Division:</Text>
            <Text style={styles.value}>{props.className}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Overall Attendance:</Text>
            <Text style={{ ...styles.value, color: props.overallPercentage >= 75 ? "#059669" : "#DC2626" }}>
              {props.overallPercentage}% ({props.totalAttended} / {props.totalHeld} Lectures)
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Issue Timestamp:</Text>
            <Text style={styles.value}>{props.generatedDate}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={{ fontSize: 11, fontWeight: "bold", color: "#1E293B", marginBottom: 6 }}>
            Subject-Wise Attendance Breakdown:
          </Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={{ ...styles.colCode, fontWeight: "bold" }}>Code</Text>
              <Text style={{ ...styles.colName, fontWeight: "bold" }}>Subject Name</Text>
              <Text style={{ ...styles.colHeld, fontWeight: "bold" }}>Held</Text>
              <Text style={{ ...styles.colAttended, fontWeight: "bold" }}>Attended</Text>
              <Text style={{ ...styles.colPct, fontWeight: "bold" }}>%</Text>
            </View>
            {props.subjects.map((s, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={styles.colCode}>{s.code}</Text>
                <Text style={styles.colName}>{s.name}</Text>
                <Text style={styles.colHeld}>{s.held}</Text>
                <Text style={styles.colAttended}>{s.attended}</Text>
                <Text style={{ ...styles.colPct, color: s.percent >= 75 ? "#059669" : "#DC2626" }}>
                  {s.percent}%
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <View>
              <Text style={styles.qrNotice}>
                Tamper-Proof Digital Verification URL:
              </Text>
              <Text style={{ ...styles.qrNotice, color: "#0284C7", marginTop: 2 }}>
                {props.verificationUrl}
              </Text>
              <Text style={{ ...styles.qrNotice, marginTop: 4 }}>
                Digitally HMAC-SHA256 Signed by Strict Attend Flow Security Core.
              </Text>
            </View>
            <View style={styles.signatureBox}>
              <Text style={styles.signTitle}>Controller of Examinations</Text>
              <Text style={styles.signDept}>Registrar & Attendance Registry</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );

  return await renderToBuffer(doc);
}
