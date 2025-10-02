// Countries API integration and caching
const API_URL = 'https://restcountries.com/v3.1/all?fields=name,flags,unMember';
const CACHE_KEY = 'countries_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export class CountriesAPI {
  constructor() {
    this.countries = [];
    this.isLoaded = false;
  }

  async loadCountries() {
    try {
      // Check cache first
      const cached = this.getCachedCountries();
      if (cached) {
        this.countries = cached;
        this.isLoaded = true;
        return this.countries;
      }

      // Check network connectivity
      if (!navigator.onLine) {
        console.log('No network connection, using fallback data');
        this.countries = this.getFallbackCountries();
        this.isLoaded = true;
        return this.countries;
      }

      // Fetch from API with timeout
      console.log('Loading countries from API...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`API Error: ${response.status} ${response.statusText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Filter and map countries with improved flag URLs
      this.countries = data
        .filter((country) => country.unMember !== false) // Include UN members and non-members
        .map((country) => ({
          name: country.name.common,
          flag_url: this.getOptimizedFlagUrl(country.flags.png),
          flag_svg: this.getOptimizedFlagUrl(country.flags.svg),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      // Cache the data
      this.cacheCountries(this.countries);
      this.isLoaded = true;

      console.log(`Loaded ${this.countries.length} countries`);
      return this.countries;
    } catch (error) {
      console.error('Error loading countries:', error);

      // Try to use cached data as fallback
      const cached = this.getCachedCountries();
      if (cached) {
        this.countries = cached;
        this.isLoaded = true;
        console.log('Using cached countries as fallback');
        return this.countries;
      }

      // Use fallback data if everything fails
      console.log('Using fallback countries data');
      this.countries = this.getFallbackCountries();
      this.isLoaded = true;
      return this.countries;
    }
  }

  getCachedCountries() {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is expired
      if (now - timestamp > CACHE_EXPIRY) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error reading cached countries:', error);
      return null;
    }
  }

  cacheCountries(countries) {
    try {
      const cacheData = {
        data: countries,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching countries:', error);
    }
  }

  getRandomCountry() {
    if (!this.isLoaded || this.countries.length === 0) {
      throw new Error('Countries not loaded');
    }

    const randomIndex = Math.floor(Math.random() * this.countries.length);
    return this.countries[randomIndex];
  }

  getRandomCountries(count, exclude = null) {
    if (!this.isLoaded || this.countries.length === 0) {
      throw new Error('Countries not loaded');
    }

    let availableCountries = this.countries;

    // Exclude specific country if provided
    if (exclude) {
      availableCountries = this.countries.filter((country) => country.name !== exclude.name);
    }

    // Shuffle and take the requested number
    const shuffled = [...availableCountries].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  getCountries() {
    return this.countries;
  }

  isReady() {
    return this.isLoaded && this.countries.length > 0;
  }

  getOptimizedFlagUrl(originalUrl) {
    if (!originalUrl) return null;

    // Try to use a more reliable CDN or add fallback parameters
    if (originalUrl.includes('flagcdn.com')) {
      // Add cache-busting parameter to avoid stale images
      const separator = originalUrl.includes('?') ? '&' : '?';
      return `${originalUrl}${separator}v=${Date.now()}`;
    }

    return originalUrl;
  }

  getFallbackCountries() {
    // Fallback data with popular countries - using multiple CDN options
    const countries = [
      { name: 'Россия', code: 'ru' },
      { name: 'США', code: 'us' },
      { name: 'Китай', code: 'cn' },
      { name: 'Германия', code: 'de' },
      { name: 'Франция', code: 'fr' },
      { name: 'Великобритания', code: 'gb' },
      { name: 'Япония', code: 'jp' },
      { name: 'Бразилия', code: 'br' },
      { name: 'Индия', code: 'in' },
      { name: 'Канада', code: 'ca' },
      { name: 'Австралия', code: 'au' },
      { name: 'Италия', code: 'it' },
      { name: 'Испания', code: 'es' },
      { name: 'Южная Корея', code: 'kr' },
      { name: 'Мексика', code: 'mx' },
      { name: 'Нидерланды', code: 'nl' },
      { name: 'Швеция', code: 'se' },
      { name: 'Норвегия', code: 'no' },
      { name: 'Швейцария', code: 'ch' },
      { name: 'Польша', code: 'pl' },
    ];

    return countries.map((country) => ({
      name: country.name,
      flag_url: `https://flagcdn.com/w320/${country.code}.png`,
      flag_svg: `https://flagcdn.com/${country.code}.svg`,
    }));
  }
}
