import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CurrencyContext = createContext(null);

// Fallback rate if API fails
const FALLBACK_INR_TO_USD = 0.012;
const MARKUP = 1.4; // 40% hike for non-India

export const CurrencyProvider = ({ children }) => {
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
      .catch(() => {}) // silently fall back
      .finally(() => setRateLoaded(true));
  }, []);

  /**
   * Convert a price (always stored in INR) to display currency.
   * India  → return INR as-is, symbol ₹, whole numbers
   * Others → convert INR→USD, apply 40% markup, round up to nearest dollar
   * 
   * @param {number} inrAmount - price in INR
   * @param {boolean} isDiscounted - if true, show 2 decimals; if false, whole number
   */
  const convert = useCallback((inrAmount, isDiscounted = false) => {
    if (isIndia) {
      const value = Math.round(inrAmount);
      return {
        symbol: '₹',
        value,
        display: isDiscounted
          ? `₹${value.toFixed(2)}`
          : `₹${value.toLocaleString('en-IN')}`,
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
    <CurrencyContext.Provider value={{ isIndia, setIsIndia, convert, rateLoaded }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
};
