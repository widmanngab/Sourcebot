import logger from '../utils/logger.js';

class EmailVariationService {
  constructor(clientInfo = {}) {
    this.clientInfo = clientInfo;
    this.variationIndex = 0;
  }

  /**
   * Generate email content with variations
   * Dissociates sender domain from target website
   */
  generateEmailVariation(companyInfo, clientInfo) {
    try {
      // Validate input
      if (!companyInfo || !clientInfo) {
        throw new Error('companyInfo and clientInfo are required');
      }

      // Use provided description instead of trying to create one
      const description = clientInfo.description || 'une demande de devis';
      const clientName = clientInfo.name || `${clientInfo.firstName || ''} ${clientInfo.lastName || ''}`.trim() || 'Un contact';
      const clientEmail = clientInfo.email || '';

      // Rotate through different templates
      const templateIndex = Math.floor(Math.random() * 3);
      
      const templates = [
        this._generateTemplate1(companyInfo, clientName, clientEmail, description),
        this._generateTemplate2(companyInfo, clientName, clientEmail, description),
        this._generateTemplate3(companyInfo, clientName, clientEmail, description),
      ];

      const emailContent = templates[templateIndex];
      logger.info(`✉️ Generated email variation ${templateIndex + 1} for ${companyInfo.name}`);
      
      return emailContent;
    } catch (error) {
      logger.error('❌ Email variation generation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Template 1: Direct & Professional
   */
  _generateTemplate1(company, clientName, clientEmail, description) {
    return {
      subject: `Demande de devis - ${description.split('\n')[0].substring(0, 40)}`,
      text: `Madame, Monsieur,

Je vous contacte concernant ${description}.

Voici les détails de ma demande:

${description}

Pourriez-vous me transmettre un devis pour cette prestation?

Cordialement,
${clientName}
${clientEmail}`,
      
      html: `<p>Madame, Monsieur,</p>
<p>Je vous contacte concernant <strong>${description.split('\n')[0]}</strong>.</p>
<p><strong>Détails de la demande:</strong></p>
<div style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; margin: 12px 0;">
  ${description.split('\n').map(line => `<div>• ${line.trim()}</div>`).join('')}
</div>
<p>Pourriez-vous me transmettre un devis pour cette prestation?</p>
<p>Cordialement,<br/>
<strong>${clientName}</strong><br/>
${clientEmail}</p>`,
    };
  }

  /**
   * Template 2: Concise & Action-oriented
   */
  _generateTemplate2(company, clientName, clientEmail, description) {
    return {
      subject: `Demande de disponibilité - ${description.split('\n')[0].substring(0, 40)}`,
      text: `Bonjour,

Nous recherchons un prestataire pour ${description.split('\n')[0]}.

Détails complets:
${description}

Disposez-vous de capacités pour cette prestation? 
Un devis serait très bienvenu.

Merci,
${clientName}
${clientEmail}`,
      
      html: `<p>Bonjour,</p>
<p>Nous recherchons un prestataire pour <strong>${description.split('\n')[0]}</strong>.</p>
<p><strong>Détails complets:</strong></p>
<div style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; margin: 12px 0;">
  ${description.split('\n').map(line => `<div>• ${line.trim()}</div>`).join('')}
</div>
<p>Disposez-vous de capacités pour cette prestation? Un devis serait très bienvenu.</p>
<p>Merci,<br/>
<strong>${clientName}</strong><br/>
${clientEmail}</p>`,
    };
  }

  /**
   * Template 3: Question-based
   */
  _generateTemplate3(company, clientName, clientEmail, description) {
    return {
      subject: `Demande de prestation - ${description.split('\n')[0].substring(0, 40)}`,
      text: `Bonjour ${company.name ? company.name.split(' ')[0] : 'l\'équipe'},

Pouvez-vous nous aider avec ${description.split('\n')[0]}?

Contexte et détails:
${description}

Si cette prestation rentre dans vos compétences, nous serions très intéressés par un devis.

Merci,
${clientName}
${clientEmail}`,
      
      html: `<p>Bonjour ${company.name ? company.name.split(' ')[0] : 'l\'équipe'},</p>
<p>Pouvez-vous nous aider avec <strong>${description.split('\n')[0]}</strong>?</p>
<p><strong>Contexte et détails:</strong></p>
<div style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; margin: 12px 0;">
  ${description.split('\n').map(line => `<div>• ${line.trim()}</div>`).join('')}
</div>
<p>Si cette prestation rentre dans vos compétences, nous serions très intéressés par un devis.</p>
<p>Merci,<br/>
<strong>${clientName}</strong><br/>
${clientEmail}</p>`,
    };
  }

  /**
   * Get sender email address (dissociated from company website)
   * Can use different domain or subdomain
   */
  getSenderEmail(useAlternateDomain = false) {
    const senderDomain = process.env.EMAIL_SENDER_DOMAIN || process.env.MAILJET_FROM_EMAIL?.split('@')[1] || 'sourcebot.com';
    const senderName = process.env.EMAIL_SENDER_NAME || 'Prospection';
    
    if (useAlternateDomain) {
      // Use alternate domain to avoid spam filters
      const alternateDomain = process.env.EMAIL_ALTERNATE_DOMAIN || senderDomain;
      return {
        email: `${senderName.toLowerCase()}@${alternateDomain}`,
        name: senderName,
      };
    }

    return {
      email: process.env.MAILJET_FROM_EMAIL || `noreply@${senderDomain}`,
      name: process.env.MAILJET_FROM_NAME || senderName,
    };
  }
}

export default EmailVariationService;
