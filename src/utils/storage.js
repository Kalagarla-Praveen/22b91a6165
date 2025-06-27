import { logger } from './logger.js';

// Local storage utility for persisting data
export class StorageService {
  static URLS_KEY = 'shortened_urls';
  static CLICKS_KEY = 'url_clicks';

  static saveUrl(urlData) {
    try {
      const urls = this.getUrls();
      urls.push(urlData);
      localStorage.setItem(this.URLS_KEY, JSON.stringify(urls));
      logger.info('URL saved to storage', { shortcode: urlData.shortcode });
      return true;
    } catch (error) {
      logger.error('Failed to save URL to storage', error);
      return false;
    }
  }

  static getUrls() {
    try {
      const urls = localStorage.getItem(this.URLS_KEY);
      return urls ? JSON.parse(urls) : [];
    } catch (error) {
      logger.error('Failed to retrieve URLs from storage', error);
      return [];
    }
  }

  static getUrlByShortcode(shortcode) {
    const urls = this.getUrls();
    return urls.find(url => url.shortcode === shortcode);
  }

  static recordClick(shortcode, clickData) {
    try {
      const clicks = this.getClicks();
      const clickEntry = {
        shortcode,
        timestamp: new Date().toISOString(),
        source: clickData.source || 'direct',
        userAgent: navigator.userAgent,
        ...clickData
      };
      
      clicks.push(clickEntry);
      localStorage.setItem(this.CLICKS_KEY, JSON.stringify(clicks));
      logger.info('Click recorded', { shortcode, source: clickData.source });
      return true;
    } catch (error) {
      logger.error('Failed to record click', error);
      return false;
    }
  }

  static getClicks() {
    try {
      const clicks = localStorage.getItem(this.CLICKS_KEY);
      return clicks ? JSON.parse(clicks) : [];
    } catch (error) {
      logger.error('Failed to retrieve clicks from storage', error);
      return [];;
    }
  }

  static getClicksForUrl(shortcode) {
    const allClicks = this.getClicks();
    return allClicks.filter(click => click.shortcode === shortcode);
  }
}