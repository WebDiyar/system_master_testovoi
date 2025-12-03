export type SupportedLocation = {
  country: string;
  countryCode: string;
  cities: string[];
};

export const supportedLocations: SupportedLocation[] = [
  {
    country: 'Kazakhstan',
    countryCode: 'KZ',
    cities: ['Astana', 'Almaty', 'Shymkent'],
  },
  {
    country: 'Russia',
    countryCode: 'RU',
    cities: ['Moscow', 'Saint Petersburg', 'Kazan'],
  },
  {
    country: 'United States',
    countryCode: 'US',
    cities: ['New York', 'San Francisco', 'Chicago'],
  },
  {
    country: 'Germany',
    countryCode: 'DE',
    cities: ['Berlin', 'Munich', 'Hamburg'],
  },
  {
    country: 'Spain',
    countryCode: 'ES',
    cities: ['Madrid', 'Barcelona', 'Valencia'],
  },
];

export function findCountryCode(name: string) {
  const normalized = name.trim().toLowerCase();
  return supportedLocations.find((item) => item.country.toLowerCase() === normalized)?.countryCode;
}
