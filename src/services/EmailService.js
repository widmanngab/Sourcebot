import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

class EmailService {
  constructor() {
    // Mailjet SMTP Configuration
    this.apiKey = process.env.MAILJET_API_KEY;
    this.apiSecret = process.env.MAILJET_API_SECRET;
    this.fromEmail = process.env.MAILJET_FROM_EMAIL || `${this.apiKey}@incoming.mailjet.com`;
    this.fromName = 'SourceBot - Demande de Devis';

    if (!this.apiKey || !this.apiSecret) {
      logger.error('❌ Mailjet credentials missing (MAILJET_API_KEY, MAILJET_API_SECRET)');
    }

    // Configure Nodemailer with Mailjet SMTP
    this.transporter = nodemailer.createTransport({
      host: 'in-v3.mailjet.com',
      port: 587,
      secure: false, // TLS
      auth: {
        user: this.apiKey,
        pass: this.apiSecret,
      },
    });

    // Verify connection
    this.transporter.verify((error) => {
      if (error) {
        logger.error('❌ Mailjet connection failed:', error);
      } else {
        logger.info('✅ Mailjet SMTP connection ready');
      }
    });
  }

  /**
   * Send a quote request email to a single company
   */
  async sendQuoteRequest(company, options = {}) {
    try {
      const {
        userEmail = 'contact@sourcebot.fr',
        subject = `Demande de Devis - ${options.keyword || 'Projet'}`,
        message = this.buildQuoteRequestMessage(options),
        attachments = [],
      } = options;

      if (!company.emails || company.emails.length === 0) {
        logger.warn(`⚠️ No email found for company: ${company.company}`);
        return { success: false, error: 'No email found' };
      }

      const recipientEmail = company.emails[0]; // Use first email

      const mailOptions = {
        from: `${this.fromName} <${this.fromEmail}>`,
        to: recipientEmail,
        replyTo: userEmail,
        subject,
        html: message,
        attachments,
        headers: {
          'X-Company': company.company,
          'X-Company-ID': company.placeId || 'unknown',
          'X-SourceBot': 'v1.0',
        },
      };

      const result = await this.transporter.sendMail(mailOptions);

      logger.info(`✅ Email sent successfully`, {
        company: company.company,
        to: recipientEmail,
        messageId: result.messageId,
      });

      return {
        success: true,
        company: company.company,
        email: recipientEmail,
        messageId: result.messageId,
      };
    } catch (error) {
      logger.error(`❌ Error sending email to ${company.company}:`, error.message);
      return {
        success: false,
        company: company.company,
        error: error.message,
      };
    }
  }

  /**
   * Send emails to multiple companies (batch)
   */
  async sendBatch(companies, options = {}) {
    logger.info(`📧 Sending batch emails to ${companies.length} companies...`);

    const results = {
      sent: [],
      failed: [],
      skipped: [],
    };

    // Send with delays to avoid rate limiting
    for (let i = 0; i < companies.length; i += 1) {
      const company = companies[i];

      // Delay between emails (respect Mailjet rate limits)
      if (i > 0) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      // eslint-disable-next-line no-await-in-loop
      const result = await this.sendQuoteRequest(company, options);

      if (result.success) {
        results.sent.push(result);
      } else if (result.error === 'No email found') {
        results.skipped.push({ company: company.company });
      } else {
        results.failed.push(result);
      }
    }

    logger.info(`📊 Batch send complete:`, {
      sent: results.sent.length,
      failed: results.failed.length,
      skipped: results.skipped.length,
    });

    return results;
  }

  /**
   * Build HTML email message for quote request
   */
  buildQuoteRequestMessage(options = {}) {
    const {
      keyword = 'Projet',
      description = 'Nous aimerions recevoir une demande de devis pour votre service.',
      budget = 'À définir',
      deadline = 'À définir',
    } = options;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .field { margin: 15px 0; }
    .label { font-weight: bold; color: #6366f1; }
    .footer { text-align: center; color: #999; margin-top: 30px; font-size: 12px; }
    a { color: #6366f1; text-decoration: none; }
  </style>
</head>
<body>
  <div class="header">
    <h2>🤖 SourceBot - Demande de Devis</h2>
  </div>
  <div class="content">
    <p>Bonjour,</p>
    <p>Nous vous contactons par l'intermédiaire de SourceBot pour une demande de devis.</p>
    
    <div class="field">
      <div class="label">📋 Domaine :</div>
      ${this.escapeHtml(keyword)}
    </div>
    
    <div class="field">
      <div class="label">📝 Description :</div>
      ${this.escapeHtml(description)}
    </div>
    
    <div class="field">
      <div class="label">💰 Budget estimé :</div>
      ${this.escapeHtml(budget)}
    </div>
    
    <div class="field">
      <div class="label">📅 Délai souhaité :</div>
      ${this.escapeHtml(deadline)}
    </div>

    <hr style="margin: 20px 0;">
    
    <p style="font-size: 14px; color: #666;">
      Nous apprécierions recevoir votre devis dans les meilleurs délais.
      <br><br>
      Cordialement,<br>
      <strong>SourceBot</strong><br>
      <em>Plateforme de Prospection B2B</em>
    </p>
  </div>
  <div class="footer">
    <p>
      <a href="https://sourcebot.fr/unsubscribe">Se désinscrire</a> | 
      <a href="https://sourcebot.fr/privacy">Politique de confidentialité</a>
    </p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Escape HTML characters
   */
  escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}

export default EmailService;
