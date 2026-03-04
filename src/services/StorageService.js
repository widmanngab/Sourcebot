import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class StorageService {
  constructor() {
    this.dataDir = path.join(__dirname, '../../data');
    this.companiesFile = path.join(this.dataDir, 'companies.json');
    this.quotesFile = path.join(this.dataDir, 'quotes.json');
    this.emailsFile = path.join(this.dataDir, 'received-emails.json');
  }

  async initializeStorage() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      for (const file of [this.companiesFile, this.quotesFile, this.emailsFile]) {
        try {
          await fs.access(file);
        } catch {
          await fs.writeFile(file, JSON.stringify([], null, 2));
          logger.info(`Created file: ${file}`);
        }
      }
    } catch (error) {
      logger.error('Storage initialization failed:', error);
    }
  }

  async saveCompanies(companies) {
    logger.debug(`Saving ${companies.length} companies`);
    // À implémenter en Phase 7
    throw new Error('Service non encore implémenté - Phase 7');
  }

  async loadCompanies() {
    logger.debug('Loading companies');
    // À implémenter en Phase 7
    throw new Error('Service non encore implémenté - Phase 7');
  }

  async saveQuotes(quotes) {
    logger.debug(`Saving ${quotes.length} quotes`);
    // À implémenter en Phase 7
    throw new Error('Service non encore implémenté - Phase 7');
  }

  async loadQuotes() {
    logger.debug('Loading quotes');
    // À implémenter en Phase 7
    throw new Error('Service non encore implémenté - Phase 7');
  }
}

export default StorageService;
