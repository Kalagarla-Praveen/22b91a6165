import React, { Component } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Box,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Add,
  Remove,
  ContentCopy,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';
import { ValidationService } from '../utils/validation.js';
import { StorageService } from '../utils/storage.js';
import { logger } from '../utils/logger.js';
import Navigation from './Navigation';

interface UrlData {
  id: number;
  longUrl: string;
  shortcode: string;
  validity: string;
  error: string;
  result: any;
}

interface UrlShortenerState {
  urls: UrlData[];
  isSubmitting: boolean;
  successMessage: string;
  globalError: string;
}

class UrlShortener extends Component<{}, UrlShortenerState> {
  constructor(props: {}) {
    super(props);
    
    this.state = {
      urls: [
        { id: 1, longUrl: '', shortcode: '', validity: '', error: '', result: null }
      ],
      isSubmitting: false,
      successMessage: '',
      globalError: ''
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.addUrlField = this.addUrlField.bind(this);
    this.removeUrlField = this.removeUrlField.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.copyToClipboard = this.copyToClipboard.bind(this);
    this.resetForm = this.resetForm.bind(this);
  }

  componentDidMount() {
    logger.info('URL Shortener component mounted');
  }

  handleInputChange(id: number, field: keyof UrlData, value: string) {
    this.setState(prevState => ({
      urls: prevState.urls.map(url =>
        url.id === id ? { ...url, [field]: value, error: '' } : url
      ),
      globalError: '',
      successMessage: ''
    }));
  }

  addUrlField() {
    if (this.state.urls.length >= 5) {
      this.setState({ globalError: 'Maximum 5 URLs allowed' });
      logger.warn('Attempted to add more than 5 URLs');
      return;
    }

    const newId = Math.max(...this.state.urls.map(u => u.id)) + 1;
    this.setState(prevState => ({
      urls: [...prevState.urls, {
        id: newId,
        longUrl: '',
        shortcode: '',
        validity: '',
        error: '',
        result: null
      }]
    }));
    
    logger.info('URL field added', { totalFields: this.state.urls.length + 1 });
  }

  removeUrlField(id: number) {
    if (this.state.urls.length <= 1) {
      logger.warn('Attempted to remove last URL field');
      return;
    }

    this.setState(prevState => ({
      urls: prevState.urls.filter(url => url.id !== id)
    }));
    
    logger.info('URL field removed', { removedId: id });
  }

  validateUrls() {
    const { urls } = this.state;
    let hasErrors = false;
    const updatedUrls = urls.map(url => {
      if (!url.longUrl.trim()) {
        return { ...url, error: 'URL is required' };
      }

      // Validate URL
      const urlValidation = ValidationService.validateUrl(url.longUrl);
      if (!urlValidation.isValid) {
        hasErrors = true;
        return { ...url, error: urlValidation.error };
      }

      // Validate shortcode
      const shortcodeValidation = ValidationService.validateShortcode(url.shortcode);
      if (!shortcodeValidation.isValid) {
        hasErrors = true;
        return { ...url, error: shortcodeValidation.error };
      }

      // Validate validity
      const validityValidation = ValidationService.validateValidity(url.validity);
      if (!validityValidation.isValid) {
        hasErrors = true;
        return { ...url, error: validityValidation.error };
      }

      return { ...url, error: '' };
    });

    this.setState({ urls: updatedUrls });
    return !hasErrors;
  }

  checkShortcodeUniqueness(urls: UrlData[]) {
    const existingUrls = StorageService.getUrls();
    const shortcodes = new Set();
    
    for (const url of urls) {
      const shortcode = url.shortcode || ValidationService.generateShortcode();
      
      // Check against existing URLs
      if (existingUrls.some(existing => existing.shortcode === shortcode)) {
        return { isUnique: false, error: `Shortcode "${shortcode}" already exists` };
      }
      
      // Check for duplicates in current batch
      if (shortcodes.has(shortcode)) {
        return { isUnique: false, error: `Duplicate shortcode "${shortcode}" in current batch` };
      }
      
      shortcodes.add(shortcode);
    }
    
    return { isUnique: true };
  }

  async handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    
    if (!this.validateUrls()) {
      logger.warn('Form validation failed');
      return;
    }

    const { urls } = this.state;
    const validUrls = urls.filter(url => url.longUrl.trim());
    
    // Check shortcode uniqueness
    const uniquenessCheck = this.checkShortcodeUniqueness(validUrls);
    if (!uniquenessCheck.isUnique) {
      this.setState({ globalError: uniquenessCheck.error });
      logger.error('Shortcode uniqueness check failed', { error: uniquenessCheck.error });
      return;
    }

    this.setState({ isSubmitting: true, globalError: '', successMessage: '' });
    logger.info('Starting URL shortening process', { urlCount: validUrls.length });

    try {
      const results = validUrls.map(url => {
        const shortcode = url.shortcode || ValidationService.generateShortcode();
        const validity = parseInt(url.validity) || 30;
        const expiresAt = new Date(Date.now() + validity * 60000);
        
        const urlData = {
          id: Date.now() + Math.random(),
          longUrl: ValidationService.validateUrl(url.longUrl).url,
          shortcode,
          validity,
          createdAt: new Date().toISOString(),
          expiresAt: expiresAt.toISOString(),
          clickCount: 0
        };

        StorageService.saveUrl(urlData);
        
        return {
          ...url,
          result: {
            shortUrl: `${window.location.origin}/${shortcode}`,
            shortcode,
            expiresAt: expiresAt.toLocaleString(),
            longUrl: urlData.longUrl
          }
        };
      });

      this.setState({
        urls: results,
        isSubmitting: false,
        successMessage: `Successfully shortened ${results.length} URL${results.length > 1 ? 's' : ''}!`
      });

      logger.info('URLs shortened successfully', { count: results.length });
    } catch (error) {
      this.setState({
        isSubmitting: false,
        globalError: 'Failed to shorten URLs. Please try again.'
      });
      logger.error('URL shortening failed', error);
    }
  }

