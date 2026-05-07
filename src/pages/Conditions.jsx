import { conditions } from '../data/conditions';
import { SectionHeader } from '../components/UI';
import styles from './Conditions.module.css';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getCurrentSeason() {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return conditions.seasonalNotes[0];
  if (month >= 5 && month <= 7) return conditions.seasonalNotes[1];
  if (month >= 8 && month <= 10) return conditions.seasonalNotes[2];
  return conditions.seasonalNotes[3];
}

function getCurrentMonth() {
  return MONTH_NAMES[new Date().getMonth()];
}

export default function Conditions() {
  const season = getCurrentSeason();
  const month = getCurrentMonth();

  return (
    <div className={`${styles.page} page-enter`}>
      <div className={styles.content}>

        {/* Current season */}
        <SectionHeader title={`${month} — ${season.season}`} />
        <div className={styles.seasonCard}>
          <span className={styles.seasonEmoji}>{season.emoji}</span>
          <div>
            <div className={styles.seasonTitle}>{season.season} — {season.months}</div>
            <div className={styles.seasonDesc}>{season.overview}</div>
          </div>
        </div>

        <div className={styles.tipsList}>
          {season.tips.map((tip) => (
            <div key={tip} className={styles.tipRow}>
              <span className={styles.tipArrow}>→</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>

        <div className={styles.bestSpecies}>
          {season.bestSpecies.map((s) => (
            <span key={s} className={styles.speciesBadge}>{s}</span>
          ))}
        </div>

        {/* Water temps */}
        <SectionHeader title="Water Temperature Guide" />
        {conditions.waterTemperature.map((t) => {
          const pct = (t.minTemp / 30) * 100;
          const width = ((t.maxTemp - t.minTemp) / 30) * 100;
          return (
            <div key={t.species} className={styles.tempCard}>
              <div className={styles.tempHeader}>
                <span className={styles.tempSpecies}>{t.species}</span>
                <span className={styles.tempBadge}>{t.idealRange}</span>
              </div>
              <div className={styles.tempBar}>
                <div
                  className={styles.tempBarFill}
                  style={{ marginLeft: `${pct}%`, width: `${width}%` }}
                />
              </div>
              <p className={styles.tempNote}>{t.generalNote}</p>
            </div>
          );
        })}

        {/* Wind */}
        <SectionHeader title="Wind Direction Guide" />
        <div className={styles.windGrid}>
          {conditions.windDirections.map((w) => (
            <div key={w.direction} className={styles.windCard}>
              <div className={styles.windDir}>{w.arrow} {w.direction}</div>
              <div className={styles.windEffect}>{w.generalEffect}</div>
              <div className={styles.windCarpNote}>Carp: {w.carpEffect}</div>
            </div>
          ))}
        </div>

        {/* Pressure */}
        <SectionHeader title="Barometric Pressure" />
        {conditions.pressureGuide.map((p) => (
          <div key={p.label} className={styles.pressureCard}>
            <div className={styles.pressureTitle}>{p.icon} {p.label}</div>
            <p className={styles.pressureEffect}>{p.effect}</p>
            <p className={styles.pressureRec}>→ {p.recommendation}</p>
          </div>
        ))}

      </div>
    </div>
  );
}
