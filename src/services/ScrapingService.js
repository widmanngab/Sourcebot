import axios from 'axios';
import * as cheerio from 'cheerio';
import logger from '../utils/logger.js';

class ScrapingService {
  constructor() {
    this.timeout = parseInt(process.env.SCRAPING_TIMEOUT || '10000', 10);
    this.delay = parseInt(process.env.SCRAPING_DELAY_MS || '3000', 10);
    this.maxParallel = parseInt(process.env.SCRAPING_MAX_PARALLEL || '10', 10);
    
    // Regex patterns for email extraction
    this.emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    this.mailtoRegex = /mailto:([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  }

  /**
   * Scrape emails from a single website
   */
  async scrapeEmail(url) {
    try {
      if (!url || !url.startsWith('http')) {
        logger.warn(`⚠️ Invalid URL: ${url}`);
        return [];
      }

      logger.info(`🔍 Scraping: ${url}`);

      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        maxRedirects: 3,
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Remove script and style tags
      $('script, style').remove();

      const text = $.text();
      const emails = new Set();

      // Extract emails from mailto links
      const mailtoMatches = html.matchAll(this.mailtoRegex);
      for (const match of mailtoMatches) {
        const email = match[1].toLowerCase();
        if (this.isValidEmail(email)) {
          emails.add(email);
        }
      }

      // Extract emails from text content
      const textMatches = text.matchAll(this.emailRegex);
      for (const match of textMatches) {
        const email = match[0].toLowerCase();
        if (this.isValidEmail(email)) {
          emails.add(email);
        }
      }

      // Also check contact page
      if (emails.size === 0) {
        const contactEmails = await this.scrapeContactPage(url);
        contactEmails.forEach(email => emails.add(email));
      }

      const emailArray = Array.from(emails);
      logger.info(`✅ Found ${emailArray.length} emails on ${url}`);

      return emailArray;
    } catch (error) {
      logger.warn(`⚠️ Scraping failed for ${url}: ${error.message}`);
      return [];
    }
  }

  /**
   * Scrape contact page variations
   */
  async scrapeContactPage(baseUrl) {
    try {
      const contactPaths = ['/contact', '/contact-us', '/about', '/team'];
      const emails = new Set();

      for (const path of contactPaths) {
        try {
          const contactUrl = new URL(baseUrl);
          contactUrl.pathname = path;

          const response = await axios.get(contactUrl.toString(), {
            timeout: 5000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          });

          const html = response.data;
          const mailtoMatches = html.matchAll(this.mailtoRegex);

          for (const match of mailtoMatches) {
            const email = match[1].toLowerCase();
            if (this.isValidEmail(email)) {
              emails.add(email);
            }
          }

          const textMatches = html.matchAll(this.emailRegex);
          for (const match of textMatches) {
            const email = match[0].toLowerCase();
            if (this.isValidEmail(email)) {
              emails.add(email);
            }
          }

          if (emails.size > 0) {
            logger.info(`✅ Found emails on ${contactUrl}`);
            break;
          }
        } catch (err) {
          // Silently continue to next path
          continue;
        }
      }

      return Array.from(emails);
    } catch (error) {
      logger.warn(`⚠️ Contact page scraping failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Validate email format
   */
  isValidEmail(email) {
    // Exclude common non-contact emails
    const excludePatterns = [
      'noreply@', 'no-reply@', 'donotreply@',
      'facebook.com', 'twitter.com', 'linkedin.com',
      'example.com', 'test.com',
    ];

    for (const pattern of excludePatterns) {
      if (email.includes(pattern)) {
        return false;
      }
    }

    // Basic email validation
    return email.length > 5 && email.includes('@') && email.includes('.');
  }

  /**
   * Scrape multiple URLs in parallel with delays
   */
  async scrapeMultiple(urls) {
    try {
      logger.info(`🔄 Scraping ${urls.length} URLs (max parallel: ${this.maxParallel})`);

      const results = [];
      const chunks = this.chunkArray(urls, this.maxParallel);

      for (const chunk of chunks) {
        const chunkResults = await Promise.all(
          chunk.map(url => this.scrapeEmail(url))
        );

        results.push(...chunkResults);

        // Delay between batches
        if (chunk.length > 0) {
          await new Promise(resolve => setTimeout(resolve, this.delay));
        }
      }

      logger.info(`✅ Scraping complete: ${results.length} websites processed`);
      return results;
    } catch (error) {
      logger.error('❌ Batch scraping failed', { error: error.message });
      return [];
    }
  }

  /**
   * Helper to split array into chunks
   */
  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Check robots.txt compliance
   */
  async checkRobots(domain) {
    try {
      const robotsUrl = `${domain}/robots.txt`;
      const response = await axios.get(robotsUrl, { timeout: 5000 });
      
      const disallowAll = response.data.includes('Disallow: /');
      if (disallowAll) {
        logger.warn(`⚠️ robots.txt disallows scraping: ${domain}`);
        return false;
      }

      logger.info(`✅ robots.txt allows scraping: ${domain}`);
      return true;
    } catch (error) {
      logger.info(`ℹ️ No robots.txt found (will proceed): ${domain}`);
      return true;
    }
  }
}

export default ScrapingService;
