import EmailService from '../services/EmailService.js';
import logger from '../utils/logger.js';

class EmailController {
  constructor() {
    this.emailService = new EmailService();
  }

  /**
   * Send quote request email to a company
   * POST /api/send-quote
   * Body: { company, userEmail, subject, message, keyword, description, budget, deadline }
   */
  async sendQuote(req, res) {
    try {
      const { company, userEmail, keyword, description, budget, deadline } = req.body;

      if (!company) {
        return res.status(400).json({
          error: 'Company data is required',
          status: 'error',
        });
      }

      logger.info(`📧 Sending quote request to: ${company.company}`);

      const result = await this.emailService.sendQuoteRequest(company, {
        userEmail: userEmail || 'contact@sourcebot.fr',
        keyword: keyword || 'Projet',
        description: description || '',
        budget: budget || 'À définir',
        deadline: deadline || 'À définir',
      });

      if (result.success) {
        return res.status(200).json({
          status: 'success',
          message: `Email sent successfully to ${result.email}`,
          result,
        });
      }

      return res.status(400).json({
        status: 'error',
        message: result.error,
        result,
      });
    } catch (error) {
      logger.error('❌ Error in sendQuote:', error);
      return res.status(500).json({
        error: 'Failed to send email',
        status: 'error',
        message: error.message,
      });
    }
  }

  /**
   * Send batch quote requests to multiple companies
   * POST /api/send-batch
   * Body: { companies, userEmail, keyword, description, budget, deadline }
   */
  async sendBatch(req, res) {
    try {
      const { companies, userEmail, keyword, description, budget, deadline } = req.body;

      if (!companies || !Array.isArray(companies) || companies.length === 0) {
        return res.status(400).json({
          error: 'Companies array is required',
          status: 'error',
        });
      }

      logger.info(
        `📧 Sending batch quote requests to ${companies.length} companies`
      );

      const results = await this.emailService.sendBatch(companies, {
        userEmail: userEmail || 'contact@sourcebot.fr',
        keyword: keyword || 'Projet',
        description: description || '',
        budget: budget || 'À définir',
        deadline: deadline || 'À définir',
      });

      return res.status(200).json({
        status: 'success',
        message: `Batch send completed: ${results.sent.length} sent, ${results.failed.length} failed`,
        results,
      });
    } catch (error) {
      logger.error('❌ Error in sendBatch:', error);
      return res.status(500).json({
        error: 'Failed to send batch',
        status: 'error',
        message: error.message,
      });
    }
  }

  /**
   * Send quote requests to all companies from search results
   * POST /api/send-to-search-results
   * Body: { searchResults, userEmail, keyword, description, budget, deadline }
   */
  async sendToSearchResults(req, res) {
    try {
      const {
        searchResults,
        userEmail,
        keyword,
        description,
        budget,
        deadline,
      } = req.body;

      if (!searchResults) {
        return res.status(400).json({
          error: 'Search results are required',
          status: 'error',
        });
      }

      // Filter companies that have emails
      const companiesWithEmails = searchResults.filter(
        (c) => c.emails && c.emails.length > 0
      );

      if (companiesWithEmails.length === 0) {
        return res.status(400).json({
          error: 'No companies with emails found in results',
          status: 'error',
        });
      }

      logger.info(
        `📧 Sending quote requests to ${companiesWithEmails.length} companies from search results`
      );

      const results = await this.emailService.sendBatch(companiesWithEmails, {
        userEmail: userEmail || 'contact@sourcebot.fr',
        keyword: keyword || 'Projet',
        description: description || '',
        budget: budget || 'À définir',
        deadline: deadline || 'À définir',
      });

      return res.status(200).json({
        status: 'success',
        message: `Emails sent to ${results.sent.length}/${companiesWithEmails.length} companies`,
        results,
      });
    } catch (error) {
      logger.error('❌ Error in sendToSearchResults:', error);
      return res.status(500).json({
        error: 'Failed to send emails to search results',
        status: 'error',
        message: error.message,
      });
    }
  }
}

export default EmailController;
