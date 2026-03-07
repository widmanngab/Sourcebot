import EmailService from '../services/EmailService.js';
import EmailVariationService from '../services/EmailVariationService.js';
import logger from '../utils/logger.js';

class EmailController {
  constructor() {
    this.emailService = new EmailService();
    this.variationService = new EmailVariationService();
  }

  /**
   * Send quote request email to a company with variation
   * POST /api/email/send
   * Body: { company, clientInfo, subject, attachments, useAlternateDomain }
   */
  async sendQuote(req, res) {
    let company; // Declare outside try block so it's accessible in catch
    
    try {
      ({ company, clientInfo, subject = null, attachments = [], useAlternateDomain = false } = req.body);

      // Debug logging
      logger.info(`📨 Email send request received:`, {
        hasCompany: !!company,
        companyName: company?.name,
        companyEmails: company?.emails,
        hasClientInfo: !!clientInfo,
        clientEmail: clientInfo?.email,
      });

      if (!company || !company.emails || company.emails.length === 0) {
        logger.error(`❌ Validation failed:`, {
          company: !!company,
          emails: company?.emails,
          emailsLength: company?.emails?.length,
        });
        return res.status(400).json({
          error: 'Company with email is required',
          status: 'error',
          details: {
            company: !!company,
            emails: company?.emails,
            emailsLength: company?.emails?.length,
          },
        });
      }

      if (!clientInfo || !clientInfo.email) {
        logger.error(`❌ Client info validation failed`, {
          hasClientInfo: !!clientInfo,
          clientEmail: clientInfo?.email,
        });
        return res.status(400).json({
          error: 'Client info with email is required',
          status: 'error',
          details: {
            hasClientInfo: !!clientInfo,
            clientEmail: clientInfo?.email,
          },
        });
      }

      // Vérifier le mode test
      const testMode = process.env.TEST_MODE === 'true';
      const testEmail = process.env.TEST_EMAIL || 'fourchettetest@gmail.com';

      logger.info(`📧 Sending quote request to: ${company.name}`);
      if (testMode) {
        logger.info(`🧪 TEST MODE ENABLED - Email will be sent to: ${testEmail}`);
      }

      // Generate email variation
      const emailContent = this.variationService.generateEmailVariation(company, clientInfo);
      
      // Use provided subject if available, otherwise use generated subject
      if (subject) {
        emailContent.subject = subject;
      }
      
      // Validate email content
      if (!emailContent || !emailContent.text || !emailContent.html || !emailContent.subject) {
        logger.error('❌ Invalid email content generated:', { emailContent });
        return res.status(500).json({
          error: 'Failed to generate email content',
          status: 'error',
        });
      }
      
      const senderInfo = this.variationService.getSenderEmail(useAlternateDomain);

      // Déterminer l'email destinataire
      let targetEmail = company.emails[0];
      let isTestMode = false;
      
      if (testMode) {
        // En mode test, envoyer à l'adresse test
        targetEmail = testEmail;
        isTestMode = true;
        
        // Modifier le sujet pour indiquer que c'est un test
        emailContent.subject = `[🧪 TEST] ${emailContent.subject}`;
        emailContent.text = `[CECI EST UN EMAIL DE TEST - MODE DÉVELOPPEMENT]\nEntreprise ciblée: ${company.name} (${company.emails[0]})\n\n${emailContent.text}`;
        emailContent.html = `<div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px;"><strong>🧪 CECI EST UN EMAIL DE TEST - MODE DÉVELOPPEMENT</strong><br/>Entreprise ciblée: ${company.name} (${company.emails[0]})</div>${emailContent.html}`;
      }
      
      try {
        // Send via Mailjet
        const response = await this.emailService.sendViaMailjet({
          from: senderInfo,
          to: [{
            email: targetEmail,
            name: isTestMode ? 'TEST INBOX' : company.name,
          }],
          replyTo: {
            email: clientInfo.email,
            name: clientInfo.name || 'Demandeur',
          },
          subject: emailContent.subject,
          textPart: emailContent.text,
          htmlPart: emailContent.html,
          attachments: attachments,
          customId: `quote-request-${company.placeId}-${Date.now()}`,
        });

        logger.info(`✅ Email sent to ${targetEmail}${isTestMode ? ' (TEST MODE)' : ''} for ${company.name}`);

        return res.status(200).json({
          status: 'success',
          message: `${isTestMode ? '🧪 [TEST MODE] ' : ''}Email envoyé à ${company.name}`,
          email: targetEmail,
          testMode: isTestMode,
          originalEmail: isTestMode ? company.emails[0] : null,
          messageId: response.ID || response.MessageID,
        });
      } catch (error) {
        logger.error(`❌ Failed to send email to ${targetEmail}:`, error.message);
        
        // Try other emails if available (only in non-test mode)
        if (!testMode && company.emails.length > 1) {
          logger.info(`🔄 Trying alternative email...`);
          const altEmail = company.emails[1];
          
          try {
            const response = await this.emailService.sendViaMailjet({
              from: senderInfo,
              to: [{
                email: altEmail,
                name: company.name,
              }],
              replyTo: {
                email: clientInfo.email,
                name: clientInfo.name || 'Demandeur',
              },
              subject: emailContent.subject,
              textPart: emailContent.text,
              htmlPart: emailContent.html,
              attachments: attachments,
              customId: `quote-request-${company.placeId}-${Date.now()}`,
            });

            logger.info(`✅ Email sent to ${altEmail} (alternative)`);
            
            return res.status(200).json({
              status: 'success',
              message: `Email envoyé à ${company.name} (adresse alternative)`,
              email: altEmail,
              messageId: response.ID || response.MessageID,
            });
          } catch (altError) {
            logger.error(`❌ Failed to send email to alternative address ${altEmail}:`, altError.message);
            throw altError;
          }
        }

        throw error;
      }
    } catch (error) {
      logger.error('❌ Error in sendQuote:', {
        errorMessage: error.message,
        errorStack: error.stack,
        company: company?.name,
      });
      return res.status(500).json({
        error: 'Erreur lors de l\'envoi de l\'email',
        status: 'error',
        message: error.message,
        details: error.message,
        company: company?.name,
      });
    }
  }

