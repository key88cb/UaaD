import { useState } from 'react';

const STORAGE_KEY = 'uaad.preferred-city';

export function usePreferredCity(defaultCity = 'ALL') {
  const [city, setCity] = useState(() => localStorage.getItem(STORAGE_KEY) ?? defaultCity);

  const updateCity = (nextCity: string) => {
    setCity(nextCity);
    localStorage.setItem(STORAGE_KEY, nextCity);
  };

  return { city, setCity: updateCity };
}
