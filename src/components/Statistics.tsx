import React, { Component } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  Card,
  CardContent,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert
} from '@mui/material';
import {
  ExpandMore,
  Link as LinkIcon,
  TrendingUp,
  Schedule,
  Mouse
} from '@mui/icons-material';
import { StorageService } from '../utils/storage.js';
import { logger } from '../utils/logger.js';
import Navigation from './Navigation';

interface StatisticsState {
  urls: any[];
  clicks: any[];
  stats: {
    totalUrls: number;
    totalClicks: number;
    activeUrls: number;
    expiredUrls: number;
  };
}

class Statistics extends Component<{}, StatisticsState> {
  constructor(props: {}) {
    super(props);
    
    this.state = {
      urls: [],
      clicks: [],
      stats: {
        totalUrls: 0,
        totalClicks: 0,
        activeUrls: 0,
        expiredUrls: 0
      }
    };

    this.loadData = this.loadData.bind(this);
    this.getClicksForUrl = this.getClicksForUrl.bind(this);
    this.isUrlExpired = this.isUrlExpired.bind(this);
    this.formatDate = this.formatDate.bind(this);
  }

  componentDidMount() {
    this.loadData();
    logger.info('Statistics component mounted');
  }

  loadData() {
    const urls = StorageService.getUrls() || [];
    const clicks = StorageService.getClicks() || [];
    
    const now = new Date();
    const activeUrls = urls.filter((url: any) => new Date(url.expiresAt) > now).length;
    const expiredUrls = urls.length - activeUrls;
    
    const stats = {
      totalUrls: urls.length,
      totalClicks: clicks.length,
      activeUrls,
      expiredUrls
    };

    this.setState({ urls, clicks, stats });
    logger.info('Statistics data loaded', stats);
  }

  getClicksForUrl(shortcode: string) {
    return this.state.clicks.filter(click => click.shortcode === shortcode);
  }

  isUrlExpired(expiresAt: string) {
    return new Date(expiresAt) <= new Date();
  }

  formatDate(dateString: string) {
    return new Date(dateString).toLocaleString();
  }

  getStatusChip(url: any) {
    const isExpired = this.isUrlExpired(url.expiresAt);
    return (
      <Chip
        label={isExpired ? 'Expired' : 'Active'}
        color={isExpired ? 'error' : 'success'}
        size="small"
      />
    );
  }

  render() {
    console.log("Statistics render", this.state);
    const { urls, stats } = this.state;

    return (
      <div>
        <Navigation currentPage="statistics" />
        
        <Container maxWidth="lg">
          {/* Statistics Overview */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={3}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <LinkIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
                  <Typography variant="h4" color="primary">
                    {stats.totalUrls}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total URLs
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={3}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Mouse sx={{ fontSize: 40, color: '#00796b', mb: 1 }} />
                  <Typography variant="h4" color="#00796b">
                    {stats.totalClicks}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Clicks
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={3}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingUp sx={{ fontSize: 40, color: '#388e3c', mb: 1 }} />
                  <Typography variant="h4" color="success.main">
                    {stats.activeUrls}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active URLs
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={3}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Schedule sx={{ fontSize: 40, color: '#f44336', mb: 1 }} />
                  <Typography variant="h4" color="error">
                    {stats.expiredUrls}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Expired URLs
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* URLs Table */}
          <Paper elevation={3}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
                URL Statistics
              </Typography>
              
              {urls.length === 0 ? (
                <Alert severity="info">
                  No URLs found. Create some shortened URLs first!
                </Alert>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell><strong>Short URL</strong></TableCell>
                        <TableCell><strong>Original URL</strong></TableCell>
                        <TableCell><strong>Clicks</strong></TableCell>
                        <TableCell><strong>Created</strong></TableCell>
                        <TableCell><strong>Expires</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Click Details</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {urls.map((url) => {
                        const urlClicks = this.getClicksForUrl(url.shortcode);
                        
                        return (
                          <TableRow key={url.id} hover>
                            <TableCell>
                              <Chip
                                label={url.shortcode}
                                color="primary"
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  maxWidth: 200,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                                title={url.longUrl}
                              >
                                {url.longUrl}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={urlClicks.length}
                                color={urlClicks.length > 0 ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{this.formatDate(url.createdAt)}</TableCell>
                            <TableCell>{this.formatDate(url.expiresAt)}</TableCell>
                            <TableCell>{this.getStatusChip(url)}</TableCell>
                            <TableCell>
                              {urlClicks.length > 0 ? (
                                <Accordion>
                                  <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Typography variant="body2">
                                      View {urlClicks.length} click{urlClicks.length > 1 ? 's' : ''}
                                    </Typography>
                                  </AccordionSummary>
                                  <AccordionDetails>
                                    <List dense>
                                      {urlClicks.map((click: any, index: number) => (
                                        <div key={index}>
                                          <ListItem>
                                            <ListItemText
                                              primary={`Click ${index + 1}`}
                                              secondary={
                                                <div>
                                                  <Typography variant="caption" display="block">
                                                    <strong>Time:</strong> {this.formatDate(click.timestamp)}
                                                  </Typography>
                                                  <Typography variant="caption" display="block">
                                                    <strong>Source:</strong> {click.source}
                                                  </Typography>
                                                  <Typography variant="caption" display="block">
                                                    <strong>Browser:</strong> {click.userAgent ? click.userAgent.slice(0, 50) + '...' : 'Unknown'}
                                                  </Typography>
                                                </div>
                                              }
                                            />
                                          </ListItem>
                                          {index < urlClicks.length - 1 && <Divider />}
                                        </div>
                                      ))}
                                    </List>
                                  </AccordionDetails>
                                </Accordion>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  No clicks yet
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Paper>
        </Container>
      </div>
    );
  }
}

export default Statistics;