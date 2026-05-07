import styles from './UI.module.css';

export function Badge({ children, variant = 'green' }) {
  return <span className={`${styles.badge} ${styles[`badge_${variant}`]}`}>{children}</span>;
}

export function SectionHeader({ title, count }) {
  return (
    <div className={styles.sectionHeader}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {count !== undefined && <span className={styles.sectionCount}>{count}</span>}
    </div>
  );
}

export function EmptyState({ icon = '🎣', title, subtitle }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>{icon}</div>
      <div className={styles.emptyTitle}>{title}</div>
      {subtitle && <div className={styles.emptySub}>{subtitle}</div>}
    </div>
  );
}

export function InfoRow({ label, value }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value}</span>
    </div>
  );
}

export function DetailSection({ title, children }) {
  return (
    <div className={styles.detailSection}>
      {title && <div className={styles.detailSectionTitle}>{title}</div>}
      {children}
    </div>
  );
}

export function BackButton({ onClick, label = 'Back' }) {
  return (
    <button className={styles.backBtn} onClick={onClick}>
      ‹ {label}
    </button>
  );
}

export function DetailHero({ title, subtitle, badge, badgeVariant = 'water', extraBadge, children }) {
  return (
    <div className={styles.detailHero}>
      {children}
      <h1 className={styles.detailHeroTitle}>{title}</h1>
      {subtitle && <div className={styles.detailHeroSub}>{subtitle}</div>}
      {badge && (
        <div style={{ marginTop: 10 }}>
          <Badge variant={badgeVariant}>{badge}</Badge>
          {extraBadge && <span className={styles.detailHeroExtraBadge}>{extraBadge}</span>}
        </div>
      )}
    </div>
  );
}
