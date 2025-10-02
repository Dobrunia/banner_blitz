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
      // Очищаем кэш для тестирования
      // localStorage.removeItem(CACHE_KEY);

      // Check cache first
      const cached = this.getCachedCountries();
      if (cached) {
        this.countries = cached;
        this.isLoaded = true;
        return this.countries;
      }

      // Check network connectivity
      if (!navigator.onLine) {
        throw new Error('No internet connection');
      }

      // Fetch from API with timeout
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
          name: this.translateCountryName(country.name.common),
          flag_url: this.getOptimizedFlagUrl(country.flags.png),
          flag_svg: this.getOptimizedFlagUrl(country.flags.svg),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      // Cache the data
      this.cacheCountries(this.countries);
      this.isLoaded = true;

      return this.countries;
    } catch (error) {
      console.error('Error loading countries:', error);

      // Try to use cached data as fallback
      const cached = this.getCachedCountries();
      if (cached) {
        this.countries = cached;
        this.isLoaded = true;
        return this.countries;
      }

      // No fallback data - throw error
      throw new Error('No cached data available');
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

  translateCountryName(englishName) {
    const translations = {
      Russia: 'Россия',
      'United States': 'США',
      China: 'Китай',
      Germany: 'Германия',
      France: 'Франция',
      'United Kingdom': 'Великобритания',
      Japan: 'Япония',
      Brazil: 'Бразилия',
      India: 'Индия',
      Canada: 'Канада',
      Australia: 'Австралия',
      Italy: 'Италия',
      Spain: 'Испания',
      'South Korea': 'Южная Корея',
      Mexico: 'Мексика',
      Netherlands: 'Нидерланды',
      Sweden: 'Швеция',
      Norway: 'Норвегия',
      Switzerland: 'Швейцария',
      Poland: 'Польша',
      Argentina: 'Аргентина',
      'South Africa': 'ЮАР',
      Egypt: 'Египет',
      Nigeria: 'Нигерия',
      Turkey: 'Турция',
      Iran: 'Иран',
      Iraq: 'Ирак',
      'Saudi Arabia': 'Саудовская Аравия',
      Israel: 'Израиль',
      Ukraine: 'Украина',
      Belarus: 'Беларусь',
      Kazakhstan: 'Казахстан',
      Uzbekistan: 'Узбекистан',
      Thailand: 'Таиланд',
      Vietnam: 'Вьетнам',
      Indonesia: 'Индонезия',
      Malaysia: 'Малайзия',
      Philippines: 'Филиппины',
      Bangladesh: 'Бангладеш',
      Pakistan: 'Пакистан',
      Afghanistan: 'Афганистан',
      Greece: 'Греция',
      Portugal: 'Португалия',
      Belgium: 'Бельгия',
      Austria: 'Австрия',
      'Czech Republic': 'Чехия',
      Hungary: 'Венгрия',
      Romania: 'Румыния',
      Bulgaria: 'Болгария',
      Croatia: 'Хорватия',
      Serbia: 'Сербия',
      Slovenia: 'Словения',
      Slovakia: 'Словакия',
      Estonia: 'Эстония',
      Latvia: 'Латвия',
      Lithuania: 'Литва',
      Finland: 'Финляндия',
      Denmark: 'Дания',
      Iceland: 'Исландия',
      Ireland: 'Ирландия',
      Luxembourg: 'Люксембург',
      Malta: 'Мальта',
      Cyprus: 'Кипр',
      Albania: 'Албания',
      Macedonia: 'Македония',
      Montenegro: 'Черногория',
      'Bosnia and Herzegovina': 'Босния и Герцеговина',
      Moldova: 'Молдова',
      Georgia: 'Грузия',
      Armenia: 'Армения',
      Azerbaijan: 'Азербайджан',
      Kyrgyzstan: 'Кыргызстан',
      Tajikistan: 'Таджикистан',
      Turkmenistan: 'Туркменистан',
      Mongolia: 'Монголия',
      'North Korea': 'Северная Корея',
      Taiwan: 'Тайвань',
      'Hong Kong': 'Гонконг',
      Singapore: 'Сингапур',
      'Sri Lanka': 'Шри-Ланка',
      Nepal: 'Непал',
      Bhutan: 'Бутан',
      Myanmar: 'Мьянма',
      Laos: 'Лаос',
      Cambodia: 'Камбоджа',
      Brunei: 'Бруней',
      'East Timor': 'Восточный Тимор',
      'Papua New Guinea': 'Папуа-Новая Гвинея',
      Fiji: 'Фиджи',
      'New Zealand': 'Новая Зеландия',
      Chile: 'Чили',
      Peru: 'Перу',
      Colombia: 'Колумбия',
      Venezuela: 'Венесуэла',
      Ecuador: 'Эквадор',
      Bolivia: 'Боливия',
      Paraguay: 'Парагвай',
      Uruguay: 'Уругвай',
      Guyana: 'Гайана',
      Suriname: 'Суринам',
      'French Guiana': 'Французская Гвиана',
      Cuba: 'Куба',
      Jamaica: 'Ямайка',
      Haiti: 'Гаити',
      'Dominican Republic': 'Доминиканская Республика',
      'Puerto Rico': 'Пуэрто-Рико',
      'Trinidad and Tobago': 'Тринидад и Тобаго',
      Barbados: 'Барбадос',
      'Saint Lucia': 'Сент-Люсия',
      Grenada: 'Гренада',
      'Saint Vincent and the Grenadines': 'Сент-Винсент и Гренадины',
      'Antigua and Barbuda': 'Антигуа и Барбуда',
      Dominica: 'Доминика',
      'Saint Kitts and Nevis': 'Сент-Китс и Невис',
      Belize: 'Белиз',
      Guatemala: 'Гватемала',
      Honduras: 'Гондурас',
      'El Salvador': 'Сальвадор',
      Nicaragua: 'Никарагуа',
      'Costa Rica': 'Коста-Рика',
      Panama: 'Панама',
      Algeria: 'Алжир',
      Angola: 'Ангола',
      Benin: 'Бенин',
      Botswana: 'Ботсвана',
      'Burkina Faso': 'Буркина-Фасо',
      Burundi: 'Бурунди',
      Cameroon: 'Камерун',
      'Cape Verde': 'Кабо-Верде',
      'Central African Republic': 'ЦАР',
      Chad: 'Чад',
      Comoros: 'Коморы',
      Congo: 'Конго',
      'Democratic Republic of the Congo': 'ДР Конго',
      Djibouti: 'Джибути',
      'Equatorial Guinea': 'Экваториальная Гвинея',
      Eritrea: 'Эритрея',
      Eswatini: 'Эсватини',
      Ethiopia: 'Эфиопия',
      Gabon: 'Габон',
      Gambia: 'Гамбия',
      Ghana: 'Гана',
      Guinea: 'Гвинея',
      'Guinea-Bissau': 'Гвинея-Бисау',
      'Ivory Coast': "Кот-д'Ивуар",
      Kenya: 'Кения',
      Lesotho: 'Лесото',
      Liberia: 'Либерия',
      Libya: 'Ливия',
      Madagascar: 'Мадагаскар',
      Malawi: 'Малави',
      Mali: 'Мали',
      Mauritania: 'Мавритания',
      Mauritius: 'Маврикий',
      Morocco: 'Марокко',
      Mozambique: 'Мозамбик',
      Namibia: 'Намибия',
      Niger: 'Нигер',
      Rwanda: 'Руанда',
      'São Tomé and Príncipe': 'Сан-Томе и Принсипи',
      Senegal: 'Сенегал',
      Seychelles: 'Сейшелы',
      'Sierra Leone': 'Сьерра-Леоне',
      Somalia: 'Сомали',
      'South Sudan': 'Южный Судан',
      Sudan: 'Судан',
      Tanzania: 'Танзания',
      Togo: 'Того',
      Tunisia: 'Тунис',
      Uganda: 'Уганда',
      Zambia: 'Замбия',
      Zimbabwe: 'Зимбабве',
      // Дополнительные страны
      'United Arab Emirates': 'ОАЭ',
      Qatar: 'Катар',
      Kuwait: 'Кувейт',
      Jordan: 'Иордания',
      Lebanon: 'Ливан',
      Syria: 'Сирия',
      Yemen: 'Йемен',
      Oman: 'Оман',
      Bahrain: 'Бахрейн',
      'Sri Lanka': 'Шри-Ланка',
      Myanmar: 'Мьянма',
      'North Macedonia': 'Северная Македония',
      'Republic of the Congo': 'Республика Конго',
      "Côte d'Ivoire": "Кот-д'Ивуар",
      // Островные государства
      Palau: 'Палау',
      'Timor-Leste': 'Восточный Тимор',
      Tuvalu: 'Тувалу',
      Maldives: 'Мальдивы',
      Tonga: 'Тонга',
      Samoa: 'Самоа',
      'Solomon Islands': 'Соломоновы Острова',
      Liechtenstein: 'Лихтенштейн',
      Bahamas: 'Багамы',
      Vanuatu: 'Вануату',
      Kiribati: 'Кирибати',
      Monaco: 'Монако',
      // Дополнительные малые государства
      'San Marino': 'Сан-Марино',
      Nauru: 'Науру',
      Micronesia: 'Микронезия',
      'Marshall Islands': 'Маршалловы Острова',
      'DR Congo': 'ДР Конго',
      Czechia: 'Чехия',
      Andorra: 'Андорра',
    };

    return translations[englishName] || englishName;
  }
}
