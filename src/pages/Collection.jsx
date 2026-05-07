import { useState, useCallback } from 'react';
import styles from './Collection.module.css';

function loadCollection() {
  try {
    return JSON.parse(localStorage.getItem('tightlines_collection') || '[]');
  } catch {
    return [];
  }
}

function persistCollection(entries) {
  localStorage.setItem('tightlines_collection', JSON.stringify(entries));
}

export default function Collection({ onFishID }) {
  const [entries, setEntries] = useState(loadCollection);
  const [expandedId, setExpandedId] = useState(null);
  const [editDraft, setEditDraft] = useState({});
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const toggleExpand = useCallback((id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setEditDraft({});
    } else {
      setExpandedId(id);
      const entry = entries.find((e) => e.id === id);
      setEditDraft({ ...entry });
    }
  }, [expandedId, entries]);

  function handleField(field, value) {
    setEditDraft((d) => ({ ...d, [field]: value }));
  }

  function handleSave() {
    const updated = entries.map((e) => e.id === editDraft.id ? { ...editDraft } : e);
    setEntries(updated);
    persistCollection(updated);
    setExpandedId(null);
    setEditDraft({});
  }

  function handleDelete(id) {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    persistCollection(updated);
    setConfirmDeleteId(null);
    setExpandedId(null);
    setEditDraft({});
  }

  return (
    <div className="page-enter">
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>My Collection</h1>
        <p className={styles.heroSub}>{entries.length} {entries.length === 1 ? 'catch' : 'catches'} logged</p>
      </div>

      <div className={styles.body}>
        {entries.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🎣</span>
            <p className={styles.emptyTitle}>No catches yet</p>
            <p className={styles.emptySub}>Use Fish ID to log your first catch</p>
            <button className={styles.goFishIdBtn} onClick={onFishID}>Open Fish ID</button>
          </div>
        ) : (
          entries.map((entry) => {
            const isExpanded = expandedId === entry.id;
            return (
              <div key={entry.id} className={styles.card}>
                <button className={styles.cardHeader} onClick={() => toggleExpand(entry.id)}>
                  {entry.photoDataUrl && (
                    <img src={entry.photoDataUrl} alt={entry.species} className={styles.thumbnail} />
                  )}
                  <div className={styles.cardInfo}>
                    <span className={styles.cardSpecies}>{entry.species}</span>
                    <span className={styles.cardMeta}>{entry.estimatedWeight} · {entry.date}</span>
                    {entry.location ? <span className={styles.cardLocation}>📍 {entry.location}</span> : null}
                  </div>
                  <span className={styles.chevron}>{isExpanded ? '▲' : '▼'}</span>
                </button>

                {isExpanded && (
                  <div className={styles.editPanel}>
                    <Field label="Species" value={editDraft.species} onChange={(v) => handleField('species', v)} />
                    <Field label="Weight" value={editDraft.estimatedWeight} onChange={(v) => handleField('estimatedWeight', v)} placeholder="e.g. 4lb 8oz" />
                    <Field label="Length" value={editDraft.estimatedLength} onChange={(v) => handleField('estimatedLength', v)} placeholder="e.g. 22 inches" />
                    <Field label="Date" value={editDraft.date} onChange={(v) => handleField('date', v)} type="date" />
                    <Field label="Location" value={editDraft.location} onChange={(v) => handleField('location', v)} placeholder="e.g. Yalding Lakes" />
                    <Field label="Notes" value={editDraft.notes} onChange={(v) => handleField('notes', v)} placeholder="Any extra details…" multiline />

                    <div className={styles.editActions}>
                      <button className={styles.saveBtn} onClick={handleSave}>Save Changes</button>
                      {confirmDeleteId === entry.id ? (
                        <div className={styles.confirmDelete}>
                          <span>Delete this catch?</span>
                          <button className={styles.confirmYes} onClick={() => handleDelete(entry.id)}>Yes, delete</button>
                          <button className={styles.confirmNo} onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                        </div>
                      ) : (
                        <button className={styles.deleteBtn} onClick={() => setConfirmDeleteId(entry.id)}>Delete</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', multiline }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      {multiline ? (
        <textarea
          className={styles.fieldInput}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
        />
      ) : (
        <input
          className={styles.fieldInput}
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
