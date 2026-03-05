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
      // Rotate through different templates
      const templateIndex = Math.floor(Math.random() * 5);
      
      const templates = [
        this._generateTemplate1(companyInfo, clientInfo),
        this._generateTemplate2(companyInfo, clientInfo),
        this._generateTemplate3(companyInfo, clientInfo),
        this._generateTemplate4(companyInfo, clientInfo),
        this._generateTemplate5(companyInfo, clientInfo),
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
  _generateTemplate1(company, client) {
    return {
      subject: `Demande de ${client.service || 'devis'} - ${client.company || 'Demande professionnelle'}`,
      text: `Madame, Monsieur,

Je vous contacte au sujet de ${client.description || 'nos besoins en prestation'}.

Entreprise: ${client.company || 'Non spécifié'}
Service demandé: ${client.service || 'Services généraux'}
${client.budget ? `Budget estimé: ${client.budget}` : ''}
${client.urgency ? `Délai: ${client.urgency}` : ''}

Serait-il possible de me transmettre un devis?

Cordialement,
${client.name || 'Une personne intéressée'}
${client.email ? `${client.email}` : ''}
${client.phone ? `${client.phone}` : ''}`,
      
      html: `<p>Madame, Monsieur,</p>
<p>Je vous contacte au sujet de <strong>${client.description || 'nos besoins en prestation'}</strong>.</p>
<ul>
  <li><strong>Entreprise:</strong> ${client.company || 'Non spécifié'}</li>
  <li><strong>Service demandé:</strong> ${client.service || 'Services généraux'}</li>
  ${client.budget ? `<li><strong>Budget estimé:</strong> ${client.budget}</li>` : ''}
  ${client.urgency ? `<li><strong>Délai:</strong> ${client.urgency}</li>` : ''}
</ul>
<p>Serait-il possible de me transmettre un devis?</p>
<p>Cordialement,<br/>
${client.name || 'Une personne intéressée'}<br/>
${client.email ? `${client.email}<br/>` : ''}
${client.phone ? `${client.phone}` : ''}</p>`,
    };
  }

  /**
   * Template 2: Concise & Action-oriented
   */
  _generateTemplate2(company, client) {
    return {
      subject: `${client.service || 'Prestation'} - Demande de disponibilité`,
      text: `Bonjour,

Nous recherchons un prestataire pour ${client.description || 'une prestation'}.

Détails:
- Type: ${client.service || 'À déterminer'}
- Entreprise: ${client.company || 'Nous'}
${client.budget ? `- Budget: ${client.budget}` : ''}
${client.timeline ? `- Timing: ${client.timeline}` : ''}

Pouvez-vous nous envoyer un devis?

${client.name || 'Cordialement'}
${client.email ? `${client.email}` : ''}
${client.phone ? `${client.phone}` : ''}`,
      
      html: `<p>Bonjour,</p>
<p>Nous recherchons un prestataire pour <strong>${client.description || 'une prestation'}</strong>.</p>
<p><strong>Détails:</strong></p>
<ul>
  <li>Type: ${client.service || 'À déterminer'}</li>
  <li>Entreprise: ${client.company || 'Nous'}</li>
  ${client.budget ? `<li>Budget: ${client.budget}</li>` : ''}
  ${client.timeline ? `<li>Timing: ${client.timeline}</li>` : ''}
</ul>
<p><strong>Pouvez-vous nous envoyer un devis?</strong></p>
<p>${client.name || 'Cordialement'}<br/>
${client.email ? `${client.email}<br/>` : ''}
${client.phone ? `${client.phone}` : ''}</p>`,
    };
  }

  /**
   * Template 3: Question-based
   */
  _generateTemplate3(company, client) {
    return {
      subject: `Question concernant votre expérience en ${client.service || 'services'}`,
      text: `Bonjour ${company.name ? company.name.split(' ')[0] : 'l\'équipe'},

Pouvez-vous nous aider avec ${client.description || 'une prestation professionnelle'}?

Contexte:
- Domaine: ${client.service || 'Diversifié'}
- Demandeur: ${client.company || 'Entreprise'}
${client.budget ? `- Investissement prévu: ${client.budget}` : ''}
${client.urgency ? `- Urgence: ${client.urgency}` : ''}

Nous serions intéressés par un devis si cela rentre dans vos compétences.

Merci,
${client.name || 'Contact'}
${client.email ? `${client.email}` : ''}`,
      
      html: `<p>Bonjour ${company.name ? company.name.split(' ')[0] : 'l\'équipe'},</p>
<p>Pouvez-vous nous aider avec <strong>${client.description || 'une prestation professionnelle'}</strong>?</p>
<p><strong>Contexte:</strong></p>
<ul>
  <li>Domaine: ${client.service || 'Diversifié'}</li>
  <li>Demandeur: ${client.company || 'Entreprise'}</li>
  ${client.budget ? `<li>Investissement prévu: ${client.budget}</li>` : ''}
  ${client.urgency ? `<li>Urgence: ${client.urgency}</li>` : ''}
</ul>
<p>Nous serions intéressés par un devis si cela rentre dans vos compétences.</p>
<p>Merci,<br/>
${client.name || 'Contact'}<br/>
${client.email ? `${client.email}` : ''}</p>`,
    };
  }

  /**
   * Template 4: Opportunity-focused
   */
  _generateTemplate4(company, client) {
    return {
      subject: `Opportunité de collaboration - ${client.service || 'Prestation'}`,
      text: `Madame, Monsieur,

${client.company || 'Notre entreprise'} envisage de confier ${client.description || 'une mission'} à un partenaire spécialisé.

Vos compétences en ${client.service || 'services'} nous intéressent.

Informations:
• Projet: ${client.description || 'Prestation à étudier'}
• Budget: ${client.budget || 'À discuter'}
${client.timeline ? `• Délai: ${client.timeline}` : ''}
• Contact: ${client.name || 'Demandeur'}

Pouvez-vous nous transmettre un devis?

${client.email ? `${client.email}` : ''}
${client.phone ? `${client.phone}` : ''}`,
      
      html: `<p>Madame, Monsieur,</p>
<p>${client.company || 'Notre entreprise'} envisage de confier <strong>${client.description || 'une mission'}</strong> à un partenaire spécialisé.</p>
<p>Vos compétences en <strong>${client.service || 'services'}</strong> nous intéressent.</p>
<p><strong>Informations:</strong></p>
<ul>
  <li>Projet: ${client.description || 'Prestation à étudier'}</li>
  <li>Budget: ${client.budget || 'À discuter'}</li>
  ${client.timeline ? `<li>Délai: ${client.timeline}</li>` : ''}
  <li>Contact: ${client.name || 'Demandeur'}</li>
</ul>
<p><strong>Pouvez-vous nous transmettre un devis?</strong></p>
<p>${client.email ? `${client.email}<br/>` : ''}
${client.phone ? `${client.phone}` : ''}</p>`,
    };
  }

  /**
   * Template 5: Short & Practical
   */
  _generateTemplate5(company, client) {
    return {
      subject: `Devis demandé - ${client.company || 'Demande'}`,
      text: `Bonjour,

Serait-il possible d'obtenir un devis pour le service suivant?

Service: ${client.service || 'À préciser'}
Description: ${client.description || 'Prestation professionnelle'}
${client.budget ? `Budget: ${client.budget}` : ''}
${client.timeline ? `Timing: ${client.timeline}` : ''}

Merci d'avance.

${client.name || 'Demandeur'}
${client.email ? `E-mail: ${client.email}` : ''}
${client.phone ? `Tél: ${client.phone}` : ''}`,
      
      html: `<p>Bonjour,</p>
<p>Serait-il possible d'obtenir un devis pour le service suivant?</p>
<table style="border-collapse: collapse; margin: 15px 0;">
  <tr><td><strong>Service:</strong></td><td>${client.service || 'À préciser'}</td></tr>
  <tr><td><strong>Description:</strong></td><td>${client.description || 'Prestation professionnelle'}</td></tr>
  ${client.budget ? `<tr><td><strong>Budget:</strong></td><td>${client.budget}</td></tr>` : ''}
  ${client.timeline ? `<tr><td><strong>Timing:</strong></td><td>${client.timeline}</td></tr>` : ''}
</table>
<p>Merci d'avance.</p>
<p>${client.name || 'Demandeur'}<br/>
${client.email ? `E-mail: ${client.email}<br/>` : ''}
${client.phone ? `Tél: ${client.phone}` : ''}</p>`,
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
