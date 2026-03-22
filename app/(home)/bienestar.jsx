import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, ActivityIndicator, Platform, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../constants/colors';
import api from '../../services/api';

const ESTADOS = [
  { emoji: '😄', label: 'Excelente', valor: 'excelente' },
  { emoji: '🙂', label: 'Bien', valor: 'bien' },
  { emoji: '😐', label: 'Regular', valor: 'regular' },
  { emoji: '😔', label: 'Mal', valor: 'mal' },
  { emoji: '😢', label: 'Muy mal', valor: 'muy_mal' },
];

const RECOMENDACIONES = {
  excelente: '¡Vas increíble! Sigue así, tu bienestar es tu mejor herramienta como mamá. 🌸',
  bien: 'Estás bien encaminada. Recuerda tomarte pequeños momentos para ti. 💕',
  regular: 'Los días difíciles también pasan. Intenta descansar y pedir ayuda si lo necesitas. 🤗',
  mal: 'Está bien no estar bien. Habla con alguien de confianza o tu médico. No estás sola. 💙',
  muy_mal: 'Tu salud emocional es muy importante. Te recomendamos contactar a tu médico o una línea de apoyo. ❤️',
};

export default function BienestarScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(null);
  const [nivelDescanso, setNivelDescanso] = useState(null);
  const [nivelEnergia, setNivelEnergia] = useState(null);
  const [nota, setNota] = useState('');
  const [loading, setLoading] = useState(false);
  const [registros, setRegistros] = useState([]);
  const [registroHoy, setRegistroHoy] = useState(null);
  const [verHistorial, setVerHistorial] = useState(false);

  useEffect(() => {
    cargarUsuario();
  }, []);

  const cargarUsuario = async () => {
    const data = await AsyncStorage.getItem('usuario');
    if (data) {
      const u = JSON.parse(data);
      setUsuario(u);
      cargarHistorial(u.id);
    }
  };

  const cargarHistorial = async (id) => {
    try {
      const response = await api.get(`/auth/bienestar/${id}`);
      const data = response.data.data;
      setRegistros(data);

      const hoy = new Date().toISOString().split('T')[0];
      const hoyRegistro = data.find(r => r.fecha_registro?.toString().startsWith(hoy));
      if (hoyRegistro) setRegistroHoy(hoyRegistro);
    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  };

  const handleGuardar = async () => {
    if (!estadoSeleccionado || !nivelDescanso || !nivelEnergia) {
      if (Platform.OS === 'web') window.alert('Por favor completa todos los campos');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/bienestar', {
        id_usuario: usuario.id,
        estado_emocional: estadoSeleccionado,
        nivel_descanso: nivelDescanso,
        nivel_energia: nivelEnergia,
        nota,
      });
      cargarHistorial(usuario.id);
    } catch (error) {
      console.error('Error guardando:', error);
    } finally {
      setLoading(false);
    }
  };

  const Escala = ({ valor, onChange, label }) => (
    <View style={styles.escalaContainer}>
      <Text style={styles.escalaLabel}>{label}</Text>
      <View style={styles.escalaNumeros}>
        {[1, 2, 3, 4, 5].map(n => (
          <TouchableOpacity
            key={n}
            style={[styles.escalaBtn, valor === n && styles.escalaBtnActivo]}
            onPress={() => onChange(n)}
          >
            <Text style={[styles.escalaBtnText, valor === n && styles.escalaBtnTextActivo]}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.escalaTextos}>
        <Text style={styles.escalaTextoMin}>Bajo</Text>
        <Text style={styles.escalaTextoMax}>Alto</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      
      {/* Banner rosa */}
      <View style={styles.banner}>
  <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(home)')}>
    <Text style={styles.backText}>← Volver</Text>
  </TouchableOpacity>
  <View style={styles.bannerCenter}>
    <Text style={styles.bannerTitle}>MOMLY</Text>
    <Text style={styles.bannerSlogan}>Bienestar Emocional</Text>
  </View>
  <View style={styles.backPlaceholder} />
</View>

      <ScrollView contentContainerStyle={styles.content}>

        {registroHoy ? (
          <View style={styles.card}>
            <Text style={styles.exitoEmoji}>✅</Text>
            <Text style={styles.cardTitle}>¡Ya registraste hoy!</Text>
            <Text style={styles.cardSubtitle}>Vuelve mañana para tu próximo registro 🌸</Text>

            <View style={styles.resumenHoy}>
              <Text style={styles.resumenTitulo}>Tu registro de hoy</Text>
              <View style={styles.resumenFila}>
                <Text style={styles.resumenEmoji}>
                  {ESTADOS.find(e => e.valor === registroHoy.estado_emocional)?.emoji || '😐'}
                </Text>
                <Text style={styles.resumenEstado}>{registroHoy.estado_emocional}</Text>
              </View>
              <Text style={styles.resumenNivel}>😴 Descanso: {registroHoy.nivel_descanso}/5</Text>
              <Text style={styles.resumenNivel}>⚡ Energía: {registroHoy.nivel_energia}/5</Text>
              {registroHoy.nota ? <Text style={styles.resumenNota}>"{registroHoy.nota}"</Text> : null}
            </View>

            <View style={styles.recomendacionContainer}>
              <Text style={styles.recomendacionTitulo}>💡 Recomendación para ti</Text>
              <Text style={styles.recomendacionTexto}>{RECOMENDACIONES[registroHoy.estado_emocional]}</Text>
            </View>

            <TouchableOpacity style={styles.btnHistorial} onPress={() => setVerHistorial(!verHistorial)}>
              <Text style={styles.btnHistorialText}>
                {verHistorial ? 'Ocultar historial' : '📅 Ver historial completo'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>¿Cómo te sientes hoy? 💆</Text>
            <Text style={styles.cardSubtitle}>Registra tu bienestar diario</Text>

            <Text style={styles.seccionLabel}>Estado emocional</Text>
            <View style={styles.estadosContainer}>
              {ESTADOS.map(e => (
                <TouchableOpacity
                  key={e.valor}
                  style={[styles.estadoBtn, estadoSeleccionado === e.valor && styles.estadoBtnActivo]}
                  onPress={() => setEstadoSeleccionado(e.valor)}
                >
                  <Text style={styles.estadoEmoji}>{e.emoji}</Text>
                  <Text style={[styles.estadoLabel, estadoSeleccionado === e.valor && styles.estadoLabelActivo]}>
                    {e.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Escala valor={nivelDescanso} onChange={setNivelDescanso} label="😴 Nivel de descanso" />
            <Escala valor={nivelEnergia} onChange={setNivelEnergia} label="⚡ Nivel de energía" />

            <Text style={styles.seccionLabel}>Nota personal (opcional)</Text>
            <TextInput
              style={styles.notaInput}
              placeholder="¿Algo que quieras recordar de hoy?"
              placeholderTextColor={colors.textLight}
              value={nota}
              onChangeText={setNota}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[styles.btnGuardar, loading && styles.btnDisabled]}
              onPress={handleGuardar}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={colors.white} />
                : <Text style={styles.btnGuardarText}>Guardar registro 🌸</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        {/* Historial */}
        {(verHistorial || !registroHoy) && registros.length > 0 && (
          <View style={styles.historialContainer}>
            <Text style={styles.historialTitulo}>📅 Historial de registros</Text>
            {registros.map(r => (
              <View key={r.id_registro} style={styles.historialCard}>
                <View style={styles.historialHeader}>
                  <Text style={styles.historialEmoji}>
                    {ESTADOS.find(e => e.valor === r.estado_emocional)?.emoji || '😐'}
                  </Text>
                  <View>
                    <Text style={styles.historialEstado}>{r.estado_emocional}</Text>
                    <Text style={styles.historialFecha}>{r.fecha_registro?.toString().split('T')[0]}</Text>
                  </View>
                </View>
                <View style={styles.historialNiveles}>
                  <Text style={styles.historialNivel}>😴 Descanso: {r.nivel_descanso}/5</Text>
                  <Text style={styles.historialNivel}>⚡ Energía: {r.nivel_energia}/5</Text>
                </View>
                {r.nota ? <Text style={styles.historialNota}>"{r.nota}"</Text> : null}
              </View>
            ))}
          </View>
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

  // Header nav
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
    fontFamily: 'Montserrat',
  },

  // Banner
  banner: {
  backgroundColor: colors.primary,
  paddingVertical: 12,
  paddingHorizontal: 16,
  flexDirection: 'row',      // ← elementos en fila
  alignItems: 'center',      // ← centrado vertical
},
backBtn: { width: 80 },      // ← flecha a la izquierda
backText: { color: '#5e5d5d', fontSize: 14, fontWeight: '600' },
bannerCenter: { flex: 1, alignItems: 'center' },  // ← título centrado
bannerTitle: { fontSize: 28, fontWeight: 'bold', color: '#5e5d5d', letterSpacing: 4 },
bannerSlogan: { fontSize: 12, color: '#5e5d5d', marginTop: 2 },
backPlaceholder: { width: 80 },  // ← equilibra el espacio derecho

  content: { padding: 24 },

  card: {
    backgroundColor: colors.white, borderRadius: 20, padding: 24, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
  },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: colors.textDark, textAlign: 'center', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: colors.textMedium, textAlign: 'center', marginBottom: 20 },
  exitoEmoji: { fontSize: 40, textAlign: 'center', marginBottom: 8 },

  resumenHoy: {
    backgroundColor: colors.primaryPale, borderRadius: 12, padding: 16, marginBottom: 16,
  },
  resumenTitulo: { fontSize: 13, fontWeight: 'bold', color: colors.textDark, marginBottom: 10 },
  resumenFila: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  resumenEmoji: { fontSize: 24 },
  resumenEstado: { fontSize: 15, fontWeight: 'bold', color: colors.textDark, textTransform: 'capitalize' },
  resumenNivel: { fontSize: 13, color: colors.textMedium, marginBottom: 4 },
  resumenNota: { fontSize: 12, color: colors.textMedium, fontStyle: 'italic', marginTop: 6 },

  recomendacionContainer: {
    backgroundColor: colors.primaryPale, borderRadius: 12, padding: 16,
    borderLeftWidth: 3, borderLeftColor: colors.primary, marginBottom: 16,
  },
  recomendacionTitulo: { fontSize: 13, fontWeight: 'bold', color: colors.textDark, marginBottom: 6 },
  recomendacionTexto: { fontSize: 13, color: colors.textMedium, lineHeight: 20 },

  btnHistorial: {
    borderWidth: 2, borderColor: colors.primary, borderRadius: 25,
    paddingVertical: 10, alignItems: 'center',
  },
  btnHistorialText: { color: colors.primary, fontSize: 14, fontWeight: 'bold' },

  seccionLabel: { fontSize: 14, fontWeight: '600', color: colors.textDark, marginBottom: 10 },
  estadosContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  estadoBtn: {
    alignItems: 'center', padding: 10, borderRadius: 12,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.primaryPale,
    flex: 1, marginHorizontal: 3,
  },
  estadoBtnActivo: { borderColor: colors.primary, backgroundColor: colors.primary },
  estadoEmoji: { fontSize: 24, marginBottom: 4 },
  estadoLabel: { fontSize: 10, color: colors.textMedium, textAlign: 'center' },
  estadoLabelActivo: { color: colors.white, fontWeight: 'bold' },

  escalaContainer: { marginBottom: 20 },
  escalaLabel: { fontSize: 14, fontWeight: '600', color: colors.textDark, marginBottom: 8 },
  escalaNumeros: { flexDirection: 'row', gap: 8 },
  escalaBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', backgroundColor: colors.primaryPale,
  },
  escalaBtnActivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  escalaBtnText: { fontSize: 16, fontWeight: 'bold', color: colors.textMedium },
  escalaBtnTextActivo: { color: colors.white },
  escalaTextos: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  escalaTextoMin: { fontSize: 11, color: colors.textLight },
  escalaTextoMax: { fontSize: 11, color: colors.textLight },

  notaInput: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 14,
    color: colors.textDark, backgroundColor: colors.primaryPale,
    marginBottom: 20, minHeight: 80, textAlignVertical: 'top',
  },
  btnGuardar: {
    backgroundColor: colors.primary, borderRadius: 25, paddingVertical: 14, alignItems: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  btnDisabled: { opacity: 0.7 },
  btnGuardarText: { color: colors.textDark, fontSize: 16, fontWeight: 'bold' },

  historialContainer: { marginBottom: 24 },
  historialTitulo: { fontSize: 16, fontWeight: 'bold', color: colors.textDark, marginBottom: 12 },
  historialCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    borderLeftWidth: 4, borderLeftColor: colors.primary,
  },
  historialHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 12 },
  historialEmoji: { fontSize: 28 },
  historialEstado: { fontSize: 14, fontWeight: 'bold', color: colors.textDark, textTransform: 'capitalize' },
  historialFecha: { fontSize: 12, color: colors.textLight },
  historialNiveles: { flexDirection: 'row', gap: 16, marginBottom: 6 },
  historialNivel: { fontSize: 12, color: colors.textMedium },
  historialNota: { fontSize: 12, color: colors.textMedium, fontStyle: 'italic' },

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