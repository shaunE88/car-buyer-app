import { formatObjectAsText, formatCurrency } from './formatters.js';

/**
 * Safely escape HTML to prevent XSS attacks
 */
function escapeHtml(text) {
  if (!text || typeof text !== 'string') return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}

export async function researchCar() {
  const method = document.getElementById('searchMethod').value;
  const resultsDiv = document.getElementById('researchResults');

  try {
    resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div>🔍 Researching car...</div>';

    let data = {};
    let endpoint = '';

    if (method === 'details') {
      const make = document.getElementById('make').value;
      const model = document.getElementById('model').value;
      const year = document.getElementById('year').value;
      const mileage = document.getElementById('mileage').value;
      const zipCode = document.getElementById('zipCode').value;

      if (!make || !model || !year || !mileage) {
        throw new Error('Please fill in all fields');
      }

      data = { make, model, year: parseInt(year), mileage: parseInt(mileage), zipCode: zipCode || null };
      endpoint = '/api/research/by-details';
    } else {
      const vin = document.getElementById('vin').value;
      const mileage = document.getElementById('vinMileage').value;

      if (!vin || !mileage) {
        throw new Error('Please fill in all fields');
      }

      data = { vin: vin.toUpperCase(), mileage: parseInt(mileage) };
      endpoint = '/api/research/by-vin';
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    // Handle non-JSON responses (like HTML error pages)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned an invalid response. Please try again.');
    }

    // Parse response safely
    let result;
    try {
      result = await response.json();
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      throw new Error('Unable to process server response. Please try again.');
    }

    // Check for error in response body
    if (result.error) {
      throw new Error(result.error);
    }

    if (!response.ok) {
      throw new Error(result.error || 'Research failed');
    }

    displayResearchResults(result, resultsDiv);
  } catch (error) {
    console.error('Research error:', error);
    resultsDiv.innerHTML = `<div class="error">⚠️ ${error.message || 'An unexpected error occurred. Please try again.'}</div>`;
  }
}

