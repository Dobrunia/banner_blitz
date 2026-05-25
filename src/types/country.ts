export type RegionName =
  | 'Европа'
  | 'Азия'
  | 'Африка'
  | 'Северная Америка'
  | 'Южная Америка'
  | 'Океания';

export interface OfflineCountry {
  name: string;
  region: RegionName;
  flag_file: string;
  code: string;
  capital?: string;
  language?: string;
  population?: string;
}

export interface Country {
  name: string;
  flag_url: string;
  flag_svg: string;
  region: RegionName;
  code: string;
  capital?: string;
  language?: string;
  population?: string;
  flag_file: string;
}
