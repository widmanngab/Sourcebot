// SourceBot Client - Application Frontend with 4-Stage Devis Workflow

// Configuration API - Déterminer l'URL de l'API selon l'environnement
let API_URL;

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  API_URL = 'http://localhost:3000';
} else {
  // Production: Railway backend URL
  const RAILWAY_BACKEND_URL = 'https://sourcebot-production.up.railway.app';
  API_URL = RAILWAY_BACKEND_URL;
}

// =============================================================================
// STATE MANAGEMENT
// =============================================================================

const state = {
  currentStep: 1,
  searchResults: [],
  selectedCompanies: new Set(),
  quoteDetails: {
    firstName: '',
    lastName: '',
    email: '',
    description: '',
    files: [],
  },
  emailTemplate: '',
  testMode: false,
  testEmail: null,
};

// =============================================================================
// INITIALIZATION
// =============================================================================

document.addEventListener('DOMContentLoaded', async () => {
  // Load config
  try {
    const configResponse = await fetch(`${API_URL}/api/config`);
    const config = await configResponse.json();
    state.testMode = config.testMode;
    state.testEmail = config.testEmail;

    if (state.testMode) {
      showTestModeBanner();
      console.log(`⊞ TEST MODE ENABLED - Emails will be sent to: ${state.testEmail}`);
    }
  } catch (error) {
    console.warn('Could not load config:', error);
  }

  // Setup event listeners
  setupSearchForm();
  setupQuoteDetailsForm();
  setupEmailTemplate();
  setupCompaniesSelection();
  setupStepNavigation();
});

// =============================================================================
// STEP 1: SEARCH
// =============================================================================

function setupSearchForm() {
  const form = document.getElementById('searchForm');
  form.addEventListener('submit', handleSearch);
}

