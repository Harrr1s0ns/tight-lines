import { useState, useEffect } from 'react';
import AppHeader from './components/AppHeader';
import BottomNav from './components/BottomNav';
import MenuSheet from './components/MenuSheet';
import Home from './pages/Home';
import Fish from './pages/Fish';
import Lakes from './pages/Lakes';
import Conditions from './pages/Conditions';
import Records from './pages/Records';
import Search from './pages/Search';
import FishID from './pages/FishID';
import Collection from './pages/Collection';
import styles from './App.module.css';

export default function App() {
  const [page, setPage] = useState('home');
  const [searchFishTarget, setSearchFishTarget] = useState(null);
  const [searchLakeTarget, setSearchLakeTarget] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [page]);

  function navigate(p) {
    setSearchFishTarget(null);
    setSearchLakeTarget(null);
    setPage(p);
  }

  function navigateToFish(fish) {
    setSearchFishTarget(fish);
    setPage('fish');
  }

  function navigateToLake(lake) {
    setSearchLakeTarget(lake);
    setPage('lakes');
  }

  return (
    <div className={styles.shell}>
      <AppHeader
        onSearchClick={() => navigate('search')}
        onMenuClick={() => setMenuOpen(true)}
      />
      <main className={styles.main}>
        {page === 'home'       && <Home onNavigate={navigate} />}
        {page === 'fish'       && <Fish initialSelected={searchFishTarget} />}
        {page === 'lakes'      && <Lakes initialSelected={searchLakeTarget} />}
        {page === 'conditions' && <Conditions />}
        {page === 'records'    && <Records />}
        {page === 'search'     && (
          <Search
            onNavigateToFish={navigateToFish}
            onNavigateToLake={navigateToLake}
          />
        )}
        {page === 'fishid'     && <FishID onNavigateToCollection={() => navigate('collection')} />}
        {page === 'collection' && <Collection onFishID={() => navigate('fishid')} />}
      </main>
      <BottomNav activePage={page} onNavigate={navigate} />
      {menuOpen && (
        <MenuSheet
          onClose={() => setMenuOpen(false)}
          onFishID={() => navigate('fishid')}
          onCollection={() => navigate('collection')}
        />
      )}
    </div>
  );
}
