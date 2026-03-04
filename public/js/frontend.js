// SourceBot Frontend App
class SourceBotApp {
  constructor() {
    this.form = document.getElementById('searchForm');
    this.resultsContainer = document.getElementById('resultsContainer');
    this.resultsList = document.getElementById('resultsList');
    this.loading = document.getElementById('loading');
    this.error = document.getElementById('error');
    this.emptyState = document.getElementById('emptyState');

    this.form.addEventListener('submit', (e) => this.handleSearch(e));
  }

  /**
   * Handle search form submission
   */
  async handleSearch(event) {
    event.preventDefault();

    const keyword = document.getElementById('keyword').value.trim();
    const location = document.getElementById('location').value.trim();
    const radius = document.getElementById('radius').value;

    if (!keyword || !location) {
      this.showError('Veuillez remplir tous les champs');
      return;
    }

    this.showLoading(true);
    this.hideError();
    this.hideResults();

    try {
      const startTime = Date.now();

      // Call the scrape-emails endpoint
      const response = await fetch('http://localhost:3000/api/scrape-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword,
          location,
          radius: parseInt(radius),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      if (data.status === 'success') {
        this.displayResults(data, duration);
      } else {
        this.showError(data.message || 'Erreur lors de la recherche');
      }
    } catch (error) {
      console.error('Search error:', error);
      this.showError(`Erreur: ${error.message}`);
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Display search results
   */
  displayResults(data, duration) {
    // Update stats
    document.getElementById('totalCompanies').textContent = data.totalCompanies;
    document.getElementById('companiesWithEmails').textContent =
      data.companiesWithEmails;
    document.getElementById('duration').textContent = duration;

    // Build companies list HTML
    let html = '';

    if (data.results && data.results.length > 0) {
      data.results.forEach((company) => {
        html += this.buildCompanyCard(company);
      });
    } else {
      html = '<p style="text-align: center; color: #64748b;">Aucune entreprise avec email trouvée.</p>';
    }

    this.resultsList.innerHTML = html;
    this.showResults(true);
  }

  /**
   * Build HTML for a single company card
   */
  buildCompanyCard(company) {
    const hasEmails = company.emails && company.emails.length > 0;
    const phoneHtml = company.phone ? `<strong>📞 Tél:</strong> ${this.escapeHtml(company.phone)}` : '';
    const websiteHtml = company.website
      ? `<strong>🌐 Web:</strong> <a href="${company.website}" target="_blank">${this.escapeHtml(company.website)}</a>`
      : '';

    const emailsHtml = hasEmails
      ? `<div class="company-emails">
          <div class="company-emails-title">📧 ${company.emails.length} email(s) trouvé(s):</div>
          <div class="emails-list">
            ${company.emails
              .map((email) => `<div class="email-item"><a href="mailto:${email}">${email}</a></div>`)
              .join('')}
          </div>
        </div>`
      : '<div class="company-emails" style="background: #fef2f2;"><div class="company-emails-title" style="color: #991b1b;">⚠️ Aucun email trouvé</div></div>';

    return `
      <div class="company-card">
        <div class="company-header">
          <div>
            <div class="company-name">${this.escapeHtml(company.company)}</div>
            <div style="color: #64748b; font-size: 0.9rem; margin-top: 0.25rem;">
              📍 ${this.escapeHtml(company.address)}
            </div>
          </div>
        </div>

        <div class="company-info">
          ${phoneHtml ? `<div class="company-info-item">${phoneHtml}</div>` : ''}
          ${websiteHtml ? `<div class="company-info-item">${websiteHtml}</div>` : ''}
        </div>

        ${emailsHtml}
      </div>
    `;
  }

  /**
   * Escape HTML special characters
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

  /**
   * Show loading spinner
   */
  showLoading(show) {
    this.loading.style.display = show ? 'block' : 'none';
  }

  /**
   * Show error message
   */
  showError(message) {
    this.error.textContent = message;
    this.error.style.display = 'block';
  }

  /**
   * Hide error message
   */
  hideError() {
    this.error.style.display = 'none';
  }

  /**
   * Show results section
   */
  showResults(show) {
    this.resultsContainer.style.display = show ? 'block' : 'none';
    this.emptyState.style.display = show ? 'none' : 'block';
  }

  /**
   * Hide results section
   */
  hideResults() {
    this.showResults(false);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new SourceBotApp();
});
