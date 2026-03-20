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
import { authService } from '../../services/api';
import { colors } from '../../constants/colors';

export default function OlvidastePasswordScreen() {
  const router = useRouter();
  const [correo, setCorreo] = useState('');
  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState({});

  const validar = () => {
    const nuevosErrores = {};
    if (!correo) {
      nuevosErrores.correo = 'El correo es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(correo)) {
      nuevosErrores.correo = 'Ingresa un correo válido';
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleEnviarCodigo = async () => {
    if (!validar()) return;
    setLoading(true);
    try {
      await authService.solicitarRecuperacion({ correo });
      // Navegamos a la pantalla de verificación pasando el correo
      router.push({
        pathname: '/(auth)/verificar-codigo',
        params: { correo },
      });
    } catch (error) {
      const mensaje =
        error.response?.data?.mensaje ||
        'No pudimos enviar el código. Verifica tu correo.';
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
          {/* Ícono */}
          <Text style={styles.icono}>🔑</Text>

          <Text style={styles.cardTitle}>¿Olvidaste tu contraseña?</Text>
          <Text style={styles.cardSubtitle}>
            No te preocupes 💕{'\n'}Te enviaremos un código a tu correo.
          </Text>

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

          {/* Botón enviar */}
          <TouchableOpacity
            style={[styles.btnPrimario, loading && styles.btnDisabled]}
            onPress={handleEnviarCodigo}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.btnPrimarioText}>Enviar código</Text>
            )}
          </TouchableOpacity>

          {/* Volver al login */}
          <TouchableOpacity
            style={styles.btnSecundario}
            onPress={() => router.back()}
          >
            <Text style={styles.btnSecundarioText}>← Volver al inicio de sesión</Text>
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  banner: {
    backgroundColor: colors.primary,
    paddingVertical: 5,
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#5e5d5d',
    letterSpacing: 4,
  },
  bannerSlogan: {
    fontSize: 25,
    color: '#5e5d5d',
    marginTop: 5,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
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
  icono: {
    fontSize: 48,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textMedium,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  campoContainer: {
    width: '100%',
    marginBottom: 20,
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
    width: '100%',
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  btnPrimario: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnPrimarioText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnSecundario: {
    marginTop: 16,
    paddingVertical: 8,
  },
  btnSecundarioText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
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
