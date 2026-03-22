import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, TextInput, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../constants/colors';
import { api } from '../../services/api';

export default function GaleriaScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubir, setLoadingSubir] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [fotoSeleccionada, setFotoSeleccionada] = useState(null);
  const [fotoActiva, setFotoActiva] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const usuarioData = await AsyncStorage.getItem('usuario');
      if (usuarioData) {
        const u = JSON.parse(usuarioData);
        setUsuario(u);
        cargarFotos(u.id);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarFotos = async (id) => {
    try {
      const response = await api.get(`/auth/galeria/${id}`);
      setFotos(response.data.data);
    } catch (error) {
      console.error('Error cargando fotos:', error);
    }
  };

  const seleccionarFoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFotoSeleccionada(event.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleSubir = async () => {
    if (!fotoSeleccionada) return;
    setLoadingSubir(true);
    try {
      await api.post('/auth/galeria', {
        id_usuario: usuario.id,
        imagen_base64: fotoSeleccionada,
        descripcion,
      });
      setFotoSeleccionada(null);
      setDescripcion('');
      setMostrarFormulario(false);
      cargarFotos(usuario.id);
    } catch (error) {
      console.error('Error subiendo foto:', error);
    } finally {
      setLoadingSubir(false);
    }
  };

  const handleEliminar = async (id_foto) => {
    if (Platform.OS === 'web') {
      const confirmar = window.confirm('¿Deseas eliminar esta foto?');
      if (!confirmar) return;
    }
    try {
      await api.delete(`/auth/galeria/${id_foto}`);
      setFotoActiva(null);
      cargarFotos(usuario.id);
    } catch (error) {
      console.error('Error eliminando foto:', error);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando galeria...</Text>
      </View>
    );
  }

  if (fotoActiva) {
    return (
      <View style={styles.container}>
        <View style={styles.banner}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setFotoActiva(null)}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <View style={styles.bannerCenter}>
            <Text style={styles.bannerTitle}>MOMLY</Text>
            <Text style={styles.bannerSlogan}>Galeria de Recuerdos</Text>
          </View>
          <View style={styles.backPlaceholder} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.fotoDetalleCard}>
            <img
              src={fotoActiva.url_imagen}
              alt={fotoActiva.descripcion || 'Foto'}
              style={{ width: '100%', borderRadius: 16, marginBottom: 16, maxHeight: 400, objectFit: 'contain', backgroundColor: '#f9f9f9' }}
            />
            {fotoActiva.descripcion ? (
              <Text style={styles.fotoDetalleDesc}>{fotoActiva.descripcion}</Text>
            ) : null}
            <Text style={styles.fotoDetalleFecha}>📅 {formatearFecha(fotoActiva.fecha)}</Text>
            <TouchableOpacity
              style={styles.btnEliminarFoto}
              onPress={() => handleEliminar(fotoActiva.id_foto)}
            >
              <Text style={styles.btnEliminarFotoText}>🗑️ Eliminar foto</Text>
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
          <Text style={styles.bannerTitle}>M🌸MLY</Text>
          <Text style={styles.bannerSlogan}>Galeria de Recuerdos</Text>
        </View>
        <View style={styles.backPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        <TouchableOpacity
          style={styles.btnAgregar}
          onPress={() => setMostrarFormulario(!mostrarFormulario)}
        >
          <Text style={styles.btnAgregarText}>
            {mostrarFormulario ? '✕ Cancelar' : '📸 Agregar foto'}
          </Text>
        </TouchableOpacity>

        {mostrarFormulario && (
          <View style={styles.formularioCard}>
            <Text style={styles.formularioTitulo}>Nueva foto 🌸</Text>

            <TouchableOpacity style={styles.btnSeleccionar} onPress={seleccionarFoto}>
              {fotoSeleccionada ? (
                <img
                  src={fotoSeleccionada}
                  alt="preview"
                  style={{ width: '100%', height: 200, objectFit: 'contain', borderRadius: 12, backgroundColor: '#f9f9f9' }}
                />
              ) : (
                <View style={styles.placeholderFoto}>
                  <Text style={styles.placeholderEmoji}>📷</Text>
                  <Text style={styles.placeholderText}>Toca para seleccionar una foto</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.campoContainer}>
              <Text style={styles.label}>Descripcion (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Primer sonrisa de Mario..."
                placeholderTextColor={colors.textLight}
                value={descripcion}
                onChangeText={setDescripcion}
              />
            </View>

            <TouchableOpacity
              style={[styles.btnSubir, (!fotoSeleccionada || loadingSubir) && styles.btnDisabled]}
              onPress={handleSubir}
              disabled={!fotoSeleccionada || loadingSubir}
            >
              {loadingSubir
                ? <ActivityIndicator color={colors.white} />
                : <Text style={styles.btnSubirText}>Subir foto 🌸</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        {fotos.length === 0 && !mostrarFormulario ? (
          <View style={styles.vacioCont}>
            <Text style={styles.vacioEmoji}>📸</Text>
            <Text style={styles.vacioTitulo}>Sin fotos aun</Text>
            <Text style={styles.vacioDesc}>Agrega la primera foto de tu pequeño para guardar este recuerdo especial</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {fotos.map(foto => (
              <TouchableOpacity
                key={foto.id_foto}
                style={styles.gridItem}
                onPress={() => setFotoActiva(foto)}
              >
                <img
                  src={foto.url_imagen}
                  alt={foto.descripcion || 'Foto'}
                  style={{ width: '100%', height: 150, objectFit: 'contain', borderRadius: 12, backgroundColor: '#f9f9f9' }}
                />
                {foto.descripcion ? (
                  <Text style={styles.gridItemDesc} numberOfLines={1}>{foto.descripcion}</Text>
                ) : null}
                <Text style={styles.gridItemFecha}>{formatearFecha(foto.fecha)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>🌸 MOMLY — contigo en cada primer paso</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  loadingText: { marginTop: 12, color: colors.textMedium, fontSize: 14 },

  banner: {
    backgroundColor: colors.primary, paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20,
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

  formularioCard: {
    backgroundColor: colors.white, borderRadius: 20, padding: 24, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
  },
  formularioTitulo: { fontSize: 16, fontWeight: 'bold', color: colors.textDark, marginBottom: 16 },

  btnSeleccionar: {
    borderWidth: 2, borderColor: colors.border, borderRadius: 12,
    borderStyle: 'dashed', marginBottom: 16, overflow: 'hidden',
  },
  placeholderFoto: {
    height: 150, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primaryPale,
  },
  placeholderEmoji: { fontSize: 40, marginBottom: 8 },
  placeholderText: { fontSize: 13, color: colors.textMedium },

  campoContainer: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textDark, marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 14,
    color: colors.textDark, backgroundColor: colors.primaryPale,
  },

  btnSubir: {
    backgroundColor: colors.primary, borderRadius: 25, paddingVertical: 12,
    alignItems: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  btnDisabled: { opacity: 0.5 },
  btnSubirText: { color: colors.white, fontSize: 15, fontWeight: 'bold' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: {
    width: '47%', backgroundColor: colors.white, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3, padding: 8,
  },
  gridItemDesc: { fontSize: 12, color: colors.textDark, marginTop: 6, fontWeight: '600' },
  gridItemFecha: { fontSize: 11, color: colors.textLight, marginTop: 2 },

  fotoDetalleCard: {
    backgroundColor: colors.white, borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
  },
  fotoDetalleDesc: { fontSize: 15, color: colors.textDark, marginBottom: 8, fontWeight: '600' },
  fotoDetalleFecha: { fontSize: 13, color: colors.textMedium, marginBottom: 16 },
  btnEliminarFoto: {
    backgroundColor: '#FFEBEE', borderRadius: 25, paddingVertical: 12,
    alignItems: 'center', borderWidth: 1.5, borderColor: colors.error,
  },
  btnEliminarFotoText: { fontSize: 14, color: colors.error, fontWeight: 'bold' },

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