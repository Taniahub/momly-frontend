import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, Image,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';

const DIAS = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function getFecha() {
  const d = new Date();
  return `${DIAS[d.getDay()]}, ${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

// ─── Métrica ──────────────────────────────────────────────────────────────────
function MetricCard({ icon, value, label, badge, badgeType }) {
  const badgeStyle = {
    warn: { bg: '#fff8e6', text: '#b8860b' },
    ok:   { bg: '#e6f9ef', text: '#1a7a4a' },
    info: { bg: '#fff0f5', text: '#F7C6D0 ' },
  }[badgeType] || { bg: '#fff0f5', text: '#F7C6D0 ' };

  return (
    <View style={styles.metric}>
      <Text style={styles.metricIcon}>{icon}</Text>
      <Text style={styles.metricVal}>{value}</Text>
      <Text style={styles.metricLbl}>{label}</Text>
      {badge && (
        <View style={[styles.badge, { backgroundColor: badgeStyle.bg }]}>
          <Text style={[styles.badgeText, { color: badgeStyle.text }]}>{badge}</Text>
        </View>
      )}
    </View>
  );
}

// ─── CTA Button ───────────────────────────────────────────────────────────────
function CtaBtn({ icon, label, sub, primary, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.ctaBtn, primary && styles.ctaBtnPrimary]}
      onPress={onPress}
    >
      <View style={[styles.ctaIcon, primary && styles.ctaIconPrimary]}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.ctaLabel, primary && styles.ctaLabelPrimary]}>{label}</Text>
        <Text style={[styles.ctaSub, primary && styles.ctaSubPrimary]}>{sub}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Item reciente ────────────────────────────────────────────────────────────
function RecentItem({ icon, label, sub, onPress }) {
  return (
    <TouchableOpacity style={styles.recentItem} onPress={onPress}>
      <View style={styles.recentIcon}>
        <Text style={{ fontSize: 16 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.recentLabel}>{label}</Text>
        <Text style={styles.recentSub}>{sub}</Text>
      </View>
      <Text style={styles.recentArrow}>→</Text>
    </TouchableOpacity>
  );
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [citas, setCitas]   = useState([]);
  const [vacunas, setVacunas] = useState([]);
  const [bienestar, setBienestar] = useState(null);

  const screenWidth = Dimensions.get('window').width;
  const isWeb       = screenWidth >= 768;
  const nombreUsuario = user?.nombre ?? user?.name ?? 'mamá';

  useEffect(() => { cargarResumen(); }, []);

  const cargarResumen = async () => {
    try {
      const usuarioStr = await AsyncStorage.getItem('usuario');
      const bebeStr    = await AsyncStorage.getItem('bebe');
      const u = usuarioStr ? JSON.parse(usuarioStr) : null;
      const b = bebeStr    ? JSON.parse(bebeStr)    : null;

      // Citas
      if (u?.id) {
        const { api } = require('../../services/api');
        const resCitas = await api.get(`/auth/citas/${u.id}`);
        setCitas(resCitas.data?.data ?? []);

        const resBienestar = await api.get(`/auth/bienestar/${u.id}`);
        const registros = resBienestar.data?.data ?? [];
        if (registros.length > 0) setBienestar(registros[registros.length - 1]);
      }

      // Vacunas
      if (b?.id) {
        const { api } = require('../../services/api');
        const resVac = await api.get(`/auth/vacunas/${b.id}`);
        const todas = resVac.data?.data ?? [];
        setVacunas(todas.filter(v => !v.aplicada));
      }
    } catch (e) {
      console.warn('Error cargando resumen:', e.message);
    }
  };

  const handleNavigate = (key) => {
    if (key !== 'index') router.push(`/(home)/${key}`);
  };

  // Próximas citas (las 2 más cercanas)
  const proximasCitas = citas.slice(0, 2);
  const alertaCitas   = proximasCitas.length > 0
    ? proximasCitas.map(c => c.descripcion ?? c.titulo ?? 'Cita programada').join(' · ')
    : null;

  const bienestarScore = bienestar?.nivel ?? bienestar?.puntuacion ?? null;

  return (
    <View style={styles.screen}>
      
      {/* Banner rosa */}
      <View style={styles.banner}>
        <View style={styles.bannerCenter}>
          <Text style={styles.bannerTitle}>MOMLY</Text>
          <Text style={styles.bannerSlogan}>Contigo en cada primer paso</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* Saludo */}
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greeting}>¡Hola, {nombreUsuario}! 👋</Text>
            <Text style={styles.greetingSub}>Bienvenida a MOMLY 🌸</Text>
          </View>
          <Text style={styles.fecha}>{getFecha()}</Text>
        </View>

        {/* Alerta de citas */}
        {alertaCitas && (
          <View style={styles.alertBanner}>
            <Text style={{ fontSize: 20 }}>💡</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>
                Tienes {proximasCitas.length} cita{proximasCitas.length > 1 ? 's' : ''} próxima{proximasCitas.length > 1 ? 's' : ''}
              </Text>
              <Text style={styles.alertSub} numberOfLines={1}>{alertaCitas}</Text>
            </View>
          </View>
        )}

        {/* Métricas */}
        <View style={styles.metricRow}>
          <MetricCard
            icon="💉"
            value={vacunas.length}
            label="Vacunas pendientes"
            badge={vacunas.length > 0 ? 'Pendiente' : 'Al día'}
            badgeType={vacunas.length > 0 ? 'warn' : 'ok'}
          />
          <MetricCard
            icon="💛"
            value={bienestarScore ? `${bienestarScore}/10` : '—'}
            label="Bienestar hoy"
            badge={bienestarScore ? (bienestarScore >= 7 ? 'Bien' : 'Regular') : 'Sin registro'}
            badgeType={bienestarScore >= 7 ? 'ok' : 'warn'}
          />
          <MetricCard
            icon="📅"
            value={citas.length}
            label="Citas próximas"
            badge="Esta semana"
            badgeType="info"
          />
        </View>

        {/* Grid 2 columnas web / 1 móvil */}
        <View style={[styles.grid2, isWeb && styles.grid2Web]}>

          {/* Acciones rápidas */}
          <View style={styles.col}>
            <Text style={styles.sectionLabel}>Acciones rápidas</Text>
            <View style={styles.ctaGrid}>
              <CtaBtn
                icon="📝" label="Test de hoy" sub="Bienestar emocional"
                primary onPress={() => handleNavigate('bienestar')}
              />
              <CtaBtn
                icon="📅" label="Agendar cita" sub="Médico o especialista"
                onPress={() => handleNavigate('citas')}
              />
              <CtaBtn
                icon="💉" label="Ver vacunas" sub="Calendario del bebé"
                onPress={() => handleNavigate('vacunas')}
              />
              <CtaBtn
                icon="👩‍⚕️" label="Especialistas" sub="Consulta premium"
                onPress={() => handleNavigate('especialistas')}
              />
            </View>
          </View>

          {/* Recientes y recomendados */}
          <View style={styles.col}>
            <Text style={styles.sectionLabel}>Recientes y recomendados</Text>
            <View style={styles.recentList}>
              <RecentItem icon="📚" label="Guías de recuperación"   sub="Física y emocional"         onPress={() => handleNavigate('guias')} />
              <RecentItem icon="📖" label="Biblioteca del bebé"     sub="Lactancia, sueño y más"     onPress={() => handleNavigate('biblioteca')} />
              <RecentItem icon="🌱" label="Desarrollo del bebé"     sub="Sugerencias para tu etapa"  onPress={() => handleNavigate('sugerencias')} />
              <RecentItem icon="👩‍👩‍👧" label="Comunidad MOMLY"        sub="Comparte con otras mamás"   onPress={() => handleNavigate('comunidad')} />
              <RecentItem icon="📸" label="Galería de Recuerdos" sub="Fotos especiales de tu bebé" onPress={() => handleNavigate('galeria')} />
            </View>
          </View>

        </View>
      </ScrollView>
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

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: '#fff9f9' },
  scroll:  { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },

  // Banner
  banner:       { backgroundColor: '#F7C6D0', paddingVertical: 12, alignItems: 'center' },
  bannerCenter: { alignItems: 'center' },
  bannerTitle:  { fontSize: 28, fontWeight: 'bold', color: '#5e5d5d', letterSpacing: 4 },
  bannerSlogan: { fontSize: 12, color: '#5e5d5d', marginTop: 2 },

  // Saludo
  greetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 },
  greeting:    { fontSize: 22, fontWeight: '800', color: '#2d2d2d' },
  greetingSub: { fontSize: 13, color: '#F7C6D0 ', fontWeight: '600', marginTop: 2 },
  fecha:       { fontSize: 12, color: '#aaa', fontWeight: '600' },

  // Alerta
  alertBanner: {
    backgroundColor: '#fff0f5', borderWidth: 1, borderColor: '#fde8ee',
    borderLeftWidth: 4, borderLeftColor: '#F7C6D0 ',
    borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16,
  },
  alertTitle: { fontSize: 13, fontWeight: '800', color: '#2d2d2d' },
  alertSub:   { fontSize: 12, color: '#888', marginTop: 2 },

  // Métricas
  metricRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  metric: {
    flex: 1, backgroundColor: '#fff',
    borderRadius: 14, borderWidth: 1, borderColor: '#fde8ee', padding: 14,
  },
  metricIcon: { fontSize: 20, marginBottom: 6 },
  metricVal:  { fontSize: 22, fontWeight: '800', color: '#2d2d2d', lineHeight: 26 },
  metricLbl:  { fontSize: 11, color: '#aaa', fontWeight: '600', marginTop: 3 },
  badge:      { alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginTop: 6 },
  badgeText:  { fontSize: 10, fontWeight: '700' },

  // Grid 2 col
  grid2:    { flexDirection: 'column', gap: 16 },
  grid2Web: { flexDirection: 'row', alignItems: 'flex-start' },
  col:      { flex: 1 },

  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: '#d4a0b0',
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10,
  },

  // CTAs
  ctaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  ctaBtn: {
    width: '47%', backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#fde8ee',
    borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  ctaBtnPrimary: { backgroundColor: '#F7C6D0 ', borderColor: '#F7C6D0 ' },
  ctaIcon:       { width: 38, height: 38, borderRadius: 10, backgroundColor: '#fff0f5', alignItems: 'center', justifyContent: 'center' },
  ctaIconPrimary:{ backgroundColor: 'rgba(255,255,255,0.2)' },
  ctaLabel:      { fontSize: 12, fontWeight: '800', color: '#2d2d2d' },
  ctaLabelPrimary:{ color: '#5e5d5d' },
  ctaSub:        { fontSize: 11, color: '#aaa', marginTop: 1 },
  ctaSubPrimary: { color: '#888' },

  // Recientes
  recentList: { gap: 8 },
  recentItem: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#fde8ee',
    borderRadius: 12, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  recentIcon:  { width: 36, height: 36, borderRadius: 10, backgroundColor: '#fff0f5', alignItems: 'center', justifyContent: 'center' },
  recentLabel: { fontSize: 13, fontWeight: '700', color: '#2d2d2d' },
  recentSub:   { fontSize: 11, color: '#aaa', marginTop: 1 },
  recentArrow: { marginLeft: 'auto', color: '#F7C6D0 ', fontSize: 14, fontWeight: '700' },

  footerColumnas: { backgroundColor: '#FADBD8', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  columnaIzquierda: { flex: 1 },
  columnaDerecha: { flex: 1, alignItems: 'flex-end' },
  footerTextMin: { color: '#5D6D7E', fontSize: 20, fontWeight: 'bold' },
  footerSloganMin: { color: '#04080c', fontSize: 15, opacity: 0.8 },
  footerLegalMin: { color: '#04080c', fontSize: 15, opacity: 0.7, textAlign: 'right' },
});
