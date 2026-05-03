import { createContext, useContext, useState, useEffect, useCallback } from "react";

const CurrencyContext = createContext(null);

const FALLBACK_INR_TO_USD = 0.012;
const MARKUP = 1; // 1:1 ratio for non-India (requested)

// Rounds a USD value to the nearest psychological price (X4.99 or X9.99)
function psychoPrice(rawUsd) {
  if (rawUsd < 0.1) return 0;
  const floor = Math.floor(rawUsd);
  const lastDigit = floor % 10;
  const base = Math.floor(floor / 10) * 10;

  if (lastDigit === 0) {
    return floor > 0 ? parseFloat((floor - 0.01).toFixed(2)) : 0.99;
  } else if (lastDigit >= 1 && lastDigit <= 4) {
    return parseFloat((base + 4.99).toFixed(2));
  } else {
    return parseFloat((base + 9.99).toFixed(2));
  }
}

// Quick locale-based guess — replaced by real selection/geo ASAP
function guessIsIndiaFromLocale() {
  try {
    const locale = navigator.language || '';
    const region = new Intl.Locale(locale).region;
    return region === 'IN';
  } catch {
    return false; // default to non-India so USD shows for unknowns
  }
}

export const CurrencyProvider = ({ children }) => {
  const [country, setCountry] = useState(null);
  const [isIndia, setIsIndia] = useState(() => guessIsIndiaFromLocale());
  const [inrToUsd, setInrToUsd] = useState(FALLBACK_INR_TO_USD);
  const [rateLoaded, setRateLoaded] = useState(false);

  useEffect(() => {
    fetch("https://api.exchangerate-api.com/v4/latest/INR")
      .then(r => r.json())
      .then(data => {
        const rate = data?.rates?.USD;
        if (rate && rate > 0) setInrToUsd(rate);
      })
      .catch(() => {})
      .finally(() => setRateLoaded(true));
  }, []);

  const setDetectedCountry = useCallback((c) => {
    setCountry(c);
    setIsIndia(c?.code === "IN");
  }, []);

  const convert = useCallback((inrAmount, isDiscounted = false, skipRounding = false) => {
    const cleanInr = Math.max(0, Math.floor(Number(inrAmount) || 0));
    
    if (isIndia) {
      const displayVal = isDiscounted ? cleanInr.toFixed(2) : cleanInr.toLocaleString("en-IN");
      return { symbol: "\u20B9", value: cleanInr, display: "\u20B9" + displayVal };
    }

    if (cleanInr === 0) {
      return { symbol: "$", value: 0, display: "$0.00" };
    }

    const raw = cleanInr * inrToUsd * (skipRounding ? 1 : MARKUP);
    const value = skipRounding ? parseFloat(raw.toFixed(2)) : psychoPrice(raw);
    return { symbol: "$", value, display: "$" + value.toFixed(2) };
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
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
};
