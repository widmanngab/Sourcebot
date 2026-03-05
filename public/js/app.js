// SourceBot Client - Application Frontend
document.addEventListener('DOMContentLoaded', async () => {
  const searchForm = document.getElementById('searchForm');
  const resultsContainer = document.getElementById('resultsContainer');
  const resultsList = document.getElementById('resultsList');
  
  // State
  let currentResults = [];
  let testMode = false;
  let testEmail = null;
  
  // Charger la configuration (mode test, etc)
  try {
    const configResponse = await fetch('/api/config');
    const config = await configResponse.json();
    testMode = config.testMode;
    testEmail = config.testEmail;
    
    if (testMode) {
      showTestModeBanner();
      console.log(`🧪 TEST MODE ENABLED - Emails will be sent to: ${testEmail}`);
    }
  } catch (error) {
    console.warn('Could not load config:', error);
  }
  
  // Charger les infos client depuis localStorage au démarrage
  loadClientInfoFromStorage();
  
  // Bouton pour modifier les infos client
  addClientInfoButton();

  // Gestion du formulaire
  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(searchForm);
    
    // Récupérer les données du formulaire avec les bons noms
    const keyword = formData.get('keyword');
    const location = formData.get('location') || 'France';
    const radius = parseInt(formData.get('radius'), 10) || 100;
    
    const data = {
      keyword: keyword.trim(),
      location: location,
      radius: radius,
    };

    console.log('📤 Envoi de la requête:', data);
    
    // Enregistrer le temps de début
    const startTime = Date.now();

    try {
      // Désactiver le bouton lors de l'envoi
      const submitBtn = searchForm.querySelector('.btn-primary');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Recherche en cours...';

      // Appeler l'API backend
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('📥 Réponse du serveur:', responseData);
      
      // Calculer le temps écoulé
      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);
      
      // Afficher les résultats (extraire le tableau de résultats)
      const results = responseData.results || [];
      currentResults = results; // Stocker pour utilisation ultérieure
      displayResults(results, duration);
      resultsContainer.style.display = 'block';
      resultsContainer.scrollIntoView({ behavior: 'smooth' });

      // Afficher le nombre de résultats trouvés
      if (results.length > 0) {
        showAlert(`✅ ${results.length} résultat(s) trouvé(s)!`, 'success');
      } else {
        showAlert('Aucun résultat trouvé pour votre recherche.', 'info');
      }

      // Réactiver le bouton
      submitBtn.disabled = false;
      submitBtn.innerHTML = '🔍 Lancer la Recherche';
    } catch (error) {
      console.error('❌ Erreur:', error);
      showAlert(`Erreur: ${error.message}`, 'error');

      // Réactiver le bouton
      const submitBtn = searchForm.querySelector('.btn-primary');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '🔍 Lancer la Recherche';
    }
  });

  // Afficher les résultats
  function displayResults(companies, duration = 0) {
    if (!companies || companies.length === 0) {
      resultsList.innerHTML =
        '<p style="grid-column: 1/-1; text-align: center; color: #64748b;">Aucun résultat trouvé</p>';
      return;
    }

    // Calculer les statistiques
    const totalCompanies = companies.length;
    const companiesWithEmails = companies.filter(c => c.emails && c.emails.length > 0).length;
    
    // Mettre à jour les éléments de stats
    const totalCompaniesEl = document.getElementById('totalCompanies');
    const companiesWithEmailsEl = document.getElementById('companiesWithEmails');
    const durationEl = document.getElementById('duration');
    
    if (totalCompaniesEl) totalCompaniesEl.textContent = totalCompanies;
    if (companiesWithEmailsEl) companiesWithEmailsEl.textContent = companiesWithEmails;
    if (durationEl) durationEl.textContent = duration;

    resultsList.innerHTML = companies
      .map(
        (company, index) => `
      <div class="result-card">
        <h4>${escapeHtml(company.name || 'N/A')}</h4>
        <p><strong>Adresse:</strong> ${escapeHtml(company.address || 'N/A')}</p>
        ${company.phone ? `<p><strong>Téléphone:</strong> <a href="tel:${company.phone}">${escapeHtml(company.phone)}</a></p>` : ''}
        ${company.website ? `<p><strong>Site:</strong> <a href="${escapeHtml(company.website)}" target="_blank" rel="noopener">Visiter</a></p>` : ''}
        ${company.rating ? `<p><strong>Note:</strong> ⭐ ${company.rating}/5 (${company.reviewCount || 0} avis)</p>` : ''}
        ${company.emails && company.emails.length > 0 ? `
          <div class="emails-section">
            <strong>📧 Emails trouvés (${company.emails.length}):</strong>
            <ul style="margin: 5px 0; padding-left: 20px;">
              ${company.emails.map(email => `<li><a href="mailto:${email}">${escapeHtml(email)}</a></li>`).join('')}
            </ul>
            <button class="btn-send-email" data-company-index="${index}" style="margin-top: 10px; padding: 8px 15px; background-color: #10b981; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
              📧 Envoyer un devis
            </button>
          </div>
        ` : '<p style="color: #ea580c;">📧 Aucun email trouvé</p>'}
        <span class="result-badge">ID: ${escapeHtml(company.placeId || `Result #${index + 1}`)}</span>
      </div>
    `
      )
      .join('');
    
    // Ajouter les event listeners aux boutons
    document.querySelectorAll('.btn-send-email').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const index = parseInt(btn.getAttribute('data-company-index'));
        const company = currentResults[index];
        await sendEmailToCompany(company, btn);
      });
    });
  }

  // Envoyer un email à une entreprise
  async function sendEmailToCompany(company, btnElement) {
    // Vérifier que les infos du client sont remplies
    const clientInfo = getClientInfo();
    if (!clientInfo) {
      showAlert('❌ Veuillez remplir vos informations de contact d\'abord!', 'error');
      return;
    }

    if (!company.emails || company.emails.length === 0) {
      showAlert('❌ Aucun email disponible pour cette entreprise', 'error');
      return;
    }

    try {
      // Sauvegarder le texte original du bouton
      const originalText = btnElement.innerHTML;
      btnElement.disabled = true;
      btnElement.innerHTML = '⏳ Envoi en cours...';

      // Récupérer les fichiers attachés s'il y en a
      const attachments = await getAttachments();

      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company: company,
          clientInfo: clientInfo,
          attachments: attachments,
          useAlternateDomain: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'envoi');
      }

      const result = await response.json();
      showAlert(`✅ Email envoyé avec succès à ${company.name}!`, 'success');
      btnElement.innerHTML = '✅ Envoyé';
      btnElement.disabled = true;
    } catch (error) {
      console.error('❌ Erreur:', error);
      showAlert(`❌ Erreur: ${error.message}`, 'error');
      btnElement.disabled = false;
      btnElement.innerHTML = '📧 Envoyer un devis';
    }
  }

  // Récupérer les fichiers attachés
  async function getAttachments() {
    const filesInput = document.getElementById('clientFiles');
    const attachments = [];

    if (!filesInput || filesInput.files.length === 0) {
      return attachments;
    }

    // Limiter à 5 fichiers max et 25MB total
    const maxFiles = 5;
    const maxTotalSize = 25 * 1024 * 1024; // 25MB
    let totalSize = 0;

    for (let i = 0; i < Math.min(filesInput.files.length, maxFiles); i++) {
      const file = filesInput.files[i];

      if (file.size > 10 * 1024 * 1024) {
        showAlert(`⚠️ Fichier "${file.name}" trop volumineux (>10MB)`, 'error');
        continue;
      }

      totalSize += file.size;
      if (totalSize > maxTotalSize) {
        showAlert(`⚠️ Taille totale des fichiers dépasse 25MB`, 'error');
        break;
      }

      // Convertir en base64
      const base64 = await fileToBase64(file);

      attachments.push({
        filename: file.name,
        base64: base64,
        contentType: file.type,
      });
    }

    return attachments;
  }

  // Convertir un fichier en base64
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Extraire la partie base64 (après "data:...;base64,")
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
    });
  }

  // Récupérer les infos du client ou demander
  function getClientInfo() {
    const modal = document.getElementById('clientInfoModal');
    
    // Essayer de charger depuis localStorage d'abord
    const storedInfo = getStoredClientInfo();
    if (storedInfo && storedInfo.name && storedInfo.email && storedInfo.company && storedInfo.service && storedInfo.description) {
      return storedInfo;
    }

    // Sinon, afficher le formulaire
    if (!modal) {
      showClientInfoForm();
      return null;
    }

    // Récupérer les infos du formulaire ouvert
    const name = document.getElementById('clientName')?.value;
    const email = document.getElementById('clientEmail')?.value;
    const company = document.getElementById('clientCompany')?.value;
    const service = document.getElementById('clientService')?.value;
    const description = document.getElementById('clientDescription')?.value;
    const budget = document.getElementById('clientBudget')?.value;
    const timeline = document.getElementById('clientTimeline')?.value;

    if (!name || !email || !company || !service || !description) {
      return null;
    }

    return {
      name,
      email,
      company,
      service,
      description,
      budget,
      timeline,
    };
  }

  // Charger les infos client depuis localStorage
  function getStoredClientInfo() {
    const stored = localStorage.getItem('sourcebot_client_info');
    return stored ? JSON.parse(stored) : null;
  }

  // Sauvegarder les infos client dans localStorage
  function saveClientInfoToStorage(clientInfo) {
    localStorage.setItem('sourcebot_client_info', JSON.stringify(clientInfo));
  }

  // Charger les infos au démarrage
  function loadClientInfoFromStorage() {
    const stored = getStoredClientInfo();
    if (stored) {
      console.log('✅ Infos client chargées depuis le stockage local');
    }
  }

  // Ajouter un bouton pour modifier les infos client
  function addClientInfoButton() {
    const stored = getStoredClientInfo();
    if (!stored) return;

    const header = document.querySelector('header');
    if (!header) return;

    // Créer le bouton s'il n'existe pas déjà
    if (document.getElementById('editClientInfoBtn')) return;

    const btn = document.createElement('button');
    btn.id = 'editClientInfoBtn';
    btn.innerHTML = '✏️ Modifier mes infos';
    btn.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 15px;
      background-color: #3b82f6;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      z-index: 999;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    btn.addEventListener('click', () => {
      // Supprimer les modals existants
      const existingModal = document.getElementById('clientInfoModal');
      if (existingModal) {
        existingModal.remove();
      }
      showClientInfoForm(true);
    });

    document.body.appendChild(btn);
  }

  // Afficher une bannière pour le mode test
  function showTestModeBanner() {
    const banner = document.createElement('div');
    banner.id = 'testModeBanner';
    banner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(90deg, #fef3c7 0%, #fcd34d 100%);
      border-bottom: 3px solid #f59e0b;
      padding: 15px;
      text-align: center;
      font-weight: bold;
      font-size: 14px;
      color: #78350f;
      z-index: 2000;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;
    banner.innerHTML = `🧪 MODE TEST ACTIVÉ - Les emails seront envoyés à fourchettetest@gmail.com au lieu des entreprises`;
    document.body.insertBefore(banner, document.body.firstChild);
    
    // Ajouter du padding au body pour éviter la superposition
    document.body.style.paddingTop = '50px';
  }

  // Afficher le formulaire des infos client
  function showClientInfoForm(isEditing = false) {
    const existingModal = document.getElementById('clientInfoModal');
    if (existingModal && !isEditing) return;

    const storedInfo = getStoredClientInfo();

    const modalHtml = `
      <div id="clientInfoModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; overflow-y: auto; padding: 20px 0;">
        <div style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.2); margin: auto;">
          <h2>📋 ${isEditing ? 'Modifier vos informations' : 'Vos Informations de Contact'}</h2>
          <p style="color: #666; margin-bottom: 20px;">Remplissez ces infos une fois, elles seront réutilisées pour tous les envois</p>
          
          <form id="clientInfoForm">
            <div style="margin-bottom: 15px;">
              <label style="display: block; font-weight: bold; margin-bottom: 5px;">👤 Votre nom *</label>
              <input type="text" id="clientName" placeholder="ex: Jean Dupont" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;" value="${storedInfo?.name || ''}" required>
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; font-weight: bold; margin-bottom: 5px;">✉️ Votre email *</label>
              <input type="email" id="clientEmail" placeholder="ex: jean@exemple.com" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;" value="${storedInfo?.email || ''}" required>
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; font-weight: bold; margin-bottom: 5px;">🏢 Votre entreprise *</label>
              <input type="text" id="clientCompany" placeholder="ex: Acme Corp" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;" value="${storedInfo?.company || ''}" required>
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; font-weight: bold; margin-bottom: 5px;">🔧 Service demandé *</label>
              <input type="text" id="clientService" placeholder="ex: Menuiserie, Plomberie" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;" value="${storedInfo?.service || ''}" required>
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; font-weight: bold; margin-bottom: 5px;">📝 Description du besoin *</label>
              <textarea id="clientDescription" placeholder="Décrivez précisément votre besoin..." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; height: 100px; resize: vertical; box-sizing: border-box;" required>${storedInfo?.description || ''}</textarea>
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; font-weight: bold; margin-bottom: 5px;">💰 Budget (optionnel)</label>
              <input type="text" id="clientBudget" placeholder="ex: 5000€ - 10000€" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;" value="${storedInfo?.budget || ''}">
            </div>
            
            <div style="margin-bottom: 20px;">
              <label style="display: block; font-weight: bold; margin-bottom: 5px;">⏰ Timeline (optionnel)</label>
              <input type="text" id="clientTimeline" placeholder="ex: Urgent, ASAP" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;" value="${storedInfo?.timeline || ''}">
            </div>

            <div style="margin-bottom: 20px;">
              <label style="display: block; font-weight: bold; margin-bottom: 5px;">📎 Fichiers à joindre (optionnel)</label>
              <input type="file" id="clientFiles" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png,.zip" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box;">
              <small style="color: #666; display: block; margin-top: 5px;">Max 5 fichiers, 10MB par fichier, 25MB total. Formats: PDF, DOC, XLS, Images, ZIP</small>
            </div>
            
            <div style="display: flex; gap: 10px;">
              <button type="submit" class="btn-primary" style="flex: 1; padding: 10px; background-color: #10b981; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
                ✅ ${isEditing ? 'Mettre à jour' : 'Enregistrer mes infos'}
              </button>
              <button type="button" id="closeModal" style="flex: 1; padding: 10px; background-color: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
                ❌ Fermer
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    document.getElementById('clientInfoForm').addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Récupérer les données du formulaire
      const clientInfo = {
        name: document.getElementById('clientName').value,
        email: document.getElementById('clientEmail').value,
        company: document.getElementById('clientCompany').value,
        service: document.getElementById('clientService').value,
        description: document.getElementById('clientDescription').value,
        budget: document.getElementById('clientBudget').value,
        timeline: document.getElementById('clientTimeline').value,
      };

      // Sauvegarder dans localStorage
      saveClientInfoToStorage(clientInfo);

      const modal = document.getElementById('clientInfoModal');
      modal.style.display = 'none';
      modal.remove();
      
      // Afficher les fichiers sélectionnés si disponibles
      const filesInput = document.getElementById('clientFiles');
      if (filesInput && filesInput.files.length > 0) {
        const fileNames = Array.from(filesInput.files).map(f => f.name).join(', ');
        showAlert(`✅ Infos enregistrées! ${filesInput.files.length} fichier(s) attaché(s): ${fileNames}`, 'success');
      } else {
        showAlert(`✅ ${isEditing ? 'Infos mises à jour!' : 'Vos informations ont été enregistrées!'}`, 'success');
      }

      // Ajouter le bouton de modification si ce n'était pas déjà fait
      if (!document.getElementById('editClientInfoBtn')) {
        addClientInfoButton();
      }
    });

    document.getElementById('closeModal').addEventListener('click', () => {
      const modal = document.getElementById('clientInfoModal');
      modal.remove();
    });
  }

  // Fonctions utilitaires
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    const container = document.querySelector('main');
    container.insertBefore(alertDiv, container.firstChild);

    setTimeout(() => {
      alertDiv.remove();
    }, 5000);
  }

  console.log('✅ SourceBot Frontend initialized');
});