export function displayResearchResults(result, container) {
  let html = `
    <div class="result-section">
      <h3>🚗 Vehicle Info</h3>
      <div class="result-item">
        <strong>${result.vehicle.make} ${result.vehicle.model} ${result.vehicle.year}</strong>
        <p>Mileage: ${result.vehicle.mileage.toLocaleString()} miles</p>
        ${result.vehicle.vin ? `<p>VIN: ${result.vehicle.vin}</p>` : ''}
      </div>
    </div>
  `;

  if (result.reliability) {
    html += `
      <div class="result-section">
        <h3>⭐ Reliability & Ratings</h3>
        <div class="result-item">
          <strong>Reliability Rating:</strong>
          <p>${formatObjectAsText(result.reliability)}</p>
        </div>
        <div class="result-item">
          <strong>Safety Rating:</strong>
          <p>${result.safetyRating ? formatObjectAsText(result.safetyRating) : 'Information not available'}</p>
        </div>
        <div class="result-item">
          <strong>Fuel Economy:</strong>
          <p>${result.fuelEconomy ? formatObjectAsText(result.fuelEconomy) : 'Information not available'}</p>
        </div>
      </div>
    `;
  }

  if (result.commonIssues && result.commonIssues.length > 0) {
    html += `
      <div class="result-section">
        <h3>⚠️ Common Issues to Watch For</h3>
        <ul>
          ${result.commonIssues.map(issue => `<li>${formatValue(issue)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  if (result.averagePrice) {
    html += `
      <div class="result-section">
        <h3>💵 Pricing & Value</h3>
        <div class="result-item">
          <strong>Average Price Range:</strong>
          <p>${formatObjectAsText(result.averagePrice)}</p>
        </div>
        <div class="result-item">
          <strong>Maintenance Costs:</strong>
          <p>${result.maintenanceCosts ? formatObjectAsText(result.maintenanceCosts) : 'Information not available'}</p>
        </div>
        <div class="result-item">
          <strong>Resale Value:</strong>
          <p>${result.resaleValue ? formatObjectAsText(result.resaleValue) : 'Information not available'}</p>
        </div>
      </div>
    `;
  }

  if (result.keyFeatures && result.keyFeatures.length > 0) {
    html += `
      <div class="result-section">
        <h3>📋 Key Features & Concerns</h3>
        <ul>
          ${result.keyFeatures.map(feature => `<li>${formatValue(feature)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  if (result.localInventory && result.localInventory.length > 0) {
    html += `
      <div class="result-section">
        <h3>📍 Local Inventory Near You</h3>
        <p style="margin-bottom: 15px; color: #666; font-size: 0.95em;">Found ${result.localInventory.length} similar vehicles for sale:</p>
        ${result.localInventory.map(car => `
          <div class="result-item">
            <strong>${car.year} ${car.make} ${car.model}</strong>
            <p>Price: ${formatCurrency(car.price)} | Mileage: ${car.mileage.toLocaleString()} miles</p>
            ${car.dealer ? `<p>Dealer: ${car.dealer}</p>` : ''}
            ${car.url ? `<p><a href="${car.url}" target="_blank" style="color: #FF6B21; text-decoration: none;">View Listing →</a></p>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  container.innerHTML = html;
}

export async function getTestDriveGuide() {
  const make = document.getElementById('tdMake').value;
  const model = document.getElementById('tdModel').value;
  const year = document.getElementById('tdYear').value;
  const resultsDiv = document.getElementById('testDriveResults');

  if (!make || !model || !year) {
    resultsDiv.innerHTML = '<div class="error">❌ Please fill in all fields</div>';
    return;
  }

  try {
    resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div>📋 Generating test drive guide...</div>';

    const response = await fetch(`/api/test-drive/checklist?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}`);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned an invalid response. Please try again.');
    }

    // Parse response safely
    let result;
    try {
      result = await response.json();
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      throw new Error('Unable to process server response. Please try again.');
    }

    if (!response.ok || result.error) {
      throw new Error(result.error || 'Failed to get guide');
    }

    let html = `
      <div class="result-section">
        <h3>🔧 Pre-Test Drive Checks</h3>
        <ul>
          ${(result.preTestDriveChecks || []).map(item => `<li>${escapeHtml(String(item))}</li>`).join('')}
        </ul>
      </div>

      <div class="result-section">
        <h3>🚗 Exterior Inspection</h3>
        <ul>
          ${(result.exteriorInspection || []).map(item => `<li>${escapeHtml(String(item))}</li>`).join('')}
        </ul>
      </div>

      <div class="result-section">
        <h3>🪑 Interior Inspection</h3>
        <ul>
          ${(result.interiorInspection || []).map(item => `<li>${escapeHtml(String(item))}</li>`).join('')}
        </ul>
      </div>

      <div class="result-section">
        <h3>⚙️ Engine Compartment</h3>
        <ul>
          ${(result.engineCompartment || []).map(item => `<li>${escapeHtml(String(item))}</li>`).join('')}
        </ul>
      </div>

      <div class="result-section">
        <h3>🏎️ Test Drive Points</h3>
        <ul>
          ${(result.testDrivePoints || []).map(item => `<li>${escapeHtml(String(item))}</li>`).join('')}
        </ul>
      </div>

      <div class="result-section">
        <h3>🚩 Red Flags</h3>
        <ul>
          ${(result.redFlags || []).map(item => `<li>${escapeHtml(String(item))}</li>`).join('')}
        </ul>
      </div>

      ${result.modelSpecificConcerns && result.modelSpecificConcerns.length > 0 ? `
        <div class="result-section">
          <h3>🎯 Model-Specific Concerns</h3>
          <ul>
            ${result.modelSpecificConcerns.map(item => `<li>${escapeHtml(String(item))}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    `;
    resultsDiv.innerHTML = html;
  } catch (error) {
    console.error('Test drive error:', error);
    resultsDiv.innerHTML = `<div class="error">⚠️ ${error.message || 'An unexpected error occurred. Please try again.'}</div>`;
  }
}

export async function getNegotiationStrategy() {
  const make = document.getElementById('negMake').value;
  const model = document.getElementById('negModel').value;
  const year = document.getElementById('negYear').value;
  const mileage = document.getElementById('negMileage').value;
  const sellingPrice = document.getElementById('sellingPrice').value;
  const resultsDiv = document.getElementById('negotiationResults');

  if (!make || !model || !year || !mileage || !sellingPrice) {
    resultsDiv.innerHTML = '<div class="error">❌ Please fill in all fields</div>';
    return;
  }

  try {
    resultsDiv.innerHTML = '<div class="loading"><div class="spinner"></div>💰 Analyzing pricing strategy...</div>';

    const response = await fetch('/api/negotiation/strategy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        make, model, year: parseInt(year), mileage: parseInt(mileage), sellingPrice: parseInt(sellingPrice)
      })
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned an invalid response. Please try again.');
    }

    // Parse response safely
    let result;
    try {
      result = await response.json();
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      throw new Error('Unable to process server response. Please try again.');
    }

    if (!response.ok || result.error) {
      throw new Error(result.error || 'Failed to get strategy');
    }

    let html = `
      <div class="result-section">
        <h3>📊 Market Analysis</h3>
        <p>${escapeHtml(String(result.marketAnalysis || 'No analysis available'))}</p>
      </div>

      <div class="result-section">
        <h3>💰 Fair Price Range</h3>
        <p>${escapeHtml(String(result.fairPriceRange || 'Unable to determine'))}</p>
      </div>

      <div class="result-section">
        <h3>💵 Recommended Offer</h3>
        <div class="result-item">
          <strong>Suggested Opening Offer:</strong>
          <p>$${(result.suggestedOpeningOffer || 0).toLocaleString()}</p>
        </div>
        <div class="result-item">
          <strong>Walk Away Price:</strong>
          <p>$${(result.walkawayprice || 0).toLocaleString()}</p>
        </div>
      </div>

      <div class="result-section">
        <h3>📝 Negotiation Points</h3>
        <ul>
          ${(result.negotiationPoints || []).map(item => `<li>${escapeHtml(String(item))}</li>`).join('')}
        </ul>
      </div>

      <div class="result-section">
        <h3>💬 Negotiation Tips</h3>
        <ul>
          ${(result.negotiationTips || []).map(item => `<li>${escapeHtml(String(item))}</li>`).join('')}
        </ul>
      </div>

      ${result.possibleIssuesBasedOnMileage && result.possibleIssuesBasedOnMileage.length > 0 ? `
        <div class="result-section">
          <h3>⚠️ Possible Issues Based on Mileage</h3>
          <ul>
            ${result.possibleIssuesBasedOnMileage.map(item => `<li>${escapeHtml(String(item))}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    `;
    resultsDiv.innerHTML = html;
  } catch (error) {
    console.error('Negotiation error:', error);
    resultsDiv.innerHTML = `<div class="error">⚠️ ${error.message || 'An unexpected error occurred. Please try again.'}</div>`;
  }
}

function formatValue(value) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value;
  if (Array.isArray(value)) {
    return value.map(item => {
      if (typeof item === 'object' && item !== null) {
        return Object.entries(item).map(([k, v]) => `${k}: ${v}`).join(', ');
      }
      return String(item);
    }).join('; ');
  }
  if (typeof value === 'object' && value !== null) return JSON.stringify(value);
  return String(value);
}
