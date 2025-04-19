import { useState, useEffect } from 'react';

const checkpoints = [
  {
    name: "Départ - Cathédrale - Vielle Ville",
    lat: 43.70313,
    lng: 7.26608,
    radius: 50,
    clue: "On commence le test ?"
  },
  {
    name: "Homebox",
    lat: 43.706803,
    lng: 7.2844832,
    radius: 50,
    clue: "T'as bien arrivé !"
  },
  {
    name: "Place Rossetti",
    lat: 43.6971832,
    lng: 7.2762796,
    radius: 100,
    clue: "Bienvenue à la casa !"
  }
];

export default function GeocachingApp() {
  const [position, setPosition] = useState(null);
  const [currentCheckpoint, setCurrentCheckpoint] = useState(0);
  const [inZone, setInZone] = useState(false);
  const [error, setError] = useState(null);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!started || finished) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ lat: latitude, lng: longitude });

        const checkpoint = checkpoints[currentCheckpoint];
        const distance = getDistanceFromLatLonInMeters(latitude, longitude, checkpoint.lat, checkpoint.lng);

        setInZone(distance <= checkpoint.radius);
        setError(null);
      },
      (err) => {
        console.error("Erreur de géolocalisation:", err.message || err);
        setError("Erreur de géolocalisation : " + (err.message || "Permission refusée ou position inaccessible. Veuillez vérifier vos paramètres de localisation et réessayer."));
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [currentCheckpoint, started, finished]);

  function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  const handleNext = () => {
    if (currentCheckpoint < checkpoints.length - 1) {
      setCurrentCheckpoint(currentCheckpoint + 1);
      setInZone(false);
    } else {
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentCheckpoint(0);
    setInZone(false);
    setFinished(false);
    setStarted(true);
  };

  if (!started) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h1>Bienvenue dans la chasse au trésor 🧭</h1>
        <p>Active ta localisation et approche-toi des lieux pour débloquer les étapes !</p>
        <p>Conseil : utilise ton smartphone, en extérieur.</p>
        <button onClick={() => setStarted(true)}>Commencer la chasse</button>
      </div>
    );
  }

  if (finished) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h1>🎉 Félicitations !</h1>
        <p>Vous avez terminé la chasse au trésor.</p>
        <button onClick={handleRestart}>Rejouer</button>
        <p><a href="https://audio-guides.eu" target="_blank" rel="noopener noreferrer">Retour à l'accueil</a></p>
      </div>
    );
  }

  const checkpoint = checkpoints[currentCheckpoint];

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h1>Chasse au Trésor : Nice</h1>
      <h2>Étape {currentCheckpoint + 1} : {checkpoint.name}</h2>
      <p>{checkpoint.clue}</p>
      {inZone ? (
        <button onClick={handleNext}>Je suis arrivé(e) ici</button>
      ) : (
        <p>Approchez-vous du lieu pour débloquer l'étape suivante...</p>
      )}
      {position && (
        <p>Votre position : {position.lat.toFixed(5)}, {position.lng.toFixed(5)}</p>
      )}
      {error && (
        <p style={{ color: 'red' }}>{error}</p>
      )}
    </div>
  );
}
