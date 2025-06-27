import React, { Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UrlShortener from './components/UrlShortener';
import Statistics from './components/Statistics';
import RedirectHandler from './components/RedirectHandler';
import { logger } from './utils/logger.js';

class Router extends Component {
  constructor(props: any) {
    super(props);
    this.handleRouteChange = this.handleRouteChange.bind(this);
  }

  componentDidMount() {
    logger.info('Router initialized');
  }

  handleRouteChange(path: string) {
    logger.info('Route changed', { path });
  }

  render() {
    return (
      <BrowserRouter>
        <Routes>
          {/* Default route - redirect to shortener */}
          <Route path="/" element={<Navigate to="/shortener" replace />} />
          
          {/* Main application routes */}
          <Route path="/shortener" element={<UrlShortener />} />
          <Route path="/statistics" element={<Statistics />} />
          
          {/* Dynamic redirect route for shortened URLs */}
          <Route 
            path="/:shortcode" 
            element={<RedirectRouteHandler />}
          />
          
          {/* Catch-all route for 404s */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    );
  }
}

// Component to handle redirect routes
class RedirectRouteHandler extends Component {
  render() {
    // Extract shortcode from URL
    const shortcode = window.location.pathname.slice(1);
    return <RedirectHandler shortcode={shortcode} />;
  }
}

// Simple 404 component
class NotFound extends Component {
  render() {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column'
      }}>
        <h1 style={{ color: '#1976d2' }}>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <a href="/" style={{ color: '#1976d2', textDecoration: 'none' }}>
          Go back to Homepage
        </a>
      </div>
    );
  }
}

export default Router;