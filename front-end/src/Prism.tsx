import React from "react";
import { Box, Typography } from "@mui/material";

const Prism: React.FC = () => {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ color: "#6846C6", fontWeight: 700 }}>
        PRISM
      </Typography>
      <Typography variant="body2" sx={{ color: "#6B7280", mt: 1 }}>
        PRISM page content goes here.
      </Typography>
    </Box>
  );
};

export default Prism;
