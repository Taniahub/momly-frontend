import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, ActivityIndicator, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../constants/colors';
import { api } from '../../services/api';


export default function CitasScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [ampm, setAmpm] = useState('AM');
  const [recordatorio, setRecordatorio] = useState(false);
  const [errores, setErrores] = useState({});

  useEffect(() => {
    cargarUsuario();
  }, []);

  const cargarUsuario = async () => {
    const data = await AsyncStorage.getItem('usuario');
    if (data) {
      const u = JSON.parse(data);
      setUsuario(u);
      cargarCitas(u.id);
    }
  };

  const cargarCitas = async (id) => {
    try {
      const response = await api.get(`/auth/citas/${id}`);
      setCitas(response.data.data);
    } catch (error) {
      console.error('Error cargando citas:', error);
    }
  };

  const validar = () => {
    const e = {};
    if (!titulo) e.titulo = 'El título es obligatorio';

    if (!fecha) {
      e.fecha = 'La fecha es obligatoria';
    } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) {
      e.fecha = 'Formato DD/MM/YYYY';
    } else {
      const [dia, mes, anio] = fecha.split('/').map(Number);
      const fechaIngresada = new Date(anio, mes - 1, dia);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fechaIngresada < hoy) e.fecha = 'La fecha debe ser hoy o en el futuro';
    }

    if (!hora) {
      e.hora = 'La hora es obligatoria';
    } else if (!/^\d{2}:\d{2}$/.test(hora)) {
      e.hora = 'Formato HH:MM';
    } else {
      const [hh, mm] = hora.split(':').map(Number);
      if (hh < 1 || hh > 12) e.hora = 'Hora debe ser entre 01 y 12';
      else if (mm < 0 || mm > 59) e.hora = 'Minutos deben ser entre 00 y 59';
    }

    setErrores(e);
    return Object.keys(e).length === 0;
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

  const handleGuardar = async () => {
    if (!validar()) return;
    setLoading(true);
    try {
      const [dia, mes, anio] = fecha.split('/');
      const hora24 = convertirA24h(hora, ampm);
      const fecha_hora = `${anio}-${mes}-${dia}T${hora24}:00`;
      await api.post('/auth/citas', {
        id_usuario: usuario.id,
        titulo,
        descripcion,
        fecha_hora,
        recordatorio: recordatorio ? 1 : 0,
      });
      setTitulo('');
      setDescripcion('');
      setFecha('');
      setHora('');
      setAmpm('AM');
      setRecordatorio(false);
      setMostrarFormulario(false);
      cargarCitas(usuario.id);
    } catch (error) {
      console.error('Error guardando cita:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id_cita) => {
    if (Platform.OS === 'web') {
      const confirmar = window.confirm('¿Deseas eliminar esta cita?');
      if (!confirmar) return;
    }
    try {
      await api.delete(`/auth/citas/${id_cita}`);
      cargarCitas(usuario.id);
    } catch (error) {
      console.error('Error eliminando cita:', error);
    }
  };

  const formatearHora = (fecha_hora) => {
    const partes = fecha_hora.toString().replace('T', ' ').slice(0, 16);
    const [, hora] = partes.split(' ');
    let [hh, mm] = hora.split(':').map(Number);
    const ampm = hh >= 12 ? 'PM' : 'AM';
    if (hh > 12) hh -= 12;
    if (hh === 0) hh = 12;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')} ${ampm}`;
  };

  const formatearFechaCompleta = (fecha_hora) => {
    const partes = fecha_hora.toString().replace('T', ' ').slice(0, 10);
    const [anio, mes, dia] = partes.split('-').map(Number);
    const fecha = new Date(anio, mes - 1, dia);
    return fecha.toLocaleDateString('es-MX', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  const getDiaYMes = (fecha_hora) => {
    const partes = fecha_hora.toString().slice(0, 10);
    const [anio, mes, dia] = partes.split('-').map(Number);
    const fecha = new Date(anio, mes - 1, dia);
    return {
      dia,
      mes: fecha.toLocaleString('es-MX', { month: 'short' }),
    };
  };

  const citasPasadas = citas.filter(c => {
    const partes = c.fecha_hora.toString().slice(0, 10);
    const [anio, mes, dia] = partes.split('-').map(Number);
    return new Date(anio, mes - 1, dia) < new Date(new Date().setHours(0,0,0,0));
  });

  const citasFuturas = citas.filter(c => {
    const partes = c.fecha_hora.toString().slice(0, 10);
    const [anio, mes, dia] = partes.split('-').map(Number);
    return new Date(anio, mes - 1, dia) >= new Date(new Date().setHours(0,0,0,0));
  });

  const CitaCard = ({ cita, pasada }) => {
    const { dia, mes } = getDiaYMes(cita.fecha_hora);
    return (
      <View key={cita.id_cita} style={[styles.citaCard, pasada && styles.citaCardPasada]}>
        <View style={styles.citaHeader}>
          <View style={[styles.citaFechaBox, pasada && styles.citaFechaBoxPasada]}>
            <Text style={styles.citaFechaDia}>{dia}</Text>
            <Text style={styles.citaFechaMes}>{mes}</Text>
          </View>
          <View style={styles.citaInfo}>
            <Text style={[styles.citaTitulo, pasada && styles.citaTituloPasada]}>{cita.titulo}</Text>
            <Text style={styles.citaHora}>🕐 {formatearHora(cita.fecha_hora)}</Text>
            <Text style={styles.citaFechaTexto}>{formatearFechaCompleta(cita.fecha_hora)}</Text>
            {cita.descripcion ? <Text style={styles.citaDesc}>{cita.descripcion}</Text> : null}
            {cita.recordatorio ? <Text style={styles.citaRecordatorio}>🔔 Recordatorio activo</Text> : null}
          </View>
        </View>
        <TouchableOpacity style={styles.btnEliminar} onPress={() => handleEliminar(cita.id_cita)}>
          <Text style={styles.btnEliminarText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(home)')}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <View style={styles.bannerCenter}>
          <Text style={styles.bannerTitle}>MOMLY</Text>
          <Text style={styles.bannerSlogan}>Citas y Recordatorios</Text>
        </View>
        <View style={styles.backPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        <TouchableOpacity
          style={styles.btnAgregar}
          onPress={() => setMostrarFormulario(!mostrarFormulario)}
        >
          <Text style={styles.btnAgregarText}>
            {mostrarFormulario ? '✕ Cancelar' : '+ Agregar cita'}
          </Text>
        </TouchableOpacity>

        {mostrarFormulario && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Nueva cita 🗓️</Text>

            <View style={styles.campoContainer}>
              <Text style={styles.label}>Título</Text>
              <TextInput
                style={[styles.input, errores.titulo && styles.inputError]}
                placeholder="Ej: Consulta con pediatra"
                placeholderTextColor={colors.textLight}
                value={titulo}
                onChangeText={(t) => { setTitulo(t); setErrores({ ...errores, titulo: null }); }}
              />
              {errores.titulo && <Text style={styles.errorText}>{errores.titulo}</Text>}
            </View>

            <View style={styles.campoContainer}>
              <Text style={styles.label}>Descripción (opcional)</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Notas adicionales..."
                placeholderTextColor={colors.textLight}
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.campoContainer}>
              <Text style={styles.label}>Fecha (solo días de hoy en adelante)</Text>
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
              style={styles.recordatorioContainer}
              onPress={() => setRecordatorio(!recordatorio)}
            >
              <View style={[styles.checkbox, recordatorio && styles.checkboxActivo]}>
                {recordatorio && <Text style={styles.checkboxCheck}>✓</Text>}
              </View>
              <Text style={styles.recordatorioText}>🔔 Activar recordatorio</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnGuardar, loading && styles.btnDisabled]}
              onPress={handleGuardar}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={colors.white} />
                : <Text style={styles.btnGuardarText}>Guardar cita 🌸</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        {citasFuturas.length > 0 ? (
          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>📅 Próximas citas</Text>
            {citasFuturas.map(cita => <CitaCard key={cita.id_cita} cita={cita} pasada={false} />)}
          </View>
        ) : (
          !mostrarFormulario && (
            <View style={styles.sinCitasFuturas}>
              <Text style={styles.sinCitasTexto}>📭 No tienes citas próximas</Text>
            </View>
          )
        )}

        {citasPasadas.length > 0 && (
          <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>✅ Citas anteriores</Text>
            {citasPasadas.map(cita => <CitaCard key={cita.id_cita} cita={cita} pasada={true} />)}
          </View>
        )}

        {citas.length === 0 && !mostrarFormulario && (
          <View style={styles.vacioCont}>
            <Text style={styles.vacioEmoji}>🗓️</Text>
            <Text style={styles.vacioTitulo}>Sin citas registradas</Text>
            <Text style={styles.vacioDesc}>Agrega tu primera cita médica para llevar el control de tu salud y la de tu bebé</Text>
          </View>
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

  btnAgregar: {
    backgroundColor: colors.primary, borderRadius: 25, paddingVertical: 12,
    alignItems: 'center', marginBottom: 20,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  btnAgregarText: { color: colors.white, fontSize: 15, fontWeight: 'bold' },

  card: {
    backgroundColor: colors.white, borderRadius: 20, padding: 24, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textDark, marginBottom: 16 },

  campoContainer: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textDark, marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 14,
    color: colors.textDark, backgroundColor: colors.primaryPale,
  },
  inputMultiline: { minHeight: 70, textAlignVertical: 'top' },
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

  recordatorioContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxActivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxCheck: { color: colors.white, fontSize: 13, fontWeight: 'bold' },
  recordatorioText: { fontSize: 14, color: colors.textMedium },

  btnGuardar: {
    backgroundColor: colors.primary, borderRadius: 25, paddingVertical: 12,
    alignItems: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  btnDisabled: { opacity: 0.7 },
  btnGuardarText: { color: colors.white, fontSize: 15, fontWeight: 'bold' },

  seccion: { marginBottom: 24 },
  seccionTitulo: { fontSize: 15, fontWeight: 'bold', color: colors.textDark, marginBottom: 12 },

  sinCitasFuturas: {
    backgroundColor: colors.primaryPale, borderRadius: 12, padding: 16,
    alignItems: 'center', marginBottom: 20,
  },
  sinCitasTexto: { fontSize: 14, color: colors.textMedium },

  citaCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    borderLeftWidth: 4, borderLeftColor: colors.primary,
  },
  citaCardPasada: { borderLeftColor: colors.border, opacity: 0.7 },
  citaHeader: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  citaFechaBox: {
    backgroundColor: colors.primary, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 8, alignItems: 'center', minWidth: 45,
  },
  citaFechaBoxPasada: { backgroundColor: colors.border },
  citaFechaDia: { color: colors.white, fontSize: 18, fontWeight: 'bold' },
  citaFechaMes: { color: colors.white, fontSize: 11, textTransform: 'uppercase' },
  citaInfo: { flex: 1 },
  citaTitulo: { fontSize: 14, fontWeight: 'bold', color: colors.textDark, marginBottom: 2 },
  citaTituloPasada: { color: colors.textMedium },
  citaHora: { fontSize: 12, color: colors.primary, fontWeight: '600', marginBottom: 2 },
  citaFechaTexto: { fontSize: 11, color: colors.textLight, marginBottom: 2, textTransform: 'capitalize' },
  citaDesc: { fontSize: 12, color: colors.textLight },
  citaRecordatorio: { fontSize: 11, color: colors.primary, marginTop: 2 },

  btnEliminar: { padding: 8 },
  btnEliminarText: { fontSize: 18 },

  vacioCont: { alignItems: 'center', paddingVertical: 40 },
  vacioEmoji: { fontSize: 50, marginBottom: 12 },
  vacioTitulo: { fontSize: 18, fontWeight: 'bold', color: colors.textDark, marginBottom: 8 },
  vacioDesc: { fontSize: 13, color: colors.textMedium, textAlign: 'center', lineHeight: 20 },

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

