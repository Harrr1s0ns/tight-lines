import { useState } from 'react';
import { fishSpecies } from '../data/fishSpecies';
import { lakes } from '../data/lakes';
import { EmptyState } from '../components/UI';
import styles from './Search.module.css';

export default function Search({ onNavigateToFish, onNavigateToLake }) {
  const [query, setQuery] = useState('');

  const q = query.toLowerCase().trim();

  const fishResults = q
    ? fishSpecies.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.latinName.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.bestBait.some((b) => b.toLowerCase().includes(q))
      )
    : [];

  const lakeResults = q
    ? lakes.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q) ||
          (l.description && l.description.toLowerCase().includes(q)) ||
          (l.species && l.species.some((s) => s.toLowerCase().includes(q)))
      )
    : [];

  const hasResults = fishResults.length > 0 || lakeResults.length > 0;

  return (
    <div className="page-enter">
      <div className={styles.searchWrap}>
        <div className={styles.inputWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            autoFocus
            type="search"
            placeholder="Search fish, lakes, baits…"
            className={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.content}>
        {!q && (
          <EmptyState icon="🔍" title="Start typing to search" subtitle="Search fish species and fishing lakes" />
        )}

        {q && !hasResults && (
          <EmptyState icon="🎣" title="No results found" subtitle={`Nothing matched "${query}"`} />
        )}

        {fishResults.length > 0 && (
          <>
            <div className={styles.resultHeader}>
              <span className={styles.resultTitle}>Fish Species</span>
              <span className={styles.resultCount}>{fishResults.length} found</span>
            </div>
            <div className={styles.list}>
              {fishResults.map((f) => (
                <div key={f.id} className={styles.card} onClick={() => onNavigateToFish(f)}>
                  <div className={styles.cardTitle}>{f.name}</div>
                  <div className={styles.cardSub}>{f.latinName}</div>
                  <div className={styles.cardDesc}>{f.description.slice(0, 80)}…</div>
                </div>
              ))}
            </div>
          </>
        )}

        {lakeResults.length > 0 && (
          <>
            <div className={styles.resultHeader} style={{ marginTop: fishResults.length > 0 ? 20 : 0 }}>
              <span className={styles.resultTitle}>Lakes</span>
              <span className={styles.resultCount}>{lakeResults.length} found</span>
            </div>
            <div className={styles.list}>
              {lakeResults.map((l) => (
                <div key={l.id} className={styles.card} onClick={() => onNavigateToLake(l)}>
                  <div className={styles.cardTitle}>{l.name}</div>
                  <div className={styles.cardSub}>📍 {l.location}</div>
                  {l.description && <div className={styles.cardDesc}>{l.description.slice(0, 80)}…</div>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
