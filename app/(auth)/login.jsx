import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, api } from '../../services/api';
import { colors } from '../../constants/colors';

export default function LoginScreen() {
  const router = useRouter();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [errores, setErrores] = useState({});

  const validar = () => {
    const nuevosErrores = {};
    if (!correo) {
      nuevosErrores.correo = 'El correo es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(correo)) {
      nuevosErrores.correo = 'Ingresa un correo válido';
    }
    if (!password) {
      nuevosErrores.password = 'La contraseña es obligatoria';
    } else if (password.length < 6) {
      nuevosErrores.password = 'Mínimo 6 caracteres';
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleLogin = async () => {
  if (!validar()) return;
  setLoading(true);
  try {
    const response = await authService.login({ correo, password });
    const { token, usuario } = response.data;
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('usuario', JSON.stringify(usuario));

    const bebeResponse = await api.get(`/auth/bebe/${usuario.id}`);
    if (bebeResponse.data.ok) {
      const bebe = bebeResponse.data.data;
      await AsyncStorage.setItem('bebe', JSON.stringify({ id: bebe.id_bebe, nombre: bebe.nombre }));
    }
    router.replace('/(home)');
  } catch (error) {
    const mensaje = error.response?.data?.mensaje || 'Error al iniciar sesión';
    Alert.alert('Error', mensaje);
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

      {/* Contenido centrado */}
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Iniciar Sesión</Text>
          <Text style={styles.cardSubtitle}>Bienvenida de vuelta, mamá 💕</Text>

          {/* Campo correo */}
          <View style={styles.campoContainer}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={[styles.input, errores.correo && styles.inputError]}
              placeholder="ejemplo@correo.com"
              placeholderTextColor={colors.textLight}
              value={correo}
              onChangeText={(text) => {
                setCorreo(text);
                setErrores({ ...errores, correo: null });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errores.correo && (
              <Text style={styles.errorText}>{errores.correo}</Text>
            )}
          </View>

          {/* Campo password */}
          <View style={styles.campoContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={[
              styles.passwordContainer,
              errores.password && styles.inputError,
            ]}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Tu contraseña"
                placeholderTextColor={colors.textLight}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrores({ ...errores, password: null });
                }}
                secureTextEntry={!mostrarPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setMostrarPassword(!mostrarPassword)}
              >
                <Text style={styles.eyeIcon}>
                  {mostrarPassword ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>
            {errores.password && (
              <Text style={styles.errorText}>{errores.password}</Text>
            )}
          </View>

          {/* Boton login */}
          <TouchableOpacity
            style={[styles.btnLogin, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.btnLoginText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          {/* Ir a registro */}
          <View style={styles.registroContainer}>
            <Text style={styles.registroText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/registro')}>
              <Text style={styles.registroLink}>Regístrate aquí</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

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
    backgroundColor: colors.primary,
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
  backBtn: {
    width: 80,
  },
  backText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  bannerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  bannerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#5e5d5d' ,
    letterSpacing: 4,
  },
  bannerSlogan: {
    fontSize: 12,
    color: '#5e5d5d' ,
    marginTop: 4,
    fontStyle: 'italic',
  },
  backPlaceholder: {
    width: 80,
  },

  // Contenido centrado
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  // Card
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 480,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textMedium,
    textAlign: 'center',
    marginBottom: 24,
  },

  // Campos
  campoContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textDark,
    backgroundColor: colors.primaryPale,
  },
  inputError: {
    borderColor: colors.error,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.primaryPale,
  },
  inputPassword: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textDark,
  },
  eyeBtn: {
    paddingHorizontal: 12,
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },

  // Boton
  btnLogin: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnLoginText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Registro
  registroContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registroText: {
    fontSize: 14,
    color: colors.textMedium,
  },
  registroLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: 'bold',
  },

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
  },
});