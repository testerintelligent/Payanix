import React, { useEffect, useState } from "react";
import axios from "axios";
import { Alert, Box, Button, MenuItem, Paper, TextField, Typography } from "@mui/material";
import {
  PRISM_API_URL,
  PrismRecord,
  activityTypes,
  attendanceOptions,
  ratingFields,
  ratingOptions,
} from "./prismShared";

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
  confidence: "",
  clarity: "",
  sentenceFormation: "",
  grammar: "",
  pronunciation: "",
  areaOfImprovement: "",
});

// Converts a record loaded from the API into the form's string-based shape.
const toFormValues = (r: PrismRecord): PrismRecord => ({
  ...emptyForm(),
  ...r,
  sessionDate: r.sessionDate ? r.sessionDate.slice(0, 10) : today(),
  areaOfImprovement: r.areaOfImprovement ?? "",
  ...Object.fromEntries(
    ratingFields.map(({ key }) => [key, r[key] == null ? "" : String(r[key])])
  ),
});

interface PrismProps {
  // When set, the form edits this record instead of creating a new one.
  editingRecord?: PrismRecord | null;
  // Called after an edit is saved or cancelled.
  onEditDone?: () => void;
}

const Prism: React.FC<PrismProps> = ({ editingRecord, onEditDone }) => {
  const isEditing = Boolean(editingRecord?._id);
  const [form, setForm] = useState<PrismRecord>(() =>
    editingRecord ? toFormValues(editingRecord) : emptyForm()
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setForm(editingRecord ? toFormValues(editingRecord) : emptyForm());
    setMessage(null);
  }, [editingRecord]);

  const handleChange =
    (field: keyof PrismRecord) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const isValid =
    form.sessionDate &&
    form.presenterName.trim() &&
    form.mentorName.trim() &&
    form.activityType &&
    form.attendance &&
    ratingFields.every(({ key }) => form[key] !== "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSaving(true);
    setMessage(null);
    const payload = {
      sessionDate: form.sessionDate,
      presenterName: form.presenterName.trim(),
      mentorName: form.mentorName.trim(),
      activityType: form.activityType,
      attendance: form.attendance,
      areaOfImprovement: form.areaOfImprovement.trim(),
      ...Object.fromEntries(ratingFields.map(({ key }) => [key, Number(form[key])])),
    };
    try {
      if (isEditing) {
        await axios.put(`${PRISM_API_URL}/${editingRecord!._id}`, payload);
        onEditDone?.();
        return;
      }
      await axios.post(PRISM_API_URL, payload);
      setMessage({ type: "success", text: "PRISM entry saved." });
      setForm(emptyForm());
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
        {isEditing ? "Edit PRISM Entry" : "PRISM"}
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

        <Typography variant="subtitle2" sx={{ color: "#6846C6", fontWeight: 700, mt: 3, mb: 1.5 }}>
          Ratings (1 = lowest, 5 = highest)
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(5, 1fr)" },
            gap: 2,
          }}
        >
          {ratingFields.map(({ key, label }) => (
            <TextField
              key={key}
              select
              label={label}
              size="small"
              required
              value={form[key]}
              onChange={handleChange(key)}
            >
              {ratingOptions.map((n) => (
                <MenuItem key={n} value={String(n)}>
                  {n}
                </MenuItem>
              ))}
            </TextField>
          ))}
        </Box>

        <TextField
          label="Area of Improvement"
          multiline
          minRows={4}
          fullWidth
          size="small"
          value={form.areaOfImprovement}
          onChange={handleChange("areaOfImprovement")}
          inputProps={{ maxLength: 2000 }}
          helperText={`${form.areaOfImprovement.length}/2000`}
          sx={{ mt: 3 }}
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
          {isEditing ? (
            <Button variant="outlined" onClick={() => onEditDone?.()} disabled={saving}>
              Cancel
            </Button>
          ) : (
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
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={!isValid || saving}
            sx={{ bgcolor: "#6846C6", "&:hover": { bgcolor: "#5636B0" } }}
          >
            {saving ? "Saving..." : isEditing ? "Update" : "Submit"}
          </Button>
        </Box>

        {message && (
          <Alert severity={message.type} sx={{ mt: 2 }} onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default Prism;
