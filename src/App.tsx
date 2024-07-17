import { Button, DefaultTheme, PaperProvider } from 'react-native-paper';
import { NavigationContainer } from "@react-navigation/native"
import { AuthProvider, useAuth } from './app/context/AuthContext';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./app/screens/Home";
import Login from "./app/screens/Login";
import { StatusBar } from 'expo-status-bar';
import colors from './app/lib/Colors';

const Stack = createNativeStackNavigator()

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'rgb(37, 99, 235)',
    secondary: 'yellow',
  },
};

export default function App() {
  return (
    <AuthProvider>
      <PaperProvider theme={theme}>
        <StatusBar style='light' backgroundColor='black' />
        <Layout />
      </PaperProvider>
    </AuthProvider >
  );
}

function Layout() {
  const { authState, onLogout } = useAuth()

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {authState?.authenticated ?
          <Stack.Screen name="Home" component={Home} options={{
            title: 'SoigneMoi',
            headerTintColor: colors.primary,
            headerShadowVisible: false,
            headerRight: () => {
              return  (
                <Button mode='text' textColor='red' onPress={onLogout}>Déconnexion</Button>
              )
            }
          }} />
          :
          <Stack.Screen name="Login" component={Login} options={{
            headerShown: false
          }} />
        }
      </Stack.Navigator>
    </NavigationContainer>
  )
}