import logger from '../utils/logger.js';

class ImapService {
  constructor() {
    this.pollInterval = parseInt(process.env.IMAP_POLL_INTERVAL_MS || '10800000', 10);
    this.user = process.env.IMAP_USER;
    if (!this.user) {
      logger.warn('IMAP_USER non configuré');
    }
  }

  async sync() {
    logger.info('IMAP sync started');
    // À implémenter en Phase 6
    throw new Error('Service non encore implémenté - Phase 6');
  }

  async startScheduler() {
    logger.info(`IMAP scheduler started (interval: ${this.pollInterval}ms)`);
    // À implémenter en Phase 6
    throw new Error('Service non encore implémenté - Phase 6');
  }

  async fetchUnseenEmails() {
    logger.debug('Fetching unseen emails');
    // À implémenter en Phase 6
    throw new Error('Service non encore implémenté - Phase 6');
  }
}

export default ImapService;
