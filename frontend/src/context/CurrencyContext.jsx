import { createContext, useContext, useState, useEffect, useCallback } from "react";

const CurrencyContext = createContext(null);

const FALLBACK_INR_TO_USD = 0.012;
const MARKUP = 1.4; // 40% hike for non-India

export const CurrencyProvider = ({ children }) => {
  const [country, setCountry] = useState(null);
  const [isIndia, setIsIndia] = useState(true);
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

  const convert = useCallback((inrAmount, isDiscounted = false) => {
    if (isIndia) {
      const value = Math.round(inrAmount);
      const displayVal = isDiscounted ? value.toFixed(2) : value.toLocaleString("en-IN");
      return { symbol: "\u20B9", value, display: "\u20B9" + displayVal };
    }
    const raw = inrAmount * inrToUsd * MARKUP;
    const value = isDiscounted ? parseFloat(raw.toFixed(2)) : Math.ceil(raw);
    const displayVal = isDiscounted ? value.toFixed(2) : String(Math.ceil(raw));
    return { symbol: "$", value, display: "$" + displayVal };
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
