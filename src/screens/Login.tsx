import React, { useRef, useState } from "react";
import { View, TouchableWithoutFeedback, Keyboard, TextInput as RNTextInput } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import colors from "../lib/Colors";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
    const { onLogin } = useAuth()

    const [registrationNumber, setRegistrationNumber] = useState("");
    const [password, setPassword] = useState("");
    const [registrationNumberError, setRegistrationNumberError] = useState<string>()
    const [passwordError, setPasswordError] = useState<string>()
    const [pending, setPending] = useState(false)

    const registrationNumberInputRef = useRef<RNTextInput>(null);
    const passwordInputRef = useRef<RNTextInput>(null);

    async function login() {
        setRegistrationNumberError(undefined)
        setPasswordError(undefined)
        setPending(true)

        const result = await onLogin!(registrationNumber, password)

        if (result && result.error) {
            if (result.msg) {
                alert(result.msg)
            }

            setRegistrationNumberError(result.errors.registrationNumber)
            setPasswordError(result.errors.password)
        }

        setPending(false)
    }

    const dismissKeyboardAndUnfocusInputs = () => {
        Keyboard.dismiss();

        if (registrationNumberInputRef.current) {
            registrationNumberInputRef.current.blur();
        }

        if (passwordInputRef.current) {
            passwordInputRef.current.blur();
        }
    };

    return (
        <TouchableWithoutFeedback onPress={dismissKeyboardAndUnfocusInputs}>
            <View style={{
                padding: 40,
                backgroundColor: 'white',
                height: '100%',
                justifyContent: 'center',
            }}>
                <Text variant="headlineSmall" style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: colors.primary,
                    marginBottom: '20%',
                    position: 'absolute',
                    alignSelf: 'center',
                    top: 80
                }}>SoigneMoi</Text>
                <Text variant="displaySmall" style={{
                    textAlign: 'center',
                    marginBottom: 40
                }}>Connexion</Text>

                <View style={{
                    marginBottom: 20
                }}>
                    <TextInput
                        keyboardType="numeric"
                        ref={registrationNumberInputRef}
                        mode="outlined"
                        label="Matricule"
                        placeholder="Entrez votre matricule..."
                        value={registrationNumber}
                        onChangeText={setRegistrationNumber}

                    />
                    {registrationNumberError && <Text style={{ color: 'red', opacity: 0.5}}>{registrationNumberError}</Text>}
                </View>

                <View style={{
                    marginBottom: 30
                }}>
                    <TextInput
                        ref={passwordInputRef}
                        mode="outlined"
                        secureTextEntry
                        label="Mot de passe"
                        placeholder="Entrez votre mot de passe..."
                        value={password}
                        onChangeText={setPassword}

                    />
                    {passwordError && <Text style={{ color: 'red', opacity: 0.5}}>{passwordError}</Text>}
                </View>

                <Button onPress={login} disabled={pending} loading={pending} mode="contained" style={{
                    borderRadius: 5
                }}>Se Connecter</Button>
            </View>
        </TouchableWithoutFeedback>
    );
}
