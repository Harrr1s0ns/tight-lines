import { records } from '../data/records';
import { SectionHeader } from '../components/UI';
import styles from './Records.module.css';

export default function Records() {
  return (
    <div className={`${styles.page} page-enter`}>
      <div className={styles.content}>
        <SectionHeader title="British Records" count="Rod-caught coarse fish" />

        <div className={styles.list}>
          {records.map((rec, i) => (
            <div key={rec.species} className={styles.card}>
              <div className={styles.rank}>{i + 1}</div>
              <div className={styles.info}>
                <div className={styles.species}>{rec.species}</div>
                <div className={styles.details}>
                  {rec.angler} · {rec.venue} · {rec.year}
                </div>
                {rec.notes && <div className={styles.notes}>{rec.notes}</div>}
              </div>
              <div className={styles.weight}>{rec.recordWeight}</div>
            </div>
          ))}
        </div>

        <div className={styles.disclaimer}>
          ℹ️ Records are subject to change. Always verify with the{' '}
          <strong>British Record (rod-caught) Fish Committee</strong> for the latest official records.
        </div>
      </div>
    </div>
  );
}
