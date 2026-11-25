import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { PRISM_API_URL, PrismRecord, formatSessionDate, ratingFields } from "./prismShared";

interface PrismSummaryProps {
  onEdit: (record: PrismRecord) => void;
}

const PrismSummary: React.FC<PrismSummaryProps> = ({ onEdit }) => {
  const [records, setRecords] = useState<PrismRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viewing, setViewing] = useState<PrismRecord | null>(null);

  useEffect(() => {
    axios
      .get<PrismRecord[]>(PRISM_API_URL)
      .then((res) => setRecords(res.data))
      .catch(() => setError("Could not load PRISM records."));
  }, []);

  const detailRows: [string, React.ReactNode][] = viewing
    ? [
        ["Session Date", formatSessionDate(viewing.sessionDate)],
        ["Presenter Name", viewing.presenterName],
        ["Mentor Name", viewing.mentorName],
        ["Activity Type", viewing.activityType],
        ["Attendance", viewing.attendance],
        ...ratingFields.map(
          ({ key, label }) => [label, viewing[key] ?? "-"] as [string, React.ReactNode]
        ),
        ["Area of Improvement", viewing.areaOfImprovement || "-"],
      ]
    : [];

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ color: "#6846C6", fontWeight: 700, mb: 2 }}>
        PRISM Summary
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 3, border: "1px solid #E7E3F1" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Session Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Presenter Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Mentor Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Activity Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Attendance</TableCell>
              {ratingFields.map(({ key, label }) => (
                <TableCell key={key} sx={{ fontWeight: 700 }} align="center">
                  {label}
                </TableCell>
              ))}
              <TableCell sx={{ fontWeight: 700 }}>Area of Improvement</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7 + ratingFields.length} align="center" sx={{ color: "#6B7280" }}>
                  No PRISM entries yet
                </TableCell>
              </TableRow>
            ) : (
              records.map((r) => (
                <TableRow key={r._id} hover>
                  <TableCell>{formatSessionDate(r.sessionDate)}</TableCell>
                  <TableCell>{r.presenterName}</TableCell>
                  <TableCell>{r.mentorName}</TableCell>
                  <TableCell>{r.activityType}</TableCell>
                  <TableCell>{r.attendance}</TableCell>
                  {ratingFields.map(({ key }) => (
                    <TableCell key={key} align="center">
                      {r[key] ?? "-"}
                    </TableCell>
                  ))}
                  <TableCell
                    sx={{
                      minWidth: 200,
                      maxWidth: 320,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {r.areaOfImprovement || "-"}
                  </TableCell>
                  <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    <Tooltip title="View">
                      <IconButton size="small" onClick={() => setViewing(r)} sx={{ color: "#6846C6" }}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => onEdit(r)} sx={{ color: "#6846C6" }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={Boolean(viewing)} onClose={() => setViewing(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: "#6846C6", fontWeight: 700 }}>PRISM Entry</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gridTemplateColumns: "max-content 1fr", columnGap: 3, rowGap: 1.25 }}>
            {detailRows.map(([label, value]) => (
              <React.Fragment key={label}>
                <Typography variant="body2" sx={{ color: "#6B7280", fontWeight: 600 }}>
                  {label}
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {value}
                </Typography>
              </React.Fragment>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              const r = viewing!;
              setViewing(null);
              onEdit(r);
            }}
            startIcon={<EditIcon />}
          >
            Edit
          </Button>
          <Button onClick={() => setViewing(null)} variant="contained" sx={{ bgcolor: "#6846C6", "&:hover": { bgcolor: "#5636B0" } }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PrismSummary;
