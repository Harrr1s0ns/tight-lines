import styles from './BottomNav.module.css';

const navItems = [
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'fish', icon: '🐟', label: 'Species' },
  { id: 'lakes', icon: '🏞️', label: 'Lakes' },
  { id: 'conditions', icon: '🌤️', label: 'Conditions' },
  { id: 'records', icon: '🏆', label: 'Records' },
];

export default function BottomNav({ activePage, onNavigate }) {
  return (
    <nav className={styles.nav}>
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`${styles.item} ${activePage === item.id ? styles.active : ''}`}
          onClick={() => onNavigate(item.id)}
        >
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.label}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
