import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { colors } from '../../constants/colors';

const PLANES = [
  {
    meses: 1,
    titulo: '1 Mes',
    precio: '$99',
    descripcion: 'Perfecto para probar Premium',
    popular: false,
  },
  {
    meses: 3,
    titulo: '3 Meses',
    precio: '$249',
    descripcion: 'El mas popular entre las mamas',
    popular: true,
  },
  {
    meses: 12,
    titulo: '1 Año',
    precio: '$799',
    descripcion: 'El mejor precio por mes',
    popular: false,
  },
];

const BENEFICIOS = [
  { emoji: '👩‍⚕️', texto: 'Acceso prioritario a especialistas' },
  { emoji: '📚', texto: 'Contenido exclusivo premium' },
  { emoji: '💬', texto: 'Comunidad privada de mamas' },
  { emoji: '🔔', texto: 'Recordatorios personalizados' },
  { emoji: '📊', texto: 'Seguimiento avanzado del desarrollo' },
  { emoji: '🌸', texto: 'Soporte prioritario 24/7' },
];

export default function PremiumScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [suscripcion, setSuscripcion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingActivar, setLoadingActivar] = useState(false);
  const [planSeleccionado, setPlanSeleccionado] = useState(1);
  const [activado, setActivado] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const usuarioData = await AsyncStorage.getItem('usuario');
      if (usuarioData) {
        const u = JSON.parse(usuarioData);
        setUsuario(u);
        const response = await axios.get(`http://localhost:3000/api/auth/suscripcion/${u.id}`);
        if (response.data.ok) {
          setSuscripcion(response.data.data);
        }
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivar = async () => {
    if (Platform.OS === 'web') {
      const confirmar = window.confirm(`¿Deseas activar el plan de ${planSeleccionado} mes(es)?`);
      if (!confirmar) return;
    }
    setLoadingActivar(true);
    try {
      const response = await axios.post('http://localhost:3000/api/auth/suscripcion', {
        id_usuario: usuario.id,
        meses: planSeleccionado,
      });
      if (response.data.ok) {
        const usuarioActualizado = { ...usuario, tipo_usuario: 'premium' };
        await AsyncStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
        setUsuario(usuarioActualizado);
        setActivado(true);
        cargarDatos();
      }
    } catch (error) {
      console.error('Error activando premium:', error);
    } finally {
      setLoadingActivar(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  const esPremium = suscripcion?.tipo_usuario === 'premium' || activado;

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(home)')}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <View style={styles.bannerCenter}>
          <Text style={styles.bannerTitle}>MOMLY</Text>
          <Text style={styles.bannerSlogan}>Plan Premium</Text>
        </View>
        <View style={styles.backPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {esPremium ? (
          // Vista de usuario premium
          <View style={styles.premiumActivoCard}>
            <Text style={styles.premiumActivoEmoji}>⭐</Text>
            <Text style={styles.premiumActivoTitulo}>Eres usuaria Premium</Text>
            <Text style={styles.premiumActivoSubtitulo}>Disfruta de todos los beneficios exclusivos</Text>
            {suscripcion?.suscripcion?.fecha_fin && (
              <View style={styles.premiumFechaBox}>
                <Text style={styles.premiumFechaLabel}>Tu plan vence el</Text>
                <Text style={styles.premiumFecha}>
                  {new Date(suscripcion.suscripcion.fecha_fin).toLocaleDateString('es-MX', {
                    day: '2-digit', month: 'long', year: 'numeric'
                  })}
                </Text>
              </View>
            )}
            <View style={styles.beneficiosContainer}>
              {BENEFICIOS.map((b, i) => (
                <View key={i} style={styles.beneficioFila}>
                  <Text style={styles.beneficioEmoji}>{b.emoji}</Text>
                  <Text style={styles.beneficioTexto}>{b.texto}</Text>
                  <Text style={styles.beneficioCheck}>✓</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          // Vista de usuario free
          <>
            <View style={styles.heroCard}>
              <Text style={styles.heroEmoji}>⭐</Text>
              <Text style={styles.heroTitulo}>Hazte Premium</Text>
              <Text style={styles.heroDesc}>
                Accede a contenido exclusivo, especialistas y mucho mas para acompanarte en tu maternidad
              </Text>
            </View>

            {/* Beneficios */}
            <View style={styles.seccionCard}>
              <Text style={styles.seccionTitulo}>🌸 Que incluye Premium</Text>
              {BENEFICIOS.map((b, i) => (
                <View key={i} style={styles.beneficioFila}>
                  <Text style={styles.beneficioEmoji}>{b.emoji}</Text>
                  <Text style={styles.beneficioTexto}>{b.texto}</Text>
                </View>
              ))}
            </View>

            {/* Planes */}
            <Text style={styles.planesTitle}>Elige tu plan</Text>
            {PLANES.map(plan => (
              <TouchableOpacity
                key={plan.meses}
                style={[styles.planCard, planSeleccionado === plan.meses && styles.planCardActivo]}
                onPress={() => setPlanSeleccionado(plan.meses)}
              >
                {plan.popular && (
                  <View style={styles.planPopularBadge}>
                    <Text style={styles.planPopularText}>MAS POPULAR</Text>
                  </View>
                )}
                <View style={styles.planInfo}>
                  <Text style={[styles.planTitulo, planSeleccionado === plan.meses && styles.planTituloActivo]}>
                    {plan.titulo}
                  </Text>
                  <Text style={styles.planDescripcion}>{plan.descripcion}</Text>
                </View>
                <View style={styles.planPrecioBox}>
                  <Text style={[styles.planPrecio, planSeleccionado === plan.meses && styles.planPrecioActivo]}>
                    {plan.precio}
                  </Text>
                  <View style={[styles.planRadio, planSeleccionado === plan.meses && styles.planRadioActivo]}>
                    {planSeleccionado === plan.meses && <View style={styles.planRadioInner} />}
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {/* Botón activar */}
            <TouchableOpacity
              style={[styles.btnActivar, loadingActivar && styles.btnDisabled]}
              onPress={handleActivar}
              disabled={loadingActivar}
            >
              {loadingActivar
                ? <ActivityIndicator color={colors.white} />
                : <Text style={styles.btnActivarText}>⭐ Activar Premium</Text>
              }
            </TouchableOpacity>

            <Text style={styles.notaSimulacion}>
              * Esta es una simulacion de pago para fines demostrativos
            </Text>
          </>
        )}

      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>🌸 MOMLY — contigo en cada primer paso</Text>
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

  heroCard: {
    backgroundColor: colors.primary, borderRadius: 20, padding: 24,
    alignItems: 'center', marginBottom: 20,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  heroEmoji: { fontSize: 56, marginBottom: 12 },
  heroTitulo: { fontSize: 24, fontWeight: 'bold', color: colors.white, marginBottom: 8 },
  heroDesc: { fontSize: 13, color: colors.white, textAlign: 'center', lineHeight: 20, opacity: 0.9 },

  seccionCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 20, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  seccionTitulo: { fontSize: 15, fontWeight: 'bold', color: colors.textDark, marginBottom: 16 },

  beneficioFila: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  beneficioEmoji: { fontSize: 20, width: 28 },
  beneficioTexto: { flex: 1, fontSize: 13, color: colors.textDark },
  beneficioCheck: { fontSize: 16, color: '#4CAF50', fontWeight: 'bold' },

  planesTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textDark, marginBottom: 12 },

  planCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 2, borderColor: colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  planCardActivo: { borderColor: colors.primary, backgroundColor: colors.primaryPale },
  planPopularBadge: {
    position: 'absolute', top: -10, right: 16,
    backgroundColor: colors.primary, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  planPopularText: { fontSize: 10, fontWeight: 'bold', color: colors.white },
  planInfo: { flex: 1 },
  planTitulo: { fontSize: 16, fontWeight: 'bold', color: colors.textDark, marginBottom: 2 },
  planTituloActivo: { color: colors.primary },
  planDescripcion: { fontSize: 12, color: colors.textMedium },
  planPrecioBox: { alignItems: 'center', gap: 8 },
  planPrecio: { fontSize: 18, fontWeight: 'bold', color: colors.textDark },
  planPrecioActivo: { color: colors.primary },
  planRadio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  planRadioActivo: { borderColor: colors.primary },
  planRadioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },

  btnActivar: {
    backgroundColor: colors.primary, borderRadius: 25, paddingVertical: 16,
    alignItems: 'center', marginTop: 20, marginBottom: 12,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  btnDisabled: { opacity: 0.7 },
  btnActivarText: { color: colors.white, fontSize: 16, fontWeight: 'bold' },
  notaSimulacion: { fontSize: 11, color: colors.textLight, textAlign: 'center', marginBottom: 8 },

  premiumActivoCard: {
    backgroundColor: colors.white, borderRadius: 20, padding: 24, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
  },
  premiumActivoEmoji: { fontSize: 64, marginBottom: 16 },
  premiumActivoTitulo: { fontSize: 24, fontWeight: 'bold', color: colors.textDark, marginBottom: 8 },
  premiumActivoSubtitulo: { fontSize: 14, color: colors.textMedium, marginBottom: 20, textAlign: 'center' },
  premiumFechaBox: {
    backgroundColor: colors.primaryPale, borderRadius: 12, padding: 16,
    alignItems: 'center', marginBottom: 20, width: '100%',
  },
  premiumFechaLabel: { fontSize: 12, color: colors.textMedium, marginBottom: 4 },
  premiumFecha: { fontSize: 16, fontWeight: 'bold', color: colors.primary },
  beneficiosContainer: { width: '100%' },

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


