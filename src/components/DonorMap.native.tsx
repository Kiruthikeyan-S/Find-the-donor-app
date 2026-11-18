import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { DEFAULT_CENTER, MedicalFacility } from '../data/facilities';
import { COLORS } from '../theme';
import { DonorRecord } from '../utils/bloodCompatibility';

interface DonorMapProps {
  donors: DonorRecord[];
  facilities: MedicalFacility[];
  filter: 'all' | 'donor' | 'bank' | 'hospital';
  userCoords: { latitude: number; longitude: number } | null;
}

export function DonorMap({
  donors,
  facilities,
  filter,
  userCoords,
}: DonorMapProps) {
  const showDonors = filter === 'all' || filter === 'donor';
  const visibleFacilities = facilities.filter(
    (f) => filter === 'all' || f.type === filter
  );

  const region = {
    latitude: userCoords?.latitude ?? DEFAULT_CENTER.latitude,
    longitude: userCoords?.longitude ?? DEFAULT_CENTER.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.mapWrap}>
      <MapView style={styles.map} region={region} showsUserLocation>
        {showDonors &&
          donors
            .filter((d) => d.latitude !== null && d.longitude !== null)
            .map((d) => (
              <Marker
                key={`donor-${d.id}`}
                coordinate={{ latitude: d.latitude!, longitude: d.longitude! }}
                title={`${d.name} (${d.blood_type})`}
                description={`Phone: ${d.phone}`}
                pinColor={COLORS.primary}
              />
            ))}

        {visibleFacilities.map((f) => (
          <Marker
            key={f.id}
            coordinate={{ latitude: f.latitude, longitude: f.longitude }}
            title={f.name}
            description={`${f.address} • ${f.phone}`}
            pinColor={f.type === 'bank' ? '#0284c7' : '#16a34a'}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  mapWrap: {
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  map: {
    flex: 1,
  },
});
