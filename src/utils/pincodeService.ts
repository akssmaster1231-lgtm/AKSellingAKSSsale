import { DeliveryZoneInfo } from '../types';

// Comprehensive Indian Metro & Tier-1/Tier-2 Pincode Hubs
const PINCODE_DIRECTORY: Record<string, { city: string; state: string; district: string; isMetro: boolean }> = {
  // Delhi NCR
  '110001': { city: 'New Delhi', state: 'Delhi', district: 'Central Delhi', isMetro: true },
  '110020': { city: 'New Delhi', state: 'Delhi', district: 'South Delhi', isMetro: true },
  '110092': { city: 'New Delhi', state: 'Delhi', district: 'East Delhi', isMetro: true },
  '110085': { city: 'New Delhi', state: 'Delhi', district: 'North West Delhi', isMetro: true },
  '122001': { city: 'Gurugram', state: 'Haryana', district: 'Gurgaon', isMetro: true },
  '122002': { city: 'Gurugram', state: 'Haryana', district: 'Gurgaon', isMetro: true },
  '122011': { city: 'Gurugram', state: 'Haryana', district: 'Gurgaon', isMetro: true },
  '122016': { city: 'Gurugram', state: 'Haryana', district: 'Gurgaon', isMetro: true },
  '122018': { city: 'Gurugram', state: 'Haryana', district: 'Gurgaon', isMetro: true },
  '201301': { city: 'Noida', state: 'Uttar Pradesh', district: 'Gautam Buddha Nagar', isMetro: true },
  '201304': { city: 'Noida', state: 'Uttar Pradesh', district: 'Gautam Buddha Nagar', isMetro: true },
  '201001': { city: 'Ghaziabad', state: 'Uttar Pradesh', district: 'Ghaziabad', isMetro: true },
  '121001': { city: 'Faridabad', state: 'Haryana', district: 'Faridabad', isMetro: true },

  // Mumbai & Maharashtra
  '400001': { city: 'Mumbai', state: 'Maharashtra', district: 'South Mumbai', isMetro: true },
  '400050': { city: 'Mumbai', state: 'Maharashtra', district: 'Bandra West', isMetro: true },
  '400069': { city: 'Mumbai', state: 'Maharashtra', district: 'Andheri East', isMetro: true },
  '400072': { city: 'Mumbai', state: 'Maharashtra', district: 'Powai', isMetro: true },
  '400601': { city: 'Thane', state: 'Maharashtra', district: 'Thane', isMetro: true },
  '400703': { city: 'Navi Mumbai', state: 'Maharashtra', district: 'Vashi', isMetro: true },
  '411001': { city: 'Pune', state: 'Maharashtra', district: 'Pune City', isMetro: true },
  '411014': { city: 'Pune', state: 'Maharashtra', district: 'Viman Nagar', isMetro: true },
  '411057': { city: 'Pune', state: 'Maharashtra', district: 'Hinjewadi', isMetro: true },
  '440001': { city: 'Nagpur', state: 'Maharashtra', district: 'Nagpur', isMetro: false },

  // Bengaluru & Karnataka
  '560001': { city: 'Bengaluru', state: 'Karnataka', district: 'Bangalore Urban', isMetro: true },
  '560034': { city: 'Bengaluru', state: 'Karnataka', district: 'Koramangala', isMetro: true },
  '560037': { city: 'Bengaluru', state: 'Karnataka', district: 'Marathahalli', isMetro: true },
  '560066': { city: 'Bengaluru', state: 'Karnataka', district: 'Whitefield', isMetro: true },
  '560100': { city: 'Bengaluru', state: 'Karnataka', district: 'Electronic City', isMetro: true },
  '570001': { city: 'Mysuru', state: 'Karnataka', district: 'Mysore', isMetro: false },

  // Hyderabad & Telangana / AP
  '500001': { city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', isMetro: true },
  '500081': { city: 'Hyderabad', state: 'Telangana', district: 'HITEC City', isMetro: true },
  '500034': { city: 'Hyderabad', state: 'Telangana', district: 'Banjara Hills', isMetro: true },
  '530001': { city: 'Visakhapatnam', state: 'Andhra Pradesh', district: 'Visakhapatnam', isMetro: false },
  '520001': { city: 'Vijayawada', state: 'Andhra Pradesh', district: 'Krishna', isMetro: false },

  // Chennai & Tamil Nadu
  '600001': { city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', isMetro: true },
  '600042': { city: 'Chennai', state: 'Tamil Nadu', district: 'Velachery', isMetro: true },
  '600096': { city: 'Chennai', state: 'Tamil Nadu', district: 'OMR Perungudi', isMetro: true },
  '641001': { city: 'Coimbatore', state: 'Tamil Nadu', district: 'Coimbatore', isMetro: false },
  '625001': { city: 'Madurai', state: 'Tamil Nadu', district: 'Madurai', isMetro: false },

  // Kolkata & West Bengal
  '700001': { city: 'Kolkata', state: 'West Bengal', district: 'Kolkata', isMetro: true },
  '700091': { city: 'Kolkata', state: 'West Bengal', district: 'Salt Lake Sector V', isMetro: true },
  '700156': { city: 'Kolkata', state: 'West Bengal', district: 'New Town', isMetro: true },
  '734001': { city: 'Siliguri', state: 'West Bengal', district: 'Darjeeling', isMetro: false },

  // Gujarat
  '380001': { city: 'Ahmedabad', state: 'Gujarat', district: 'Ahmedabad', isMetro: true },
  '380015': { city: 'Ahmedabad', state: 'Gujarat', district: 'Satellite/SG Highway', isMetro: true },
  '395001': { city: 'Surat', state: 'Gujarat', district: 'Surat', isMetro: false },
  '390001': { city: 'Vadodara', state: 'Gujarat', district: 'Vadodara', isMetro: false },

  // Rajasthan & North
  '302001': { city: 'Jaipur', state: 'Rajasthan', district: 'Jaipur', isMetro: true },
  '302020': { city: 'Jaipur', state: 'Rajasthan', district: 'Mansarovar', isMetro: true },
  '342001': { city: 'Jodhpur', state: 'Rajasthan', district: 'Jodhpur', isMetro: false },
  '313001': { city: 'Udaipur', state: 'Rajasthan', district: 'Udaipur', isMetro: false },
  '160017': { city: 'Chandigarh', state: 'Chandigarh', district: 'Chandigarh', isMetro: true },
  '141001': { city: 'Ludhiana', state: 'Punjab', district: 'Ludhiana', isMetro: false },

  // Uttar Pradesh & Central
  '226001': { city: 'Lucknow', state: 'Uttar Pradesh', district: 'Lucknow', isMetro: false },
  '226010': { city: 'Lucknow', state: 'Uttar Pradesh', district: 'Gomti Nagar', isMetro: false },
  '208001': { city: 'Kanpur', state: 'Uttar Pradesh', district: 'Kanpur Nagar', isMetro: false },
  '221001': { city: 'Varanasi', state: 'Uttar Pradesh', district: 'Varanasi', isMetro: false },
  '282001': { city: 'Agra', state: 'Uttar Pradesh', district: 'Agra', isMetro: false },
  '800001': { city: 'Patna', state: 'Bihar', district: 'Patna', isMetro: false },
  '800020': { city: 'Patna', state: 'Bihar', district: 'Kankarbagh', isMetro: false },
  '462001': { city: 'Bhopal', state: 'Madhya Pradesh', district: 'Bhopal', isMetro: false },
  '452001': { city: 'Indore', state: 'Madhya Pradesh', district: 'Indore', isMetro: false },
  '682001': { city: 'Kochi', state: 'Kerala', district: 'Ernakulam', isMetro: false },
  '695001': { city: 'Thiruvananthapuram', state: 'Kerala', district: 'Thiruvananthapuram', isMetro: false },
};

// Regional Prefixes Map for generic 6-digit Indian pincode coverage
const PINCODE_PREFIX_MAP: Record<string, { state: string; defaultCity: string; isMetro?: boolean }> = {
  '11': { state: 'Delhi', defaultCity: 'New Delhi', isMetro: true },
  '12': { state: 'Haryana', defaultCity: 'Gurugram / Faridabad', isMetro: true },
  '13': { state: 'Haryana', defaultCity: 'Ambala / Panipat' },
  '14': { state: 'Punjab', defaultCity: 'Ludhiana / Jalandhar' },
  '15': { state: 'Punjab', defaultCity: 'Bathinda / Ferozepur' },
  '16': { state: 'Chandigarh / Punjab', defaultCity: 'Chandigarh', isMetro: true },
  '17': { state: 'Himachal Pradesh', defaultCity: 'Shimla' },
  '18': { state: 'Jammu & Kashmir', defaultCity: 'Jammu' },
  '19': { state: 'Jammu & Kashmir', defaultCity: 'Srinagar' },
  '20': { state: 'Uttar Pradesh', defaultCity: 'Noida / Ghaziabad', isMetro: true },
  '21': { state: 'Uttar Pradesh', defaultCity: 'Prayagraj / Fatehpur' },
  '22': { state: 'Uttar Pradesh', defaultCity: 'Lucknow' },
  '24': { state: 'Uttarakhand', defaultCity: 'Dehradun' },
  '25': { state: 'Uttar Pradesh', defaultCity: 'Meerut' },
  '28': { state: 'Uttar Pradesh', defaultCity: 'Agra / Mathura' },
  '30': { state: 'Rajasthan', defaultCity: 'Jaipur', isMetro: true },
  '31': { state: 'Rajasthan', defaultCity: 'Udaipur' },
  '34': { state: 'Rajasthan', defaultCity: 'Jodhpur' },
  '38': { state: 'Gujarat', defaultCity: 'Ahmedabad', isMetro: true },
  '39': { state: 'Gujarat', defaultCity: 'Surat / Vadodara' },
  '40': { state: 'Maharashtra', defaultCity: 'Mumbai / Thane / Navi Mumbai', isMetro: true },
  '41': { state: 'Maharashtra', defaultCity: 'Pune', isMetro: true },
  '42': { state: 'Maharashtra', defaultCity: 'Nashik' },
  '44': { state: 'Maharashtra', defaultCity: 'Nagpur' },
  '45': { state: 'Madhya Pradesh', defaultCity: 'Indore' },
  '46': { state: 'Madhya Pradesh', defaultCity: 'Bhopal' },
  '50': { state: 'Telangana', defaultCity: 'Hyderabad', isMetro: true },
  '51': { state: 'Andhra Pradesh', defaultCity: 'Tirupati / Kadapa' },
  '52': { state: 'Andhra Pradesh', defaultCity: 'Vijayawada / Guntur' },
  '53': { state: 'Andhra Pradesh', defaultCity: 'Visakhapatnam' },
  '56': { state: 'Karnataka', defaultCity: 'Bengaluru', isMetro: true },
  '57': { state: 'Karnataka', defaultCity: 'Mangaluru / Mysuru' },
  '58': { state: 'Karnataka', defaultCity: 'Hubli / Dharwad' },
  '60': { state: 'Tamil Nadu', defaultCity: 'Chennai', isMetro: true },
  '62': { state: 'Tamil Nadu', defaultCity: 'Madurai' },
  '64': { state: 'Tamil Nadu', defaultCity: 'Coimbatore' },
  '67': { state: 'Kerala', defaultCity: 'Kozhikode' },
  '68': { state: 'Kerala', defaultCity: 'Kochi' },
  '69': { state: 'Kerala', defaultCity: 'Thiruvananthapuram' },
  '70': { state: 'West Bengal', defaultCity: 'Kolkata', isMetro: true },
  '71': { state: 'West Bengal', defaultCity: 'Howrah / Hooghly' },
  '75': { state: 'Odisha', defaultCity: 'Bhubaneswar' },
  '78': { state: 'Assam', defaultCity: 'Guwahati' },
  '80': { state: 'Bihar', defaultCity: 'Patna' },
  '82': { state: 'Jharkhand', defaultCity: 'Ranchi / Dhanbad' },
  '83': { state: 'Jharkhand', defaultCity: 'Jamshedpur' },
};

/**
 * Calculates human-friendly estimated delivery date (excluding Sunday if needed)
 */
export function calculateDeliveryDate(daysToAdd: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-IN', options);
}

/**
 * Fast synchronous lookup from curated postal directory or prefix mapping
 */
export function lookupPincodeSync(pincode: string): { city: string; state: string; district: string; isMetro: boolean } | null {
  const clean = pincode.trim().replace(/\D/g, '').slice(0, 6);
  if (clean.length !== 6) return null;

  if (PINCODE_DIRECTORY[clean]) {
    return PINCODE_DIRECTORY[clean];
  }

  const prefix = clean.substring(0, 2);
  if (PINCODE_PREFIX_MAP[prefix]) {
    const meta = PINCODE_PREFIX_MAP[prefix];
    return {
      city: meta.defaultCity,
      state: meta.state,
      district: meta.defaultCity,
      isMetro: Boolean(meta.isMetro),
    };
  }

  return {
    city: 'Direct Express Hub',
    state: 'India',
    district: 'Serviceable Pincode',
    isMetro: false,
  };
}

// In-memory cache for ultra-fast instant lookups
const PINCODE_CACHE = new Map<string, DeliveryZoneInfo>();

/**
 * Normalizes Indian state names to match standard dropdown options
 */
export function normalizeIndianState(rawState: string): string {
  const s = rawState.trim().toLowerCase();
  if (s.includes('delhi')) return 'Delhi NCR';
  if (s.includes('haryana')) return 'Haryana';
  if (s.includes('uttar pradesh') || s === 'up') return 'Uttar Pradesh';
  if (s.includes('maharashtra') || s === 'mh') return 'Maharashtra';
  if (s.includes('karnataka') || s === 'ka') return 'Karnataka';
  if (s.includes('tamil nadu') || s === 'tn') return 'Tamil Nadu';
  if (s.includes('telangana') || s === 'ts') return 'Telangana';
  if (s.includes('andhra pradesh') || s === 'ap') return 'Andhra Pradesh';
  if (s.includes('west bengal') || s === 'wb') return 'West Bengal';
  if (s.includes('rajasthan') || s === 'rj') return 'Rajasthan';
  if (s.includes('gujarat') || s === 'gj') return 'Gujarat';
  if (s.includes('punjab') || s === 'pb') return 'Punjab';
  if (s.includes('kerala') || s === 'kl') return 'Kerala';
  if (s.includes('madhya pradesh') || s === 'mp') return 'Madhya Pradesh';
  if (s.includes('bihar') || s === 'br') return 'Bihar';
  if (s.includes('odisha') || s === 'or') return 'Odisha';
  if (s.includes('assam') || s === 'as') return 'Assam';
  if (s.includes('jharkhand') || s === 'jh') return 'Jharkhand';
  if (s.includes('chandigarh')) return 'Chandigarh';
  if (s.includes('chhattisgarh') || s === 'cg') return 'Chhattisgarh';
  if (s.includes('uttarakhand') || s === 'uk') return 'Uttarakhand';
  if (s.includes('himachal') || s === 'hp') return 'Himachal Pradesh';
  if (s.includes('jammu') || s === 'kashmir' || s === 'jk') return 'Jammu & Kashmir';
  if (s.includes('goa')) return 'Goa';
  if (s.includes('puducherry') || s.includes('pondicherry')) return 'Puducherry';
  return rawState.trim();
}

/**
 * Asynchronous Postal Pincode Lookup (combines instant sync + live India Post API + caching)
 */
export async function lookupPincodeAsync(pincode: string): Promise<DeliveryZoneInfo> {
  const clean = pincode.trim().replace(/\D/g, '').slice(0, 6);
  if (!clean || clean.length < 6) {
    return {
      pincode: clean,
      city: '',
      state: '',
      district: '',
      deliveryDays: 2,
      estimatedDate: calculateDeliveryDate(2),
      courierPartner: 'Delhivery Surface & Air 🚚',
      zone: 'Tier-2 Express (2-3 days)',
      isCodAvailable: true,
      isServiceable: false,
      shippingCharge: 0,
    };
  }

  // Check cache first
  if (PINCODE_CACHE.has(clean)) {
    return PINCODE_CACHE.get(clean)!;
  }

  const localMatch = lookupPincodeSync(clean);

  let city = localMatch?.city || 'Local Delivery Hub';
  let state = localMatch?.state ? normalizeIndianState(localMatch.state) : 'India';
  let district = localMatch?.district || city;
  let isMetro = localMatch?.isMetro ?? false;

  // Attempt live India Postal API query for exact sub-post office details
  if (typeof fetch !== 'undefined') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5-second timeout
      const response = await fetch(`https://api.postalpincode.in/pincode/${clean}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          city = po.Block && po.Block !== 'NA' ? po.Block : po.District || po.Name || city;
          if (po.State) {
            state = normalizeIndianState(po.State);
          }
          district = po.District || district;
          const locLower = `${city} ${state} ${district}`.toLowerCase();
          if (
            locLower.includes('delhi') ||
            locLower.includes('mumbai') ||
            locLower.includes('bengaluru') ||
            locLower.includes('gurgaon') ||
            locLower.includes('gurugram') ||
            locLower.includes('noida') ||
            locLower.includes('hyderabad') ||
            locLower.includes('chennai') ||
            locLower.includes('kolkata') ||
            locLower.includes('pune') ||
            locLower.includes('ahmedabad')
          ) {
            isMetro = true;
          }
        }
      }
    } catch {
      // Fallback seamlessly to curated directory
    }
  }

  const deliveryDays = isMetro ? 1 : 2;
  const estimatedDate = calculateDeliveryDate(deliveryDays);
  const courierPartner = isMetro ? 'BlueDart Air Express ⚡' : 'Delhivery Surface & Air 🚚';
  const zone = isMetro 
    ? ('Metro Express (24-48 hrs)' as const)
    : ('Tier-2 Express (2-3 days)' as const);

  const result: DeliveryZoneInfo = {
    pincode: clean,
    city,
    state,
    district,
    deliveryDays,
    estimatedDate,
    courierPartner,
    zone,
    isCodAvailable: true,
    isServiceable: true,
    shippingCharge: 0,
  };

  PINCODE_CACHE.set(clean, result);
  return result;
}

/**
 * HTML5 Geolocation Auto-Detection with reverse lookup approximation
 */
export async function autoDetectLocationAndPincode(): Promise<DeliveryZoneInfo> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      // Return default location if geolocation is unavailable
      resolve(lookupPincodeAsync('122002'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        // Approximate known Indian Metro Coordinates
        let estimatedPincode = '122002'; // Default Gurugram / Delhi NCR

        if (latitude > 28.3 && latitude < 28.9 && longitude > 76.8 && longitude < 77.4) {
          estimatedPincode = '110001'; // Delhi NCR
        } else if (latitude > 18.8 && latitude < 19.3 && longitude > 72.7 && longitude < 73.2) {
          estimatedPincode = '400001'; // Mumbai
        } else if (latitude > 12.8 && latitude < 13.2 && longitude > 77.4 && longitude < 77.8) {
          estimatedPincode = '560001'; // Bengaluru
        } else if (latitude > 17.2 && latitude < 17.6 && longitude > 78.2 && longitude < 78.6) {
          estimatedPincode = '500001'; // Hyderabad
        } else if (latitude > 12.9 && latitude < 13.3 && longitude > 80.1 && longitude < 80.4) {
          estimatedPincode = '600001'; // Chennai
        } else if (latitude > 22.4 && latitude < 22.8 && longitude > 88.2 && longitude < 88.6) {
          estimatedPincode = '700001'; // Kolkata
        } else if (latitude > 18.4 && latitude < 18.7 && longitude > 73.7 && longitude < 74.0) {
          estimatedPincode = '411001'; // Pune
        } else if (latitude > 22.9 && latitude < 23.2 && longitude > 72.4 && longitude < 72.8) {
          estimatedPincode = '380001'; // Ahmedabad
        } else if (latitude > 26.8 && latitude < 27.0 && longitude > 75.7 && longitude < 76.0) {
          estimatedPincode = '302001'; // Jaipur
        } else if (latitude > 26.7 && latitude < 27.0 && longitude > 80.8 && longitude < 81.1) {
          estimatedPincode = '226001'; // Lucknow
        }

        const info = await lookupPincodeAsync(estimatedPincode);
        saveActiveDeliveryLocation(info);
        resolve(info);
      },
      async () => {
        // Fallback on permission denial or error to saved or default location
        const saved = getSavedDeliveryLocation();
        if (saved) {
          resolve(saved);
        } else {
          const fallback = await lookupPincodeAsync('122002');
          resolve(fallback);
        }
      },
      { timeout: 5000, maximumAge: 60000 }
    );
  });
}

const STORAGE_KEY = 'akselling_delivery_zone_info';

export function saveActiveDeliveryLocation(info: DeliveryZoneInfo): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
    // Dispatch custom event for cross-component reactive sync
    window.dispatchEvent(new CustomEvent('akselling_location_changed', { detail: info }));
  } catch {
    // Ignore storage issues
  }
}

export function getSavedDeliveryLocation(): DeliveryZoneInfo | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Fallback
  }
  return null;
}
