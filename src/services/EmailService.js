import logger from '../utils/logger.js';

class EmailService {
  constructor() {
    this.fromEmail = process.env.MAILJET_FROM_EMAIL;
    this.fromName = process.env.MAILJET_FROM_NAME || 'SourceBot';
    if (!this.fromEmail) {
      logger.warn('MAILJET_FROM_EMAIL non configuré');
    }
  }

  async sendQuoteRequest(company, request) {
    logger.info(`Sending quote request to: ${company.email}`);
    // À implémenter en Phase 5
    throw new Error('Service non encore implémenté - Phase 5');
  }

  async sendBatch(companies, request) {
    logger.info(`Sending batch emails to ${companies.length} companies`);
    // À implémenter en Phase 5
    throw new Error('Service non encore implémenté - Phase 5');
  }

  async composeMail(company, request) {
    logger.debug(`Composing email for: ${company.name}`);
    // À implémenter en Phase 5
    throw new Error('Service non encore implémenté - Phase 5');
  }
}

export default EmailService;
