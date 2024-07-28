import { Button, DefaultTheme, IconButton, PaperProvider } from 'react-native-paper';
import { NavigationContainer } from "@react-navigation/native"
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./src/screens/Home";
import Login from "./src/screens/Login";
import { StatusBar } from 'expo-status-bar';
import colors from './src/lib/Colors';
import PatientScreen from './src/screens/Patient';

export type ScreensParamsList = {
  Home: undefined,
  Login: undefined,
  Patient: { id: number, fullName: string }
}

const Stack = createNativeStackNavigator<ScreensParamsList>()

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...colors
  },
};

export default function App() {
  return (
    <AuthProvider>
      <PaperProvider theme={theme}>
        <StatusBar style='light' backgroundColor={colors.tertiary} />
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
        {authState?.token ?
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                title: 'SoigneMoi',
                headerTintColor: colors.secondary,
                headerStyle: {
                  backgroundColor: colors.tertiary
                },
                headerRight: () => {
                  return (
                    <IconButton icon="logout" iconColor='white' onPress={onLogout} />
                  )
                }
              }} />
            <Stack.Screen
              name="Patient"
              component={PatientScreen}
              options={({ route }) => ({
                title: route.params.fullName,
                headerTintColor: colors.secondary,
                headerStyle: {
                  backgroundColor: colors.tertiary
                },
              })} />
          </>
          :
          <Stack.Screen name="Login" component={Login} options={{
            headerShown: false
          }} />
        }
      </Stack.Navigator>
    </NavigationContainer>
  )
}