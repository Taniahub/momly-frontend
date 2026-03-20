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
import { useState, useRef } from 'react';
import { authService } from '../../services/api';
import { colors } from '../../constants/colors';

export default function VerificarCodigoScreen() {
  const router = useRouter();
  const { correo } = useLocalSearchParams();

  // 6 inputs individuales para el código
  const [codigo, setCodigo] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [loadingReenvio, setLoadingReenvio] = useState(false);
  const [error, setError] = useState('');
  const inputs = useRef([]);

  const handleCambiarDigito = (texto, index) => {
    const nuevo = [...codigo];
    // Solo acepta dígitos
    const digito = texto.replace(/[^0-9]/g, '').slice(-1);
    nuevo[index] = digito;
    setCodigo(nuevo);
    setError('');

    // Avanza al siguiente campo automáticamente
    if (digito && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Retrocede al campo anterior si borra
    if (e.nativeEvent.key === 'Backspace' && !codigo[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const codigoCompleto = codigo.join('');

  const handleVerificar = async () => {
    if (codigoCompleto.length < 6) {
      setError('Ingresa los 6 dígitos del código');
      return;
    }
    setLoading(true);
    try {
      await authService.verificarCodigo({ correo, codigo: codigoCompleto });
      // Navegamos a nueva contraseña pasando correo y código verificado
      router.push({
        pathname: '/(auth)/nueva-password',
        params: { correo, codigo: codigoCompleto },
      });
    } catch (error) {
      const mensaje =
        error.response?.data?.mensaje ||
        'Código incorrecto o expirado. Intenta de nuevo.';
      setError(mensaje);
    } finally {
      setLoading(false);
    }
  };

  const handleReenviar = async () => {
    setLoadingReenvio(true);
    setError('');
    try {
      await authService.solicitarRecuperacion({ correo });
      if (Platform.OS === 'web') {
        window.alert('¡Código reenviado! Revisa tu correo.');
      } else {
        Alert.alert('✅ Código reenviado', 'Revisa tu correo electrónico.');
      }
      // Limpiar inputs
      setCodigo(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } catch (error) {
      setError('No pudimos reenviar el código. Intenta más tarde.');
    } finally {
      setLoadingReenvio(false);
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

          <Text style={styles.icono}>📬</Text>
          <Text style={styles.cardTitle}>Revisa tu correo</Text>
          <Text style={styles.cardSubtitle}>
            Enviamos un código de 6 dígitos a{'\n'}
            <Text style={styles.correoResaltado}>{correo}</Text>
          </Text>

          {/* Inputs del código */}
          <View style={styles.codigoContainer}>
            {codigo.map((digito, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputs.current[index] = ref)}
                style={[
                  styles.digitoInput,
                  digito ? styles.digitoActivo : null,
                  error ? styles.digitoError : null,
                ]}
                value={digito}
                onChangeText={(texto) => handleCambiarDigito(texto, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Error */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Botón verificar */}
          <TouchableOpacity
            style={[
              styles.btnPrimario,
              (loading || codigoCompleto.length < 6) && styles.btnDisabled,
            ]}
            onPress={handleVerificar}
            disabled={loading || codigoCompleto.length < 6}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.btnPrimarioText}>Verificar código</Text>
            )}
          </TouchableOpacity>

          {/* Reenviar */}
          <View style={styles.reenvioContainer}>
            <Text style={styles.reenvioText}>¿No recibiste el código? </Text>
            <TouchableOpacity onPress={handleReenviar} disabled={loadingReenvio}>
              {loadingReenvio ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={styles.reenvioLink}>Reenviar</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Volver */}
          <TouchableOpacity
            style={styles.btnSecundario}
            onPress={() => router.back()}
          >
            <Text style={styles.btnSecundarioText}>← Cambiar correo</Text>
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
  logoImagen: { width: 100, height: 40 },
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
    lineHeight: 22,
  },
  correoResaltado: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  // Inputs del código OTP
  codigoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
    gap: 8,
  },
  digitoInput: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 52,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textDark,
    backgroundColor: colors.primaryPale,
    textAlign: 'center',
  },
  digitoActivo: {
    borderColor: colors.primary,
    backgroundColor: '#FFF1E6',
  },
  digitoError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
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
  btnDisabled: { opacity: 0.5 },
  btnPrimarioText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  reenvioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  reenvioText: {
    fontSize: 13,
    color: colors.textMedium,
  },
  reenvioLink: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: 'bold',
  },
  btnSecundario: {
    marginTop: 12,
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