async function handleSearch(e) {
  e.preventDefault();

  const formData = new FormData(document.getElementById('searchForm'));
  const keyword = formData.get('keyword');
  const location = formData.get('location');
  const radius = formData.get('radius');

  if (!keyword || !location) {
    showError('Veuillez remplir tous les champs requis');
    return;
  }

  const loading = document.getElementById('loading');
  const resultsContainer = document.getElementById('resultsContainer');
  const resultsList = document.getElementById('resultsList');
  const error = document.getElementById('error');

  loading.style.display = 'block';
  resultsContainer.style.display = 'none';
  error.style.display = 'none';

  const startTime = Date.now();

  try {
    const response = await fetch(`${API_URL}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword, location, radius: parseInt(radius) }),
    });

    if (!response.ok) throw new Error('API Error');

    const data = await response.json();
    state.searchResults = data.results || [];
    state.selectedCompanies.clear(); // Reset selection

    const duration = Math.round((Date.now() - startTime) / 1000);

    // Update stats
    document.getElementById('totalCompanies').textContent = state.searchResults.length;
    document.getElementById('companiesWithEmails').textContent = state.searchResults.filter(
      (c) => c.emails && c.emails.length > 0
    ).length;
    document.getElementById('duration').textContent = duration;

    // Display results
    displayResults();
    resultsContainer.style.display = 'block';
  } catch (error) {
    console.error('Search error:', error);
    showError(`Erreur: ${error.message}`);
  } finally {
    loading.style.display = 'none';
  }
}

function displayResults() {
  const resultsList = document.getElementById('resultsList');
  resultsList.innerHTML = '';

  if (state.searchResults.length === 0) {
    resultsList.innerHTML = '<div class="empty-state"><div class="empty-icon">⊙</div><p>Aucune entreprise trouvée</p></div>';
    return;
  }

  // Sort results: companies with emails first
  const sortedResults = [...state.searchResults].sort((a, b) => {
    const aHasEmails = a.emails && a.emails.length > 0 ? 1 : 0;
    const bHasEmails = b.emails && b.emails.length > 0 ? 1 : 0;
    return bHasEmails - aHasEmails; // Higher value comes first
  });

  sortedResults.forEach((company) => {
    const card = createCompanyCard(company);
    resultsList.appendChild(card);
  });
}

function createCompanyCard(company) {
  const card = document.createElement('div');
  card.className = 'company-card';

  const hasEmails = company.emails && company.emails.length > 0;
  const emailsHtml = hasEmails ? company.emails.map((email) => `<a href="mailto:${email}">${email}</a>`).join('<br>') : '<em>Non trouvés</em>';

  const cardId = 'card-' + Math.random().toString(36).substr(2, 9);

  card.innerHTML = `
    <div class="company-header" onclick="toggleCompanyDetails('${cardId}')">
      <div class="company-name-section">
        <span class="toggle-icon">▶</span>
        <div class="company-name">${company.name || 'N/A'}</div>
      </div>
      <div class="company-header-badges">
        ${hasEmails ? '<span class="email-badge">● Email trouvé</span>' : ''}
        ${company.rating ? `<div class="company-rating">⭐ ${company.rating}</div>` : ''}
      </div>
    </div>
    <div class="company-details" id="${cardId}" style="display: none;">
      <div class="company-info-item">
        <strong>Adresse:</strong>
        <span>${company.address || 'N/A'}</span>
      </div>
      <div class="company-info-item">
        <strong>Tél:</strong>
        <span>${company.phone || 'N/A'}</span>
      </div>
      <div class="company-info-item">
        <strong>Site:</strong>
        ${company.website ? `<a href="${company.website}" target="_blank">${company.website}</a>` : '<span>N/A</span>'}
      </div>
      <div class="company-info-item">
        <strong>Emails:</strong>
        <div class="emails-list">${emailsHtml}</div>
      </div>
    </div>
  `;

  return card;
}

function toggleCompanyDetails(cardId) {
  const details = document.getElementById(cardId);
  const header = details.previousElementSibling;
  const icon = header.querySelector('.toggle-icon');
  if (details.style.display === 'none') {
    details.style.display = 'block';
    icon.textContent = '▼';
  } else {
    details.style.display = 'none';
    icon.textContent = '▶';
  }
}

// =============================================================================
// STEP 2: QUOTE DETAILS
// =============================================================================

function setupQuoteDetailsForm() {
  const form = document.getElementById('quoteDetailsForm');

  // Character counter
  const description = document.getElementById('projectDescription');
  description.addEventListener('input', (e) => {
    const count = e.target.value.length;
    document.getElementById('charCount').textContent = `${count} / 5000 caractères`;
  });

  // File upload handling
  const filesInput = document.getElementById('projectFiles');
  filesInput.addEventListener('change', handleFileUpload);

  // Files important checkbox
  document.getElementById('filesImportant').addEventListener('change', (e) => {
    state.quoteDetails.filesImportant = e.target.checked;
  });
}

function handleFileUpload(e) {
  const files = Array.from(e.target.files);
  const preview = document.getElementById('filesPreview');
  preview.innerHTML = '';

  const errors = [];
  const validFiles = [];
  const maxFileSize = 25 * 1024 * 1024; // 25MB
  const allowedFormats = ['pdf', 'png', 'jpg', 'dwg', 'step', 'iges', 'zip'];

  files.forEach((file, index) => {
    const ext = file.name.split('.').pop().toLowerCase();
    let isValid = true;

    if (!allowedFormats.includes(ext)) {
      errors.push(`${file.name}: Format non autorisé`);
      isValid = false;
    } else if (file.size > maxFileSize) {
      errors.push(`${file.name}: Fichier trop volumineux (max 25MB)`);
      isValid = false;
    } else if (validFiles.length >= 10) {
      errors.push(`${file.name}: Maximum 10 fichiers dépassé`);
      isValid = false;
    } else {
      validFiles.push(file);
    }

    // Show preview
    const previewItem = document.createElement('div');
    previewItem.className = `file-preview-item ${isValid ? '' : 'error'}`;
    previewItem.innerHTML = `
      <span>${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)</span>
      <button type="button" class="file-preview-remove" data-index="${index}">✕</button>
    `;

    if (!isValid) {
      previewItem.style.background = '#fee2e2';
    }

    preview.appendChild(previewItem);
  });

  state.quoteDetails.files = validFiles;

  // Remove button handlers
  preview.querySelectorAll('.file-preview-remove').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const index = parseInt(btn.dataset.index);
      state.quoteDetails.files.splice(index, 1);
      handleFileUpload({ target: { files: state.quoteDetails.files } });
    });
  });

  if (errors.length > 0) {
    showError(errors.join('\n'));
  }
}

// =============================================================================
// STEP 3: EMAIL TEMPLATE
// =============================================================================

function setupEmailTemplate() {
  const textarea = document.getElementById('emailTemplate');
  textarea.addEventListener('change', (e) => {
    state.emailTemplate = e.target.value;
  });

  // Regenerate email button
  const regenerateBtn = document.getElementById('regenerateEmailBtn');
  if (regenerateBtn) {
    regenerateBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const newTemplate = generateEmailTemplate(true);
      textarea.value = newTemplate;
      state.emailTemplate = newTemplate;
    });
  }
}

function generateEmailTemplate(isAlternate = false) {
  const { firstName, lastName, description } = state.quoteDetails;
  
  // Format the description into bullet points
  const lines = description.split('\n').filter(line => line.trim());
  const bulletPoints = lines.map(line => `• ${line.trim()}`).join('\n');

  const filesInfo = state.quoteDetails.files && state.quoteDetails.files.length > 0 
    ? `\n\nDocuments joints :\n${state.quoteDetails.files.map(f => `• ${f.name}`).join('\n')}`
    : '';

  // Introductions
  const introductions = [
    'Je vous contacte afin d\'obtenir un devis pour un projet.',
    'Je vous contacte pour demander un devis concernant un projet.',
    'J\'aurais un projet pour lequel j\'aimerais obtenir votre devis.',
    'Nous avons un projet et souhaiterions obtenir un devis de votre part.'
  ];

  // Closings
  const closings = [
    'Je reste à votre disposition pour tout complément d\'information ou clarification.',
    'N\'hésitez pas à me contacter pour d\'éventuels ajustements ou questions.',
    'Merci de votre attention. Je serais heureux d\'avoir votre retour.',
    'Je vous remercie de l\'attention que vous porterez à cette demande.'
  ];

  // Select introduction and closing
  let introduction, closing;
  if (isAlternate) {
    // Pick random indices for alternate version
    introduction = introductions[Math.floor(Math.random() * introductions.length)];
    closing = closings[Math.floor(Math.random() * closings.length)];
  } else {
    // Use default (first) option
    introduction = introductions[0];
    closing = closings[0];
  }

  const template = `Bonjour,

${introduction}

Voici les éléments techniques détaillant ma demande :

${bulletPoints}${filesInfo}

${closing}

Cordialement,
${firstName} ${lastName}
${state.quoteDetails.email}`;

  return template;
}

function updateEmailPreview() {
  // Display attached files in step 3
  const filesSection = document.getElementById('emailFilesSection');
  const filesList = document.getElementById('emailFilesList');

  if (state.quoteDetails.files && state.quoteDetails.files.length > 0) {
    filesSection.style.display = 'block';
    filesList.innerHTML = '';

    state.quoteDetails.files.forEach((file) => {
      const item = document.createElement('div');
      item.innerHTML = `✓ ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
      filesList.appendChild(item);
    });
  } else {
    filesSection.style.display = 'none';
  }
}

