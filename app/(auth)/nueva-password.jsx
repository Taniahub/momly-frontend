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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { authService } from '../../services/api';
import { colors } from '../../constants/colors';

export default function NuevaPasswordScreen() {
  const router = useRouter();
  const { correo, codigo } = useLocalSearchParams();

  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState({});

  const validar = () => {
    const nuevosErrores = {};
    if (!password) {
      nuevosErrores.password = 'La contraseña es obligatoria';
    } else if (password.length < 6) {
      nuevosErrores.password = 'Mínimo 6 caracteres';
    }
    if (!confirmar) {
      nuevosErrores.confirmar = 'Confirma tu contraseña';
    } else if (password !== confirmar) {
      nuevosErrores.confirmar = 'Las contraseñas no coinciden';
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Indicador de fortaleza de contraseña
  const calcularFortaleza = (pass) => {
    if (!pass) return { nivel: 0, texto: '', color: 'transparent' };
    let puntos = 0;
    if (pass.length >= 6) puntos++;
    if (pass.length >= 10) puntos++;
    if (/[A-Z]/.test(pass)) puntos++;
    if (/[0-9]/.test(pass)) puntos++;
    if (/[^A-Za-z0-9]/.test(pass)) puntos++;

    if (puntos <= 1) return { nivel: 1, texto: 'Débil', color: colors.error };
    if (puntos <= 3) return { nivel: 2, texto: 'Regular', color: '#F39C12' };
    return { nivel: 3, texto: 'Fuerte 💪', color: '#27AE60' };
  };

  const fortaleza = calcularFortaleza(password);

  const handleGuardar = async () => {
    if (!validar()) return;
    setLoading(true);
    try {
      await authService.restablecerPassword({ correo, codigo, nuevaPassword: password });
      if (Platform.OS === 'web') {
        window.alert('¡Contraseña actualizada con éxito! Ya puedes iniciar sesión.');
      } else {
        Alert.alert(
          '✅ ¡Listo!',
          'Tu contraseña fue actualizada. Inicia sesión con tu nueva contraseña.',
          [{ text: 'Iniciar sesión', onPress: () => router.replace('/(auth)/login') }]
        );
      }
    } catch (error) {
      const mensaje =
        error.response?.data?.mensaje ||
        'No pudimos actualizar la contraseña. Intenta de nuevo.';
      if (Platform.OS === 'web') {
        window.alert(mensaje);
      } else {
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
          source={require('../../assets/images/logo.png')}
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

          <Text style={styles.icono}>🔒</Text>
          <Text style={styles.cardTitle}>Nueva contraseña</Text>
          <Text style={styles.cardSubtitle}>
            Elige una contraseña segura 💕
          </Text>

          {/* Campo nueva contraseña */}
          <View style={styles.campoContainer}>
            <Text style={styles.label}>Nueva contraseña</Text>
            <View style={[
              styles.passwordContainer,
              errores.password && styles.inputError,
            ]}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Mínimo 6 caracteres"
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
                <Text style={styles.eyeIcon}>{mostrarPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {errores.password && (
              <Text style={styles.errorText}>{errores.password}</Text>
            )}

            {/* Barra de fortaleza */}
            {password.length > 0 && (
              <View style={styles.fortalezaContainer}>
                <View style={styles.barrasContainer}>
                  {[1, 2, 3].map((nivel) => (
                    <View
                      key={nivel}
                      style={[
                        styles.barra,
                        {
                          backgroundColor:
                            fortaleza.nivel >= nivel
                              ? fortaleza.color
                              : colors.border,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.fortalezaTexto, { color: fortaleza.color }]}>
                  {fortaleza.texto}
                </Text>
              </View>
            )}
          </View>

          {/* Confirmar contraseña */}
          <View style={styles.campoContainer}>
            <Text style={styles.label}>Confirmar contraseña</Text>
            <View style={[
              styles.passwordContainer,
              errores.confirmar && styles.inputError,
            ]}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Repite tu contraseña"
                placeholderTextColor={colors.textLight}
                value={confirmar}
                onChangeText={(text) => {
                  setConfirmar(text);
                  setErrores({ ...errores, confirmar: null });
                }}
                secureTextEntry={!mostrarConfirmar}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setMostrarConfirmar(!mostrarConfirmar)}
              >
                <Text style={styles.eyeIcon}>{mostrarConfirmar ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {errores.confirmar && (
              <Text style={styles.errorText}>{errores.confirmar}</Text>
            )}
            {/* Check si coinciden */}
            {confirmar.length > 0 && password === confirmar && (
              <Text style={styles.matchText}>✅ Las contraseñas coinciden</Text>
            )}
          </View>

          {/* Botón guardar */}
          <TouchableOpacity
            style={[styles.btnPrimario, loading && styles.btnDisabled]}
            onPress={handleGuardar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.btnPrimarioText}>Guardar nueva contraseña</Text>
            )}
          </TouchableOpacity>

        </View>
      </View>

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 10,
    backgroundColor: '#FFF1E6',
  },
  logoImagen: { width: 100, height: 40 },
  slogan: { fontSize: 11, color: colors.textMedium, fontFamily: 'Montserrat' },
  banner: { backgroundColor: colors.primary, paddingVertical: 5, alignItems: 'center' },
  bannerTitle: { fontSize: 30, fontWeight: 'bold', color: '#5e5d5d', letterSpacing: 4 },
  bannerSlogan: {
    fontSize: 25, color: '#5e5d5d', marginTop: 5,
    fontWeight: '600', textAlign: 'center', letterSpacing: -0.5,
  },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
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
    alignItems: 'center',
  },
  icono: { fontSize: 48, marginBottom: 12 },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: colors.textDark, textAlign: 'center', marginBottom: 8 },
  cardSubtitle: { fontSize: 14, color: colors.textMedium, textAlign: 'center', marginBottom: 24 },
  campoContainer: { width: '100%', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textDark, marginBottom: 6 },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.primaryPale,
  },
  inputPassword: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: colors.textDark },
  eyeBtn: { paddingHorizontal: 12 },
  eyeIcon: { fontSize: 18 },
  inputError: { borderColor: colors.error },
  errorText: { color: colors.error, fontSize: 12, marginTop: 4, marginLeft: 4 },
  matchText: { color: '#27AE60', fontSize: 12, marginTop: 4, marginLeft: 4 },
  // Fortaleza
  fortalezaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  barrasContainer: { flexDirection: 'row', gap: 4, flex: 1 },
  barra: { flex: 1, height: 4, borderRadius: 2 },
  fortalezaTexto: { fontSize: 12, fontWeight: '600', minWidth: 70 },
  // Botón
  btnPrimario: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnDisabled: { opacity: 0.7 },
  btnPrimarioText: { color: colors.white, fontSize: 16, fontWeight: 'bold' },
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
