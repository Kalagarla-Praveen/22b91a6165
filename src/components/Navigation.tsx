import React, { Component } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Link, BarChart } from '@mui/icons-material';
import { logger } from '../utils/logger.js';

interface NavigationProps {
  currentPage?: string;
}

class Navigation extends Component<NavigationProps> {
  constructor(props: NavigationProps) {
    super(props);
    this.handleNavigation = this.handleNavigation.bind(this);
  }

  handleNavigation(page: string) {
    logger.info('Navigation clicked', { page });
  }

  render() {
    const { currentPage } = this.props;

    return (
      <AppBar position="static" sx={{ bgcolor: '#1976d2', mb: 4 }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Link sx={{ mr: 2, color: 'white' }} />
            <Typography variant="h6" component="div">
              URL Shortener
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              component={RouterLink}
              to="/"
              color="inherit"
              startIcon={<Link />}
              onClick={() => this.handleNavigation('shortener')}
              sx={{
                bgcolor: currentPage === 'shortener' ? 'rgba(255,255,255,0.2)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Shortener
            </Button>
            
            <Button
              component={RouterLink}
              to="/statistics"
              color="inherit"
              startIcon={<BarChart />}
              onClick={() => this.handleNavigation('statistics')}
              sx={{
                bgcolor: currentPage === 'statistics' ? 'rgba(255,255,255,0.2)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Statistics
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
    );
  }
}

export default Navigation;