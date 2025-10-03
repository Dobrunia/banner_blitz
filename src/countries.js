// Оффлайн Countries API
import { OFFLINE_COUNTRIES } from './offline-countries.js';

export class CountriesAPI {
  constructor() {
    this.countries = [];
    this.isLoaded = false;
  }

  async loadCountries() {
    // Загружаем оффлайн данные
    this.countries = OFFLINE_COUNTRIES.map((country) => ({
      name: country.name,
      flag_url: `/flags/${country.flag_file}`,
      flag_svg: `/flags/${country.flag_file}`,
      region: country.region,
      code: country.code,
      capital: country.capital,
      language: country.language,
      population: country.population,
      flag_file: country.flag_file, // Добавляем оригинальное поле для совместимости
    }));

    this.isLoaded = true;
    return this.countries;
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
}
