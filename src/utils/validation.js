import { logger } from './logger.js';

export class ValidationService {
  static validateUrl(url) {
    if (!url || typeof url !== 'string') {
      return { isValid: false, error: 'URL is required' };
    }

    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    
    if (!urlPattern.test(url)) {
      return { isValid: false, error: 'Please enter a valid URL' };
    }

    // Add protocol if missing
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    
    return { isValid: true, url: normalizedUrl };
  }

  static validateShortcode(shortcode) {
    if (!shortcode) {
      return { isValid: true }; // Optional field
    }

    if (typeof shortcode !== 'string') {
      return { isValid: false, error: 'Shortcode must be text' };
    }

    if (shortcode.length < 3 || shortcode.length > 20) {
      return { isValid: false, error: 'Shortcode must be 3-20 characters' };
    }

    const shortcodePattern = /^[a-zA-Z0-9_-]+$/;
    if (!shortcodePattern.test(shortcode)) {
      return { isValid: false, error: 'Shortcode can only contain letters, numbers, hyphens, and underscores' };
    }

    return { isValid: true };
  }

  static validateValidity(validity) {
    if (!validity) {
      return { isValid: true, validity: 30 }; // Default 30 minutes
    }

    const validityNum = parseInt(validity, 10);
    
    if (isNaN(validityNum) || validityNum <= 0) {
      return { isValid: false, error: 'Validity must be a positive number' };
    }

    if (validityNum > 43200) { // Max 30 days
      return { isValid: false, error: 'Validity cannot exceed 30 days (43200 minutes)' };
    }

    return { isValid: true, validity: validityNum };
  }

  static generateShortcode() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    logger.debug('Generated shortcode', { shortcode: result });
    return result;
  }
}