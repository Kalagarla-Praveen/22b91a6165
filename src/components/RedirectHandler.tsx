import React, { Component } from 'react';
import { Container, Paper, Typography, CircularProgress, Alert, Button, Box } from '@mui/material';
import { Link as LinkIcon, Error as ErrorIcon } from '@mui/icons-material';
import { StorageService } from '../utils/storage.js';
import { logger } from '../utils/logger.js';

interface RedirectHandlerProps {
  shortcode: string;
}

interface RedirectHandlerState {
  loading: boolean;
  error: string | null;
  url: any;
}

class RedirectHandler extends Component<RedirectHandlerProps, RedirectHandlerState> {
  constructor(props: RedirectHandlerProps) {
    super(props);
    
    this.state = {
      loading: true,
      error: null,
      url: null
    };

    this.handleRedirect = this.handleRedirect.bind(this);
  }

  componentDidMount() {
    const shortcode = this.props.shortcode;
    this.handleRedirect(shortcode);
  }

  async handleRedirect(shortcode: string) {
    logger.info('Redirect attempt', { shortcode });

    try {
      const url = StorageService.getUrlByShortcode(shortcode);
      
      if (!url) {
        this.setState({
          loading: false,
          error: 'URL not found. This short link may have been removed or never existed.'
        });
        logger.warn('URL not found for shortcode', { shortcode });
        return;
      }

      // Check if URL has expired
      const now = new Date();
      const expiresAt = new Date(url.expiresAt);
      
      if (expiresAt <= now) {
        this.setState({
          loading: false,
          error: 'This link has expired and is no longer valid.'
        });
        logger.warn('Attempted to access expired URL', { shortcode, expiresAt });
        return;
      }

      // Record the click
      StorageService.recordClick(shortcode, {
        source: document.referrer || 'direct',
        timestamp: new Date().toISOString()
      });

      this.setState({ url, loading: false });

      // Redirect after a short delay to show the redirect page
      setTimeout(() => {
        window.location.href = url.longUrl;
        logger.info('Redirect executed', { shortcode, longUrl: url.longUrl });
      }, 2000);

    } catch (error) {
      this.setState({
        loading: false,
        error: 'An error occurred while processing the redirect. Please try again.'
      });
      logger.error('Redirect error', { shortcode, error });
    }
  }

  render() {
    const { loading, error, url } = this.state;
    const { shortcode } = this.props;

    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          {loading ? (
            <Box>
              <CircularProgress size={60} sx={{ mb: 3, color: '#1976d2' }} />
              <Typography variant="h5" gutterBottom>
                Processing Redirect...
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Checking link for: <strong>{shortcode}</strong>
              </Typography>
            </Box>
          ) : error ? (
            <Box>
              <ErrorIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
              <Typography variant="h5" color="error" gutterBottom>
                Link Not Available
              </Typography>
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
              <Button
                variant="contained"
                href="/"
                sx={{ bgcolor: '#1976d2' }}
              >
                Go to Homepage
              </Button>
            </Box>
          ) : (
            <Box>
              <LinkIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" color="success.main" gutterBottom>
                Redirecting...
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Taking you to: <strong>{url.longUrl}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You will be redirected automatically in a moment...
              </Typography>
              
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  href={url.longUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in New Tab
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
    );
  }
}

export default RedirectHandler;