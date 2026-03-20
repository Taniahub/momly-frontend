/**
 * RUTA DONDE VA ESTE ARCHIVO:
 * frontend/context/AuthContext.jsx
 *
 * (crea la carpeta "context" si no existe dentro de frontend/)
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

// ─── Contexto ─────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

// ─── Provider — envuelve toda la app ─────────────────────────────────────────

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true mientras carga sesión

  // Al arrancar la app, lee la sesión guardada
  useEffect(() => {
    const cargarSesion = async () => {
      try {
        const usuarioGuardado = await AsyncStorage.getItem('usuario');
        if (usuarioGuardado) {
          setUser(JSON.parse(usuarioGuardado));
        }
      } catch (e) {
        console.warn('Error cargando sesión:', e);
      } finally {
        setLoading(false);
      }
    };
    cargarSesion();
  }, []);

  // Llamado después de login exitoso (ya lo hace tu login.jsx)
  // Solo actualiza el estado en memoria para que la UI reaccione
  const actualizarUsuario = async () => {
    try {
      const usuarioGuardado = await AsyncStorage.getItem('usuario');
      if (usuarioGuardado) setUser(JSON.parse(usuarioGuardado));
    } catch (e) {
      console.warn('Error actualizando usuario:', e);
    }
  };

  // Cierre de sesión — limpia AsyncStorage y redirige al login
  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'usuario', 'bebe']);
    } catch (e) {
      console.warn('Error al cerrar sesión:', e);
    } finally {
      setUser(null);
      router.replace('/(auth)/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, actualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook para usar en cualquier pantalla ─────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
