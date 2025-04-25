import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const KpiCard = ({ title, value, icon, color = 'primary.main', unit = '', trend = null }) => {
  const trendColor = trend > 0 ? 'success.main' : trend < 0 ? 'error.main' : 'text.secondary';
  const TrendIcon = trend > 0 ? ArrowUpwardIcon : trend < 0 ? ArrowDownwardIcon : null;

  return (
    <Card sx={{ display: 'flex', alignItems: 'center', p: 1.5, borderTop: `4px solid ${color}` }}>
      {/* Icon Box */}
      {icon && (
        <Box
          sx={{
            bgcolor: color,
            minWidth: 50,
            height: 50,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2,
            color: 'common.white', // Ensure icon is visible on colored background
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      )}

      {/* Content Area */}
      <Box sx={{ flexGrow: 1 }}>
        <CardContent sx={{ p: '0 !important' }}> {/* Remove CardContent default padding */}
          {/* Title */}
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>

          {/* Value and Unit */}
          <Stack direction="row" alignItems="baseline" spacing={0.5}>
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              {value}
            </Typography>
            {unit && (
              <Typography variant="caption" color="text.secondary">
                {unit}
              </Typography>
            )}
          </Stack>

          {/* Trend */}
          {trend !== null && TrendIcon && (
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: trendColor, mt: 0.5 }}>
              <TrendIcon sx={{ fontSize: '1rem' }} />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                {Math.abs(trend)}%
              </Typography>
            </Stack>
          )}
        </CardContent>
      </Box>
    </Card>
  );
};

export default KpiCard; 