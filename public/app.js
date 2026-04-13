import { initializeMakeDropdowns, setupFormPersistence, restoreFormFields, updateModelDropdown } from './formUtils.js';
import { researchCar, getTestDriveGuide, getNegotiationStrategy } from './api.js';

// Expose functions to global scope for HTML onclick handlers
window.switchTab = switchTab;
window.toggleSearchMethod = toggleSearchMethod;
window.updateModelDropdown = updateModelDropdown;
window.researchCar = researchCar;
window.getTestDriveGuide = getTestDriveGuide;
window.getNegotiationStrategy = getNegotiationStrategy;

// Initialize on page load
window.addEventListener('DOMContentLoaded', function() {
  initializeMakeDropdowns();
  setupFormPersistence();
});

function switchTab(tabName, evt) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Show selected tab
  document.getElementById(tabName).classList.add('active');
  if (evt && evt.target) {
    evt.target.classList.add('active');
  }

  restoreFormFields();
}

function toggleSearchMethod() {
  const method = document.getElementById('searchMethod').value;
  document.getElementById('detailsSearch').style.display = method === 'details' ? 'block' : 'none';
  document.getElementById('vinSearch').style.display = method === 'vin' ? 'block' : 'none';
}
