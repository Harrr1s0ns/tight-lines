import { useEffect } from 'react';
import styles from './MenuSheet.module.css';

export default function MenuSheet({ onClose, onFishID, onCollection }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.handle} />
        <button className={styles.option} onClick={() => { onFishID(); onClose(); }}>
          <span className={styles.optionIcon}>📷</span>
          <div className={styles.optionText}>
            <span className={styles.optionLabel}>Fish ID</span>
            <span className={styles.optionSub}>Take a photo to identify a fish</span>
          </div>
          <span className={styles.optionArrow}>›</span>
        </button>
        <button className={styles.option} onClick={() => { onCollection(); onClose(); }}>
          <span className={styles.optionIcon}>🏅</span>
          <div className={styles.optionText}>
            <span className={styles.optionLabel}>My Collection</span>
            <span className={styles.optionSub}>View and edit your logged catches</span>
          </div>
          <span className={styles.optionArrow}>›</span>
        </button>
        <button className={styles.cancel} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
