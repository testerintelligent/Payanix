// Definitions shared by the PRISM entry form and the PRISM summary page.

export const PRISM_API_URL = `${process.env.REACT_APP_API_BASE_URL}/api/prism`;

export const activityTypes = ["Practice", "Assessment", "Mentoring"];
export const attendanceOptions = ["Present", "Absent"];
export const ratingOptions = [1, 2, 3, 4, 5];

export const ratingFields = [
  { key: "confidence", label: "Confidence" },
  { key: "clarity", label: "Clarity" },
  { key: "sentenceFormation", label: "Sentence Formation" },
  { key: "grammar", label: "Grammar" },
  { key: "pronunciation", label: "Pronunciation" },
] as const;

export type RatingKey = (typeof ratingFields)[number]["key"];

export interface PrismRecord {
  _id?: string;
  sessionDate: string;
  presenterName: string;
  mentorName: string;
  activityType: string;
  attendance: string;
  // Ratings are kept as strings in the form ("" = not selected) and sent as numbers.
  confidence: string | number;
  clarity: string | number;
  sentenceFormation: string | number;
  grammar: string | number;
  pronunciation: string | number;
  areaOfImprovement: string;
}

// Dates are stored as midnight UTC, so format them in UTC to avoid
// showing the previous day in time zones behind UTC.
export const formatSessionDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { timeZone: "UTC" });