// =============================================================================
// STEP 4: COMPANIES SELECTION & SENDING
// =============================================================================

function setupCompaniesSelection() {
  const selectAll = document.getElementById('selectAllCompanies');
  const sendButton = document.getElementById('sendQuotes');

  selectAll.addEventListener('change', (e) => {
    const checkboxes = document.querySelectorAll('.company-checkbox-item input[type="checkbox"]');
    checkboxes.forEach((cb) => {
      cb.checked = e.target.checked;
      const index = parseInt(cb.dataset.index);
      if (e.target.checked) {
        state.selectedCompanies.add(index);
      } else {
        state.selectedCompanies.delete(index);
      }
    });
    updateSelectionSummary();
  });

  sendButton.addEventListener('click', handleSendQuotes);
}

function displayCompaniesCheckboxes() {
  const list = document.getElementById('companiesList');
  list.innerHTML = '';

  state.searchResults.forEach((company, index) => {
    const item = document.createElement('div');
    item.className = 'company-checkbox-item';

    const emails = company.emails && company.emails.length > 0 ? company.emails.join(', ') : 'Pas d\'email';

    item.innerHTML = `
      <input type="checkbox" data-index="${index}" class="company-select-checkbox">
      <div class="company-checkbox-info">
        <div class="company-checkbox-name">${company.name}</div>
        <div class="company-checkbox-email">${emails}</div>
      </div>
    `;

    const checkbox = item.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        state.selectedCompanies.add(index);
      } else {
        state.selectedCompanies.delete(index);
      }
      updateSelectionSummary();
    });

    list.appendChild(item);
  });
}

