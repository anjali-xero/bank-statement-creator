import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import './ContinuousSlider.css';

export default function NoiseSlider(props) {
  const [value, setValue] = React.useState(10);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    props.setNoiseIntensity(newValue)
  };

  return (
    <Box className="transaction-slider">
      <h2>Noise Intensity: {value/10}{(value/10 > 3) ? <h5 className="warning-noise-message">(This document likely wont extract with this level of noise)</h5> : ""}</h2>
      <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
        {props.disabled ? 
          <Slider 
          disabled
          aria-label="TransactionCount" 
          value={value}
          marks
          step={10}
          min={10}
          max={100}
          onChange={handleChange} /> :
          <Slider 
          aria-label="TransactionCount" 
          value={value}
          marks
          step={10}
          min={10}
          max={100}
          onChange={handleChange}
          color="secondary" />}
      </Stack>
    </Box>
  );
}