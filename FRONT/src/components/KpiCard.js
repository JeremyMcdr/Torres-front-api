import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const KpiCard = ({ title, value, trend, icon }) => {
    const getBorderColor = () => {
        if (trend === 'up') {
            return 'success.main';
        } else if (trend === 'down') {
            return 'error.main';
        }
        return 'grey.500';
    };

    const TrendIcon = () => {
        if (trend === 'up') {
            return <TrendingUpIcon sx={{ color: 'success.main' }} />;
        } else if (trend === 'down') {
            return <TrendingDownIcon sx={{ color: 'error.main' }} />;
        }
        return null;
    };

    return (
        <Card sx={{ borderTop: `4px solid ${getBorderColor()}`, display: 'flex', alignItems: 'center', p: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                <img src={icon} alt={`${title} icon`} style={{ width: '24px', height: '24px' }} />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary">
                    {title}
                </Typography>
                <Typography variant="h5" component="div">
                    {value}
                </Typography>
            </Box>
            <Box sx={{ ml: 1 }}>
                <TrendIcon />
            </Box>
        </Card>
    );
};

export default KpiCard; 