  async copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      logger.info('URL copied to clipboard', { url: text });
    } catch (error) {
      logger.error('Failed to copy to clipboard', error);
    }
  }

  resetForm() {
    this.setState({
      urls: [
        { id: 1, longUrl: '', shortcode: '', validity: '', error: '', result: null }
      ],
      successMessage: '',
      globalError: ''
    });
    logger.info('Form reset');
  }

  render() {
    const { urls, isSubmitting, successMessage, globalError } = this.state;

    return (
      <div>
        <Navigation currentPage="shortener" />
        
        <Container maxWidth="lg">
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', color: '#1976d2', fontWeight: 'bold' }}>
              URL Shortener
            </Typography>
            
            <Typography variant="body1" sx={{ textAlign: 'center', mb: 4, color: 'text.secondary' }}>
              Shorten up to 5 URLs at once with custom shortcodes and expiration times
            </Typography>

            {globalError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {globalError}
              </Alert>
            )}

            {successMessage && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {successMessage}
              </Alert>
            )}

            <form onSubmit={this.handleSubmit}>
              <Grid container spacing={3}>
                {urls.map((url, index) => (
                  <Grid item xs={12} key={url.id}>
                    <Card elevation={2} sx={{ bgcolor: '#fafafa' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" color="primary">
                            URL #{index + 1}
                          </Typography>
                          
                          {urls.length > 1 && (
                            <IconButton
                              onClick={() => this.removeUrlField(url.id)}
                              color="error"
                              size="small"
                            >
                              <Remove />
                            </IconButton>
                          )}
                        </Box>

                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Long URL *"
                              value={url.longUrl}
                              onChange={(e) => this.handleInputChange(url.id, 'longUrl', e.target.value)}
                              error={!!url.error}
                              helperText={url.error || 'Enter the URL you want to shorten'}
                              placeholder="https://example.com/very-long-url"
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={3}>
                            <TextField
                              fullWidth
                              label="Custom Shortcode"
                              value={url.shortcode}
                              onChange={(e) => this.handleInputChange(url.id, 'shortcode', e.target.value)}
                              helperText="Optional (3-20 chars)"
                              placeholder="my-link"
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={3}>
                            <TextField
                              fullWidth
                              label="Validity (minutes)"
                              type="number"
                              value={url.validity}
                              onChange={(e) => this.handleInputChange(url.id, 'validity', e.target.value)}
                              helperText="Default: 30 minutes"
                              placeholder="30"
                            />
                          </Grid>
                        </Grid>

                        {url.result && (
                          <Box sx={{ mt: 3, p: 2, bgcolor: '#e8f5e8', borderRadius: 1 }}>
                            <Typography variant="subtitle2" color="success.main" gutterBottom>
                              ✅ URL Shortened Successfully!
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                Short URL:
                              </Typography>
                              <Chip
                                label={url.result.shortUrl}
                                color="primary"
                                size="small"
                                onClick={() => this.copyToClipboard(url.result.shortUrl)}
                                deleteIcon={<ContentCopy />}
                                onDelete={() => this.copyToClipboard(url.result.shortUrl)}
                              />
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary">
                              Expires: {url.result.expiresAt}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                {urls.length < 5 && (
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={this.addUrlField}
                    sx={{ minWidth: 150 }}
                  >
                    Add URL
                  </Button>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{ minWidth: 150, bgcolor: '#1976d2' }}
                >
                  {isSubmitting ? 'Shortening...' : 'Shorten URLs'}
                </Button>

                <Button
                  variant="text"
                  onClick={this.resetForm}
                  sx={{ minWidth: 150 }}
                >
                  Reset Form
                </Button>
              </Box>
            </form>
          </Paper>
        </Container>
      </div>
    );
  }
}

export default UrlShortener;