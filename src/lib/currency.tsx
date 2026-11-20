import React, { createContext, useContext, useState, useEffect } from 'react';

export type CurrencyCode = 'USD' | 'PHP' | 'EUR' | 'JPY';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rate: number; // exchange rate relative to USD
  label: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', rate: 1.0, label: 'USD ($)' },
  PHP: { code: 'PHP', symbol: '₱', rate: 58.0, label: 'PHP (₱)' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92, label: 'EUR (€)' },
  JPY: { code: 'JPY', symbol: '¥', rate: 155.0, label: 'JPY (¥)' },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (amountInUSD: number) => string;
  convertPrice: (amountInUSD: number) => number;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'USD',
  setCurrency: () => {},
  formatPrice: (amount: number) => `$${amount.toLocaleString()}`,
  convertPrice: (amount: number) => amount,
  symbol: '$',
});

const STORAGE_KEY = 'palacio_sanctuary_currency';

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as CurrencyCode;
      if (saved && CURRENCIES[saved]) return saved;
    } catch {}
    return 'USD';
  });

  const setCurrency = (code: CurrencyCode) => {
    if (CURRENCIES[code]) {
      setCurrencyState(code);
      try {
        localStorage.setItem(STORAGE_KEY, code);
      } catch {}
    }
  };

  const convertPrice = (amountInUSD: number): number => {
    const config = CURRENCIES[currency];
    const converted = amountInUSD * config.rate;
    // JPY doesn't use decimal places
    if (currency === 'JPY') {
      return Math.round(converted);
    }
    return Math.round(converted * 100) / 100;
  };

  const formatPrice = (amountInUSD: number): string => {
    const config = CURRENCIES[currency];
    const converted = convertPrice(amountInUSD);
    
    if (currency === 'JPY') {
      return `${config.symbol}${converted.toLocaleString('en-US')}`;
    }
    
    return `${config.symbol}${converted.toLocaleString('en-US', {
      minimumFractionDigits: Number.isInteger(converted) ? 0 : 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        convertPrice,
        symbol: CURRENCIES[currency].symbol,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
