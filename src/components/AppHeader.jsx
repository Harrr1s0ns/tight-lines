import styles from './AppHeader.module.css';

export default function AppHeader({ onSearchClick, onMenuClick }) {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <span className={styles.title}>
          Tight <span className={styles.accent}>Lines</span>
        </span>
        <div className={styles.headerActions}>
          <button className={styles.searchBtn} onClick={onSearchClick} aria-label="Search">
            🔍
          </button>
          <button className={styles.menuBtn} onClick={onMenuClick} aria-label="More options">
            ⋮
          </button>
        </div>
      </div>
    </header>
  );
}
