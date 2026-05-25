import { OFFLINE_COUNTRIES } from '../offline-countries';
import type { Country } from '../types/country';

export class CountriesAPI {
  private countries: Country[] = [];
  private loaded = false;

  async loadCountries(): Promise<Country[]> {
    this.countries = OFFLINE_COUNTRIES.map((country) => ({
      name: country.name,
      flag_url: `/flags/${country.flag_file}`,
      flag_svg: `/flags/${country.flag_file}`,
      region: country.region,
      code: country.code,
      capital: country.capital,
      language: country.language,
      population: country.population,
      flag_file: country.flag_file,
    }));

    this.loaded = true;
    return this.countries;
  }

  getRandomCountry(): Country {
    if (!this.isReady()) {
      throw new Error('Countries not loaded');
    }

    const randomIndex = Math.floor(Math.random() * this.countries.length);
    return this.countries[randomIndex];
  }

  getRandomCountries(count: number, exclude: Country | null = null): Country[] {
    if (!this.isReady()) {
      throw new Error('Countries not loaded');
    }

    const availableCountries = exclude
      ? this.countries.filter((country) => country.name !== exclude.name)
      : this.countries;

    return [...availableCountries].sort(() => Math.random() - 0.5).slice(0, count);
  }

  getCountries(): Country[] {
    return this.countries;
  }

  isReady(): boolean {
    return this.loaded && this.countries.length > 0;
  }
}
