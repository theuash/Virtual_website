import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

// 180 major freelancing countries — code, name, flag emoji
const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷' },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰' },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵' },
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲' },
  { code: 'KH', name: 'Cambodia', flag: '🇰🇭' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼' },
  { code: 'SN', name: 'Senegal', flag: '🇸🇳' },
  { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮' },
  { code: 'CM', name: 'Cameroon', flag: '🇨🇲' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾' },
  { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'PA', name: 'Panama', flag: '🇵🇦' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻' },
  { code: 'NI', name: 'Nicaragua', flag: '🇳🇮' },
  { code: 'DO', name: 'Dominican Republic', flag: '🇩🇴' },
  { code: 'JM', name: 'Jamaica', flag: '🇯🇲' },
  { code: 'TT', name: 'Trinidad & Tobago', flag: '🇹🇹' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'BY', name: 'Belarus', flag: '🇧🇾' },
  { code: 'KZ', name: 'Kazakhstan', flag: '🇰🇿' },
  { code: 'UZ', name: 'Uzbekistan', flag: '🇺🇿' },
  { code: 'GE', name: 'Georgia', flag: '🇬🇪' },
  { code: 'AM', name: 'Armenia', flag: '🇦🇲' },
  { code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿' },
  { code: 'MD', name: 'Moldova', flag: '🇲🇩' },
  { code: 'RS', name: 'Serbia', flag: '🇷🇸' },
  { code: 'BA', name: 'Bosnia & Herzegovina', flag: '🇧🇦' },
  { code: 'MK', name: 'North Macedonia', flag: '🇲🇰' },
  { code: 'AL', name: 'Albania', flag: '🇦🇱' },
  { code: 'ME', name: 'Montenegro', flag: '🇲🇪' },
  { code: 'XK', name: 'Kosovo', flag: '🇽🇰' },
  { code: 'IQ', name: 'Iraq', flag: '🇮🇶' },
  { code: 'JO', name: 'Jordan', flag: '🇯🇴' },
  { code: 'LB', name: 'Lebanon', flag: '🇱🇧' },
  { code: 'PS', name: 'Palestine', flag: '🇵🇸' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲' },
  { code: 'YE', name: 'Yemen', flag: '🇾🇪' },
  { code: 'IR', name: 'Iran', flag: '🇮🇷' },
  { code: 'AF', name: 'Afghanistan', flag: '🇦🇫' },
  { code: 'MN', name: 'Mongolia', flag: '🇲🇳' },
  { code: 'KG', name: 'Kyrgyzstan', flag: '🇰🇬' },
  { code: 'TJ', name: 'Tajikistan', flag: '🇹🇯' },
  { code: 'TM', name: 'Turkmenistan', flag: '🇹🇲' },
  { code: 'DZ', name: 'Algeria', flag: '🇩🇿' },
  { code: 'LY', name: 'Libya', flag: '🇱🇾' },
  { code: 'SD', name: 'Sudan', flag: '🇸🇩' },
  { code: 'ZM', name: 'Zambia', flag: '🇿🇲' },
  { code: 'ZW', name: 'Zimbabwe', flag: '🇿🇼' },
  { code: 'MZ', name: 'Mozambique', flag: '🇲🇿' },
  { code: 'AO', name: 'Angola', flag: '🇦🇴' },
  { code: 'MG', name: 'Madagascar', flag: '🇲🇬' },
  { code: 'MU', name: 'Mauritius', flag: '🇲🇺' },
  { code: 'NA', name: 'Namibia', flag: '🇳🇦' },
  { code: 'BW', name: 'Botswana', flag: '🇧🇼' },
  { code: 'LS', name: 'Lesotho', flag: '🇱🇸' },
  { code: 'SZ', name: 'Eswatini', flag: '🇸🇿' },
  { code: 'MW', name: 'Malawi', flag: '🇲🇼' },
  { code: 'PG', name: 'Papua New Guinea', flag: '🇵🇬' },
  { code: 'FJ', name: 'Fiji', flag: '🇫🇯' },
  { code: 'WS', name: 'Samoa', flag: '🇼🇸' },
  { code: 'TO', name: 'Tonga', flag: '🇹🇴' },
  { code: 'VU', name: 'Vanuatu', flag: '🇻🇺' },
  { code: 'SB', name: 'Solomon Islands', flag: '🇸🇧' },
  { code: 'KI', name: 'Kiribati', flag: '🇰🇮' },
  { code: 'MV', name: 'Maldives', flag: '🇲🇻' },
  { code: 'BT', name: 'Bhutan', flag: '🇧🇹' },
  { code: 'TL', name: 'Timor-Leste', flag: '🇹🇱' },
  { code: 'BN', name: 'Brunei', flag: '🇧🇳' },
  { code: 'LA', name: 'Laos', flag: '🇱🇦' },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸' },
  { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮' },
  { code: 'MC', name: 'Monaco', flag: '🇲🇨' },
  { code: 'SM', name: 'San Marino', flag: '🇸🇲' },
  { code: 'AD', name: 'Andorra', flag: '🇦🇩' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'CU', name: 'Cuba', flag: '🇨🇺' },
  { code: 'HT', name: 'Haiti', flag: '🇭🇹' },
  { code: 'BS', name: 'Bahamas', flag: '🇧🇸' },
  { code: 'BB', name: 'Barbados', flag: '🇧🇧' },
  { code: 'LC', name: 'Saint Lucia', flag: '🇱🇨' },
  { code: 'VC', name: 'St. Vincent', flag: '🇻🇨' },
  { code: 'GD', name: 'Grenada', flag: '🇬🇩' },
  { code: 'AG', name: 'Antigua & Barbuda', flag: '🇦🇬' },
  { code: 'KN', name: 'Saint Kitts & Nevis', flag: '🇰🇳' },
  { code: 'DM', name: 'Dominica', flag: '🇩🇲' },
  { code: 'SR', name: 'Suriname', flag: '🇸🇷' },
  { code: 'GY', name: 'Guyana', flag: '🇬🇾' },
  { code: 'BZ', name: 'Belize', flag: '🇧🇿' },
  { code: 'MR', name: 'Mauritania', flag: '🇲🇷' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: 'NE', name: 'Niger', flag: '🇳🇪' },
  { code: 'TD', name: 'Chad', flag: '🇹🇩' },
  { code: 'CF', name: 'Central African Republic', flag: '🇨🇫' },
  { code: 'CG', name: 'Republic of Congo', flag: '🇨🇬' },
  { code: 'CD', name: 'DR Congo', flag: '🇨🇩' },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦' },
  { code: 'GQ', name: 'Equatorial Guinea', flag: '🇬🇶' },
  { code: 'ST', name: 'São Tomé & Príncipe', flag: '🇸🇹' },
  { code: 'CV', name: 'Cape Verde', flag: '🇨🇻' },
  { code: 'GM', name: 'Gambia', flag: '🇬🇲' },
  { code: 'GW', name: 'Guinea-Bissau', flag: '🇬🇼' },
  { code: 'GN', name: 'Guinea', flag: '🇬🇳' },
  { code: 'SL', name: 'Sierra Leone', flag: '🇸🇱' },
  { code: 'LR', name: 'Liberia', flag: '🇱🇷' },
  { code: 'TG', name: 'Togo', flag: '🇹🇬' },
  { code: 'BJ', name: 'Benin', flag: '🇧🇯' },
  { code: 'ER', name: 'Eritrea', flag: '🇪🇷' },
  { code: 'DJ', name: 'Djibouti', flag: '🇩🇯' },
  { code: 'SO', name: 'Somalia', flag: '🇸🇴' },
  { code: 'SS', name: 'South Sudan', flag: '🇸🇸' },
  { code: 'BI', name: 'Burundi', flag: '🇧🇮' },
  { code: 'KM', name: 'Comoros', flag: '🇰🇲' },
  { code: 'SC', name: 'Seychelles', flag: '🇸🇨' },
].sort((a, b) => a.name.localeCompare(b.name));

// Detect country from browser locale (instant fallback)
function detectCountryFromLocale() {
  try {
    const locale = navigator.language || 'en-US';
    const region = new Intl.Locale(locale).region;
    return COUNTRIES.find(c => c.code === region) || COUNTRIES.find(c => c.code === 'US');
  } catch {
    return COUNTRIES.find(c => c.code === 'US');
  }
}

export default function CountrySelector() {
  const { setIsIndia } = useCurrency();
  const [selected, setSelected] = useState(() => detectCountryFromLocale());
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Set initial currency on mount
  useEffect(() => {
    setIsIndia(selected?.code === 'IN');
  }, []);

  // Auto-detect via backend geo endpoint — API key stays server-side
  useEffect(() => {
    const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    fetch(`${BASE}/geo/country`)
      .then(r => r.json())
      .then(data => {
        const code = data?.data?.country_code;
        if (!code) return;
        const match = COUNTRIES.find(c => c.code === code);
        if (match) {
          setSelected(match);
          setIsIndia(match.code === 'IN');
        }
      })
      .catch(() => {}); // silently fall back to locale detection
  }, []);

  const handleSelect = (c) => {
    setSelected(c);
    setIsIndia(c.code === 'IN');
    setOpen(false);
    setQuery('');
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const filtered = query
    ? COUNTRIES.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    : COUNTRIES;

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => { setOpen(o => !o); setQuery(''); }}
        className="flex items-center gap-1 rounded-full transition-all hover:scale-110 active:scale-95"
        style={{
          width: 32, height: 32,
          border: '1px solid var(--border)',
          background: 'transparent',
          fontSize: 16,
          justifyContent: 'center',
        }}
        title={selected?.name}
      >
        <span>{selected?.flag}</span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-10 z-[200] rounded-xl border overflow-hidden"
            style={{
              width: 220,
              background: 'var(--bg-secondary)',
              borderColor: 'var(--border)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}
          >
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <Search size={12} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search country…"
                className="flex-1 bg-transparent text-xs outline-none"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>

            {/* List */}
            <div className="overflow-y-auto" style={{ maxHeight: 240 }}>
              {filtered.length === 0 ? (
                <p className="text-xs text-center py-4" style={{ color: 'var(--text-secondary)' }}>No results</p>
              ) : (
                filtered.map(c => (
                  <button
                    key={c.code}
                    onClick={() => handleSelect(c)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors"
                    style={{
                      background: selected?.code === c.code ? 'var(--accent)11' : 'transparent',
                      color: selected?.code === c.code ? 'var(--accent)' : 'var(--text-primary)',
                    }}
                    onMouseEnter={e => { if (selected?.code !== c.code) e.currentTarget.style.background = 'var(--bg-card)'; }}
                    onMouseLeave={e => { if (selected?.code !== c.code) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{ fontSize: 16 }}>{c.flag}</span>
                    <span className="text-xs font-medium truncate">{c.name}</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
