import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../constants/colors';
import { api } from '../../services/api';

const GRUPOS_EDAD = [
  { label: 'Recién nacido', min: 0, max: 0 },
  { label: '2 meses', min: 2, max: 2 },
  { label: '4 meses', min: 4, max: 4 },
  { label: '6-7 meses', min: 6, max: 7 },
  { label: '12 meses', min: 12, max: 12 },
  { label: '18-24 meses', min: 18, max: 24 },
];

export default function VacunasScreen() {
  const router = useRouter();
  const [bebe, setBebe] = useState(null);
  const [vacunas, setVacunas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grupoActivo, setGrupoActivo] = useState(0);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const bebeData = await AsyncStorage.getItem('bebe');
      if (bebeData) {
        const b = JSON.parse(bebeData);
        setBebe(b);
        cargarVacunas(b.id);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarVacunas = async (id_bebe) => {
    try {
      const response = await api.get(`/auth/vacunas/${id_bebe}`);
      setVacunas(response.data.data);
    } catch (error) {
      console.error('Error cargando vacunas:', error);
    }
  };

  const handleMarcar = async (vacuna) => {
    if (vacuna.aplicada) {
      if (Platform.OS === 'web') {
        const confirmar = window.confirm('¿Deseas desmarcar esta vacuna?');
        if (!confirmar) return;
      }
      try {
        await api.delete(`/auth/vacunas/${vacuna.id_vacuna_bebe}`);
        cargarVacunas(bebe.id);
      } catch (error) {
        console.error('Error desmarcando vacuna:', error);
      }
    } else {
      try {
        const hoy = new Date().toISOString().slice(0, 10);
        await api.post('/auth/vacunas', {
          id_bebe: bebe.id,
          id_vacuna: vacuna.id_vacuna,
          fecha_aplicacion: hoy,
        });
        cargarVacunas(bebe.id);
      } catch (error) {
        console.error('Error marcando vacuna:', error);
      }
    }
  };

  const vacunasFiltradas = vacunas.filter(v => {
    const grupo = GRUPOS_EDAD[grupoActivo];
    return v.edad_aplicacion_meses >= grupo.min && v.edad_aplicacion_meses <= grupo.max;
  });

  const totalAplicadas = vacunas.filter(v => v.aplicada).length;
  const porcentaje = vacunas.length > 0 ? Math.round((totalAplicadas / vacunas.length) * 100) : 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando vacunas...</Text>
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
          <Text style={styles.bannerSlogan}>Calendario de Vacunación</Text>
        </View>
        <View style={styles.backPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Resumen */}
        <View style={styles.resumenCard}>
          <View style={styles.resumenInfo}>
            <Text style={styles.resumenTitulo}>💉 Progreso de vacunación</Text>
            <Text style={styles.resumenSubtitulo}>
              {totalAplicadas} de {vacunas.length} vacunas aplicadas
            </Text>
          </View>
          <View style={styles.resumenCirculo}>
            <Text style={styles.resumenPorcentaje}>{porcentaje}%</Text>
          </View>
        </View>

        {/* Barra de progreso */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${porcentaje}%` }]} />
        </View>

        {/* Tabs de edad */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {GRUPOS_EDAD.map((grupo, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.tab, grupoActivo === index && styles.tabActivo]}
              onPress={() => setGrupoActivo(index)}
            >
              <Text style={[styles.tabText, grupoActivo === index && styles.tabTextActivo]}>
                {grupo.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lista de vacunas */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>
            {GRUPOS_EDAD[grupoActivo].label} — {vacunasFiltradas.length} vacuna(s)
          </Text>

          {vacunasFiltradas.length === 0 ? (
            <View style={styles.vacioCont}>
              <Text style={styles.vacioText}>No hay vacunas para este período</Text>
            </View>
          ) : (
            vacunasFiltradas.map(vacuna => (
              <View key={vacuna.id_vacuna} style={[styles.vacunaCard, vacuna.aplicada && styles.vacunaCardAplicada]}>
                <View style={styles.vacunaInfo}>
                  <Text style={[styles.vacunaNombre, vacuna.aplicada && styles.vacunaNombreAplicada]}>
                    {vacuna.nombre}
                  </Text>
                  <Text style={styles.vacunaEdad}>
                    📅 {vacuna.edad_aplicacion_meses === 0 ? 'Al nacer' : `${vacuna.edad_aplicacion_meses} meses`}
                  </Text>
                  {vacuna.aplicada && vacuna.fecha_aplicacion && (
                    <Text style={styles.vacunaFecha}>
                      ✅ Aplicada: {new Date(vacuna.fecha_aplicacion).toLocaleDateString('es-MX', {
                        day: '2-digit', month: 'long', year: 'numeric'
                      })}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.btnMarcar, vacuna.aplicada && styles.btnMarcarAplicada]}
                  onPress={() => handleMarcar(vacuna)}
                >
                  <Text style={styles.btnMarcarText}>
                    {vacuna.aplicada ? '✓' : '+'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Nota informativa */}
        <View style={styles.notaBox}>
          <Text style={styles.notaTitle}>💡 Importante</Text>
          <Text style={styles.notaText}>
            Consulta siempre con tu pediatra el calendario oficial de vacunación. Las fechas pueden variar según el país y el estado de salud de tu bebé.
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

  resumenCard: {
    backgroundColor: colors.white, borderRadius: 20, padding: 20, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
  },
  resumenInfo: { flex: 1 },
  resumenTitulo: { fontSize: 16, fontWeight: 'bold', color: colors.textDark, marginBottom: 4 },
  resumenSubtitulo: { fontSize: 13, color: colors.textMedium },
  resumenCirculo: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  resumenPorcentaje: { fontSize: 16, fontWeight: 'bold', color: colors.white },

  progressBar: {
    height: 8, backgroundColor: colors.primaryPale, borderRadius: 4, marginBottom: 20,
  },
  progressFill: {
    height: 8, backgroundColor: '#D3A5E3', borderRadius: 4,
  },

  tabsContainer: { maxHeight: 50, marginBottom: 20 },
  tabsContent: { gap: 8, paddingRight: 8 },
  tab: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.primaryPale, borderWidth: 1.5, borderColor: colors.border,
  },
  tabActivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 12, fontWeight: '600', color: colors.textMedium },
  tabTextActivo: { color: colors.white },

  seccion: { marginBottom: 20 },
  seccionTitulo: { fontSize: 14, fontWeight: 'bold', color: colors.textDark, marginBottom: 12 },

  vacunaCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    borderLeftWidth: 4, borderLeftColor: colors.border,
  },
  vacunaCardAplicada: { borderLeftColor: '#4CAF50' },
  vacunaInfo: { flex: 1 },
  vacunaNombre: { fontSize: 14, fontWeight: 'bold', color: colors.textDark, marginBottom: 4 },
  vacunaNombreAplicada: { color: '#4CAF50' },
  vacunaEdad: { fontSize: 12, color: colors.textMedium },
  vacunaFecha: { fontSize: 11, color: '#4CAF50', marginTop: 4 },

  btnMarcar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primaryPale, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.border,
  },
  btnMarcarAplicada: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  btnMarcarText: { fontSize: 20, fontWeight: 'bold', color: colors.white },

  vacioCont: { alignItems: 'center', padding: 20 },
  vacioText: { fontSize: 13, color: colors.textMedium },

  notaBox: {
    backgroundColor: colors.primaryPale, borderRadius: 12, padding: 16,
    borderLeftWidth: 4, borderLeftColor: colors.primary,
  },
  notaTitle: { fontSize: 14, fontWeight: 'bold', color: colors.textDark, marginBottom: 6 },
  notaText: { fontSize: 13, color: colors.textMedium, lineHeight: 20 },

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