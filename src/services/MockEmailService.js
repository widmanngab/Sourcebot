import logger from '../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MockEmailService {
  constructor() {
    this.mockEmailFile = path.join(__dirname, '../logs/mock_emails.log');
    this.mockEmails = [];
    this.loadMockEmails();
  }

  /**
   * Load previously sent mock emails from file
   */
  loadMockEmails() {
    try {
      if (fs.existsSync(this.mockEmailFile)) {
        const content = fs.readFileSync(this.mockEmailFile, 'utf-8');
        const lines = content.split('\n').filter(line => line.trim());
        this.mockEmails = lines.map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        }).filter(Boolean);
      }
    } catch (error) {
      logger.warn('Could not load mock emails from file:', error.message);
    }
  }

  /**
   * Save mock email to file
   */
  saveMockEmail(emailData) {
    try {
      const logsDir = path.dirname(this.mockEmailFile);
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
      fs.appendFileSync(this.mockEmailFile, JSON.stringify(emailData) + '\n');
      this.mockEmails.push(emailData);
    } catch (error) {
      logger.error('Could not save mock email:', error);
    }
  }

  /**
   * Simulate sending an email via Mailjet (returns mock response)
   */
  async sendViaMailjet(mailData) {
    try {
      const mockResponse = {
        ID: Math.floor(Math.random() * 1000000000),
        UUID: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        Status: 'success',
        Email: mailData.to[0].email,
        TemplateID: 0,
        Processed: 1,
      };

      // Store mock email data
      const emailRecord = {
        timestamp: new Date().toISOString(),
        from: mailData.from,
        to: mailData.to,
        subject: mailData.subject,
        textPart: mailData.textPart?.substring(0, 100) + '...',
        htmlPart: mailData.htmlPart ? 'HTML content' : null,
        attachments: mailData.attachments?.length || 0,
        customId: mailData.customId,
        mockId: mockResponse.UUID,
      };

      // Save to file
      this.saveMockEmail(emailRecord);

      // Log in console
      logger.info('📧 [MOCK] Email simulated successfully', {
        to: mailData.to[0].email,
        subject: mailData.subject,
        attachments: mailData.attachments?.length || 0,
        mockId: mockResponse.UUID,
      });

      // Also display in detailed format
      console.log('\n🎭 ========== MOCK EMAIL LOG ==========');
      console.log(`📧 To: ${mailData.to[0].email}`);
      console.log(`👤 From: ${mailData.from.email}`);
      console.log(`📝 Subject: ${mailData.subject}`);
      console.log(`💬 Message preview: ${(mailData.textPart || '').substring(0, 100)}...`);
      if (mailData.attachments?.length) {
        console.log(`📎 Attachments: ${mailData.attachments.length} file(s)`);
      }
      console.log(`⏰ Mock ID: ${mockResponse.UUID}`);
      console.log('🎭 ====================================\n');

      return mockResponse;
    } catch (error) {
      logger.error('❌ Mock email error:', error);
      throw new Error('Failed to simulate email send');
    }
  }

  /**
   * Get all mock emails sent so far
   */
  getAllMockEmails() {
    return this.mockEmails;
  }

  /**
   * Clear mock emails log
   */
  clearMockEmails() {
    try {
      if (fs.existsSync(this.mockEmailFile)) {
        fs.unlinkSync(this.mockEmailFile);
      }
      this.mockEmails = [];
      logger.info('✅ Mock emails log cleared');
    } catch (error) {
      logger.error('Could not clear mock emails:', error);
    }
  }

  /**
   * Get mock email statistics
   */
  getStats() {
    const stats = {
      totalSent: this.mockEmails.length,
      byDay: {},
    };

    this.mockEmails.forEach(email => {
      const date = new Date(email.timestamp).toLocaleDateString();
      stats.byDay[date] = (stats.byDay[date] || 0) + 1;
    });

    return stats;
  }
}

export default new MockEmailService();
