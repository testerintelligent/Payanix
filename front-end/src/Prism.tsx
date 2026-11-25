import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

const API_URL = `${process.env.REACT_APP_API_BASE_URL}/api/prism`;

const activityTypes = ["Practice", "Assessment", "Mentoring"];
const attendanceOptions = ["Present", "Absent"];

interface PrismRecord {
  _id?: string;
  sessionDate: string;
  presenterName: string;
  mentorName: string;
  activityType: string;
  attendance: string;
}

// Today's date as YYYY-MM-DD in the user's local time zone
// (toISOString() would use UTC and can be off by a day).
const today = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const emptyForm = (): PrismRecord => ({
  sessionDate: today(),
  presenterName: "",
  mentorName: "",
  activityType: "",
  attendance: "",
});

const Prism: React.FC = () => {
  const [form, setForm] = useState<PrismRecord>(emptyForm);
  const [records, setRecords] = useState<PrismRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchRecords = async () => {
    try {
      const res = await axios.get<PrismRecord[]>(API_URL);
      setRecords(res.data);
    } catch {
      setMessage({ type: "error", text: "Could not load PRISM records." });
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleChange =
    (field: keyof PrismRecord) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const isValid =
    form.sessionDate &&
    form.presenterName.trim() &&
    form.mentorName.trim() &&
    form.activityType &&
    form.attendance;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSaving(true);
    setMessage(null);
    try {
      await axios.post(API_URL, {
        ...form,
        presenterName: form.presenterName.trim(),
        mentorName: form.mentorName.trim(),
      });
      setMessage({ type: "success", text: "PRISM entry saved." });
      setForm(emptyForm());
      fetchRecords();
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.response?.data?.error || "Could not save PRISM entry.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ color: "#6846C6", fontWeight: 700, mb: 2 }}>
        PRISM
      </Typography>

      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: "1px solid #E7E3F1",
          boxShadow: "0 4px 24px rgba(0, 106, 113, 0.08)",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(5, 1fr)" },
            gap: 2,
          }}
        >
          <TextField
            label="Session Date"
            type="date"
            size="small"
            required
            value={form.sessionDate}
            onChange={handleChange("sessionDate")}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Presenter Name"
            size="small"
            required
            value={form.presenterName}
            onChange={handleChange("presenterName")}
          />
          <TextField
            label="Mentor Name"
            size="small"
            required
            value={form.mentorName}
            onChange={handleChange("mentorName")}
          />
          <TextField
            select
            label="Activity Type"
            size="small"
            required
            value={form.activityType}
            onChange={handleChange("activityType")}
          >
            {activityTypes.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Attendance"
            size="small"
            required
            value={form.attendance}
            onChange={handleChange("attendance")}
          >
            {attendanceOptions.map((a) => (
              <MenuItem key={a} value={a}>
                {a}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
          <Button
            variant="outlined"
            onClick={() => {
              setForm(emptyForm());
              setMessage(null);
            }}
            disabled={saving}
          >
            Clear
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!isValid || saving}
            sx={{ bgcolor: "#6846C6", "&:hover": { bgcolor: "#5636B0" } }}
          >
            {saving ? "Saving..." : "Submit"}
          </Button>
        </Box>

        {message && (
          <Alert severity={message.type} sx={{ mt: 2 }} onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 3, border: "1px solid #E7E3F1" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Session Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Presenter Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Mentor Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Activity Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Attendance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: "#6B7280" }}>
                  No PRISM entries yet
                </TableCell>
              </TableRow>
            ) : (
              records.map((r) => (
                <TableRow key={r._id}>
                  <TableCell>{new Date(r.sessionDate).toLocaleDateString(undefined, { timeZone: "UTC" })}</TableCell>
                  <TableCell>{r.presenterName}</TableCell>
                  <TableCell>{r.mentorName}</TableCell>
                  <TableCell>{r.activityType}</TableCell>
                  <TableCell>{r.attendance}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Prism;
