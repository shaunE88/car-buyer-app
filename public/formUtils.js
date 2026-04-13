import { carDatabase } from './carDatabase.js';

// Map of field relationships: when one changes, sync to others
export const sharedFieldMaps = {
  'make': ['tdMake', 'negMake'],
  'tdMake': ['make', 'negMake'],
  'negMake': ['make', 'tdMake'],
  'model': ['tdModel', 'negModel'],
  'tdModel': ['model', 'negModel'],
  'negModel': ['model', 'tdModel'],
  'year': ['tdYear', 'negYear'],
  'tdYear': ['year', 'negYear'],
  'negYear': ['year', 'tdYear'],
  'mileage': ['negMileage'],
  'negMileage': ['mileage']
};

export const allFormFields = [
  'make', 'model', 'year', 'mileage', 'zipCode', 'searchMethod', 'vin', 'vinMileage',
  'tdMake', 'tdModel', 'tdYear',
  'negMake', 'negModel', 'negYear', 'negMileage', 'sellingPrice'
];

// Initialize make dropdown on page load
export function initializeMakeDropdowns() {
  const makes = Object.keys(carDatabase).sort();
  ['make', 'tdMake', 'negMake'].forEach(id => {
    const select = document.getElementById(id);
    if (select) {
      makes.forEach(make => {
        const option = document.createElement('option');
        option.value = make;
        option.textContent = make;
        select.appendChild(option);
      });
    }
  });
}

// Update model dropdown when make is selected
export function updateModelDropdown(modelId, makeId) {
  const makeSelect = document.getElementById(makeId);
  const modelSelect = document.getElementById(modelId);
  const selectedMake = makeSelect.value;

  // Clear model dropdown
  modelSelect.innerHTML = '<option value="">Select a Model...</option>';

  if (selectedMake && carDatabase[selectedMake]) {
    carDatabase[selectedMake].sort().forEach(model => {
      const option = document.createElement('option');
      option.value = model;
      option.textContent = model;
      modelSelect.appendChild(option);
    });
  }
}

// Setup form field persistence with cross-tab syncing
export function setupFormPersistence() {
  allFormFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      // Restore on load
      const saved = localStorage.getItem('carbuyer_' + id);
      if (saved) {
        el.value = saved;
        // If it's a make field, update the model dropdown
        if (id.endsWith('Make')) {
          const modelId = id.replace('Make', 'Model');
          updateModelDropdown(modelId, id);
          // Restore model selection if available
          const modelSaved = localStorage.getItem('carbuyer_' + modelId);
          if (modelSaved) {
            const modelSelect = document.getElementById(modelId);
            if (modelSelect) {
              modelSelect.value = modelSaved;
            }
          }
        }
      }
      
      // Sync changes across related fields
      el.addEventListener('change', () => {
        const value = el.value;
        localStorage.setItem('carbuyer_' + id, value);
        
        // Update model dropdowns when make changes
        if (id.endsWith('Make')) {
          const modelId = id.replace('Make', 'Model');
          updateModelDropdown(modelId, id);
          // Clear the model value if make changed
          const modelSelect = document.getElementById(modelId);
          if (modelSelect) {
            modelSelect.value = '';
            localStorage.setItem('carbuyer_' + modelId, '');
          }
        }
        
        // Sync to related fields if they exist
        if (sharedFieldMaps[id]) {
          sharedFieldMaps[id].forEach(relatedId => {
            const relatedEl = document.getElementById(relatedId);
            if (relatedEl) {
              relatedEl.value = value;
              localStorage.setItem('carbuyer_' + relatedId, value);
              // If we're syncing a make field, update its model dropdown too
              if (relatedId.endsWith('Make')) {
                const relatedModelId = relatedId.replace('Make', 'Model');
                updateModelDropdown(relatedModelId, relatedId);
              }
            }
          });
        }
      });
    }
  });
}

// Restore field values from localStorage
export function restoreFormFields() {
  allFormFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      const saved = localStorage.getItem('carbuyer_' + id);
      if (saved) {
        el.value = saved;
      }
    }
  });
}
