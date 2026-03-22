import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { colors } from '../../constants/colors';
import { api } from '../../services/api';

export default function EsNormalScreen() {
  const router = useRouter();
  const [preguntas, setPreguntas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [preguntaActiva, setPreguntaActiva] = useState(null);

  useEffect(() => {
    cargarPreguntas();
  }, []);

  const cargarPreguntas = async () => {
    try {
      const response = await api.get('/auth/es-normal');
      setPreguntas(response.data.data);
    } catch (error) {
      console.error('Error cargando preguntas:', error);
    } finally {
      setLoading(false);
    }
  };

  const categorias = ['Todas', ...new Set(preguntas.map(p => p.categoria))];

  const preguntasFiltradas = preguntas.filter(p => {
  const coincideCategoria = categoriaActiva === 'Todas' || p.categoria === categoriaActiva;
  const coincideBusqueda = p.pregunta.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .includes(busqueda.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
  return coincideCategoria && coincideBusqueda;
});

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (preguntaActiva) {
    return (
      <View style={styles.container}>
        <View style={styles.banner}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setPreguntaActiva(null)}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <View style={styles.bannerCenter}>
            <Text style={styles.bannerTitle}>MOMLY</Text>
            <Text style={styles.bannerSlogan}>¿Es Normal?</Text>
          </View>
          <View style={styles.backPlaceholder} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.detalleCard}>
            <Text style={styles.detalleEmoji}>{preguntaActiva.es_alarma ? '⚠️' : '✅'}</Text>
            <Text style={styles.detallePregunta}>{preguntaActiva.pregunta}</Text>
            <View style={[styles.detalleBadge, preguntaActiva.es_alarma && styles.detalleBadgeAlarma]}>
              <Text style={styles.detalleBadgeText}>
                {preguntaActiva.es_alarma ? '⚠️ Puede requerir atención médica' : '✅ Generalmente normal'}
              </Text>
            </View>
            <View style={styles.detalleRespuestaBox}>
              <Text style={styles.detalleRespuestaTitle}>📋 Respuesta</Text>
              <Text style={styles.detalleRespuesta}>{preguntaActiva.respuesta}</Text>
            </View>
            {preguntaActiva.es_alarma === 1 && (
              <View style={styles.alarmaBox}>
                <Text style={styles.alarmaTitle}>🏥 Recuerda</Text>
                <Text style={styles.alarmaText}>
                  Si tienes dudas, siempre es mejor consultar con tu médico o pediatra. Tu instinto de mamá también cuenta.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>🌸 MOMLY — contigo en cada primer paso</Text>
        </View>
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
          <Text style={styles.bannerSlogan}>¿Es Normal?</Text>
        </View>
        <View style={styles.backPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Buscador */}
        <View style={styles.buscadorContainer}>
          <Text style={styles.buscadorIcon}>🔍</Text>
          <TextInput
            style={styles.buscadorInput}
            placeholder="Buscar una situación..."
            placeholderTextColor={colors.textLight}
            value={busqueda}
            onChangeText={setBusqueda}
          />
          {busqueda.length > 0 && (
            <TouchableOpacity onPress={() => setBusqueda('')}>
              <Text style={styles.buscadorLimpiar}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs categorías */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {categorias.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.tab, categoriaActiva === cat && styles.tabActivo]}
              onPress={() => setCategoriaActiva(cat)}
            >
              <Text style={[styles.tabText, categoriaActiva === cat && styles.tabTextActivo]}>
                {cat === 'Todas' ? '🌸 Todas' : cat === 'Bebe' ? '👶 Bebé' : '🤱 Mamá'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Contador */}
        <Text style={styles.contador}>
          {preguntasFiltradas.length} situación(es) encontrada(s)
        </Text>

        {/* Lista */}
        {preguntasFiltradas.length === 0 ? (
          <View style={styles.vacioCont}>
            <Text style={styles.vacioEmoji}>🔍</Text>
            <Text style={styles.vacioTitulo}>Sin resultados</Text>
            <Text style={styles.vacioDesc}>Intenta con otras palabras</Text>
          </View>
        ) : (
          preguntasFiltradas.map(p => (
            <TouchableOpacity
              key={p.id_pregunta}
              style={[styles.preguntaCard, p.es_alarma && styles.preguntaCardAlarma]}
              onPress={() => setPreguntaActiva(p)}
            >
              <View style={styles.preguntaIcono}>
                <Text style={styles.preguntaIconoText}>{p.es_alarma ? '⚠️' : '✅'}</Text>
              </View>
              <View style={styles.preguntaInfo}>
                <Text style={styles.preguntaTexto}>{p.pregunta}</Text>
                <Text style={styles.preguntaCategoria}>
                  {p.categoria === 'Bebe' ? '👶 Bebé' : '🤱 Mamá'}
                </Text>
              </View>
              <Text style={styles.preguntaFlecha}>›</Text>
            </TouchableOpacity>
          ))
        )}

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
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  loadingText: { marginTop: 12, color: colors.textMedium, fontSize: 14 },

  banner: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { width: 80 },
  backText: { color: '#5e5d5d', fontSize: 14, fontWeight: '600' },
  bannerCenter: { alignItems: 'center', flex: 1 },
  bannerTitle: { fontSize: 28, fontWeight: 'bold', color: '#5e5d5d', letterSpacing: 4 },
  bannerSlogan: { fontSize: 12, color: '#5e5d5d', marginTop: 2 },
  backPlaceholder: { width: 80 },

  content: { padding: 24 },

  buscadorContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: 16, paddingHorizontal: 16,
    marginBottom: 16, borderWidth: 1.5, borderColor: colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  buscadorIcon: { fontSize: 18, marginRight: 8 },
  buscadorInput: {
    flex: 1, paddingVertical: 12, fontSize: 14, color: colors.textDark,
  },
  buscadorLimpiar: { fontSize: 16, color: colors.textLight, paddingLeft: 8 },

  tabsContainer: { maxHeight: 50, marginBottom: 16 },
  tabsContent: { gap: 8, paddingRight: 8 },
  tab: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.primaryPale, borderWidth: 1.5, borderColor: colors.border,
  },
  tabActivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textMedium },
  tabTextActivo: { color: colors.white },

  contador: { fontSize: 12, color: colors.textLight, marginBottom: 12 },

  preguntaCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    borderLeftWidth: 4, borderLeftColor: '#4CAF50',
  },
  preguntaCardAlarma: { borderLeftColor: '#FF9800' },
  preguntaIcono: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primaryPale, alignItems: 'center', justifyContent: 'center',
  },
  preguntaIconoText: { fontSize: 18 },
  preguntaInfo: { flex: 1 },
  preguntaTexto: { fontSize: 13, fontWeight: '600', color: colors.textDark, marginBottom: 4 },
  preguntaCategoria: { fontSize: 11, color: colors.textMedium },
  preguntaFlecha: { fontSize: 24, color: colors.primary, fontWeight: 'bold' },

  detalleCard: {
    backgroundColor: colors.white, borderRadius: 20, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
    alignItems: 'center',
  },
  detalleEmoji: { fontSize: 56, marginBottom: 16 },
  detallePregunta: { fontSize: 18, fontWeight: 'bold', color: colors.textDark, textAlign: 'center', marginBottom: 16 },
  detalleBadge: {
    backgroundColor: '#E8F5E9', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6,
    marginBottom: 20,
  },
  detalleBadgeAlarma: { backgroundColor: '#FFF3E0' },
  detalleBadgeText: { fontSize: 12, fontWeight: '600', color: colors.textDark },
  detalleRespuestaBox: {
    backgroundColor: colors.background, borderRadius: 12, padding: 16,
    width: '100%', marginBottom: 16, borderWidth: 1.5, borderColor: colors.primarySoft,
  },
  detalleRespuestaTitle: { fontSize: 14, fontWeight: 'bold', color: colors.textDark, marginBottom: 8 },
  detalleRespuesta: { fontSize: 14, color: colors.textDark, lineHeight: 24 },
  alarmaBox: {
    backgroundColor: '#FFF3E0', borderRadius: 12, padding: 16,
    width: '100%', borderLeftWidth: 4, borderLeftColor: '#FF9800',
  },
  alarmaTitle: { fontSize: 14, fontWeight: 'bold', color: colors.textDark, marginBottom: 6 },
  alarmaText: { fontSize: 13, color: colors.textMedium, lineHeight: 20 },

  vacioCont: { alignItems: 'center', paddingVertical: 40 },
  vacioEmoji: { fontSize: 50, marginBottom: 12 },
  vacioTitulo: { fontSize: 18, fontWeight: 'bold', color: colors.textDark, marginBottom: 8 },
  vacioDesc: { fontSize: 13, color: colors.textMedium },

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


