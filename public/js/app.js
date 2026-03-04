// SourceBot Client - Application Frontend
document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('searchForm');
  const resultsContainer = document.getElementById('resultsContainer');
  const resultsList = document.getElementById('resultsList');

  // Gestion du formulaire
  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(searchForm);
    const data = {
      category: formData.get('category'),
      description: formData.get('description'),
      country: formData.get('country'),
      radius: parseInt(formData.get('radius'), 10),
      budget: formData.get('budget') ? parseFloat(formData.get('budget')) : null,
    };

    console.log('📤 Envoi de la requête:', data);

    try {
      // Désactiver le bouton lors de l'envoi
      const submitBtn = searchForm.querySelector('.btn-primary');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Recherche en cours...';

      // Simuler un appel API (à remplacer en Phase 2)
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const results = await response.json();
      displayResults(results);
      resultsContainer.style.display = 'block';
      resultsContainer.scrollIntoView({ behavior: 'smooth' });

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
  function displayResults(companies) {
    if (!companies || companies.length === 0) {
      resultsList.innerHTML =
        '<p style="grid-column: 1/-1; text-align: center; color: #64748b;">Aucun résultat trouvé</p>';
      return;
    }

    resultsList.innerHTML = companies
      .map(
        (company) => `
      <div class="result-card">
        <h4>${escapeHtml(company.name)}</h4>
        <p><strong>Adresse:</strong> ${escapeHtml(company.address || 'N/A')}</p>
        ${company.phone ? `<p><strong>Téléphone:</strong> <a href="tel:${company.phone}">${company.phone}</a></p>` : ''}
        ${company.email ? `<p><strong>Email:</strong> <a href="mailto:${company.email}">${company.email}</a></p>` : ''}
        ${company.website ? `<p><strong>Site:</strong> <a href="${company.website}" target="_blank">Visiter</a></p>` : ''}
        ${company.rating ? `<p><strong>Note:</strong> ⭐ ${company.rating}/5</p>` : ''}
        <span class="result-badge">Distance: ${company.distance || 'N/A'}</span>
      </div>
    `
      )
      .join('');
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
