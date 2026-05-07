import { useState, useEffect } from 'react';
import { lakes } from '../data/lakes';
import { swims } from '../data/swims';
import { tackleShops } from '../data/tackleShops';
import { Badge, DetailSection, BackButton, DetailHero, InfoRow, EmptyState } from '../components/UI';
import styles from './Lakes.module.css';

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function NearestShops({ lake }) {
  if (!lake.lat || !lake.lng) return null;

  const nearest = tackleShops
    .map((s) => ({ ...s, distKm: haversineKm(lake.lat, lake.lng, s.lat, s.lng) }))
    .sort((a, b) => a.distKm - b.distKm)
    .slice(0, 5);

  return (
    <DetailSection title="Nearest Tackle Shops">
      {nearest.map((shop) => (
        <div key={shop.id} className={styles.shopCard}>
          <div className={styles.shopHeader}>
            <div className={styles.shopName}>{shop.name}</div>
            <span className={styles.shopDist}>
              {shop.distKm < 1 ? '<1 km' : `${Math.round(shop.distKm)} km`}
            </span>
          </div>
          <div className={styles.shopAddress}>📍 {shop.address}{shop.postcode ? `, ${shop.postcode}` : ''}</div>
          {shop.phone && (
            <a href={`tel:${shop.phone}`} className={styles.shopPhone}>
              📞 {shop.phone}
            </a>
          )}
          {shop.website && (
            <a href={shop.website} target="_blank" rel="noreferrer" className={styles.shopWebsite}>
              🌐 Visit website →
            </a>
          )}
        </div>
      ))}
    </DetailSection>
  );
}

function LakeCard({ lake, onClick }) {
  const isClub = lake.isClubWater;
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.cardBody}>
        <div className={styles.cardTop}>
          <div className={styles.cardTitle}>{lake.name}</div>
          <Badge variant={isClub ? 'earth' : 'water'}>{isClub ? 'Club Water' : 'Day Ticket'}</Badge>
        </div>
        <div className={styles.cardLocation}>📍 {lake.location}</div>
        <div className={styles.cardDesc}>{lake.description ? lake.description.slice(0, 100) + '…' : ''}</div>
      </div>
      <div className={styles.cardFooter}>
        <span>{lake.costToFish ? lake.costToFish.split('|')[0].trim() : ''}</span>
        <span className={styles.arrow}>›</span>
      </div>
    </div>
  );
}

