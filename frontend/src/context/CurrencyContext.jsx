import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CurrencyContext = createContext(null);

const FALLBACK_INR_TO_USD = 0.012;
const MARKUP = 1.4; // 40% hike for non-India

export const CurrencyProvider = ({ children }) => {
  // country: { code, name, flag } — set once by CountrySelector from geo detection
  const [country, setCountry] = useState(null);
  const [isIndia, setIsIndia] = useState(true);
  const [inrToUsd, setInrToUsd] = useState(FALLBACK_INR_TO_USD);
  const [rateLoaded, setRateLoaded] = useState(false);

  // Fetch live INR→USD rate once on mount
  useEffect(() => {
    fetch('https://api.exchangerate-api.com/v4/latest/INR')
      .then(r => r.json())
      .then(data => {
        const rate = data?.rates?.USD;
        if (rate && rate > 0) setInrToUsd(rate);
      })
      .catch(() => {})
      .finally(() => setRateLoaded(true));
  }, []);

  // When country changes, sync isIndia
  const setDetectedCountry = useCallback((c) => {
    setCountry(c);
    setIsIndia(c?.code === 'IN');
  }, []);

  /**
   * Convert a price (always stored in INR) to display currency.
   * India  → ₹ whole numbers (discounted: 2dp)
   * Others → $ with 40% markup (discounted: 2dp)
   */
  const convert = useCallback((inrAmount, isDiscounted = false) => {
    if (isIndia) {
      const value = Math.round(inrAmount);
      return {
        symbol: '₹',
        value,
        display: isDiscounted ? `₹${value.toFixed(2)}` : `₹${value.toLocaleString('en-IN')}`,
      };
    }
    const raw = inrAmount * inrToUsd * MARKUP;
    const value = isDiscounted ? parseFloat(raw.toFixed(2)) : Math.ceil(raw);
    return {
      symbol: '$',
      value,
      display: isDiscounted ? `$${value.toFixed(2)}` : `$${Math.ceil(raw)}`,
    };
  }, [isIndia, inrToUsd]);

  return (
    <CurrencyContext.Provider value={{
      country,           
      setDetectedCountry,
      isIndia,
      setIsIndia,        
      convert,
      rateLoaded,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
};