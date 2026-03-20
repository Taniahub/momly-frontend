import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../constants/colors';
import { useState, useRef } from 'react';

const { width, height } = Dimensions.get('window');

const SERVICIOS = [
  'Acompañamiento posparto',
  'Monitoreo del bienestar emocional',
  'Gestión del cuidado integral del bebé',
  'Administración de agenda y recordatorios',
  'Monitoreo de cansancio y fatiga',
  'Gestión de comunidad',
];

export default function LandingScreen() {
  const router = useRouter();
  const [verMasAbierto, setVerMasAbierto] = useState(false);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
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

      {/* Descripcion */}
      <View style={styles.descripcionContainer}>
        <Text style={styles.descripcion}>
          <Text style={styles.descripcionBold}>MOMLY </Text>
          Brinda acompañamiento integral a mamás primerizas durante las etapas
          de embarazo y postparto, ofreciendo apoyo, información y tranquilidad
          en cada momento.
        </Text>

        {/* Botón Ver Más / Ver Menos */}
        <TouchableOpacity
          style={styles.verMasBtn}
          onPress={() => setVerMasAbierto(!verMasAbierto)}
          activeOpacity={0.75}
        >
          <Text style={styles.verMasText}>
            {verMasAbierto ? 'Ver Menos ▲' : 'Ver Más ▼'}
          </Text>
        </TouchableOpacity>

        {/* Lista desplegable */}
        {verMasAbierto && (
          <View style={styles.desplegableContainer}>
            <Text style={styles.ofrecemosTitle}>¿Qué ofrece MOMLY?</Text>
            {SERVICIOS.map((item, index) => (
              <View key={index} style={styles.ofrecemosItem}>
                <Text style={styles.ofrecemosItemText}>🌸 {item}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Imagen ilustracion */}
      <View style={styles.ilustracionContainer}>
        <View style={styles.ilustracionCircle}>
          <Image
            source={require('../../assets/images/Uno.png')}
            style={styles.imagenRedonda}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Frase motivacional */}
      <View style={styles.fraseContainer}>
        <Text style={styles.frase}>
          Porque todo lo bueno{'\n'}empieza con un poco de{'\n'}miedo
        </Text>
      </View>

      {/* Que ofrece (sección completa debajo) */}
      <View style={styles.ofrecemosContainer}>
        <Text style={styles.ofrecemosTitle}>¿Qué ofrece MOMLY?</Text>
        {SERVICIOS.map((item, index) => (
          <View key={index} style={styles.ofrecemosItem}>
            <Text style={styles.ofrecemosItemText}>{item}</Text>
          </View>
        ))}

        <TouchableOpacity style={styles.verPlanesBtn}>
          <Text style={styles.verPlanesBtnText}>Ver Planes</Text>
        </TouchableOpacity>
      </View>

      {/* Frase unete */}
      <View style={styles.uneteContainer}>
        <Text style={styles.uneteText}>
          Únete a MOMLY y vive tu maternidad acompañada
        </Text>
      </View>

      {/* Botones */}
      <View style={styles.botonesContainer}>
        <TouchableOpacity
          style={styles.btnIniciarSesion}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.btnIniciarSesionText}>Iniciar sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnRegistrarse}
          onPress={() => router.push('/(auth)/registro')}
        >
          <Text style={styles.btnRegistrarseText}>Registrarse</Text>
        </TouchableOpacity>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
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
    paddingVertical: 30,
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

  // Descripcion
  descripcionContainer: {
    padding: 24,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  descripcion: {
    fontSize: 14,
    color: colors.textMedium,
    textAlign: 'center',
    lineHeight: 22,
  },
  descripcionBold: {
    fontWeight: 'bold',
    color: '#8E8E8E',
  },

  // Botón Ver Más
  verMasBtn: {
    marginTop: 16,
    backgroundColor: '#FADBD8',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
    alignSelf: 'center',
  },
  verMasText: {
    color: '#5D6D7E',
    fontSize: 13,
    fontFamily: 'Montserrat',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Desplegable dentro de descripción
  desplegableContainer: {
    marginTop: 20,
    width: '100%',
    backgroundColor: '#FFF6F4',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F5C6CE',
  },

  // Ilustracion
  ilustracionContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: colors.primaryPale,
  },
  ilustracionCircle: {
    width: 250,
    height: 250,
    borderRadius: 150,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  imagenRedonda: {
    width: '100%',
    height: '100%',
  },

  // Frase
  fraseContainer: {
    backgroundColor: '#EBADB2',
    paddingHorizontal: 25,
    paddingVertical: 20,
    borderRadius: 40,
    marginTop: 25,
    alignSelf: 'center',
    maxWidth: '80%',
  },
  frase: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 22,
    color: '#553830',
    textAlign: 'center',
    lineHeight: 25,
    letterSpacing: 0.5,
  },

  // Que ofrece (sección completa)
  ofrecemosContainer: {
    backgroundColor: colors.white,
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  ofrecemosTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 16,
    textAlign: 'center',
  },
  ofrecemosItem: {
    backgroundColor: colors.primaryPale,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  ofrecemosItemText: {
    fontSize: 13,
    color: colors.textDark,
  },
  verPlanesBtn: {
    marginTop: 12,
    backgroundColor: colors.primarySoft,
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  verPlanesBtnText: {
    color: colors.textDark,
    fontWeight: '600',
    fontSize: 14,
  },

  // Unete
  uneteContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  uneteText: {
    fontSize: 15,
    color: colors.textDark,
    textAlign: 'center',
    fontWeight: '600',
  },

  // Botones principales
  botonesContainer: {
    paddingHorizontal: 40,
    gap: 12,
    marginBottom: 30,
  },
  btnIniciarSesion: {
    backgroundColor: '#F7C6D0',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  btnIniciarSesionText: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: '600',
  },
  btnRegistrarse: {
    backgroundColor: colors.primarySoft,
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnRegistrarseText: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: '600',
  },

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
  },
});
