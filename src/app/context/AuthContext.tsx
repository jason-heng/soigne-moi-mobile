import * as SecureStore from "expo-secure-store"
import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react";
import axios from "axios"

interface AuthState {
    token: string | null;
}

interface AuthProps {
    authState?: AuthState;
    onLogin?: (registrationNumber: string, password: string) => Promise<any>;
    onLogout?: () => Promise<any>;
}

const TOKEN_KEY = 'soinge-moi-jwt'
export const API_URL = process.env.EXPO_PUBLIC_API_URL

const AuthContext = createContext<AuthProps>({})

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }: PropsWithChildren) {
    const [authState, setAuthState] = useState<AuthState>({ token: null })

    useEffect(() => {
        async function loadToken() {
            const token = await SecureStore.getItemAsync(TOKEN_KEY)

            if (token) {
                setAuthState({
                    token
                })

                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
            }
        }

        loadToken()
    }, [])

    async function login(registrationNumber: string, password: string) {
        try {
            console.log(`${API_URL}/doctor/auth`);

            const res = await axios.post(`${API_URL}/doctor/auth`, { registrationNumber, password })

            setAuthState({
                token: res.data.token
            })

            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`

            await SecureStore.setItemAsync(TOKEN_KEY, res.data.token)

            return res
        } catch (e) {
            return { error: true, msg: (e as any).response.data.msg, errors: (e as any).response.data.errors }
        }
    }

    async function logout() {
        await SecureStore.deleteItemAsync(TOKEN_KEY)

        axios.defaults.headers.common['Authorization'] = ''

        setAuthState({
            token: null
        })
    }

    const value: AuthProps = {
        authState,
        onLogin: login,
        onLogout: logout,
    }

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    )
}