function updateSelectionSummary() {
  document.getElementById('selectedCount').textContent = state.selectedCompanies.size;
  document.getElementById('totalCount').textContent = state.searchResults.length;
}

async function handleSendQuotes() {
  if (state.selectedCompanies.size === 0) {
    showError('Veuillez sélectionner au moins une entreprise');
    return;
  }

  const selectedCompanies = Array.from(state.selectedCompanies).map((i) => state.searchResults[i]);
  const progress = document.getElementById('sendingProgress');
  const results = document.getElementById('sendingResults');

  progress.style.display = 'block';
  results.style.display = 'none';

  const successResults = [];
  const errorResults = [];

  for (let i = 0; i < selectedCompanies.length; i++) {
    const company = selectedCompanies[i];

    try {
      // Debug logging
      console.log(`● Sending email to company:`, company);
      console.log(`● Company emails:`, company.emails);

      const emailPayload = {
        company: company,
        clientInfo: {
          name: `${state.quoteDetails.firstName} ${state.quoteDetails.lastName}`,
          email: state.quoteDetails.email,
          description: state.quoteDetails.description,
        },
        attachments: [],
        useAlternateDomain: false,
      };

      console.log(`● Payload being sent:`, JSON.stringify(emailPayload, null, 2));

      const response = await fetch(`${API_URL}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload),
      });

      if (response.ok) {
        successResults.push(company.name);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erreur API' }));
        errorResults.push(`${company.name}: ${errorData.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      errorResults.push(`${company.name}: ${error.message}`);
    }

    // Update progress
    const percent = Math.round(((i + 1) / selectedCompanies.length) * 100);
    document.getElementById('progressFill').style.width = `${percent}%`;
    document.getElementById('progressText').textContent = `Envoi en cours... ${percent}%`;
  }

  progress.style.display = 'none';
  displaySendingResults(successResults, errorResults);
}

function displaySendingResults(successResults, errorResults) {
  const results = document.getElementById('sendingResults');
  const detail = document.getElementById('resultsDetail');

  detail.innerHTML = '';

  // Success message
  const summary = document.createElement('div');
  summary.style.cssText = 'background: #dcfce7; border: 1px solid #86efac; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;';
  summary.innerHTML = `
    <h3 style="color: #16a34a; margin-top: 0;">✅ Envoi réussi!</h3>
    <p style="color: #15803d; margin-bottom: 0.5rem;">
      <strong>${successResults.length}</strong> email(s) ont été traité(s) avec succès.
    </p>
    <p style="color: #15803d; font-size: 0.9rem;">
      🧪 <strong>MODE TEST:</strong> Tous les emails ont été envoyés à <strong>fourchettetest@gmail.com</strong>
    </p>
  `;
  detail.appendChild(summary);

  // List each sent email
  const listDiv = document.createElement('div');
  listDiv.innerHTML = '<h4 style="margin-top: 0; margin-bottom: 1rem; color: #1e293b;">📧 Emails traités:</h4>';

  successResults.forEach((name, index) => {
    const item = document.createElement('div');
    item.className = 'result-item success';
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';
    item.style.alignItems = 'center';
    item.innerHTML = `
      <span>
        <strong>${index + 1}.</strong> ${name}
      </span>
      <span style="background: #10b981; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem;">
        ✓ Envoyé
      </span>
    `;
    listDiv.appendChild(item);
  });

  if (errorResults.length > 0) {
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = '<h4 style="margin-top: 1rem; margin-bottom: 1rem; color: #991b1b;">❌ Erreurs:</h4>';
    
    errorResults.forEach((error) => {
      const item = document.createElement('div');
      item.className = 'result-item error';
      item.innerHTML = `<span>✗ ${error}</span>`;
      errorDiv.appendChild(item);
    });
    
    listDiv.appendChild(errorDiv);
  }

  detail.appendChild(listDiv);

  // Info box
  const infoDiv = document.createElement('div');
  infoDiv.style.cssText = 'background: #eef2ff; border: 1px solid #bfdbfe; padding: 1rem; border-radius: 6px; margin-top: 1rem;';
  infoDiv.innerHTML = `
    <p style="color: #1e40af; margin: 0; font-size: 0.9rem;">
      📌 <strong>En mode développement:</strong> Les emails sont simulés et enregistrés dans le système de test.
      Vérifiez <strong>fourchettetest@gmail.com</strong> pour voir les emails reçus.
    </p>
  `;
  detail.appendChild(infoDiv);

  results.style.display = 'block';
}

// =============================================================================
// STEP NAVIGATION
// =============================================================================

function setupStepNavigation() {
  // Step 1 -> Step 2
  document.getElementById('continueToStep2').addEventListener('click', () => {
    if (state.searchResults.length === 0) {
      showError('Veuillez faire une recherche d\'abord');
      return;
    }
    goToStep(2);
  });

  // Step 2 -> Step 3
  document.getElementById('continueToStep3').addEventListener('click', () => {
    const form = document.getElementById('quoteDetailsForm');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Save form data
    state.quoteDetails.firstName = document.getElementById('clientFirstName').value;
    state.quoteDetails.lastName = document.getElementById('clientLastName').value;
    state.quoteDetails.email = document.getElementById('clientEmail').value;
    state.quoteDetails.description = document.getElementById('projectDescription').value;

    // Generate email template
    state.emailTemplate = generateEmailTemplate();
    document.getElementById('emailTemplate').value = state.emailTemplate;

    // Show attached files
    updateEmailPreview();

    goToStep(3);
  });

  // Step 3 -> Step 4
  document.getElementById('continueToStep4').addEventListener('click', () => {
    // Save email template
    state.emailTemplate = document.getElementById('emailTemplate').value;

    // Display companies for selection
    displayCompaniesCheckboxes();
    updateSelectionSummary();

    goToStep(4);
  });

  // Back buttons
  document.getElementById('backToStep1').addEventListener('click', () => goToStep(1));
  document.getElementById('backToStep2').addEventListener('click', () => goToStep(2));
  document.getElementById('backToStep3').addEventListener('click', () => goToStep(3));
}

function goToStep(stepNumber) {
  // Hide all steps
  document.querySelectorAll('.step-section').forEach((section) => {
    section.classList.remove('active');
  });

  // Hide all step indicators
  document.querySelectorAll('.step').forEach((step) => {
    step.classList.remove('active');
  });

  // Show current step
  const stepSection = document.getElementById(`step${stepNumber}-section`);
  const stepIndicator = document.getElementById(`step${stepNumber}-indicator`);

  if (stepSection) stepSection.classList.add('active');
  if (stepIndicator) stepIndicator.classList.add('active');

  state.currentStep = stepNumber;

  // Scroll to top
  window.scrollTo(0, 0);
}

// =============================================================================
// UTILITIES
// =============================================================================

function showError(message) {
  const error = document.getElementById('error');
  error.textContent = message;
  error.style.display = 'block';
  setTimeout(() => {
    error.style.display = 'none';
  }, 5000);
}

function showTestModeBanner() {
  const banner = document.createElement('div');
  banner.style.cssText =
    'background: #fef3c7; border: 1px solid #fcd34d; color: #92400e; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; text-align: center;';
  banner.innerHTML = `🧪 <strong>MODE TEST ACTIVÉ</strong> - Les emails seront envoyés à: <strong>${state.testEmail}</strong>`;

  document.querySelector('main').insertBefore(banner, document.querySelector('main').firstChild);
}
