import { ScrollView, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios, { AxiosError } from 'axios'
import { API_URL, useAuth } from '../context/AuthContext'
import { ActivityIndicator, IconButton, Searchbar, Text } from 'react-native-paper'
import { formatDate } from '../lib/utils'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ScreensParamsList } from '../../App'
import colors from '../lib/Colors'

export default function Home({ navigation }: NativeStackScreenProps<ScreensParamsList, 'Home'>) {
    const [stays, setStays] = useState<any[]>([])
    const [firstName, setFirstName] = useState('')
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    const { onLogout } = useAuth()

    useEffect(() => {
        async function loadPatients() {
            try {
                const res = await axios.get(`${API_URL}/stays/`)
                setStays(res.data.stays)
            } catch (e) {
                const error = e as AxiosError
                const status = (error.toJSON() as any).status

                if (status === 403) {
                    onLogout!()
                }
            }
        }

        async function loadDoctor() {
            try {
                const res = await axios.get(`${API_URL}/doctor/`)
                setFirstName(res.data.firstName)
            } catch (e) {
                const error = e as AxiosError
                const status = (error.toJSON() as any).status

                if (status === 403) {
                    onLogout!()
                }
            }
        }

        async function load() {
            setLoading(true)
            await loadDoctor()
            await loadPatients()
            setLoading(false)
        }

        load()
    }, [])

    if (loading) {
        return (
            <View style={{
                height: '100%',
                justifyContent: 'center',
                backgroundColor: 'white'
            }}>
                <ActivityIndicator size={'large'} />
            </View>
        )
    }

    const visibleStays = stays.filter(stay => stay.reason.toLowerCase().includes(search.toLowerCase()) || stay.patient.firstName.toLowerCase().includes(search.toLowerCase()) || stay.patient.lastName.toLowerCase().includes(search.toLowerCase()))

    return (
        <View style={{
            height: '100%',
            backgroundColor: 'white',
            padding: 20,
            gap: 15
        }}>
            <Text variant='titleLarge'>Bonjour, Dr. {firstName}!</Text>
            <View style={{ gap: 10 }}>
                <Text variant='titleMedium'>Vos patients du jour</Text>
                <Searchbar mode='bar' onChangeText={setSearch} value={search} placeholder='Cherchez un patient...' inputStyle={{ minHeight: 0 }} style={{ borderRadius: 5, height: 40 }} />
            </View>
            <ScrollView style={{
                flex: 1
            }} contentContainerStyle={{
                flexGrow: 1,
                overflow: 'visible'
            }}>
                {visibleStays.length ?
                    visibleStays.map(stay => (
                        <View
                            key={stay.id}
                            style={{
                                flexDirection: 'row',
                                backgroundColor: 'white',
                                padding: 10,
                                marginHorizontal: 2,
                                marginVertical: 8,
                                borderRadius: 10,
                                elevation: 3,
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                shadowColor: '#52006A',
                            }}
                        >
                            <View style={{
                                gap: 5,

                            }}>
                                <View>
                                    <Text variant='titleSmall'>{stay.patient.firstName} {stay.patient.lastName}</Text>
                                    <Text style={{ opacity: 0.5 }}>{formatDate(stay.start)} - {formatDate(stay.end)}</Text>
                                </View>
                                <Text>{stay.reason}</Text>
                            </View>
                            <IconButton
                                icon="magnify"
                                iconColor={colors.primary}
                                onPress={() =>
                                    navigation.navigate("Patient", {
                                        id: stay.id,
                                        fullName: `${stay.patient.firstName} ${stay.patient.lastName}`
                                    })}
                            />
                        </View>
                    )) :
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Text style={{
                            opacity: 0.5
                        }}>
                            {search ? "Aucun patient trouvé" : "Aucun patient aujourd'hui"}
                        </Text>
                    </View>
                }
            </ScrollView>
        </View>
    )
}