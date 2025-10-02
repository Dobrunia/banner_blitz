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

      // Fetch from API
      console.log('Loading countries from API...');
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`API Error: ${response.status} ${response.statusText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Filter and map countries
      this.countries = data
        .filter((country) => country.unMember !== false) // Include UN members and non-members
        .map((country) => ({
          name: country.name.common,
          flag_url: country.flags.png,
          flag_svg: country.flags.svg,
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

  getFallbackCountries() {
    // Fallback data with popular countries
    return [
      {
        name: 'Россия',
        flag_url: 'https://flagcdn.com/w320/ru.png',
        flag_svg: 'https://flagcdn.com/ru.svg',
      },
      {
        name: 'США',
        flag_url: 'https://flagcdn.com/w320/us.png',
        flag_svg: 'https://flagcdn.com/us.svg',
      },
      {
        name: 'Китай',
        flag_url: 'https://flagcdn.com/w320/cn.png',
        flag_svg: 'https://flagcdn.com/cn.svg',
      },
      {
        name: 'Германия',
        flag_url: 'https://flagcdn.com/w320/de.png',
        flag_svg: 'https://flagcdn.com/de.svg',
      },
      {
        name: 'Франция',
        flag_url: 'https://flagcdn.com/w320/fr.png',
        flag_svg: 'https://flagcdn.com/fr.svg',
      },
      {
        name: 'Великобритания',
        flag_url: 'https://flagcdn.com/w320/gb.png',
        flag_svg: 'https://flagcdn.com/gb.svg',
      },
      {
        name: 'Япония',
        flag_url: 'https://flagcdn.com/w320/jp.png',
        flag_svg: 'https://flagcdn.com/jp.svg',
      },
      {
        name: 'Бразилия',
        flag_url: 'https://flagcdn.com/w320/br.png',
        flag_svg: 'https://flagcdn.com/br.svg',
      },
      {
        name: 'Индия',
        flag_url: 'https://flagcdn.com/w320/in.png',
        flag_svg: 'https://flagcdn.com/in.svg',
      },
      {
        name: 'Канада',
        flag_url: 'https://flagcdn.com/w320/ca.png',
        flag_svg: 'https://flagcdn.com/ca.svg',
      },
      {
        name: 'Австралия',
        flag_url: 'https://flagcdn.com/w320/au.png',
        flag_svg: 'https://flagcdn.com/au.svg',
      },
      {
        name: 'Италия',
        flag_url: 'https://flagcdn.com/w320/it.png',
        flag_svg: 'https://flagcdn.com/it.svg',
      },
      {
        name: 'Испания',
        flag_url: 'https://flagcdn.com/w320/es.png',
        flag_svg: 'https://flagcdn.com/es.svg',
      },
      {
        name: 'Южная Корея',
        flag_url: 'https://flagcdn.com/w320/kr.png',
        flag_svg: 'https://flagcdn.com/kr.svg',
      },
      {
        name: 'Мексика',
        flag_url: 'https://flagcdn.com/w320/mx.png',
        flag_svg: 'https://flagcdn.com/mx.svg',
      },
      {
        name: 'Нидерланды',
        flag_url: 'https://flagcdn.com/w320/nl.png',
        flag_svg: 'https://flagcdn.com/nl.svg',
      },
      {
        name: 'Швеция',
        flag_url: 'https://flagcdn.com/w320/se.png',
        flag_svg: 'https://flagcdn.com/se.svg',
      },
      {
        name: 'Норвегия',
        flag_url: 'https://flagcdn.com/w320/no.png',
        flag_svg: 'https://flagcdn.com/no.svg',
      },
      {
        name: 'Швейцария',
        flag_url: 'https://flagcdn.com/w320/ch.png',
        flag_svg: 'https://flagcdn.com/ch.svg',
      },
      {
        name: 'Польша',
        flag_url: 'https://flagcdn.com/w320/pl.png',
        flag_svg: 'https://flagcdn.com/pl.svg',
      },
    ];
  }
}
