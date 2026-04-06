import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { PublicHeader } from '../components/public/PublicHeader';
import { usePreferredCity } from '../hooks/usePreferredCity';

export interface PublicLayoutContext {
  preferredCity: string;
  setPreferredCity: (city: string) => void;
}

export default function PublicLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { city, setCity } = usePreferredCity();
  const initialSearchValue = new URLSearchParams(location.search).get('keyword') ?? '';

  const contextValue = useMemo<PublicLayoutContext>(
    () => ({
      preferredCity: city,
      setPreferredCity: setCity,
    }),
    [city, setCity],
  );

  const handleSearchSubmit = (nextSearchValue: string) => {
    const params = new URLSearchParams();

    if (nextSearchValue.trim()) {
      params.set('keyword', nextSearchValue.trim());
    }

    if (city !== 'ALL') {
      params.set('region', city);
    }

    navigate(`/activities${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleCityChange = (nextCity: string) => {
    setCity(nextCity);

    if (location.pathname === '/activities') {
      const params = new URLSearchParams(location.search);

      if (nextCity === 'ALL') {
        params.delete('region');
      } else {
        params.set('region', nextCity);
      }

      navigate(`/activities${params.toString() ? `?${params.toString()}` : ''}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf7] text-slate-900">
      <PublicHeader
        key={`${location.pathname}:${location.search}`}
        preferredCity={city}
        onCityChange={handleCityChange}
        initialSearchValue={initialSearchValue}
        onSearchSubmit={handleSearchSubmit}
      />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
        <Outlet context={contextValue} />
      </main>
    </div>
  );
}
