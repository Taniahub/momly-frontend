import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../constants/colors';
import { api } from '../../services/api';

const ESTADOS = [
  { key: 'muy_bien', emoji: '🤩', label: 'Muy bien' },
  { key: 'bien', emoji: '😊', label: 'Bien' },
  { key: 'mal', emoji: '😟', label: 'Mal' },
  { key: 'muy_mal', emoji: '😞', label: 'Muy mal' },
  { key: 'feliz', emoji: '🥰', label: 'Feliz' },
  { key: 'tranquila', emoji: '😌', label: 'Tranquila' },
  { key: 'cansada', emoji: '😴', label: 'Cansada' },
  { key: 'ansiosa', emoji: '😰', label: 'Ansiosa' },
  { key: 'triste', emoji: '😢', label: 'Triste' },
];

export default function AcompanamientoScreen() {
  const router = useRouter();
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(null);
  const [acompanamiento, setAcompanamiento] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ultimoEstado, setUltimoEstado] = useState(null);

  useEffect(() => {
    cargarUltimoEstado();
  }, []);

  const cargarUltimoEstado = async () => {
    try {
      const usuarioData = await AsyncStorage.getItem('usuario');
      if (usuarioData) {
        const usuario = JSON.parse(usuarioData);
        const response = await api.get(`/auth/bienestar/${usuario.id}`);
        if (response.data.data.length > 0) {
          setUltimoEstado(response.data.data[0].estado_emocional);
        }
      }
    } catch (error) {
      console.error('Error cargando último estado:', error);
    }
  };

  const handleSeleccionarEstado = async (estado) => {
    setEstadoSeleccionado(estado);
    setLoading(true);
    try {
      const response = await api.get(`/auth/acompanamiento/${estado}`);
      setAcompanamiento(response.data.data);
    } catch (error) {
      console.error('Error cargando acompañamiento:', error);
    } finally {
      setLoading(false);
    }
  };

  const estadoInfo = ESTADOS.find(e => e.key === estadoSeleccionado);

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(home)')}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <View style={styles.bannerCenter}>
          <Text style={styles.bannerTitle}>MOMLY</Text>
          <Text style={styles.bannerSlogan}>Acompañamiento Emocional</Text>
        </View>
        <View style={styles.backPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Intro */}
        <View style={styles.introCard}>
          <Text style={styles.introEmoji}>💆‍♀️</Text>
          <Text style={styles.introTitulo}>¿Cómo te sientes hoy?</Text>
          <Text style={styles.introDesc}>
            Selecciona tu estado emocional y recibirás recomendaciones personalizadas para tu bienestar.
          </Text>
        </View>

        {/* Último estado registrado */}
        {ultimoEstado && !estadoSeleccionado && (
          <TouchableOpacity
            style={styles.ultimoEstadoCard}
            onPress={() => handleSeleccionarEstado(ultimoEstado)}
          >
            <Text style={styles.ultimoEstadoLabel}>📋 Tu último registro</Text>
            <Text style={styles.ultimoEstadoEmoji}>
              {ESTADOS.find(e => e.key === ultimoEstado)?.emoji || '😊'}
            </Text>
            <Text style={styles.ultimoEstadoTexto}>
              Te sentías {ESTADOS.find(e => e.key === ultimoEstado)?.label || ultimoEstado}
            </Text>
            <Text style={styles.ultimoEstadoBtn}>Ver recomendaciones →</Text>
          </TouchableOpacity>
        )}

        {/* Selector de estados */}
        <View style={styles.estadosContainer}>
          {ESTADOS.map(estado => (
            <TouchableOpacity
              key={estado.key}
              style={[styles.estadoBtn, estadoSeleccionado === estado.key && styles.estadoBtnActivo]}
              onPress={() => handleSeleccionarEstado(estado.key)}
            >
              <Text style={styles.estadoEmoji}>{estado.emoji}</Text>
              <Text style={[styles.estadoLabel, estadoSeleccionado === estado.key && styles.estadoLabelActivo]}>
                {estado.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Loading */}
        {loading && (
          <View style={styles.loadingCont}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Preparando tu acompañamiento...</Text>
          </View>
        )}

        {/* Resultado */}
        {acompanamiento && !loading && (
          <View style={styles.resultadoContainer}>

            <View style={styles.mensajeCard}>
              <Text style={styles.mensajeEmoji}>{estadoInfo?.emoji}</Text>
              <Text style={styles.mensajeTitulo}>Mensaje para ti 💕</Text>
              <Text style={styles.mensajeTexto}>{acompanamiento.mensaje_principal}</Text>
            </View>

            <View style={styles.seccionCard}>
              <Text style={styles.seccionTitulo}>🧘‍♀️ Estrategias para reducir el estrés</Text>
              {acompanamiento.estrategias.split('.').filter(s => s.trim()).map((estrategia, index) => (
                <View key={index} style={styles.itemFila}>
                  <View style={styles.itemBullet} />
                  <Text style={styles.itemTexto}>{estrategia.trim()}.</Text>
                </View>
              ))}
            </View>

            <View style={styles.seccionCard}>
              <Text style={styles.seccionTitulo}>🌸 Recomendaciones de autocuidado</Text>
              {acompanamiento.autocuidado.split('.').filter(s => s.trim()).map((item, index) => (
                <View key={index} style={styles.itemFila}>
                  <View style={styles.itemBullet} />
                  <Text style={styles.itemTexto}>{item.trim()}.</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.btnOtroEstado}
              onPress={() => { setEstadoSeleccionado(null); setAcompanamiento(null); }}
            >
              <Text style={styles.btnOtroEstadoText}>Seleccionar otro estado</Text>
            </TouchableOpacity>

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

  introCard: {
    backgroundColor: colors.white, borderRadius: 20, padding: 24, marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
  },
  introEmoji: { fontSize: 48, marginBottom: 12 },
  introTitulo: { fontSize: 20, fontWeight: 'bold', color: colors.textDark, marginBottom: 8, textAlign: 'center' },
  introDesc: { fontSize: 13, color: colors.textMedium, textAlign: 'center', lineHeight: 20 },

  ultimoEstadoCard: {
    backgroundColor: colors.primaryPale, borderRadius: 16, padding: 16, marginBottom: 20,
    alignItems: 'center', borderWidth: 1.5, borderColor: colors.primarySoft,
  },
  ultimoEstadoLabel: { fontSize: 12, color: colors.textMedium, marginBottom: 8 },
  ultimoEstadoEmoji: { fontSize: 36, marginBottom: 4 },
  ultimoEstadoTexto: { fontSize: 14, fontWeight: '600', color: colors.textDark, marginBottom: 8 },
  ultimoEstadoBtn: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  estadosContainer: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
    justifyContent: 'center', marginBottom: 24,
  },
  estadoBtn: {
    width: 90, alignItems: 'center', padding: 16, borderRadius: 16,
    backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  estadoBtnActivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  estadoEmoji: { fontSize: 32, marginBottom: 6 },
  estadoLabel: { fontSize: 12, fontWeight: '600', color: colors.textMedium, textAlign: 'center' },
  estadoLabelActivo: { color: colors.white },

  loadingCont: { alignItems: 'center', paddingVertical: 24 },
  loadingText: { marginTop: 12, color: colors.textMedium, fontSize: 14 },

  resultadoContainer: { gap: 16 },

  mensajeCard: {
    backgroundColor: colors.primary, borderRadius: 20, padding: 24, alignItems: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  mensajeEmoji: { fontSize: 48, marginBottom: 12 },
  mensajeTitulo: { fontSize: 16, fontWeight: 'bold', color: colors.white, marginBottom: 12 },
  mensajeTexto: { fontSize: 14, color: colors.white, lineHeight: 22, textAlign: 'center' },

  seccionCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  seccionTitulo: { fontSize: 15, fontWeight: 'bold', color: colors.textDark, marginBottom: 16 },
  itemFila: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 10 },
  itemBullet: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary,
    marginTop: 6, flexShrink: 0,
  },
  itemTexto: { flex: 1, fontSize: 13, color: colors.textDark, lineHeight: 20 },

  btnOtroEstado: {
    backgroundColor: colors.primaryPale, borderRadius: 25, paddingVertical: 12,
    alignItems: 'center', borderWidth: 1.5, borderColor: colors.primary,
  },
  btnOtroEstadoText: { color: colors.primary, fontSize: 14, fontWeight: 'bold' },

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