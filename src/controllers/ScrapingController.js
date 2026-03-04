import ScrapingService from '../services/ScrapingService.js';
import GooglePlacesService from '../services/GooglePlacesService.js';
import logger from '../utils/logger.js';

class ScrapingController {
  constructor() {
    this.scrapingService = new ScrapingService();
    this.placesService = new GooglePlacesService(process.env.GOOGLE_PLACES_API_KEY);
  }

  /**
   * Scrape emails from websites
   * POST /api/scrape-emails
   * Body: { keyword, location, radius }
   */
  async scrapeEmails(req, res) {
    try {
      const { keyword, location = 'France', radius = 100 } = req.body;

      if (!keyword || keyword.trim() === '') {
        return res.status(400).json({
          error: 'Keyword is required',
          status: 'error',
        });
      }

      logger.info(`🔎 Scraping emails for: ${keyword} in ${location}`);

      // Step 1: Search for companies
      const companies = await this.placesService.comprehensiveSearch(
        keyword,
        location,
        radius
      );

      if (companies.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'No companies found',
          results: [],
        });
      }

      logger.info(`📍 Found ${companies.length} companies, now scraping websites`);

      // Step 2: Extract websites
      const websites = companies
        .filter(c => c.website && c.website.startsWith('http'))
        .map(c => c.website);

      if (websites.length === 0) {
        return res.status(200).json({
          status: 'partial',
          message: 'No websites found for scraping',
          companies,
          results: [],
        });
      }

      // Step 3: Scrape emails from websites
      const emailResults = [];
      for (let i = 0; i < companies.length; i++) {
        const company = companies[i];
        if (company.website) {
          const emails = await this.scrapingService.scrapeEmail(company.website);
          if (emails.length > 0) {
            emailResults.push({
              company: company.name,
              address: company.address,
              phone: company.phone,
              website: company.website,
              emails,
              found: emails.length,
            });
          }
          // Respectful delay
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      logger.info(`✅ Email scraping complete: ${emailResults.length} companies with emails`);

      return res.status(200).json({
        status: 'success',
        keyword,
        location,
        totalCompanies: companies.length,
        companiesWithEmails: emailResults.length,
        results: emailResults,
      });
    } catch (error) {
      logger.error('❌ Scraping controller error', {
        error: error.message,
      });

      return res.status(500).json({
        error: 'Scraping failed',
        status: 'error',
        message: error.message,
      });
    }
  }

  /**
   * Scrape emails from a single URL
   * POST /api/scrape-url
   * Body: { url }
   */
  async scrapeUrl(req, res) {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({
          error: 'URL is required',
          status: 'error',
        });
      }

      logger.info(`🔍 Scraping URL: ${url}`);

      const emails = await this.scrapingService.scrapeEmail(url);

      return res.status(200).json({
        status: 'success',
        url,
        emails,
        found: emails.length,
      });
    } catch (error) {
      logger.error('❌ URL scraping error', {
        error: error.message,
      });

      return res.status(500).json({
        error: 'URL scraping failed',
        status: 'error',
        message: error.message,
      });
    }
  }
}

export default ScrapingController;
