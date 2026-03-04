import logger from '../utils/logger.js';

class QuoteParserService {
  constructor() {
    this.minPrice = parseFloat(process.env.QUOTE_MIN_PRICE || '0.01');
    this.maxPrice = parseFloat(process.env.QUOTE_MAX_PRICE || '999999999');
    this.minMoq = parseInt(process.env.QUOTE_MIN_MOQ || '1', 10);
    this.maxMoq = parseInt(process.env.QUOTE_MAX_MOQ || '999999', 10);
  }

  async parseQuoteEmail(email) {
    logger.info(`Parsing quote email from: ${email.from}`);
    // À implémenter en Phase 7
    throw new Error('Service non encore implémenté - Phase 7');
  }

  extractPrices(text) {
    logger.debug('Extracting prices');
    // À implémenter en Phase 7
    throw new Error('Service non encore implémenté - Phase 7');
  }

  extractMoqs(text) {
    logger.debug('Extracting MOQs');
    // À implémenter en Phase 7
    throw new Error('Service non encore implémenté - Phase 7');
  }

  extractDelays(text) {
    logger.debug('Extracting delivery delays');
    // À implémenter en Phase 7
    throw new Error('Service non encore implémenté - Phase 7');
  }
}

export default QuoteParserService;
