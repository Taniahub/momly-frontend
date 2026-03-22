import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Platform, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../constants/colors';
import { api } from '../../services/api';

const ICONOS_ESPECIALIDAD = {
  'Pediatra': '👶',
  'Psicologa Perinatal': '🧠',
  'Consultora de Lactancia': '🤱',
  'Ginecologia y Obstetricia': '👩‍⚕️',
  'Nutricionista Materno-Infantil': '🥗',
};

export default function EspecialistasScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [especialistas, setEspecialistas] = useState([]);
  const [misConsultas, setMisConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [especialistaActivo, setEspecialistaActivo] = useState(null);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [ampm, setAmpm] = useState('AM');
  const [loadingAgendar, setLoadingAgendar] = useState(false);
  const [vista, setVista] = useState('especialistas');
  const [errores, setErrores] = useState({});

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const usuarioData = await AsyncStorage.getItem('usuario');
      if (usuarioData) {
        const u = JSON.parse(usuarioData);
        setUsuario(u);
        const [espResponse, consResponse] = await Promise.all([
          api.get('/auth/especialistas'),
          api.get(`/auth/consultas/${u.id}`),
        ]);
        setEspecialistas(espResponse.data.data);
        setMisConsultas(consResponse.data.data);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFechaChange = (text) => {
    let cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 3) cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    if (cleaned.length >= 6) cleaned = cleaned.slice(0, 5) + '/' + cleaned.slice(5);
    setFecha(cleaned.slice(0, 10));
    setErrores({ ...errores, fecha: null });
  };

  const handleHoraChange = (text) => {
    let cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 3) cleaned = cleaned.slice(0, 2) + ':' + cleaned.slice(2);
    setHora(cleaned.slice(0, 5));
    setErrores({ ...errores, hora: null });
  };

  const convertirA24h = (hora12, ampm) => {
    let [hh, mm] = hora12.split(':').map(Number);
    if (ampm === 'AM' && hh === 12) hh = 0;
    if (ampm === 'PM' && hh !== 12) hh += 12;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  };

  const validar = () => {
    const e = {};
    if (!fecha) {
      e.fecha = 'La fecha es obligatoria';
    } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) {
      e.fecha = 'Formato DD/MM/YYYY';
    } else {
      const [dia, mes, anio] = fecha.split('/').map(Number);
      const fechaIngresada = new Date(anio, mes - 1, dia);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      fechaIngresada.setHours(0, 0, 0, 0);
      if (fechaIngresada.getTime() < hoy.getTime()) e.fecha = 'La fecha debe ser hoy o en el futuro';
    }

    if (!hora) {
      e.hora = 'La hora es obligatoria';
    } else if (!/^\d{2}:\d{2}$/.test(hora)) {
      e.hora = 'Formato HH:MM';
    } else {
      const [hh, mm] = hora.split(':').map(Number);
      if (hh < 1 || hh > 12) e.hora = 'Hora debe ser entre 01 y 12';
      else if (mm < 0 || mm > 59) e.hora = 'Minutos deben ser entre 00 y 59';
      else if (fecha && /^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) {
        const [dia, mes, anio] = fecha.split('/').map(Number);
        const fechaIngresada = new Date(anio, mes - 1, dia);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        fechaIngresada.setHours(0, 0, 0, 0);
        if (fechaIngresada.getTime() === hoy.getTime()) {
          const hora24 = convertirA24h(hora, ampm);
          const [hh24, mm24] = hora24.split(':').map(Number);
          const ahora = new Date();
          if (hh24 < ahora.getHours() || (hh24 === ahora.getHours() && mm24 <= ahora.getMinutes())) {
            e.hora = 'La hora ya paso, elige una hora futura';
          }
        }
      }
    }
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleAgendar = async () => {
    if (!validar()) return;
    if (Platform.OS === 'web') {
      const confirmar = window.confirm(`¿Deseas agendar una consulta con ${especialistaActivo.nombre}?`);
      if (!confirmar) return;
    }
    setLoadingAgendar(true);
    try {
      const [dia, mes, anio] = fecha.split('/');
      const hora24 = convertirA24h(hora, ampm);
      const fechaHora = `${anio}-${mes}-${dia}T${hora24}:00`;
      await api.post('/auth/consultas', {
        id_usuario: usuario.id,
        id_especialista: especialistaActivo.id_especialista,
        fecha: fechaHora,
      });
      setEspecialistaActivo(null);
      setFecha('');
      setHora('');
      setAmpm('AM');
      setErrores({});
      cargarDatos();
      setVista('consultas');
    } catch (error) {
      console.error('Error agendando consulta:', error);
    } finally {
      setLoadingAgendar(false);
    }
  };

  const formatearFecha = (fecha) => {
    const partes = fecha.toString().slice(0, 10);
    const [anio, mes, dia] = partes.split('-').map(Number);
    const fechaLocal = new Date(anio, mes - 1, dia);
    return fechaLocal.toLocaleDateString('es-MX', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  };

  const formatearHora = (fecha) => {
    const partes = fecha.toString().replace('T', ' ').slice(0, 16);
    const [, hora] = partes.split(' ');
    let [hh, mm] = hora.split(':').map(Number);
    const ampm = hh >= 12 ? 'PM' : 'AM';
    if (hh > 12) hh -= 12;
    if (hh === 0) hh = 12;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')} ${ampm}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando especialistas...</Text>
      </View>
    );
  }

  const esPremium = usuario?.tipo_usuario === 'premium';

  if (especialistaActivo) {
    return (
      <View style={styles.container}>
        <View style={styles.banner}>
          <TouchableOpacity style={styles.backBtn} onPress={() => { setEspecialistaActivo(null); setErrores({}); }}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <View style={styles.bannerCenter}>
            <Text style={styles.bannerTitle}>MOMLY</Text>
            <Text style={styles.bannerSlogan}>Agendar Consulta</Text>
          </View>
          <View style={styles.backPlaceholder} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.especialistaDetalleCard}>
            <Text style={styles.especialistaEmoji}>{ICONOS_ESPECIALIDAD[especialistaActivo.especialidad] || '👩‍⚕️'}</Text>
            <Text style={styles.especialistaNombre}>{especialistaActivo.nombre}</Text>
            <Text style={styles.especialistaEspecialidad}>{especialistaActivo.especialidad}</Text>
            <Text style={styles.especialistaDesc}>{especialistaActivo.descripcion}</Text>
          </View>

          <View style={styles.agendarCard}>
            <Text style={styles.agendarTitulo}>📅 Selecciona fecha y hora</Text>
            <View style={styles.campoContainer}>
              <Text style={styles.label}>Fecha (hoy o dias futuros)</Text>
              <TextInput
                style={[styles.input, errores.fecha && styles.inputError]}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={colors.textLight}
                value={fecha}
                onChangeText={handleFechaChange}
                keyboardType="numeric"
                maxLength={10}
              />
              {errores.fecha && <Text style={styles.errorText}>{errores.fecha}</Text>}
            </View>

            <View style={styles.campoContainer}>
              <Text style={styles.label}>Hora</Text>
              <View style={styles.horaContainer}>
                <TextInput
                  style={[styles.inputHora, errores.hora && styles.inputError]}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.textLight}
                  value={hora}
                  onChangeText={handleHoraChange}
                  keyboardType="numeric"
                  maxLength={5}
                />
                <View style={styles.ampmContainer}>
                  {['AM', 'PM'].map(op => (
                    <TouchableOpacity
                      key={op}
                      style={[styles.ampmBtn, ampm === op && styles.ampmBtnActivo]}
                      onPress={() => setAmpm(op)}
                    >
                      <Text style={[styles.ampmText, ampm === op && styles.ampmTextActivo]}>{op}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {errores.hora && <Text style={styles.errorText}>{errores.hora}</Text>}
            </View>

            <TouchableOpacity
              style={[styles.btnAgendar, loadingAgendar && styles.btnDisabled]}
              onPress={handleAgendar}
              disabled={loadingAgendar}
            >
              {loadingAgendar
                ? <ActivityIndicator color={colors.white} />
                : <Text style={styles.btnAgendarText}>Agendar consulta 🌸</Text>
              }
            </TouchableOpacity>
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
          <Text style={styles.bannerSlogan}>Especialistas</Text>
        </View>
        <View style={styles.backPlaceholder} />
      </View>

      {!esPremium && (
        <View style={styles.premiumBanner}>
          <Text style={styles.premiumBannerText}>⭐ Hazte Premium para agendar consultas</Text>
          <TouchableOpacity onPress={() => router.replace('/(home)/premium')}>
            <Text style={styles.premiumBannerBtn}>Ver planes →</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, vista === 'especialistas' && styles.tabActivo]}
          onPress={() => setVista('especialistas')}
        >
          <Text style={[styles.tabText, vista === 'especialistas' && styles.tabTextActivo]}>👩‍⚕️ Especialistas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, vista === 'consultas' && styles.tabActivo]}
          onPress={() => setVista('consultas')}
        >
          <Text style={[styles.tabText, vista === 'consultas' && styles.tabTextActivo]}>📋 Mis consultas ({misConsultas.length})</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {vista === 'especialistas' ? (
          <>
            {especialistas.map(esp => (
              <View key={esp.id_especialista} style={styles.especialistaCard}>
                <View style={styles.especialistaHeader}>
                  <Text style={styles.especialistaIcono}>{ICONOS_ESPECIALIDAD[esp.especialidad] || '👩‍⚕️'}</Text>
                  <View style={styles.especialistaInfo}>
                    <Text style={styles.especialistaNombreCard}>{esp.nombre}</Text>
                    <Text style={styles.especialistaEspecialidadCard}>{esp.especialidad}</Text>
                  </View>
                </View>
                <Text style={styles.especialistaDescCard} numberOfLines={2}>{esp.descripcion}</Text>
                {esPremium ? (
                  <TouchableOpacity style={styles.btnAgendarCard} onPress={() => setEspecialistaActivo(esp)}>
                    <Text style={styles.btnAgendarCardText}>Agendar consulta →</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.btnBloqueado}>
                    <Text style={styles.btnBloqueadoText}>🔒 Solo para Premium</Text>
                  </View>
                )}
              </View>
            ))}
          </>
        ) : (
          <>
            {misConsultas.length === 0 ? (
              <View style={styles.vacioCont}>
                <Text style={styles.vacioEmoji}>📋</Text>
                <Text style={styles.vacioTitulo}>Sin consultas agendadas</Text>
                <Text style={styles.vacioDesc}>Agenda tu primera consulta con un especialista</Text>
              </View>
            ) : (
              misConsultas.map(c => (
                <View key={c.id_consulta} style={styles.consultaCard}>
                  <View style={styles.consultaHeader}>
                    <Text style={styles.consultaIcono}>{ICONOS_ESPECIALIDAD[c.especialidad] || '👩‍⚕️'}</Text>
                    <View style={styles.consultaInfo}>
                      <Text style={styles.consultaNombre}>{c.nombre}</Text>
                      <Text style={styles.consultaEspecialidad}>{c.especialidad}</Text>
                    </View>
                    <View style={[styles.consultaEstado, c.estado === 'pendiente' && styles.consultaEstadoPendiente, c.estado === 'completada' && styles.consultaEstadoCompletada]}>
                      <Text style={styles.consultaEstadoText}>{c.estado}</Text>
                    </View>
                  </View>
                  <Text style={styles.consultaFecha}>📅 {formatearFecha(c.fecha)}</Text>
                  <Text style={styles.consultaHora}>🕐 {formatearHora(c.fecha)}</Text>
                </View>
              ))
            )}
          </>
        )}
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

  premiumBanner: {
    backgroundColor: '#FFF3E0', padding: 12, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20,
  },
  premiumBannerText: { fontSize: 13, color: '#E65100', fontWeight: '600' },
  premiumBannerBtn: { fontSize: 13, color: colors.primary, fontWeight: 'bold' },
  tabsContainer: {
    flexDirection: 'row', backgroundColor: colors.white,
    paddingHorizontal: 20, paddingVertical: 10, gap: 10,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  tab: {
    flex: 1, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.primaryPale, alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.border,
  },
  tabActivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 12, fontWeight: '600', color: colors.textMedium },
  tabTextActivo: { color: colors.white },
  content: { padding: 24 },
  especialistaCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  especialistaHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  especialistaIcono: { fontSize: 36 },
  especialistaInfo: { flex: 1 },
  especialistaNombreCard: { fontSize: 15, fontWeight: 'bold', color: colors.textDark },
  especialistaEspecialidadCard: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  especialistaDescCard: { fontSize: 13, color: colors.textMedium, lineHeight: 20, marginBottom: 12 },
  btnAgendarCard: {
    backgroundColor: colors.primaryPale, borderRadius: 20, paddingVertical: 8,
    alignItems: 'center', borderWidth: 1.5, borderColor: colors.primary,
  },
  btnAgendarCardText: { fontSize: 13, color: colors.primary, fontWeight: 'bold' },
  btnBloqueado: {
    backgroundColor: colors.background, borderRadius: 20, paddingVertical: 8,
    alignItems: 'center', borderWidth: 1.5, borderColor: colors.border,
  },
  btnBloqueadoText: { fontSize: 13, color: colors.textLight, fontWeight: '600' },
  especialistaDetalleCard: {
    backgroundColor: colors.white, borderRadius: 20, padding: 24, marginBottom: 20, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
  },
  especialistaEmoji: { fontSize: 56, marginBottom: 12 },
  especialistaNombre: { fontSize: 20, fontWeight: 'bold', color: colors.textDark, marginBottom: 4 },
  especialistaEspecialidad: { fontSize: 14, color: colors.primary, fontWeight: '600', marginBottom: 12 },
  especialistaDesc: { fontSize: 13, color: colors.textMedium, textAlign: 'center', lineHeight: 22 },
  agendarCard: {
    backgroundColor: colors.white, borderRadius: 20, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
  },
  agendarTitulo: { fontSize: 16, fontWeight: 'bold', color: colors.textDark, marginBottom: 20 },
  campoContainer: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textDark, marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 14,
    color: colors.textDark, backgroundColor: colors.primaryPale,
  },
  inputError: { borderColor: colors.error },
  errorText: { color: colors.error, fontSize: 12, marginTop: 4 },
  horaContainer: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  inputHora: {
    flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 14,
    color: colors.textDark, backgroundColor: colors.primaryPale,
  },
  ampmContainer: { flexDirection: 'row', gap: 6 },
  ampmBtn: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.primaryPale,
  },
  ampmBtnActivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  ampmText: { fontSize: 14, fontWeight: 'bold', color: colors.textMedium },
  ampmTextActivo: { color: colors.white },
  btnAgendar: {
    backgroundColor: colors.primary, borderRadius: 25, paddingVertical: 12, alignItems: 'center', marginTop: 8,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  btnDisabled: { opacity: 0.7 },
  btnAgendarText: { color: colors.white, fontSize: 15, fontWeight: 'bold' },
  consultaCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    borderLeftWidth: 4, borderLeftColor: colors.primary,
  },
  consultaHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  consultaIcono: { fontSize: 28 },
  consultaInfo: { flex: 1 },
  consultaNombre: { fontSize: 14, fontWeight: 'bold', color: colors.textDark },
  consultaEspecialidad: { fontSize: 12, color: colors.primary },
  consultaEstado: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: colors.primaryPale },
  consultaEstadoPendiente: { backgroundColor: '#FFF3E0' },
  consultaEstadoCompletada: { backgroundColor: '#E8F5E9' },
  consultaEstadoText: { fontSize: 11, fontWeight: 'bold', color: colors.textDark },
  consultaFecha: { fontSize: 12, color: colors.textMedium, marginBottom: 2, textTransform: 'capitalize' },
  consultaHora: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  vacioCont: { alignItems: 'center', paddingVertical: 40 },
  vacioEmoji: { fontSize: 50, marginBottom: 12 },
  vacioTitulo: { fontSize: 18, fontWeight: 'bold', color: colors.textDark, marginBottom: 8 },
  vacioDesc: { fontSize: 13, color: colors.textMedium, textAlign: 'center' },
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