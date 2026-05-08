import { fishSpecies } from '../data/fishSpecies';
import { lakes } from '../data/lakes';
import { conditions } from '../data/conditions';
import styles from './Home.module.css';

function getCurrentSeason() {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return conditions.seasonalNotes[0];
  if (month >= 5 && month <= 7) return conditions.seasonalNotes[1];
  if (month >= 8 && month <= 10) return conditions.seasonalNotes[2];
  return conditions.seasonalNotes[3];
}

const baits = [
  {
    icon: '🌱',
    name: 'Worms',
    desc: 'Works for almost everything. Lobworms for perch and chub, dendrobenas for carp and bream, redworms for smaller species. Never go fishing without them.',
  },
  {
    icon: '🟡',
    name: 'Sweetcorn',
    desc: 'Outstanding for carp and tench. Cheap, visible, and almost irresistible. Use straight on the hook or combined with pellets.',
  },
  {
    icon: '🟠',
    name: 'Maggots',
    desc: 'The universal coarse fishing bait. Deadly for roach, bream, perch, and tench. Double maggot on a size 14 hook is a banker rig.',
  },
  {
    icon: '⚪',
    name: 'Bread',
    desc: 'Cheap and effective. Bread punch for roach, flake for carp and chub. Surface crust for surface-feeding carp in summer.',
  },
];

export default function Home({ onNavigate }) {
  const season = getCurrentSeason();

  return (
    <div className={`${styles.page} page-enter`}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroGreeting}>Your Fishing Guide</div>
        <h1 className={styles.heroTitle}>Good fishing 🎣</h1>
        <p className={styles.heroDesc}>Kent waters, UK species, and conditions — all in one place.</p>
      </div>

      <div className={styles.content}>
        {/* Season banner */}
        <div className={styles.seasonCard} onClick={() => onNavigate('conditions')}>
          <span className={styles.seasonEmoji}>{season.emoji}</span>
          <div>
            <div className={styles.seasonTitle}>It's {season.season} — {season.months}</div>
            <div className={styles.seasonDesc}>{season.tips[0]}</div>
          </div>
        </div>

        {/* Quick navigation grid */}
        <div className={styles.sectionLabel}>Explore</div>
        <div className={styles.quickGrid}>
          <button className={styles.quickCard} onClick={() => onNavigate('fish')}>
            <span className={styles.quickIcon}>🐟</span>
            <div className={styles.quickTitle}>Fish Species</div>
            <div className={styles.quickSub}>{fishSpecies.length} species</div>
          </button>
          <button className={styles.quickCard} onClick={() => onNavigate('lakes')}>
            <span className={styles.quickIcon}>🏞️</span>
            <div className={styles.quickTitle}>Kent Lakes</div>
            <div className={styles.quickSub}>{lakes.length} venues</div>
          </button>
          <button className={styles.quickCard} onClick={() => onNavigate('conditions')}>
            <span className={styles.quickIcon}>🌤️</span>
            <div className={styles.quickTitle}>Conditions</div>
            <div className={styles.quickSub}>Wind, temp & season</div>
          </button>
          <button className={styles.quickCard} onClick={() => onNavigate('records')}>
            <span className={styles.quickIcon}>🏆</span>
            <div className={styles.quickTitle}>UK Records</div>
            <div className={styles.quickSub}>British bests</div>
          </button>
        </div>

        {/* Bait guide */}
        <div className={styles.sectionLabel} style={{ marginTop: 24 }}>Quick Bait Guide</div>
        <div className={styles.baitList}>
          {baits.map((b) => (
            <div key={b.name} className={styles.baitCard}>
              <div className={styles.baitTitle}>{b.icon} {b.name}</div>
              <p className={styles.baitDesc}>{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Fishing licence */}
        <div className={styles.sectionLabel} style={{ marginTop: 24 }}>Licence</div>
        <a
          href="https://www.gov.uk/fishing-licences/buy-a-fishing-licence"
          target="_blank"
          rel="noreferrer"
          className={styles.licenceCard}
        >
          <span style={{ fontSize: 28, flexShrink: 0 }}>🎫</span>
          <div className={styles.licenceText}>
            <div className={styles.licenceTitle}>Buy a Fishing Licence</div>
            <div className={styles.licenceSub}>gov.uk — required for most UK fishing</div>
          </div>
          <span className={styles.licenceArrow}>›</span>
        </a>

        {/* Swim Booker */}
        <div className={styles.sectionLabel} style={{ marginTop: 24 }}>Swim Booker</div>
        <a
          href="https://www.swimbooker.com"
          target="_blank"
          rel="noreferrer"
          className={styles.swimBookerCard}
        >
          <span style={{ fontSize: 28, flexShrink: 0 }}>📍</span>
          <div className={styles.licenceText}>
            <div className={styles.licenceTitle}>Swim Booker</div>
            <div className={styles.licenceSub}>swimbooker.com — book fishing swims online</div>
          </div>
          <span className={styles.licenceArrow}>›</span>
        </a>
      </div>
    </div>
  );
}
