import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import MomlyNavigation from '../../components/MomlyNavigation';

function NavWrapper({ children }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const nombreUsuario = user?.nombre ?? user?.name ?? 'mamá';

  const handleNavigate = (key) => {
    if (key !== 'index') router.push(`/(home)/${key}`);
    else router.replace('/(home)');
  };

  return (
    <View style={{ flex: 1 }}>
      <MomlyNavigation
        user={{ ...user, name: nombreUsuario }}
        onLogout={logout}
        onNavigate={handleNavigate}
      />
      {children}
    </View>
  );
}

export default function HomeLayout() {
  return (
    <NavWrapper>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="guias" />
        <Stack.Screen name="bienestar" />
        <Stack.Screen name="citas" />
        <Stack.Screen name="biblioteca" />
        <Stack.Screen name="esnormal" />
        <Stack.Screen name="acompanamiento" />
        <Stack.Screen name="sugerencias" />
        <Stack.Screen name="premium" />
        <Stack.Screen name="comunidad" />
        <Stack.Screen name="especialistas" />
        <Stack.Screen name="galeria" />
        <Stack.Screen name="vacunas" />
      </Stack>
    </NavWrapper>
  );
}