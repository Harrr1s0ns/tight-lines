import { useRef, useState } from 'react';
import styles from './FishID.module.css';

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function compressImage(dataUrl, maxDim = 1024, quality = 0.82) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = dataUrl;
  });
}

function saveToCollection(entry) {
  const existing = JSON.parse(localStorage.getItem('tightlines_collection') || '[]');
  existing.unshift(entry);
  localStorage.setItem('tightlines_collection', JSON.stringify(existing));
}

export default function FishID({ onNavigateToCollection }) {
  const inputRef = useRef(null);
  const compressedPhotoRef = useRef(null);
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | analyzing | result | error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [logged, setLogged] = useState(false);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const rawDataUrl = evt.target.result;
      setPhotoDataUrl(rawDataUrl);
      setStatus('analyzing');
      setLogged(false);
      setResult(null);

      const compressed = await compressImage(rawDataUrl);
      compressedPhotoRef.current = compressed;
      const base64 = compressed.split(',')[1];
      const mimeType = 'image/jpeg';

      try {
        const res = await fetch('/.netlify/functions/identify-fish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mimeType }),
        });
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error('Server error — make sure GEMINI_API_KEY is set in Netlify and redeploy.');
        }
        if (!res.ok) {
          let msg = data.error || 'Unknown error';
          if (data.quotaInfo) msg += ` (quota: ${data.quotaInfo})`;
          throw new Error(msg);
        }
        setResult(data);
        setStatus('result');
      } catch (err) {
        setErrorMsg(err.message || 'Something went wrong. Please try again.');
        setStatus('error');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function handleLog() {
    if (!result) return;
    const entry = {
      id: generateId(),
      species: result.species || 'Unknown',
      estimatedLength: result.estimatedLength || '—',
      estimatedWeight: result.estimatedWeight || '—',
      confidence: result.confidence || 'low',
      notes: result.notes || '',
      date: new Date().toISOString().slice(0, 10),
      location: '',
      photoDataUrl: compressedPhotoRef.current || null,
    };
    saveToCollection(entry);
    setLogged(true);
  }

  function confidenceColor(c) {
    if (c === 'high') return styles.confHigh;
    if (c === 'medium') return styles.confMedium;
    return styles.confLow;
  }

  return (
    <div className="page-enter">
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Fish ID</h1>
        <p className={styles.heroSub}>Take or upload a photo to identify your catch</p>
      </div>

      <div className={styles.body}>
        {/* Photo area */}
        <div
          className={styles.photoArea}
          onClick={() => status !== 'analyzing' && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          {photoDataUrl ? (
            <img src={photoDataUrl} alt="Captured fish" className={styles.photo} />
          ) : (
            <div className={styles.photoPlaceholder}>
              <span className={styles.photoIcon}>📷</span>
              <span className={styles.photoHint}>Tap to take or choose a photo</span>
            </div>
          )}
          {status === 'analyzing' && (
            <div className={styles.analysingOverlay}>
              <span className={styles.spinner} />
              <span>Identifying fish…</span>
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className={styles.hiddenInput}
          onChange={handleFileChange}
        />

        {status === 'idle' && (
          <button className={styles.captureBtn} onClick={() => inputRef.current?.click()}>
            Take Photo
          </button>
        )}

        {status === 'analyzing' && (
          <p className={styles.analysisNote}>Analysing with AI…</p>
        )}

        {status === 'error' && (
          <div className={styles.errorCard}>
            <p className={styles.errorText}>{errorMsg}</p>
            <button className={styles.retryBtn} onClick={() => { setStatus('idle'); setPhotoDataUrl(null); }}>
              Try Again
            </button>
          </div>
        )}

        {status === 'result' && result && (
          <div className={styles.resultCard}>
            <div className={styles.resultHeader}>
              <span className={styles.speciesName}>{result.species}</span>
              <span className={`${styles.confidence} ${confidenceColor(result.confidence)}`}>
                {result.confidence} confidence
              </span>
            </div>

            <div className={styles.statsRow}>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Length</span>
                <span className={styles.statValue}>{result.estimatedLength}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statLabel}>Weight</span>
                <span className={styles.statValue}>{result.estimatedWeight}</span>
              </div>
            </div>

            {result.notes && (
              <p className={styles.resultNotes}>{result.notes}</p>
            )}

            <div className={styles.resultActions}>
              {logged ? (
                <div className={styles.loggedBanner}>
                  ✓ Logged to your Collection
                  <button className={styles.viewCollectionBtn} onClick={onNavigateToCollection}>
                    View Collection
                  </button>
                </div>
              ) : (
                <button className={styles.logBtn} onClick={handleLog}>
                  Log to My Collection
                </button>
              )}
              <button className={styles.retakeBtn} onClick={() => { setStatus('idle'); setPhotoDataUrl(null); setResult(null); setLogged(false); compressedPhotoRef.current = null; }}>
                New Photo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