  /**
   * Send batch quote requests to multiple companies with variations
   * POST /api/email/send-batch
   * Body: { companies, clientInfo, useAlternateDomain }
   */
  async sendBatch(req, res) {
    try {
      const { companies, clientInfo, useAlternateDomain = false } = req.body;

      if (!companies || !Array.isArray(companies) || companies.length === 0) {
        return res.status(400).json({
          error: 'Companies array is required',
          status: 'error',
        });
      }

      if (!clientInfo || !clientInfo.email) {
        return res.status(400).json({
          error: 'Client info with email is required',
          status: 'error',
        });
      }

      logger.info(`📧 Sending batch quote requests to ${companies.length} companies`);

      const results = {
        sent: [],
        failed: [],
      };

      const senderInfo = this.variationService.getSenderEmail(useAlternateDomain);

      // Send emails sequentially to avoid rate limiting
      for (const company of companies) {
        try {
          if (!company.emails || company.emails.length === 0) {
            results.failed.push({
              company: company.name,
              reason: 'No email found',
            });
            continue;
          }

          // Generate variation for each company
          const emailContent = this.variationService.generateEmailVariation(company, clientInfo);
          const targetEmail = company.emails[0];

          const response = await this.emailService.sendViaMailjet({
            from: senderInfo,
            to: [{
              email: targetEmail,
              name: company.name,
            }],
            replyTo: {
              email: clientInfo.email,
              name: clientInfo.name || 'Demandeur',
            },
            subject: emailContent.subject,
            textPart: emailContent.text,
            htmlPart: emailContent.html,
            customId: `batch-${company.placeId}-${Date.now()}`,
          });

          results.sent.push({
            company: company.name,
            email: targetEmail,
            messageId: response.MessageID,
          });

          logger.info(`✅ Email sent to ${company.name}`);

          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          logger.warn(`⚠️ Failed to send email to ${company.name}:`, error.message);
          results.failed.push({
            company: company.name,
            reason: error.message,
          });
        }
      }

      return res.status(200).json({
        status: 'success',
        message: `Emails envoyés: ${results.sent.length}/${companies.length}`,
        results,
      });
    } catch (error) {
      logger.error('❌ Error in sendBatch:', error);
      return res.status(500).json({
        error: 'Erreur lors de l\'envoi du batch',
        status: 'error',
        message: error.message,
      });
    }
  }

  /**
   * Send quote requests to all companies from search results with email addresses
   * POST /api/email/send-to-search-results
   * Body: { searchResults, clientInfo, useAlternateDomain }
   */
  async sendToSearchResults(req, res) {
    try {
      const { searchResults, clientInfo, useAlternateDomain = false } = req.body;

      if (!searchResults || !Array.isArray(searchResults)) {
        return res.status(400).json({
          error: 'Search results array is required',
          status: 'error',
        });
      }

      if (!clientInfo || !clientInfo.email) {
        return res.status(400).json({
          error: 'Client info with email is required',
          status: 'error',
        });
      }

      // Filter companies that have emails
      const companiesWithEmails = searchResults.filter(
        (c) => c.emails && c.emails.length > 0
      );

      if (companiesWithEmails.length === 0) {
        return res.status(400).json({
          error: 'Aucune entreprise avec email trouvée',
          status: 'error',
        });
      }

      logger.info(
        `📧 Sending quote requests to ${companiesWithEmails.length} companies from search results`
      );

      // Use sendBatch with the filtered companies
      const req2 = {
        body: {
          companies: companiesWithEmails,
          clientInfo,
          useAlternateDomain,
        },
      };

      const res2 = {
        status: (code) => ({
          json: (data) => {
            return data;
          },
        }),
      };

      return res.status(200).json(
        await this.sendBatch(req2, res2)
      );
    } catch (error) {
      logger.error('❌ Error in sendToSearchResults:', error);
      return res.status(500).json({
        error: 'Erreur lors de l\'envoi des emails',
        status: 'error',
        message: error.message,
      });
    }
  }
}

export default EmailController;
