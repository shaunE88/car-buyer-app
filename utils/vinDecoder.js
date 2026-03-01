import axios from 'axios';

const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'vin-decoder19.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

export async function decodeVin(vin) {
  if (!RAPIDAPI_KEY) {
    throw new Error('RAPIDAPI_KEY not configured');
  }

  if (!vin || vin.length !== 17) {
    throw new Error('Invalid VIN: must be 17 characters');
  }

  try {
    const response = await axios.get(
      `https://${RAPIDAPI_HOST}/vin_decoder_lite`,
      {
        params: { vin },
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST
        }
      }
    );

    console.log('Raw VIN decoder response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('VIN decoder error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw new Error(`Failed to decode VIN: ${error.message}`);
  }
}

export function parseVinLocally(vin) {
  // Basic VIN parsing if decoder fails
  if (!vin || vin.length !== 17) {
    return null;
  }

  // Position 0-2: World Manufacturer Identifier (WMI)
  // Position 3-8: Vehicle Descriptor Section (VDS)
  // Position 9: Check digit
  // Position 10: Model year (simplified)
  // Position 11: Assembly plant
  // Position 12-16: Serial number

  return {
    vin: vin.toUpperCase(),
    wmi: vin.substring(0, 3),
    checkDigit: vin.substring(9, 10)
  };
}
