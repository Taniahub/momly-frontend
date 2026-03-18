import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, ActivityIndicator, Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../constants/colors';
import { authService, api } from '../../services/api';


export default function RegistroScreen() {
  const router = useRouter();
  const [paso, setPaso] = useState(1);

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const [nombreBebe, setNombreBebe] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [genero, setGenero] = useState('');

  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState({});

  const validarPaso1 = () => {
  const e = {};
  if (!nombre) e.nombre = 'El nombre es obligatorio';
  else if (nombre.length < 3) e.nombre = 'Mínimo 3 caracteres';
  
  if (!correo) e.correo = 'El correo es obligatorio';
  else if (!/^[^\s@]+@[^\s@]+\.(com|net|org|edu|mx|es|io|co)$/.test(correo.toLowerCase()))
    e.correo = 'Ingresa un correo con dominio válido (ej: gmail.com)';
  
  if (!password) e.password = 'La contraseña es obligatoria';
  else if (password.length < 6) e.password = 'Mínimo 6 caracteres';
  
  if (!confirmarPassword) e.confirmarPassword = 'Confirma tu contraseña';
  else if (password !== confirmarPassword) e.confirmarPassword = 'Las contraseñas no coinciden';
  
  setErrores(e);
  return Object.keys(e).length === 0;
  };

  const validarFecha = (fecha) => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(fecha)) return false;
    const [dia, mes, anio] = fecha.split('/').map(Number);
    const date = new Date(anio, mes - 1, dia);
    const hoy = new Date();
    const hace3anios = new Date();
    hace3anios.setFullYear(hoy.getFullYear() - 3);
    
    return date <= hoy && date >= hace3anios;
  };

  const validarPaso2 = () => {
    const e = {};
    if (!nombreBebe) e.nombreBebe = 'El nombre del bebé es obligatorio';
    else if (nombreBebe.length < 2) e.nombreBebe = 'Mínimo 2 caracteres';
    if (!fechaNacimiento) e.fechaNacimiento = 'La fecha de nacimiento es obligatoria';
    else if (!validarFecha(fechaNacimiento)) 
    e.fechaNacimiento = 'MOMLY es para bebés de 0 a 3 años 💕';
    if (!genero) e.genero = 'Selecciona el género del bebé';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleSiguiente = async () => {
  if (!validarPaso1()) return;
  
  setLoading(true);
  try {
    await api.post('/auth/verificar-correo', { correo });
    setErrores({});
    setPaso(2);
  } catch (error) {
    const mensaje = error.response?.data?.mensaje || 'Este correo ya existe';
    setErrores({ ...errores, correo: mensaje });
  } finally {
    setLoading(false);
  }
  };

  const handleFechaChange = (text) => {
    let cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 3) cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    if (cleaned.length >= 6) cleaned = cleaned.slice(0, 5) + '/' + cleaned.slice(5);
    setFechaNacimiento(cleaned.slice(0, 10));
    setErrores({ ...errores, fechaNacimiento: null });
  };

  const handleRegistroCompleto = async () => {
    if (!validarPaso2()) return;
    setLoading(true);
    try {
      const [dia, mes, anio] = fechaNacimiento.split('/');
      const response = await authService.registroCompleto({
        nombre, correo, password,
        bebe: {
          nombre: nombreBebe,
          fecha_nacimiento: `${anio}-${mes}-${dia}`,
          genero,
        },
      });
      const { token, usuario } = response.data;
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('usuario', JSON.stringify(usuario));
      setPaso(3);
    } catch (error) {
      const mensaje = error.response?.data?.mensaje || 'Error al registrarse';
      if (Platform.OS === 'web') {
        window.alert(mensaje);
      }else {
        
        Alert.alert('Error', mensaje);
      }
    } finally {
      setLoading(false); 
    }
  };

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

      {/* Indicador de pasos */}
      {paso !== 3 && (
        <>
          <View style={styles.pasoContainer}>
            <View style={paso >= 1 ? styles.pasoActivo : styles.pasoInactivo}>
              <Text style={paso >= 1 ? styles.pasoTextoActivo : styles.pasoTextoInactivo}>
                {paso > 1 ? '✓' : '1'}
              </Text>
            </View>
            <View style={[styles.pasoLinea, paso === 2 && styles.pasoLineaActiva]} />
            <View style={paso === 2 ? styles.pasoActivo : styles.pasoInactivo}>
              <Text style={paso === 2 ? styles.pasoTextoActivo : styles.pasoTextoInactivo}>2</Text>
            </View>
          </View>
          <Text style={styles.pasoLabel}>
            {paso === 1 ? 'Paso 1 de 2 — Tu cuenta' : 'Paso 2 de 2 — Tu bebé'}
          </Text>
        </>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>

          {/* PASO 1 */}
          {paso === 1 && (
            <>
              <Text style={styles.cardTitle}>Crear Cuenta</Text>
              <Text style={styles.cardSubtitle}>Empieza tu camino con MOMLY 💕</Text>

              <View style={styles.campoContainer}>
                <Text style={styles.label}>Nombre completo</Text>
                <TextInput
                  style={[styles.input, errores.nombre && styles.inputError]}
                  placeholder="Tu nombre"
                  placeholderTextColor={colors.textLight}
                  value={nombre}
                  onChangeText={(t) => { setNombre(t); setErrores({ ...errores, nombre: null }); }}
                  autoCapitalize="words"
                />
                {errores.nombre && <Text style={styles.errorText}>{errores.nombre}</Text>}
              </View>

              <View style={styles.campoContainer}>
                <Text style={styles.label}>Correo electrónico</Text>
                <TextInput
                  style={[styles.input, errores.correo && styles.inputError]}
                  placeholder="ejemplo@correo.com"
                  placeholderTextColor={colors.textLight}
                  value={correo}
                  onChangeText={(t) => { setCorreo(t); setErrores({ ...errores, correo: null }); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errores.correo && <Text style={styles.errorText}>{errores.correo}</Text>}
              </View>

              <View style={styles.campoContainer}>
                <Text style={styles.label}>Contraseña</Text>
                <View style={[styles.passwordContainer, errores.password && styles.inputError]}>
                  <TextInput
                    style={styles.inputPassword}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor={colors.textLight}
                    value={password}
                    onChangeText={(t) => { setPassword(t); setErrores({ ...errores, password: null }); }}
                    secureTextEntry={!mostrarPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity style={styles.eyeBtn} onPress={() => setMostrarPassword(!mostrarPassword)}>
                    <Text style={styles.eyeIcon}>{mostrarPassword ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
                {errores.password && <Text style={styles.errorText}>{errores.password}</Text>}
              </View>

              <View style={styles.campoContainer}>
                <Text style={styles.label}>Confirmar contraseña</Text>
                <View style={[styles.passwordContainer, errores.confirmarPassword && styles.inputError]}>
                  <TextInput
                    style={styles.inputPassword}
                    placeholder="Repite tu contraseña"
                    placeholderTextColor={colors.textLight}
                    value={confirmarPassword}
                    onChangeText={(t) => { setConfirmarPassword(t); setErrores({ ...errores, confirmarPassword: null }); }}
                    secureTextEntry={!mostrarConfirmar}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity style={styles.eyeBtn} onPress={() => setMostrarConfirmar(!mostrarConfirmar)}>
                    <Text style={styles.eyeIcon}>{mostrarConfirmar ? '🙈' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
                {errores.confirmarPassword && <Text style={styles.errorText}>{errores.confirmarPassword}</Text>}
              </View>

              <TouchableOpacity style={styles.btnPrimario} onPress={handleSiguiente}>
                <Text style={styles.btnPrimarioText}>Siguiente →</Text>
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                  <Text style={styles.loginLink}>Inicia sesión aquí</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* PASO 2 */}
          {paso === 2 && (
            <>
              <Text style={styles.cardTitle}>Datos de tu bebé 👶</Text>
              <Text style={styles.cardSubtitle}>Cuéntanos sobre tu pequeño/a 💕</Text>

              <View style={styles.campoContainer}>
                <Text style={styles.label}>Nombre del bebé</Text>
                <TextInput
                  style={[styles.input, errores.nombreBebe && styles.inputError]}
                  placeholder="Nombre de tu bebé"
                  placeholderTextColor={colors.textLight}
                  value={nombreBebe}
                  onChangeText={(t) => { setNombreBebe(t); setErrores({ ...errores, nombreBebe: null }); }}
                  autoCapitalize="words"
                />
                {errores.nombreBebe && <Text style={styles.errorText}>{errores.nombreBebe}</Text>}
              </View>

              <View style={styles.campoContainer}>
                <Text style={styles.label}>Fecha de nacimiento</Text>
                <TextInput
                  style={[styles.input, errores.fechaNacimiento && styles.inputError]}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor={colors.textLight}
                  value={fechaNacimiento}
                  onChangeText={handleFechaChange}
                  keyboardType="numeric"
                  maxLength={10}
                />
                {errores.fechaNacimiento && <Text style={styles.errorText}>{errores.fechaNacimiento}</Text>}
              </View>

              <View style={styles.campoContainer}>
                <Text style={styles.label}>Género</Text>
                <View style={styles.generoContainer}>
                  {['Niña', 'Niño', 'Prefiero no decir'].map((opcion) => (
                    <TouchableOpacity
                      key={opcion}
                      style={[styles.generoBtn, genero === opcion && styles.generoBtnActivo]}
                      onPress={() => { setGenero(opcion); setErrores({ ...errores, genero: null }); }}
                    >
                      <Text style={[styles.generoBtnText, genero === opcion && styles.generoBtnTextoActivo]}>
                        {opcion === 'Niña' ? '👧 Niña' : opcion === 'Niño' ? '👦 Niño' : '💛 Prefiero no decir'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errores.genero && <Text style={styles.errorText}>{errores.genero}</Text>}
              </View>

              <View style={styles.resumenContainer}>
                <Text style={styles.resumenTitulo}>📋 Tu cuenta</Text>
                <Text style={styles.resumenTexto}>👤 {nombre}</Text>
                <Text style={styles.resumenTexto}>✉️ {correo}</Text>
              </View>

              <TouchableOpacity
                style={[styles.btnPrimario, loading && styles.btnDisabled]}
                onPress={handleRegistroCompleto}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color={colors.white} />
                  : <Text style={styles.btnPrimarioText}>Crear Cuenta 🌸</Text>
                }
              </TouchableOpacity>
            </>
          )}

          {/* PASO 3: Éxito */}
          {paso === 3 && (
            <>
              <Text style={styles.exitoEmoji}>🌸</Text>
              <Text style={styles.cardTitle}>¡Bienvenida, {nombre}!</Text>
              <Text style={styles.cardSubtitle}>Tu cuenta y el perfil de {nombreBebe} fueron creados exitosamente 💕</Text>

              <View style={styles.resumenContainer}>
                <Text style={styles.resumenTitulo}>✅ Resumen de tu cuenta</Text>
                <Text style={styles.resumenTexto}>👤 {nombre}</Text>
                <Text style={styles.resumenTexto}>✉️ {correo}</Text>
                <Text style={styles.resumenTexto}>👶 {nombreBebe}</Text>
              </View>

              <TouchableOpacity
                style={styles.btnPrimario}
                onPress={() => router.replace('/(home)')}
              >
                <Text style={styles.btnPrimarioText}>¡Comenzar! 🌸</Text>
              </TouchableOpacity>
            </>
          )}

        </View>
      </ScrollView>

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
    // Header nav
  header: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingTop: 5,
  paddingBottom: 10,
  backgroundColor: '#FFF1E6', // Rosa de fondo del header
},
logoImagen: {
  width: 100,  // Ajusta según el ancho de tu nueva imagen
  height: 40,  // Ajusta según el alto de tu nueva imagen
},
slogan: {
  fontSize: 11,
  color: colors.textMedium,
  fontFamily: 'Montserrat', // Corregido de fontStyle a fontFamily
},

  // Banner
  banner: {
    backgroundColor: '#5e5d5d',
    paddingVertical: 5,
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#5e5d5d' ,
    letterSpacing: 4,
  },
  bannerSlogan: {
    fontSize: 25,
    color: '#5e5d5d' ,
    marginTop: 5,
    fontStyle: 'Montserrat-SemiBold',
  fontWeight: '600',
  textAlign: 'center',
  letterSpacing: -0.5,

  },
  backBtn: { width: 80 },
  backText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  bannerCenter: { alignItems: 'center', flex: 1 },
  bannerTitle: { fontSize: 28, fontWeight: 'bold', color: colors.white, letterSpacing: 4 },
  bannerSlogan: { fontSize: 12, color: colors.white, marginTop: 2 },
  backPlaceholder: { width: 80 },

  pasoContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 10, paddingHorizontal: 40 },
  pasoActivo: { width: 32, height: 33, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  pasoInactivo: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  pasoTextoActivo: { color: colors.white, fontWeight: 'bold', fontSize: 14 },
  pasoTextoInactivo: { color: colors.textLight, fontWeight: 'bold', fontSize: 14 },
  pasoLinea: { flex: 1, height: 2, backgroundColor: colors.border, marginHorizontal: 8 },
  pasoLineaActiva: { backgroundColor: colors.primary },
  pasoLabel: { textAlign: 'center', fontSize: 12, color: colors.textMedium, marginTop: 6, marginBottom: 4 },

  content: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 20 },
  card: {
    backgroundColor: colors.white, borderRadius: 20, padding: 28,
    width: '100%', maxWidth: 480,
    shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
  },
  cardTitle: { fontSize: 24, fontWeight: 'bold', color: colors.textDark, textAlign: 'center', marginBottom: 6 },
  cardSubtitle: { fontSize: 14, color: colors.textMedium, textAlign: 'center', marginBottom: 24 },
  exitoEmoji: { fontSize: 60, textAlign: 'center', marginBottom: 16 },
  campoContainer: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textDark, marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: colors.textDark, backgroundColor: colors.primaryPale },
  inputError: { borderColor: colors.error },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.primaryPale },
  inputPassword: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: colors.textDark },
  eyeBtn: { paddingHorizontal: 12 },
  eyeIcon: { fontSize: 18 },
  errorText: { color: colors.error, fontSize: 12, marginTop: 4, marginLeft: 4 },
  generoContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  generoBtn: { borderWidth: 1.5, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.primaryPale },
  generoBtnActivo: { borderColor: colors.primary, backgroundColor: colors.primary },
  generoBtnText: { fontSize: 13, color: colors.textMedium, fontWeight: '500' },
  generoBtnTextoActivo: { color: colors.white, fontWeight: 'bold' },
  resumenContainer: { backgroundColor: colors.primaryPale, borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  resumenTitulo: { fontSize: 13, fontWeight: 'bold', color: colors.textDark, marginBottom: 8 },
  resumenTexto: { fontSize: 13, color: colors.textMedium, marginBottom: 4 },
  btnPrimario: {
    backgroundColor: colors.primary, borderRadius: 25, paddingVertical: 14,
    alignItems: 'center', marginTop: 8,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  btnDisabled: { opacity: 0.7 },
  btnPrimarioText: { color: colors.white, fontSize: 16, fontWeight: 'bold' },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginText: { fontSize: 14, color: colors.textMedium },
  loginLink: { fontSize: 14, color: colors.primary, fontWeight: 'bold' },
  // Footer estilo "App Pro"
  footerColumnas: {
    backgroundColor: '#FADBD8', // Rosa suave MOMLY
    flexDirection: 'row',       // Esto crea las dos columnas
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