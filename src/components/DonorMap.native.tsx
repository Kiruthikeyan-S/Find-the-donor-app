import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { COLORS } from '../theme';
import { DonorRecord } from '../utils/bloodCompatibility';

interface DonorMapProps {
  donors: DonorRecord[];
  userCoords: { latitude: number; longitude: number } | null;
}

const FALLBACK_REGION = {
  latitude: 13.0827,
  longitude: 80.2707,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export function DonorMap({ donors, userCoords }: DonorMapProps) {
  const geolocatedDonors = donors.filter(
    (d) => d.latitude !== null && d.longitude !== null
  );

  const region = userCoords
    ? {
        latitude: userCoords.latitude,
        longitude: userCoords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : geolocatedDonors[0]
    ? {
        latitude: geolocatedDonors[0].latitude!,
        longitude: geolocatedDonors[0].longitude!,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : FALLBACK_REGION;

  return (
    <View style={styles.mapWrap}>
      <MapView style={styles.map} region={region} showsUserLocation>
        {geolocatedDonors.map((d) => (
          <Marker
            key={`donor-${d.id}`}
            coordinate={{ latitude: d.latitude!, longitude: d.longitude! }}
            title={`${d.name} (${d.blood_type})`}
            description={d.phone ? `Phone: ${d.phone}` : undefined}
            pinColor={COLORS.primary}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  mapWrap: {
    height: 360,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  map: {
    flex: 1,
  },
});
