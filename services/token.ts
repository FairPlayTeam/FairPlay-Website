import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'fp_session_key';
let cached: string | null | undefined;

export async function getToken(): Promise<string | null> {
  if (cached !== undefined) return cached;
  const v = await AsyncStorage.getItem(KEY);
  cached = v;
  return v;
}

export async function setToken(value: string): Promise<void> {
  cached = value;
  await AsyncStorage.setItem(KEY, value);
}

export async function clearToken(): Promise<void> {
  cached = null;
  await AsyncStorage.removeItem(KEY);
}

export function getCachedToken(): string | null {
  return cached ?? null;
}
