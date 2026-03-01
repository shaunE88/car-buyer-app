// Placeholder - actual VIN parsing is done by RapidAPI service
export function parseVin(vin) {
  if (!vin || vin.length !== 17) {
    return null;
  }
  // This will be replaced by actual decodeVin from vinDecoder.js
  return {
    vin: vin.toUpperCase(),
    wmi: vin.substring(0, 3)
  };
}
