export type CurrencyCode = string;

export interface ExchangeRates {
    [key: string]: number;
}

export interface CacheData {
    rates: ExchangeRates;
    timestamp: number;
}

const CACHE_DURATION = 15 * 60 * 1000;
const cache: Map<CurrencyCode, CacheData> = new Map();

async function fetchExchangeRates(baseCurrency: CurrencyCode): Promise<ExchangeRates> {
    try {
        const response = await fetch(`https://api.coinbase.com/v2/exchange-rates?currency=${baseCurrency}`);
        if (!response.ok) throw new Error('Ошибка сети');

        const data = await response.json();
        return data.data.rates;
    } catch (error) {
        throw new Error(`Не удалось получить курсы валют: ${error}`);
    }
}

function getCachedRates(baseCurrency: CurrencyCode): ExchangeRates | null {
    const cached = cache.get(baseCurrency);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
    return isExpired ? null : cached.rates;
}

function cacheRates(baseCurrency: CurrencyCode, rates: ExchangeRates): void {
    cache.set(baseCurrency, {
        rates,
        timestamp: Date.now()
    });
}

export async function convertCurrency(
    amount: number,
    from: CurrencyCode,
    to: CurrencyCode
): Promise<number> {
    if (from === to) return amount;

    const baseCurrency = from;
    let rates = getCachedRates(baseCurrency);

    if (!rates) {
        rates = await fetchExchangeRates(baseCurrency);
        cacheRates(baseCurrency, rates);
    }

    if (!rates[to]) {
        throw new Error(`Не найден курс для валюты ${to}`);
    }

    return amount * rates[to];
}