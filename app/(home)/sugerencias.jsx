import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../constants/colors';
import { api } from '../../services/api';

const ICONOS_AREA = {
  'Estimulacion visual': '👁️',
  'Estimulacion auditiva': '👂',
  'Estimulacion cognitiva': '🧠',
  'Vinculo afectivo': '💕',
  'Motricidad': '🤸',
  'Motricidad gruesa': '🤸',
  'Sueno': '😴',
  'Lenguaje': '💬',
  'Social': '👥',
  'Cognitivo': '🧩',
  'Alimentacion': '🥣',
  'Emocional': '💛',
  'Autonomia': '⭐',
};

export default function SugerenciasScreen() {
  const router = useRouter();
  const [bebe, setBebe] = useState(null);
  const [meses, setMeses] = useState(0);
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [areaActiva, setAreaActiva] = useState('Todas');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const bebeData = await AsyncStorage.getItem('bebe');
      const usuarioData = await AsyncStorage.getItem('usuario');

      if (bebeData && usuarioData) {
        const bebeObj = JSON.parse(bebeData);
        setBebe(bebeObj);

        // Obtener fecha de nacimiento del bebé
        const usuario = JSON.parse(usuarioData);
        const bebeResponse = await api.get(`/auth/bebe/${usuario.id}`);
        if (bebeResponse.data.ok) {
          const fechaNac = new Date(bebeResponse.data.data.fecha_nacimiento);
          const hoy = new Date();
          const mesesEdad = Math.floor((hoy - fechaNac) / (1000 * 60 * 60 * 24 * 30.44));
          setMeses(mesesEdad);
          cargarSugerencias(mesesEdad);
        }
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarSugerencias = async (mesesEdad) => {
    try {
      const response = await api.get(`/auth/sugerencias/${mesesEdad}`);
      setSugerencias(response.data.data);
    } catch (error) {
      console.error('Error cargando sugerencias:', error);
    }
  };

  const etapaTexto = () => {
    if (meses <= 2) return 'Recien nacido (0-2 meses)';
    if (meses <= 5) return 'Bebe pequeno (3-5 meses)';
    if (meses <= 8) return 'Bebe activo (6-8 meses)';
    if (meses <= 11) return 'Explorador (9-11 meses)';
    if (meses <= 18) return 'Primer ano (12-18 meses)';
    if (meses <= 24) return 'Caminador (19-24 meses)';
    return 'Mas de 2 anos';
  };

  const areas = ['Todas', ...new Set(sugerencias.map(s => s.area))];

  const sugerenciasFiltradas = areaActiva === 'Todas'
    ? sugerencias
    : sugerencias.filter(s => s.area === areaActiva);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando sugerencias...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(home)')}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <View style={styles.bannerCenter}>
          <Text style={styles.bannerTitle}>MOMLY</Text>
          <Text style={styles.bannerSlogan}>Desarrollo del Bebé</Text>
        </View>
        <View style={styles.backPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Info del bebé */}
        <View style={styles.bebeCard}>
          <Text style={styles.bebeEmoji}>👶</Text>
          <View style={styles.bebeInfo}>
            <Text style={styles.bebeNombre}>{bebe?.nombre || 'Tu bebé'}</Text>
            <Text style={styles.bebeMeses}>{meses} {meses === 1 ? 'mes' : 'meses'} de edad</Text>
            <Text style={styles.bebeEtapa}>🌱 {etapaTexto()}</Text>
          </View>
        </View>

        {sugerencias.length === 0 ? (
          <View style={styles.vacioCont}>
            <Text style={styles.vacioEmoji}>🌟</Text>
            <Text style={styles.vacioTitulo}>Sin sugerencias disponibles</Text>
            <Text style={styles.vacioDesc}>No hay sugerencias para la edad actual de tu bebé. Consulta con tu pediatra.</Text>
          </View>
        ) : (
          <>
            {/* Tabs de áreas */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tabsContainer}
              contentContainerStyle={styles.tabsContent}
            >
              {areas.map(area => (
                <TouchableOpacity
                  key={area}
                  style={[styles.tab, areaActiva === area && styles.tabActivo]}
                  onPress={() => setAreaActiva(area)}
                >
                  <Text style={[styles.tabText, areaActiva === area && styles.tabTextActivo]}>
                    {area === 'Todas' ? '🌸 Todas' : `${ICONOS_AREA[area] || '⭐'} ${area}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.contador}>
              {sugerenciasFiltradas.length} sugerencia(s) para esta etapa
            </Text>

            {sugerenciasFiltradas.map((s, index) => (
              <View key={s.id} style={styles.sugerenciaCard}>
                <View style={styles.sugerenciaHeader}>
                  <Text style={styles.sugerenciaIcono}>{ICONOS_AREA[s.area] || '⭐'}</Text>
                  <Text style={styles.sugerenciaArea}>{s.area}</Text>
                </View>
                <Text style={styles.sugerenciaTexto}>{s.sugerencia}</Text>
              </View>
            ))}
          </>
        )}

        {/* Nota */}
        <View style={styles.notaBox}>
          <Text style={styles.notaTitle}>💡 Recuerda</Text>
          <Text style={styles.notaText}>
            Cada bebe se desarrolla a su propio ritmo. Estas sugerencias son una guia general. Si tienes dudas sobre el desarrollo de tu bebe consulta con tu pediatra.
          </Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  loadingText: { marginTop: 12, color: colors.textMedium, fontSize: 14 },

  banner: {
    backgroundColor: colors.primary,
    paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  backBtn: { width: 80 },
  backText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  bannerCenter: { alignItems: 'center', flex: 1 },
  bannerTitle: { fontSize: 28, fontWeight: 'bold', color: colors.white, letterSpacing: 4 },
  bannerSlogan: { fontSize: 12, color: colors.white, marginTop: 2 },
  backPlaceholder: { width: 80 },

  content: { padding: 24 },

  bebeCard: {
    backgroundColor: colors.white, borderRadius: 20, padding: 20, marginBottom: 20,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
    borderLeftWidth: 4, borderLeftColor: colors.primary,
  },
  bebeEmoji: { fontSize: 48 },
  bebeInfo: { flex: 1 },
  bebeNombre: { fontSize: 18, fontWeight: 'bold', color: colors.textDark, marginBottom: 2 },
  bebeMeses: { fontSize: 14, color: colors.primary, fontWeight: '600', marginBottom: 2 },
  bebeEtapa: { fontSize: 12, color: colors.textMedium },

  tabsContainer: { maxHeight: 50, marginBottom: 16 },
  tabsContent: { gap: 8, paddingRight: 8 },
  tab: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.primaryPale, borderWidth: 1.5, borderColor: colors.border,
  },
  tabActivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 12, fontWeight: '600', color: colors.textMedium },
  tabTextActivo: { color: colors.white },

  contador: { fontSize: 12, color: colors.textLight, marginBottom: 12 },

  sugerenciaCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    borderLeftWidth: 4, borderLeftColor: colors.primary,
  },
  sugerenciaHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  sugerenciaIcono: { fontSize: 20 },
  sugerenciaArea: { fontSize: 13, fontWeight: 'bold', color: colors.primary },
  sugerenciaTexto: { fontSize: 13, color: colors.textDark, lineHeight: 22 },

  vacioCont: { alignItems: 'center', paddingVertical: 40 },
  vacioEmoji: { fontSize: 50, marginBottom: 12 },
  vacioTitulo: { fontSize: 18, fontWeight: 'bold', color: colors.textDark, marginBottom: 8 },
  vacioDesc: { fontSize: 13, color: colors.textMedium, textAlign: 'center', lineHeight: 20 },

  notaBox: {
    backgroundColor: colors.primaryPale, borderRadius: 12, padding: 16, marginTop: 8,
    borderLeftWidth: 4, borderLeftColor: colors.primary,
  },
  notaTitle: { fontSize: 14, fontWeight: 'bold', color: colors.textDark, marginBottom: 6 },
  notaText: { fontSize: 13, color: colors.textMedium, lineHeight: 20 },

   // Footer estilo "App Pro"
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
  columnaIzquierda: {
    flex: 1,
  },
  columnaDerecha: {
    flex: 1,
    alignItems: 'flex-end',    
  },
  footerTextMin: {
    color: '#5D6D7E',          
    fontSize: 20,
    fontWeight: 'bold',
  },
  footerSloganMin: {
    color: '#04080c',
    fontSize: 15,
    opacity: 0.8,
  },
  footerLegalMin: {
    color: '#04080c',
    fontSize: 15,
    opacity: 0.7,
    textAlign: 'right',
  },});

