import React, { useState, useEffect } from 'react';
import styles from './StoreLocationMap.module.css';

const StoreLocationMap = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Coordenadas de la tienda (extraídas del enlace de Google Maps)
  const storeLocation = {
    lat: 20.0247,
    lng: -75.8219,
    address: "Santiago de Cuba, Cuba",
    name: "Yero Shop!"
  };

  // Función para calcular distancia entre dos puntos
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  // Obtener ubicación del usuario
  const getUserLocation = () => {
    setIsLoadingLocation(true);
    
    if (!navigator.geolocation) {
      alert('La geolocalización no es compatible con este navegador');
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        setUserLocation({ lat: userLat, lng: userLng });
        
        // Calcular distancia
        const dist = calculateDistance(
          userLat, 
          userLng, 
          storeLocation.lat, 
          storeLocation.lng
        );
        
        setDistance(dist);
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        alert('No se pudo obtener tu ubicación. Por favor permite el acceso a la ubicación.');
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // URLs para diferentes aplicaciones de mapas
  const getDirectionsUrls = () => {
    const storeCoords = `${storeLocation.lat},${storeLocation.lng}`;
    const userCoords = userLocation ? `${userLocation.lat},${userLocation.lng}` : '';
    
    return {
      googleMaps: userLocation 
        ? `https://www.google.com/maps/dir/${userCoords}/${storeCoords}`
        : `https://www.google.com/maps/search/?api=1&query=${storeCoords}`,
      appleMaps: userLocation
        ? `http://maps.apple.com/?saddr=${userCoords}&daddr=${storeCoords}`
        : `http://maps.apple.com/?q=${storeCoords}`,
      waze: userLocation
        ? `https://waze.com/ul?ll=${storeLocation.lat},${storeLocation.lng}&navigate=yes`
        : `https://waze.com/ul?ll=${storeLocation.lat},${storeLocation.lng}`,
    };
  };

  const directionsUrls = getDirectionsUrls();

  return (
    <div className={styles.storeLocationMap}>
      {/* Mapa embebido de Google Maps */}
      <div className={styles.mapContainer}>
        <iframe
          src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3664.8!2d${storeLocation.lng}!3d${storeLocation.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjDCsDAxJzI5LjAiTiA3NcKwNDknMTkuMCJX!5e0!3m2!1ses!2scu!4v1640000000000!5m2!1ses!2scu&zoom=15`}
          width="100%"
          height="250"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Ubicación de Yero Shop!"
        ></iframe>
      </div>

      {/* Información de la tienda */}
      <div className={styles.storeInfo}>
        <h4>🏪 {storeLocation.name}</h4>
        <p>📍 {storeLocation.address}</p>
        <p>📞 WhatsApp: +53 54690878</p>
        
        {distance && (
          <div className={styles.distanceInfo}>
            <p className={styles.distance}>
              📏 Distancia aproximada: <strong>{distance.toFixed(2)} km</strong>
            </p>
            <p className={styles.travelTime}>
              🚗 Tiempo estimado: <strong>{Math.ceil(distance * 3)} minutos</strong>
            </p>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className={styles.actionButtons}>
        <button
          onClick={getUserLocation}
          disabled={isLoadingLocation}
          className={`btn btn-primary ${styles.locationBtn}`}
        >
          {isLoadingLocation ? (
            <span className={styles.loading}>
              <span className="loader-2"></span>
              Obteniendo ubicación...
            </span>
          ) : (
            '📍 Calcular Distancia'
          )}
        </button>

        <div className={styles.directionsButtons}>
          <a
            href={directionsUrls.googleMaps}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn btn-success ${styles.directionsBtn}`}
          >
            🗺️ Google Maps
          </a>
          
          <a
            href={directionsUrls.appleMaps}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn btn-success ${styles.directionsBtn}`}
          >
            🍎 Apple Maps
          </a>
          
          <a
            href={directionsUrls.waze}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn btn-success ${styles.directionsBtn}`}
          >
            🚗 Waze
          </a>
        </div>
      </div>

      {/* Instrucciones adicionales */}
      <div className={styles.instructions}>
        <h5>📋 Instrucciones para llegar:</h5>
        <ul>
          <li>🚗 Puedes usar cualquier aplicación de mapas</li>
          <li>📞 Llama al +53 54690878 si necesitas ayuda</li>
          <li>🕒 Horario de atención: Lunes a Domingo</li>
          <li>🅿️ Estacionamiento disponible cerca</li>
        </ul>
      </div>
    </div>
  );
};

export default StoreLocationMap;