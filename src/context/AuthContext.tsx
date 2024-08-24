import * as SecureStore from "expo-secure-store"
import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useState } from "react";
import axios from "axios"
import * as SplashScreen from 'expo-splash-screen';
import { View } from "react-native";

interface AuthState {
    token: string | null;
    firstName: string | null;
}

interface AuthProps {
    authState?: AuthState;
    onLogin?: (registrationNumber: string, password: string) => Promise<any>;
    onLogout?: () => Promise<any>;
}

const TOKEN_KEY = 'soinge-moi-jwt'
const FIRSTNAME_KEY = 'soinge-moi-firstName'
export const API_URL = process.env.EXPO_PUBLIC_API_URL

SplashScreen.preventAutoHideAsync();

const AuthContext = createContext<AuthProps>({})

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }: PropsWithChildren) {
    const [authState, setAuthState] = useState<AuthState>({ token: null, firstName: null })
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        async function loadToken() {
            const token = await SecureStore.getItemAsync(TOKEN_KEY)
            const firstName = await SecureStore.getItemAsync(FIRSTNAME_KEY)

            if (token) {
                setAuthState({
                    token,
                    firstName
                })

                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
            }

            setAppIsReady(true);
        }

        loadToken()
    }, [])

    async function login(registrationNumber: string, password: string) {
        interface Response {
            token: string;
            firstName: string;
        }

        try {
            const { data } = await axios.post<Response>(`${API_URL}/doctor/auth`, { registrationNumber, password })

            setAuthState(data)

            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

            await SecureStore.setItemAsync(TOKEN_KEY, data.token)
            await SecureStore.setItemAsync(FIRSTNAME_KEY, data.token)

            return data
        } catch (e) {
            return { error: true, msg: (e as any).response.data.msg, errors: (e as any).response.data.errors }
        }
    }

    async function logout() {
        await SecureStore.deleteItemAsync(TOKEN_KEY)
        await SecureStore.deleteItemAsync(FIRSTNAME_KEY)

        axios.defaults.headers.common['Authorization'] = ''

        setAuthState({
            token: null,
            firstName: null
        })
    }

    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            await SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    if (!appIsReady) {
        return null;
    }

    const value: AuthProps = {
        authState,
        onLogin: login,
        onLogout: logout,
    }

    return (
        <AuthContext.Provider value={value}>
            <View onLayout={onLayoutRootView} style={{ flex: 1, }}>
                {children}
            </View>
        </AuthContext.Provider>
    )
}