import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, ActivityIndicator, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { colors } from '../../constants/colors';

export default function ComunidadScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [contenido, setContenido] = useState('');
  const [anonimo, setAnonimo] = useState(false);
  const [loadingPublicar, setLoadingPublicar] = useState(false);
  const [publicacionActiva, setPublicacionActiva] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [loadingComentario, setLoadingComentario] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const usuarioData = await AsyncStorage.getItem('usuario');
      if (usuarioData) {
        setUsuario(JSON.parse(usuarioData));
      }
      cargarPublicaciones();
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarPublicaciones = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/auth/publicaciones');
      setPublicaciones(response.data.data);
    } catch (error) {
      console.error('Error cargando publicaciones:', error);
    }
  };

  const cargarComentarios = async (id_publicacion) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/auth/comentarios/${id_publicacion}`);
      setComentarios(response.data.data);
    } catch (error) {
      console.error('Error cargando comentarios:', error);
    }
  };

  const handlePublicar = async () => {
    if (!contenido.trim()) return;
    setLoadingPublicar(true);
    try {
      await axios.post('http://localhost:3000/api/auth/publicaciones', {
        id_usuario: usuario.id,
        contenido,
        anonimo: anonimo ? 1 : 0,
      });
      setContenido('');
      setAnonimo(false);
      setMostrarFormulario(false);
      cargarPublicaciones();
    } catch (error) {
      console.error('Error publicando:', error);
    } finally {
      setLoadingPublicar(false);
    }
  };

  const handleEliminar = async (id_publicacion) => {
    if (Platform.OS === 'web') {
      const confirmar = window.confirm('¿Deseas eliminar esta publicacion?');
      if (!confirmar) return;
    }
    try {
      await axios.delete(`http://localhost:3000/api/auth/publicaciones/${id_publicacion}`);
      cargarPublicaciones();
    } catch (error) {
      console.error('Error eliminando publicacion:', error);
    }
  };

  const handleAbrirPublicacion = (pub) => {
    setPublicacionActiva(pub);
    cargarComentarios(pub.id_publicacion);
  };

  const handleComentario = async () => {
    if (!nuevoComentario.trim()) return;
    setLoadingComentario(true);
    try {
      await axios.post('http://localhost:3000/api/auth/comentarios', {
        id_publicacion: publicacionActiva.id_publicacion,
        id_usuario: usuario.id,
        comentario: nuevoComentario,
      });
      setNuevoComentario('');
      cargarComentarios(publicacionActiva.id_publicacion);
      cargarPublicaciones();
    } catch (error) {
      console.error('Error comentando:', error);
    } finally {
      setLoadingComentario(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando comunidad...</Text>
      </View>
    );
  }

  // Vista de detalle de publicación
  if (publicacionActiva) {
    return (
      <View style={styles.container}>
        <View style={styles.banner}>
          <TouchableOpacity style={styles.backBtn} onPress={() => { setPublicacionActiva(null); setComentarios([]); }}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <View style={styles.bannerCenter}>
            <Text style={styles.bannerTitle}>MOMLY</Text>
            <Text style={styles.bannerSlogan}>Comunidad</Text>
          </View>
          <View style={styles.backPlaceholder} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.pubDetalleCard}>
            <View style={styles.pubHeader}>
              <View style={styles.pubAvatar}>
                <Text style={styles.pubAvatarText}>
                  {publicacionActiva.anonimo ? '?' : publicacionActiva.nombre_usuario?.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.pubNombre}>
                  {publicacionActiva.anonimo ? 'Mama Anonima' : publicacionActiva.nombre_usuario}
                </Text>
                <Text style={styles.pubFecha}>{formatearFecha(publicacionActiva.fecha_publicacion)}</Text>
              </View>
              {publicacionActiva.anonimo === 1 && (
                <View style={styles.anonimoBadge}>
                  <Text style={styles.anonimoText}>Anonima</Text>
                </View>
              )}
            </View>
            <Text style={styles.pubContenido}>{publicacionActiva.contenido}</Text>
          </View>

          <Text style={styles.comentariosTitulo}>
            💬 {comentarios.length} comentario(s)
          </Text>

          {comentarios.map(c => (
            <View key={c.id_comentario} style={styles.comentarioCard}>
              <View style={styles.comentarioAvatar}>
                <Text style={styles.comentarioAvatarText}>{c.nombre?.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.comentarioInfo}>
                <Text style={styles.comentarioNombre}>{c.nombre}</Text>
                <Text style={styles.comentarioTexto}>{c.comentario}</Text>
                <Text style={styles.comentarioFecha}>{formatearFecha(c.fecha)}</Text>
              </View>
            </View>
          ))}

          {comentarios.length === 0 && (
            <View style={styles.sinComentarios}>
              <Text style={styles.sinComentariosText}>Se la primera en comentar 💕</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.comentarioInputContainer}>
          <TextInput
            style={styles.comentarioInput}
            placeholder="Escribe un comentario..."
            placeholderTextColor={colors.textLight}
            value={nuevoComentario}
            onChangeText={setNuevoComentario}
            multiline
          />
          <TouchableOpacity
            style={[styles.btnEnviar, loadingComentario && styles.btnDisabled]}
            onPress={handleComentario}
            disabled={loadingComentario}
          >
            {loadingComentario
              ? <ActivityIndicator color={colors.white} size="small" />
              : <Text style={styles.btnEnviarText}>→</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>🌸 MOMLY — contigo en cada primer paso</Text>
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
          <Text style={styles.bannerSlogan}>Comunidad</Text>
        </View>
        <View style={styles.backPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        <TouchableOpacity
          style={styles.btnNuevaPublicacion}
          onPress={() => setMostrarFormulario(!mostrarFormulario)}
        >
          <Text style={styles.btnNuevaPublicacionText}>
            {mostrarFormulario ? '✕ Cancelar' : '✏️ Nueva publicacion'}
          </Text>
        </TouchableOpacity>

        {mostrarFormulario && (
          <View style={styles.formularioCard}>
            <Text style={styles.formularioTitulo}>Compartir con la comunidad 🌸</Text>
            <TextInput
              style={styles.formularioInput}
              placeholder="Que quieres compartir hoy?"
              placeholderTextColor={colors.textLight}
              value={contenido}
              onChangeText={setContenido}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity
              style={styles.anonimoContainer}
              onPress={() => setAnonimo(!anonimo)}
            >
              <View style={[styles.checkbox, anonimo && styles.checkboxActivo]}>
                {anonimo && <Text style={styles.checkboxCheck}>✓</Text>}
              </View>
              <Text style={styles.anonimoLabel}>Publicar de forma anonima</Text>
            </TouchableOpacity>
            {anonimo && (
              <Text style={styles.anonimoNota}>
                Tu nombre no sera visible para otros usuarios
              </Text>
            )}
            <TouchableOpacity
              style={[styles.btnPublicar, loadingPublicar && styles.btnDisabled]}
              onPress={handlePublicar}
              disabled={loadingPublicar}
            >
              {loadingPublicar
                ? <ActivityIndicator color={colors.white} />
                : <Text style={styles.btnPublicarText}>Publicar 🌸</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        {publicaciones.length === 0 ? (
          <View style={styles.vacioCont}>
            <Text style={styles.vacioEmoji}>👥</Text>
            <Text style={styles.vacioTitulo}>Sin publicaciones aun</Text>
            <Text style={styles.vacioDesc}>Se la primera en compartir algo con la comunidad</Text>
          </View>
        ) : (
          publicaciones.map(pub => (
            <TouchableOpacity
              key={pub.id_publicacion}
              style={styles.pubCard}
              onPress={() => handleAbrirPublicacion(pub)}
            >
              <View style={styles.pubHeader}>
                <View style={styles.pubAvatar}>
                  <Text style={styles.pubAvatarText}>
                    {pub.anonimo ? '?' : pub.nombre_usuario?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.pubHeaderInfo}>
                  <Text style={styles.pubNombre}>
                    {pub.anonimo ? 'Mama Anonima' : pub.nombre_usuario}
                  </Text>
                  <Text style={styles.pubFecha}>{formatearFecha(pub.fecha_publicacion)}</Text>
                </View>
                {pub.anonimo === 1 && (
                  <View style={styles.anonimoBadge}>
                    <Text style={styles.anonimoText}>Anonima</Text>
                  </View>
                )}
              </View>
              <Text style={styles.pubContenido} numberOfLines={3}>{pub.contenido}</Text>
              <View style={styles.pubFooter}>
                <Text style={styles.pubComentarios}>💬 {pub.total_comentarios} comentario(s)</Text>
                {pub.id_usuario === usuario?.id && (
                  <TouchableOpacity
                    onPress={(e) => { e.stopPropagation(); handleEliminar(pub.id_publicacion); }}
                  >
                    <Text style={styles.pubEliminar}>🗑️</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))
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

  btnNuevaPublicacion: {
    backgroundColor: colors.primary, borderRadius: 25, paddingVertical: 12,
    alignItems: 'center', marginBottom: 20,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  btnNuevaPublicacionText: { color: colors.white, fontSize: 15, fontWeight: 'bold' },

  formularioCard: {
    backgroundColor: colors.white, borderRadius: 20, padding: 24, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
  },
  formularioTitulo: { fontSize: 16, fontWeight: 'bold', color: colors.textDark, marginBottom: 16 },
  formularioInput: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 14,
    color: colors.textDark, backgroundColor: colors.primaryPale,
    minHeight: 100, textAlignVertical: 'top', marginBottom: 16,
  },
  anonimoContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxActivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxCheck: { color: colors.white, fontSize: 13, fontWeight: 'bold' },
  anonimoLabel: { fontSize: 14, color: colors.textMedium },
  anonimoNota: { fontSize: 12, color: colors.primary, marginBottom: 16, marginLeft: 32 },
  btnPublicar: {
    backgroundColor: colors.primary, borderRadius: 25, paddingVertical: 12,
    alignItems: 'center', marginTop: 8,
  },
  btnDisabled: { opacity: 0.7 },
  btnPublicarText: { color: colors.white, fontSize: 15, fontWeight: 'bold' },

  pubCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  pubDetalleCard: {
    backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  pubHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  pubHeaderInfo: { flex: 1 },
  pubAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  pubAvatarText: { color: colors.white, fontSize: 16, fontWeight: 'bold' },
  pubNombre: { fontSize: 14, fontWeight: 'bold', color: colors.textDark },
  pubFecha: { fontSize: 11, color: colors.textLight },
  anonimoBadge: {
    backgroundColor: colors.primaryPale, borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  anonimoText: { fontSize: 10, color: colors.primary, fontWeight: '600' },
  pubContenido: { fontSize: 14, color: colors.textDark, lineHeight: 22, marginBottom: 12 },
  pubFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pubComentarios: { fontSize: 12, color: colors.textMedium },
  pubEliminar: { fontSize: 18 },

  comentariosTitulo: { fontSize: 15, fontWeight: 'bold', color: colors.textDark, marginBottom: 12 },
  comentarioCard: {
    flexDirection: 'row', gap: 10, marginBottom: 12,
    backgroundColor: colors.white, borderRadius: 12, padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  comentarioAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center',
  },
  comentarioAvatarText: { color: colors.primary, fontSize: 13, fontWeight: 'bold' },
  comentarioInfo: { flex: 1 },
  comentarioNombre: { fontSize: 13, fontWeight: 'bold', color: colors.textDark, marginBottom: 2 },
  comentarioTexto: { fontSize: 13, color: colors.textDark, lineHeight: 20 },
  comentarioFecha: { fontSize: 11, color: colors.textLight, marginTop: 4 },

  sinComentarios: { alignItems: 'center', padding: 20 },
  sinComentariosText: { fontSize: 13, color: colors.textMedium },

  comentarioInputContainer: {
    flexDirection: 'row', padding: 16, gap: 10,
    backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border,
  },
  comentarioInput: {
    flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 14,
    color: colors.textDark, backgroundColor: colors.primaryPale, maxHeight: 80,
  },
  btnEnviar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  btnEnviarText: { color: colors.white, fontSize: 20, fontWeight: 'bold' },

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


