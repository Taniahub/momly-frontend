import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { colors } from '../../constants/colors';
import { authService } from '../../services/api'; // ajusta la ruta si cambia


export default function GuiasScreen() {
  const router = useRouter();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [guiaSeleccionada, setGuiaSeleccionada] = useState(null);

  useEffect(() => {
    cargarGuias();
  }, []);

  
const cargarGuias = async () => {
  try {
    const response = await authService.getGuias();
    const data = response?.data?.data || [];

    setCategorias(data);
    setCategoriaActiva(data.length > 0 ? data[0].id_categoria : null);
  } catch (error) {
    console.error("Error cargando guías:", error?.response?.data || error.message);
  } finally {
    setLoading(false);
  }
};

  const categoriaActivaData = categorias.find(c => c.id_categoria === categoriaActiva);

  
  if (guiaSeleccionada) {
    return (
      <View style={styles.container}>
            {/* Header */}
                    <View style={styles.header}>
                      <Image 
                        source={require('../../assets/images/logo.png')} // Asegúrate de poner el nombre real de tu archivo
                        style={styles.logoImagen}
                        resizeMode="contain"
                      />
                      <Text style={styles.slogan}>contigo en cada primer paso.</Text>
                    </View>
              
                    {/* Banner rosa */}
                    <View style={styles.banner}>
                      <Text style={styles.bannerTitle}>MOMLY</Text>
                      <Text style={styles.bannerSlogan}>Contigo en cada primer paso</Text>
                    </View>

        <ScrollView contentContainerStyle={styles.detalleContent}>
          <View style={styles.detalleCard}>
            <Text style={styles.detalleTitulo}>{guiaSeleccionada.titulo}</Text>
            <View style={styles.detalleDivider} />
            <Text style={styles.detalleTexto}>{guiaSeleccionada.descripcion}</Text>
            <View style={styles.detalleExtra}>
              <Text style={styles.detalleExtraTexto}>
                💡 Esta guía fue creada por el equipo de MOMLY para acompañarte en tu recuperación posparto de manera segura y efectiva.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header superior */}
<View style={styles.header}>
  <Image 
    source={require('../../assets/images/logo.png')}
    style={styles.logoImagen}
    resizeMode="contain"
  />
  <Text style={styles.slogan}>contigo en cada primer paso.</Text>
</View>

{/* Banner rosa con flecha */}
<View style={styles.banner}>
  <TouchableOpacity 
    style={styles.backButton}
    onPress={() => router.replace('/(home)')}
  >
    <Text style={styles.backIcon}>←</Text>
  </TouchableOpacity>

  <View style={styles.bannerCenter}>
    <Text style={styles.bannerTitle}>MOMLY</Text>
    <Text style={styles.bannerSlogan}>Contigo en cada primer paso</Text>
  </View>

  {/* Espacio vacío para centrar */}
  <View style={{ width: 30 }} />
</View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando guías...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.titulo}>Tu guía de recuperación 💕</Text>
          <Text style={styles.subtitulo}>Selecciona una categoría para comenzar</Text>

          {/* Tabs de categorías */}
          <View style={styles.tabsContainer}>
            {categorias.map(cat => (
              <TouchableOpacity
                key={cat.id_categoria}
                style={[styles.tab, categoriaActiva === cat.id_categoria && styles.tabActivo]}
                onPress={() => setCategoriaActiva(cat.id_categoria)}
              >
                <Text style={[styles.tabText, categoriaActiva === cat.id_categoria && styles.tabTextActivo]}>
                  {cat.nombre === 'Recuperacion Fisica' ? '🧘 Física' : '💆 Emocional'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Lista de guías */}
          
{(!categoriaActivaData || !categoriaActivaData.guias || categoriaActivaData.guias.length === 0) ? (
  <Text style={{ textAlign: 'center', color: colors.textMedium, marginTop: 20 }}>
    No hay guías en esta categoría aún.
  </Text>
) : (
  categoriaActivaData.guias.map(guia => (
    <TouchableOpacity
      key={guia.id_contenido}
      style={styles.guiaCard}
      onPress={() => setGuiaSeleccionada(guia)}
    >
      <View style={styles.guiaCardContent}>
        <Text style={styles.guiaTitulo}>{guia.titulo}</Text>
        <Text style={styles.guiaDesc} numberOfLines={2}>{guia.descripcion}</Text>
      </View>
      <Text style={styles.guiaArrow}>→</Text>
    </TouchableOpacity>
  ))
)}
        </ScrollView>
      )}

     {/* Footer ultra compacto en dos columnas */}
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
header: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingTop: 5,
  paddingBottom: 10,
  backgroundColor: '#FFF1E6',
},

logoImagen: {
  width: 100,
  height: 40,
},

slogan: {
  fontSize: 11,
  color: colors.textMedium,
},

banner: {
  backgroundColor: colors.primary,
  paddingVertical: 14,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 16,
},

backButton: {
  width: 30,
},

backIcon: {
  color: colors.white,
  fontSize: 22,
  fontWeight: 'bold',
},

bannerCenter: {
  alignItems: 'center',
  flex: 1,
},

bannerTitle: {
  fontSize: 28,
  fontWeight: 'bold',
  color: '#5e5d5d',
  letterSpacing: 4,
},

bannerSlogan: {
  fontSize: 12,
  color: '#5e5d5d',
  marginTop: 2,
},
  backBtn: { width: 80 },
  backText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  bannerCenter: { alignItems: 'center', flex: 1 },
  backPlaceholder: { width: 80 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: colors.textMedium, fontSize: 14 },

  content: { padding: 24 },
  titulo: { fontSize: 20, fontWeight: 'bold', color: colors.textDark, textAlign: 'center', marginBottom: 6 },
  subtitulo: { fontSize: 13, color: colors.textMedium, textAlign: 'center', marginBottom: 20 },

  tabsContainer: { flexDirection: 'row', gap: 12, marginBottom: 20, justifyContent: 'center' },
  tab: {
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.white,
  },
  tabActivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 13, color: colors.textMedium, fontWeight: '600' },
  tabTextActivo: { color: colors.white },

  guiaCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 16,
    marginBottom: 12, flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    borderLeftWidth: 4, borderLeftColor: colors.primary,
  },
  guiaCardContent: { flex: 1 },
  guiaTitulo: { fontSize: 15, fontWeight: 'bold', color: colors.textDark, marginBottom: 4 },
  guiaDesc: { fontSize: 12, color: colors.textMedium, lineHeight: 18 },
  guiaArrow: { fontSize: 20, color: colors.primary, marginLeft: 8 },

  detalleContent: { padding: 24 },
  detalleCard: {
    backgroundColor: colors.white, borderRadius: 20, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
  },
  detalleTitulo: { fontSize: 22, fontWeight: 'bold', color: colors.textDark, marginBottom: 16, textAlign: 'center' },
  detalleDivider: { height: 2, backgroundColor: colors.primaryPale, marginBottom: 16 },
  detalleTexto: { fontSize: 15, color: colors.textMedium, lineHeight: 24, marginBottom: 20 },
  detalleExtra: {
    backgroundColor: colors.primaryPale, borderRadius: 12, padding: 16,
    borderLeftWidth: 3, borderLeftColor: colors.primary,
  },
  detalleExtraTexto: { fontSize: 13, color: colors.textDark, lineHeight: 20, fontStyle: 'italic' },

   // Footer estilo "App Pro"
  footerColumnas: {
    backgroundColor: '#FADBD8', // Rosa suave MOMLY
    flexDirection: 'row',       // Esto crea las dos columnas
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,         // Espacio mínimo vertical
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  columnaIzquierda: {
    flex: 1,
  },
  columnaDerecha: {
    flex: 1,
    alignItems: 'flex-end',    // Alinea el texto legal a la derecha
  },
  footerTextMin: {
    color: '#5D6D7E',          // Gris marca
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