import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, Platform, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../constants/colors';

export default function HomeScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    cargarUsuario();
  }, []);

  const cargarUsuario = async () => {
    try {
      const data = await AsyncStorage.getItem('usuario');
      if (data) setUsuario(JSON.parse(data));
    } catch (error) {
      console.log(error);
    }
  };

  const handleCerrarSesion = async () => {
  if (Platform.OS === 'web') {
    const confirmar = window.confirm('¿Estás segura que deseas salir?');
    if (!confirmar) return;
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('usuario');
    router.replace('/(auth)');
  } else {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás segura que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('usuario');
            router.replace('/(auth)');
          },
        },
      ]
    );
  }
};

  const modulos = [
    {
      emoji: '📚',
      titulo: 'Guías de Recuperación',
      descripcion: 'Física y emocional',
      disponible: true,
      ruta: '/(home)/guias',
    },
    {
      emoji: '🗓️',
      titulo: 'Citas y Recordatorios',
      descripcion: 'Gestiona tus citas médicas',
      disponible: true,
      ruta: '/(home)/citas',
    },
    {
      emoji: '❓',
      titulo: '¿Es Normal?',
      descripcion: 'Consulta situaciones comunes',
      disponible: false,
    },
    {
      emoji: '💆',
      titulo: 'Bienestar Emocional',
      descripcion: 'Monitoreo de tu estado emocional',
      disponible: true,
      ruta: '/(home)/bienestar',
    },
    {
      emoji: '💉',
      titulo: 'Calendario de Vacunación',
      descripcion: 'Lleva el control de las vacunas de tu bebé',
      disponible: true,
      ruta: '/(home)/vacunas',
    },
    {
      emoji: '📚',
      titulo: 'Biblioteca del bebé',
      descripcion: 'Lactancia, sueño, alimentación y más',
      disponible: true,
      ruta: '/(home)/biblioteca',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

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

      {/* Bienvenida */}
      <View style={styles.bienvenidaContainer}>
        <Text style={styles.bienvenida}>¡Hola, {usuario?.nombre || 'Mamá'}! 👋</Text>
        <Text style={styles.subtitulo}>Bienvenida a MOMLY 🌸</Text>
      </View>

      {/* Info usuario */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Tu cuenta</Text>
        <Text style={styles.infoItem}>👤 {usuario?.nombre}</Text>
        <Text style={styles.infoItem}>📧 {usuario?.correo}</Text>
        <Text style={styles.infoItem}>⭐ Plan {usuario?.tipo_usuario}</Text>
      </View>

      {/* Módulos */}
      <Text style={styles.modulosTitulo}>¿Qué quieres hacer hoy?</Text>

      <View style={styles.modulosGrid}>
        {modulos.map((modulo, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.moduloCard, !modulo.disponible && styles.moduloCardDisponible]}
            onPress={() => {
              if (modulo.disponible) {
                router.push(modulo.ruta);
              } else {
                Alert.alert('Próximamente', 'Esta funcionalidad estará disponible muy pronto 🌸');
              }
            }}
          >
            <Text style={styles.moduloEmoji}>{modulo.emoji}</Text>
            <Text style={[styles.moduloTitulo, !modulo.disponible && styles.moduloTextoDisponible]}>
              {modulo.titulo}
            </Text>
            <Text style={[styles.moduloDesc, !modulo.disponible && styles.moduloTextoDisponible]}>
              {modulo.descripcion}
            </Text>
            {!modulo.disponible && (
              <View style={styles.proximamenteBadge}>
                <Text style={styles.proximamenteText}>Próximamente</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Cerrar sesión */}
      <TouchableOpacity style={styles.btnCerrarSesion} onPress={handleCerrarSesion}>
        <Text style={styles.btnCerrarSesionText}>Cerrar Sesión</Text>
      </TouchableOpacity>

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

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },

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
  bannerTitle: { fontSize: 36, fontWeight: 'bold', color: colors.white, letterSpacing: 4 },
  bannerSlogan: { fontSize: 13, color: colors.white, marginTop: 5, fontStyle: 'italic' },

  bienvenidaContainer: { alignItems: 'center', paddingVertical: 24 },
  bienvenida: { fontSize: 24, fontWeight: 'bold', color: colors.textDark },
  subtitulo: { fontSize: 15, color: colors.primary, marginTop: 4, fontWeight: '600' },

  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 16, padding: 20,
    marginHorizontal: 24, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    borderLeftWidth: 4, borderLeftColor: colors.primary,
  },
  infoTitle: { fontSize: 15, fontWeight: 'bold', color: colors.textDark, marginBottom: 10 },
  infoItem: { fontSize: 14, color: colors.textMedium, marginBottom: 6 },

  modulosTitulo: {
    fontSize: 16, fontWeight: 'bold', color: colors.textDark,
    textAlign: 'center', marginBottom: 16,
  },
  modulosGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, gap: 12,
    justifyContent: 'center', marginBottom: 30,
  },
  moduloCard: {
    backgroundColor: colors.white,
    borderRadius: 16, padding: 20,
    width: '45%', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    borderWidth: 2, borderColor: colors.primary,
  },
  moduloCardDisponible: {
    borderColor: colors.border,
    opacity: 0.7,
  },
  moduloEmoji: { fontSize: 32, marginBottom: 8 },
  moduloTitulo: { fontSize: 13, fontWeight: 'bold', color: colors.textDark, textAlign: 'center', marginBottom: 4 },
  moduloDesc: { fontSize: 11, color: colors.textMedium, textAlign: 'center' },
  moduloTextoDisponible: { color: colors.textLight },
  proximamenteBadge: {
    marginTop: 8, backgroundColor: colors.primaryPale,
    borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3,
  },
  proximamenteText: { fontSize: 10, color: colors.primary, fontWeight: '600' },

  btnCerrarSesion: {
    marginHorizontal: 40, marginBottom: 30,
    borderWidth: 2, borderColor: colors.primary,
    borderRadius: 25, paddingVertical: 12, alignItems: 'center',
    backgroundColor: colors.primarySoft,
  },
  btnCerrarSesionText: { color: colors.textDark, fontSize: 15, fontWeight: 'bold' },

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
  },});