/**
 * RUTA: frontend/app/(home)/index.jsx
 */

import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import MomlyNavigation, { NAV_ITEMS } from '../../components/MomlyNavigation';

function DashboardCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item.key)}>
      <Text style={styles.cardIcon}>{item.icon}</Text>
      <Text style={styles.cardLabel}>{item.label}</Text>
      {item.sub && <Text style={styles.cardSub} numberOfLines={2}>{item.sub}</Text>}
      {item.premium && (
        <View style={styles.premiumTag}>
          <Text style={styles.premiumTagText}>Premium</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [activeRoute, setActiveRoute] = useState('index');

  const screenWidth = Dimensions.get('window').width;
  const numColumns  = screenWidth >= 768 ? 3 : 2;
  const gridItems   = NAV_ITEMS.filter(i => i.key !== 'index' && !i.isPremiumCta);

  const handleNavigate = (key) => {
    setActiveRoute(key);
    if (key !== 'index') router.push(`/(home)/${key}`);
  };

  const nombreUsuario = user?.nombre ?? user?.name ?? 'mamá';

  return (
    <View style={styles.screen}>
      <MomlyNavigation
        user={{ ...user, name: nombreUsuario }}
        onLogout={logout}
        activeRoute={activeRoute}
        onNavigate={handleNavigate}
      />

      {/* Banner rosa — igual que en guías */}
      <View style={styles.banner}>
        <View style={styles.bannerCenter}>
          <Text style={styles.bannerTitle}>MOMLY</Text>
          <Text style={styles.bannerSlogan}>Contigo en cada primer paso</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.greeting}>¡Hola, {nombreUsuario}! 👋</Text>
        <Text style={styles.greetingSub}>Bienvenida a MOMLY 🌸</Text>
        <Text style={styles.sectionTitle}>¿Qué quieres hacer hoy?</Text>

        <View style={[styles.grid, { gap: 12 }]}>
          {gridItems.map((item, idx) => {
            const isLone = gridItems.length % numColumns !== 0
              && idx === gridItems.length - 1;
            return (
              <View
                key={item.key}
                style={[
                  styles.cardWrapper,
                  { width: `${100 / numColumns - 1.5}%` },
                  isLone && { alignSelf: 'center' },
                ]}
              >
                <DashboardCard item={item} onPress={handleNavigate} />
              </View>
            );
          })}
        </View>
      </ScrollView>
      {/* Footer */}
            <View style={styles.footerColumnas}>
              <View style={styles.columnaIzquierda}>
                <Text style={styles.footerTextMin}>🌸 MOMLY</Text>
                <Text style={styles.footerSloganMin}>contigo en cada primer paso.</Text>
              </View>
              <View style={styles.columnaDerecha}>
                <Text style={styles.footerLegalMin}>© 2026 • Privacidad</Text>
                <Text style={styles.footerLegalMin}>Términos y condiciones</Text>
              </View>
            </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:        { flex: 1, backgroundColor: '#fff9f9' },
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  // Banner rosa igual que guías
  banner: {
    backgroundColor: '#f4a7b9',  // mismo color que colors.primary en tu app
    paddingVertical: 12,
    alignItems: 'center',
  },
  bannerCenter:  { alignItems: 'center' },
  bannerTitle:   { fontSize: 28, fontWeight: 'bold', color: '#5e5d5d', letterSpacing: 4 },
  bannerSlogan:  { fontSize: 12, color: '#5e5d5d', marginTop: 2 },

  greeting:      { fontSize: 22, fontWeight: '800', color: '#2d2d2d', marginTop: 24 },
  greetingSub:   { fontSize: 14, color: '#E8336D', fontWeight: '600', marginTop: 2, marginBottom: 20 },
  sectionTitle:  { fontSize: 16, fontWeight: '700', color: '#2d2d2d', textAlign: 'center', marginBottom: 16 },
  grid:          { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cardWrapper:   { marginBottom: 12 },
  card: {
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 1, borderColor: '#fde8ee',
    padding: 18, alignItems: 'center',
    minHeight: 110, justifyContent: 'center', gap: 6,
  },
  cardIcon:       { fontSize: 30 },
  cardLabel:      { fontSize: 13, fontWeight: '700', color: '#2d2d2d', textAlign: 'center' },
  cardSub:        { fontSize: 11, color: '#9b9b9b', textAlign: 'center' },
  premiumTag:     { backgroundColor: '#fff8e6', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  premiumTagText: { fontSize: 10, fontWeight: '700', color: '#b8860b' },
// Footer
  footerColumnas: {
    backgroundColor: '#FADBD8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  columnaIzquierda: { flex: 1 },
  columnaDerecha: { flex: 1, alignItems: 'flex-end' },
  footerTextMin: { color: '#5D6D7E', fontSize: 20, fontWeight: 'bold' },
  footerSloganMin: { color: '#04080c', fontSize: 15, opacity: 0.8 },
  footerLegalMin: { color: '#04080c', fontSize: 15, opacity: 0.7, textAlign: 'right' },
});
