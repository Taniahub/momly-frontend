import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { colors } from '../../constants/colors';
import { api } from '../../services/api';

const ICONOS = {
  'Lactancia': '🤱',
  'Sueno del bebe': '😴',
  'Alimentacion': '🥣',
  'Cuidados basicos': '👶',
};

export default function BibliotecaScreen() {
  const router = useRouter();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [articuloActivo, setArticuloActivo] = useState(null);

  useEffect(() => {
    cargarBiblioteca();
  }, []);

  const cargarBiblioteca = async () => {
    try {
      const response = await api.get('/auth/biblioteca');
      setCategorias(response.data.data);
      if (response.data.data.length > 0) {
        setCategoriaActiva(response.data.data[0].id_categoria);
      }
    } catch (error) {
      console.error('Error cargando biblioteca:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoriaSeleccionada = categorias.find(c => c.id_categoria === categoriaActiva);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando biblioteca...</Text>
      </View>
    );
  }

  // Vista de detalle de artículo
  if (articuloActivo) {
    return (
      <View style={styles.container}>
        <View style={styles.banner}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setArticuloActivo(null)}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <View style={styles.bannerCenter}>
            <Text style={styles.bannerTitle}>MOMLY</Text>
            <Text style={styles.bannerSlogan}>Biblioteca del bebé</Text>
          </View>
          <View style={styles.backPlaceholder} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.detalleCard}>
            <Text style={styles.detalleEmoji}>
              {ICONOS[categoriaSeleccionada?.nombre] || '📖'}
            </Text>
            <Text style={styles.detalleTitulo}>{articuloActivo.titulo}</Text>
            <View style={styles.detalleDivider} />
            <Text style={styles.detalleCategoria}>
              {categoriaSeleccionada?.nombre}
            </Text>
            <Text style={styles.detalleDescripcion}>{articuloActivo.contenido || articuloActivo.descripcion}</Text>

            <View style={styles.detalleTipsBox}>
              <Text style={styles.detalleTipsTitle}>💡 Recuerda</Text>
              <Text style={styles.detalleTipsText}>
                Cada bebé es único y puede responder diferente. Consulta siempre con tu pediatra ante cualquier duda.
              </Text>
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

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(home)')}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <View style={styles.bannerCenter}>
          <Text style={styles.bannerTitle}>MOMLY</Text>
          <Text style={styles.bannerSlogan}>Biblioteca del bebé</Text>
        </View>
        <View style={styles.backPlaceholder} />
      </View>

      {/* Tabs de categorías */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {categorias.map(cat => (
          <TouchableOpacity
            key={cat.id_categoria}
            style={[styles.tab, categoriaActiva === cat.id_categoria && styles.tabActivo]}
            onPress={() => setCategoriaActiva(cat.id_categoria)}
          >
            <Text style={styles.tabEmoji}>{ICONOS[cat.nombre] || '📖'}</Text>
            <Text style={[styles.tabText, categoriaActiva === cat.id_categoria && styles.tabTextActivo]}>
              {cat.nombre}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content}>

        {categoriaSeleccionada && (
          <>
            <View style={styles.seccionHeader}>
              <Text style={styles.seccionEmoji}>{ICONOS[categoriaSeleccionada.nombre] || '📖'}</Text>
              <View>
                <Text style={styles.seccionTitulo}>{categoriaSeleccionada.nombre}</Text>
                <Text style={styles.seccionSubtitulo}>
                  {categoriaSeleccionada.articulos?.length} artículos disponibles
                </Text>
              </View>
            </View>

            {categoriaSeleccionada.articulos?.map((articulo, index) => (
              <TouchableOpacity
                key={articulo.id_contenido}
                style={styles.articuloCard}
                onPress={() => setArticuloActivo(articulo)}
              >
                <View style={styles.articuloNumero}>
                  <Text style={styles.articuloNumeroText}>{index + 1}</Text>
                </View>
                <View style={styles.articuloInfo}>
                  <Text style={styles.articuloTitulo}>{articulo.titulo}</Text>
                  <Text style={styles.articuloDesc} numberOfLines={2}>{articulo.descripcion}</Text>
                </View>
                <Text style={styles.articuloFlecha}>›</Text>
              </TouchableOpacity>
            ))}
          </>
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
    paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  backBtn: { width: 80 },
  backText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  bannerCenter: { alignItems: 'center', flex: 1 },
  bannerTitle: { fontSize: 28, fontWeight: 'bold', color: colors.white, letterSpacing: 4 },
  bannerSlogan: { fontSize: 12, color: colors.white, marginTop: 2 },
  backPlaceholder: { width: 80 },

  tabsContainer: { backgroundColor: colors.white, maxHeight: 80 },
  tabsContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.primaryPale, borderWidth: 1.5, borderColor: colors.border,
  },
  tabActivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabEmoji: { fontSize: 16 },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textMedium },
  tabTextActivo: { color: colors.white },

  content: { padding: 24 },

  seccionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: 20, backgroundColor: colors.white,
    borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  seccionEmoji: { fontSize: 36 },
  seccionTitulo: { fontSize: 18, fontWeight: 'bold', color: colors.textDark },
  seccionSubtitulo: { fontSize: 12, color: colors.textMedium, marginTop: 2 },

  articuloCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    borderLeftWidth: 4, borderLeftColor: colors.primary,
  },
  articuloNumero: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.primaryPale, alignItems: 'center', justifyContent: 'center',
  },
  articuloNumeroText: { fontSize: 14, fontWeight: 'bold', color: colors.primary },
  articuloInfo: { flex: 1 },
  articuloTitulo: { fontSize: 14, fontWeight: 'bold', color: colors.textDark, marginBottom: 4 },
  articuloDesc: { fontSize: 12, color: colors.textMedium, lineHeight: 18 },
  articuloFlecha: { fontSize: 24, color: colors.primary, fontWeight: 'bold' },

  detalleCard: {
    backgroundColor: colors.white, borderRadius: 20, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
    alignItems: 'center',
  },
  detalleEmoji: { fontSize: 56, marginBottom: 16 },
  detalleTitulo: { fontSize: 22, fontWeight: 'bold', color: colors.textDark, textAlign: 'center', marginBottom: 12 },
  detalleDivider: { width: 60, height: 3, backgroundColor: colors.primary, borderRadius: 2, marginBottom: 12 },
  detalleCategoria: { fontSize: 13, color: colors.primary, fontWeight: '600', marginBottom: 16 },
  detalleDescripcion: { fontSize: 15, color: colors.textMedium, lineHeight: 24, textAlign: 'center', marginBottom: 24 },
  detalleTipsBox: {
    backgroundColor: colors.primaryPale, borderRadius: 12, padding: 16,
    width: '100%', borderLeftWidth: 4, borderLeftColor: colors.primary,
  },
  detalleTipsTitle: { fontSize: 14, fontWeight: 'bold', color: colors.textDark, marginBottom: 6 },
  detalleTipsText: { fontSize: 13, color: colors.textMedium, lineHeight: 20 },

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