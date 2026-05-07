import { useState } from 'react';
import { fishSpecies } from '../data/fishSpecies';
import { Badge, DetailSection, BackButton, DetailHero, InfoRow, EmptyState } from '../components/UI';
import styles from './Fish.module.css';

function FishCard({ fish, onClick }) {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.cardBody}>
        <div className={styles.cardTitle}>{fish.name}</div>
        <div className={styles.cardLatin}>{fish.latinName}</div>
        <div className={styles.cardDesc}>{fish.description.slice(0, 90)}…</div>
      </div>
      <div className={styles.cardFooter}>
        <div className={styles.baitTags}>
          {fish.bestBait.slice(0, 3).map((b) => (
            <Badge key={b} variant="green">{b}</Badge>
          ))}
        </div>
        <span className={styles.arrow}>›</span>
      </div>
    </div>
  );
}

function FishDetail({ fish, onBack }) {
  return (
    <div className="page-enter">
      <DetailHero title={fish.name} subtitle={fish.latinName}>
        <BackButton onClick={onBack} label="All Species" />
      </DetailHero>

      <DetailSection title="About">
        <p className={styles.bodyText}>{fish.description}</p>
      </DetailSection>

      <DetailSection title="Best Baits">
        <div className={styles.baitTagsFull}>
          {fish.bestBait.map((b) => (
            <span key={b} className={styles.baitTag}>{b}</span>
          ))}
        </div>
      </DetailSection>

      <DetailSection>
        <InfoRow label="Diet" value={fish.diet} />
        <InfoRow label="Habitat" value={fish.habitat} />
        {fish.bestSeason && <InfoRow label="Best Season" value={fish.bestSeason} />}
        {fish.bestTemp && <InfoRow label="Ideal Temp" value={fish.bestTemp} />}
      </DetailSection>

      {fish.notes && (
        <DetailSection title="Angler's Tip">
          <p className={styles.bodyText}>{fish.notes}</p>
        </DetailSection>
      )}
    </div>
  );
}

export default function Fish({ initialSelected = null }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(initialSelected);

  const filtered = query.trim()
    ? fishSpecies.filter(
        (f) =>
          f.name.toLowerCase().includes(query.toLowerCase()) ||
          f.latinName.toLowerCase().includes(query.toLowerCase()) ||
          f.bestBait.some((b) => b.toLowerCase().includes(query.toLowerCase()))
      )
    : fishSpecies;

  if (selected) {
    return <FishDetail fish={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="page-enter">
      <div className={styles.searchWrap}>
        <div className={styles.searchInputWrap}>
          <span className={styles.searchIcon}>🐟</span>
          <input
            type="search"
            placeholder="Search species or bait…"
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>UK Species Guide</h2>
          <span className={styles.sectionCount}>{filtered.length} species</span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon="🐟" title="No species found" subtitle="Try a different search" />
        ) : (
          <div className={styles.list}>
            {filtered.map((fish) => (
              <FishCard key={fish.id} fish={fish} onClick={() => setSelected(fish)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
