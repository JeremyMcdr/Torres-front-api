import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useFocusChart } from '../../context/FocusChartContext';

// Import chart types again
import BarChart from '../charts/BarChart';
import LineChart from '../charts/LineChart';
import PieChart from '../charts/PieChart';
import GaugeChart from '../charts/GaugeChart';
import ComparisonChart from '../charts/ComparisonChart';

const ChartFocusDialog = () => {
  const { focusedChartInfo, closeFocusDialog } = useFocusChart();
  const open = Boolean(focusedChartInfo);

  // Destructure directly from focusedChartInfo
  const { type, title, chartProps, chartData, filterDefinition } = focusedChartInfo || {};

  const renderFocusedChart = () => {
    // Use the live chartData passed from the page
    if (!type || !chartProps || !chartData) return null; 

    // Combine base props with live data
    const liveChartProps = { ...chartProps, data: chartData };

    switch (type) {
      case 'bar':
        return <BarChart {...liveChartProps} />;
      case 'line':
        return <LineChart {...liveChartProps} />;
      case 'pie':
        // Assuming PieChart takes similar props
        return <PieChart {...liveChartProps} />;
      case 'gauge':
         // Gauge might need specific prop mapping if `data` is not the primary way it gets value
         // Example: Assuming GaugeChart needs a 'value' prop derived from data 
         // const gaugeValue = liveChartProps.data[0]?.SomeValueField || 0;
         // return <GaugeChart {...liveChartProps} value={gaugeValue} />;
        return <GaugeChart {...liveChartProps} />;
      case 'comparison':
        return <ComparisonChart {...liveChartProps} />;
      default:
        console.warn('Unknown chart type:', type);
        return <div>Type de graphique inconnu</div>;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={closeFocusDialog}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          background: theme => theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 30, 30, 0.9)',
          backdropFilter: 'blur(8px)',
        }
      }}
      sx={{
        backdropFilter: 'blur(5px)',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
          <Box sx={{ fontWeight: 'bold', mr: 2 }}>{title || 'Graphique'}</Box>
          
          {/* Render filters dynamically using LIVE values from filterDefinition */}
          {filterDefinition && filterDefinition.config && (
            <Stack direction="row" spacing={1.5}>
              {filterDefinition.config.map((filter) => (
                <FormControl key={filter.id} sx={{ minWidth: 150 }} size="small">
                  <InputLabel id={`${filter.id}-dialog-label`}>{filter.label}</InputLabel>
                  <Select
                    labelId={`${filter.id}-dialog-label`}
                    value={filter.value} // Use the LIVE value passed in the definition
                    label={filter.label}
                    name={filter.id} 
                    onChange={filterDefinition.onChange} // Use the LIVE onChange handler from the page
                    disabled={!filter.options || filter.options.length === 0}
                  >
                    {/* Render options */}
                    {filter.id !== 'annee' && <MenuItem value=""><em>Tous</em></MenuItem>} 
                    {filter.id === 'annee' && <MenuItem value="all"><em>Toutes</em></MenuItem>}
                    {filter.options?.map((option) => (
                      <MenuItem 
                        key={typeof option === 'object' ? option.value : option}
                        value={typeof option === 'object' ? option.value : option}
                       >
                         {typeof option === 'object' ? option.label : option}
                       </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ))}
            </Stack>
          )}
        </Stack>
        <IconButton
          aria-label="close"
          onClick={closeFocusDialog}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ padding: 2 }}>
        <Box sx={{ height: '65vh', width: '100%' }}> 
           {open ? renderFocusedChart() : null} {/* Render using live data */} 
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ChartFocusDialog; 