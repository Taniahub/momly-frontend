import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
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
    </Stack>
  );
}