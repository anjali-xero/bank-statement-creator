import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import './ContinuousSlider.css';

export default function ContinuousSlider(props) {
  const [value, setValue] = React.useState(25);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    props.setTransactionCount(newValue)
  };

  return (
    <Box className="transaction-slider">
      <h2>Transaction Count: {value}</h2>
      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        <Slider aria-label="TransactionCount" value={value} onChange={handleChange} />
      </Stack>
    </Box>
  );
}