export function formatValue(value) {
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

export function formatCurrency(value) {
  if (!value) return 'N/A';
  if (typeof value === 'number') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
  return String(value);
}

export function formatObjectAsText(obj) {
  if (!obj) return 'Information not available';
  if (typeof obj === 'string') return obj;
  if (typeof obj === 'number') return obj;
  if (Array.isArray(obj)) {
    if (obj.every(item => typeof item === 'string' || typeof item === 'number')) {
      return obj.join('; ');
    }
    return obj.map(item => {
      if (typeof item === 'object') return Object.entries(item).map(([k, v]) => `${k}: ${v}`).join(', ');
      return String(item);
    }).join('; ');
  }
  if (typeof obj === 'object') {
    return Object.entries(obj)
      .map(([key, val]) => {
        if (typeof val === 'object') {
          return `${key}: ${formatObjectAsText(val)}`;
        }
        if (typeof val === 'number' && (key.toLowerCase().includes('price') || key.toLowerCase().includes('cost') || key.toLowerCase().includes('value'))) {
          return `${key}: ${formatCurrency(val)}`;
        }
        return `${key}: ${val}`;
      })
      .join('; ');
  }
  return String(obj);
}
