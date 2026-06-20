import styles from './Header.module.css';
import { useNow } from '../../hooks/useNow';
import { useApiHealth } from '../../hooks/useApiHealth';
import { formatTime, formatDate } from '../../utils/format';

const STATUS_LABEL = {
  online: 'Online',
  offline: 'Offline',
  checking: 'Conectando',
} as const;

export function Header() {
  const now = useNow(1000);
  const { status } = useApiHealth(10000);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logo} aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </div>
          <div className={styles.titles}>
            <h1 className={styles.title}>Gps Monitoreo</h1>
            <span className={styles.subtitle}>Telemetría de flotas en tiempo real</span>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.clock}>
            <span className={styles.time}>{formatTime(now)}</span>
            <span className={styles.date}>{formatDate(now)}</span>
          </div>

          <div
            className={styles.statusPill}
            role="status"
            aria-live="polite"
            title={`Estado de la API: ${STATUS_LABEL[status]}`}
          >
            <span className={`${styles.statusDot} ${styles[status]}`} />
            <span className={`${styles.statusLabel} ${styles[status]}`}>
              {STATUS_LABEL[status]}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