function windDegToCompass(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

function mpsToMph(mps) {
  return Math.round(mps * 2.237);
}

function getFishingInsights(weather) {
  const temp = weather.main.temp;
  const windMph = mpsToMph(weather.wind.speed);
  const windDir = windDegToCompass(weather.wind.deg);
  const condition = weather.weather[0].main;
  const insights = [];

  if (temp < 5)
    insights.push('Cold water — pike and perch are your best targets today.');
  else if (temp < 12)
    insights.push('Cool temperatures — predators active; carp will be sluggish near deeper areas.');
  else if (temp < 18)
    insights.push('Mild temperatures — carp starting to feed; a mixed bag is likely.');
  else
    insights.push('Warm water — carp very active, especially at dawn and dusk near the margins.');

  if (windMph < 5)
    insights.push('Calm conditions — try surface fishing or stalking near visible features.');
  else if (windMph <= 15)
    insights.push('Moderate breeze — wind lanes oxygenate the water and push food; fish the windward bank.');
  else
    insights.push('Strong wind — fish will seek shelter in margins and behind snags.');

  if (['SW', 'S', 'W'].includes(windDir))
    insights.push('SW/W wind — a warm, productive direction. Cast into the wind for best results.');
  else if (['N', 'NE', 'E'].includes(windDir))
    insights.push('N/E wind — cold and less productive. Focus on sheltered south-facing swims.');

  if (condition === 'Rain' || condition === 'Drizzle')
    insights.push('Rain bringing nutrients in — pike and perch often respond well in these conditions.');
  else if (condition === 'Clouds')
    insights.push('Overcast sky — fish feel confident to feed closer to the surface.');
  else if (condition === 'Clear')
    insights.push('Bright conditions — fish may go deeper; early morning or late evening sessions are best.');

  return insights;
}

function LakeDetail({ lake, onBack }) {
  const lakeSwims = swims.filter((s) => s.lakeId === lake.id);
  const isClub = lake.isClubWater;

  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(null);

  useEffect(() => {
    setWeather(null);
    setWeatherLoading(true);
    setWeatherError(null);

    const query =
      lake.lat && lake.lng
        ? `lat=${lake.lat}&lon=${lake.lng}`
        : `q=${encodeURIComponent(lake.location || 'Kent')},UK`;

    fetch(
      `https://api.openweathermap.org/data/2.5/weather?${query}&appid=5e425507ce91583f354f6fbb06f42227&units=metric`
    )
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setWeather(data);
        setWeatherLoading(false);
      })
      .catch(() => {
        setWeatherError('Weather data unavailable');
        setWeatherLoading(false);
      });
  }, [lake.id]);

  return (
    <div className="page-enter">
      <DetailHero
        title={lake.name}
        subtitle={`📍 ${lake.location}`}
        badge={isClub ? 'Club Water' : 'Day Ticket'}
        badgeVariant={isClub ? 'earth' : 'water'}
        extraBadge={lake.clubName}
      >
        <BackButton onClick={onBack} label="All Lakes" />
      </DetailHero>

      {(lake.address || lake.locationNotes || lake.accessNotes) && (
        <DetailSection title="Location & Access">
          {lake.address && (
            <InfoRow
              label="Address"
              value={`${lake.address}${lake.postcode ? `, ${lake.postcode}` : ''}`}
            />
          )}
          {lake.locationNotes && <InfoRow label="Directions" value={lake.locationNotes} />}
          {lake.accessNotes && <InfoRow label="Access" value={lake.accessNotes} />}
        </DetailSection>
      )}

      {lake.description && (
        <DetailSection title="About">
          <p className={styles.bodyText}>{lake.description}</p>
        </DetailSection>
      )}

      {lake.species && lake.species.length > 0 && (
        <DetailSection title="Fish Species">
          <div className={styles.speciesTags}>
            {lake.species.map((s) => (
              <span key={s} className={styles.speciesTag}>{s}</span>
            ))}
          </div>
        </DetailSection>
      )}

      <DetailSection title="Practical Info">
        {lake.costToFish && <InfoRow label="Cost" value={lake.costToFish} />}
        {lake.facilities && lake.facilities.length > 0 && (
          <InfoRow label="Facilities" value={lake.facilities.join(' · ')} />
        )}
        {lake.contactDetails.phone && (
          <InfoRow
            label="Phone"
            value={<a href={`tel:${lake.contactDetails.phone}`}>{lake.contactDetails.phone}</a>}
          />
        )}
        {lake.contactDetails.email && (
          <InfoRow
            label="Email"
            value={<a href={`mailto:${lake.contactDetails.email}`}>{lake.contactDetails.email}</a>}
          />
        )}
        {lake.contactDetails.website && (
          <InfoRow
            label="Website"
            value={
              <a href={lake.contactDetails.website} target="_blank" rel="noreferrer">
                Visit website →
              </a>
            }
          />
        )}
      </DetailSection>

      {lake.bestTimes && (
        <DetailSection title="Best Times to Fish">
          <p className={styles.bodyText}>{lake.bestTimes}</p>
        </DetailSection>
      )}

      {lake.rules && lake.rules.length > 0 && (
        <DetailSection title="Rules">
          {lake.rules.map((r) => (
            <div key={r} className={styles.ruleRow}>
              <span className={styles.ruleTick}>✓</span>
              <span>{r}</span>
            </div>
          ))}
        </DetailSection>
      )}

      {lakeSwims.length > 0 && (
        <DetailSection title={`Swims & Hotspots (${lakeSwims.length})`}>
          {lakeSwims.map((swim) => (
            <div key={swim.id} className={styles.swimCard}>
              <div className={styles.swimName}>{swim.swimName}</div>
              <div className={styles.swimDesc}>{swim.description}</div>
              <div className={styles.swimMeta}>
                <div className={styles.swimMetaLabel}>Best Conditions</div>
                <div className={styles.swimMetaText}>{swim.bestConditions}</div>
              </div>
              <div className={styles.swimMeta}>
                <div className={styles.swimMetaLabel}>Rig Advice</div>
                <div className={styles.swimMetaText}>{swim.rigAdvice}</div>
              </div>
              {swim.targetSpecies && swim.targetSpecies.length > 0 && (
                <div className={styles.targetTags}>
                  {swim.targetSpecies.map((s) => (
                    <span key={s} className={styles.targetTag}>{s}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </DetailSection>
      )}

      {lake.notes && (
        <DetailSection title="Angler's Notes">
          <p className={styles.bodyText}>{lake.notes}</p>
        </DetailSection>
      )}

      <DetailSection title="Current Weather">
        {weatherLoading && <p className={styles.weatherLoading}>Loading weather…</p>}
        {weatherError && <p className={styles.weatherError}>{weatherError}</p>}
        {weather && (
          <div className={styles.weatherGrid}>
            <div className={styles.weatherStat}>
              <div className={styles.weatherValue}>{Math.round(weather.main.temp)}°C</div>
              <div className={styles.weatherLabel}>Temperature</div>
            </div>
            <div className={styles.weatherStat}>
              <div className={styles.weatherValue}>{mpsToMph(weather.wind.speed)} mph</div>
              <div className={styles.weatherLabel}>Wind Speed</div>
            </div>
            <div className={styles.weatherStat}>
              <div className={styles.weatherValue}>{windDegToCompass(weather.wind.deg)}</div>
              <div className={styles.weatherLabel}>Wind Direction</div>
            </div>
            <div className={styles.weatherStat}>
              <div className={`${styles.weatherValue} ${styles.weatherDesc}`}>
                {weather.weather[0].description}
              </div>
              <div className={styles.weatherLabel}>Conditions</div>
            </div>
          </div>
        )}
      </DetailSection>

      {weather && (
        <DetailSection title="Fishing Conditions Insight">
          <div className={styles.insightList}>
            {getFishingInsights(weather).map((tip, i) => (
              <div key={i} className={styles.insightRow}>
                <span className={styles.insightIcon}>🎣</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </DetailSection>
      )}

      <NearestShops lake={lake} />
    </div>
  );
}

export default function Lakes({ initialSelected = null }) {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(initialSelected);

  const filtered =
    filter === 'club'
      ? lakes.filter((l) => l.isClubWater)
      : filter === 'dayticket'
      ? lakes.filter((l) => l.isNonClubWater)
      : lakes;

  if (selected) {
    return <LakeDetail lake={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="page-enter">
      <div className={styles.filters}>
        {[
          { id: 'all', label: 'All Waters' },
          { id: 'dayticket', label: 'Day Ticket' },
          { id: 'club', label: 'Club Waters' },
        ].map((f) => (
          <button
            key={f.id}
            className={`${styles.chip} ${filter === f.id ? styles.chipActive : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Kent Fishing Venues</h2>
          <span className={styles.sectionCount}>{filtered.length} venues</span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon="🏞️" title="No venues found" />
        ) : (
          <div className={styles.list}>
            {filtered.map((lake) => (
              <LakeCard key={lake.id} lake={lake} onClick={() => setSelected(lake)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
