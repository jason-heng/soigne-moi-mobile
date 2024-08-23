import { RefreshControl, ScrollView, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import axios, { AxiosError } from 'axios'
import { API_URL, useAuth } from '../context/AuthContext'
import { ActivityIndicator, IconButton, Searchbar, Text } from 'react-native-paper'
import { formatDate } from '../lib/utils'
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack'
import { ScreensParamsList } from '../../App'
import colors from '../lib/Colors'

interface Stay {
    id: number;
    firstName: string;
    lastName: string;
    start: string;
    end: string;
    reason: string;
}

export default function HomeScreen({ navigation }: NativeStackScreenProps<ScreensParamsList, 'Home'>) {
    const [stays, setStays] = useState<Stay[]>([])
    const [firstName, setFirstName] = useState('')
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [search, setSearch] = useState("")

    const { onLogout } = useAuth()

    const getDoctor = useCallback(async () => {
        try {
            const { data } = await axios.get<{ firstName: string }>(`${API_URL}/doctor/`)
            setFirstName(data.firstName)
        } catch (e) {
            const error = e as AxiosError
            const status = (error.toJSON() as any).status

            if (status === 403) {
                onLogout!()
            }
        }
    }, [])

    const getStays = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API_URL}/doctor/stays/`)
            setStays(data)
        } catch (e) {
            const error = e as AxiosError
            const status = (error.toJSON() as any).status

            if (status === 403) {
                onLogout!()
            }
        }
    }, [])

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await getStays()
        setRefreshing(false)
    }, []);

    useEffect(() => {
        async function load() {
            setLoading(true)
            await getDoctor()
            await getStays()
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

    const visibleStays = stays.filter(stay => stay.reason.toLowerCase().includes(search.toLowerCase()) || stay.firstName.toLowerCase().includes(search.toLowerCase()) || stay.lastName.toLowerCase().includes(search.toLowerCase()))

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
            <ScrollView
                style={{
                    flex: 1
                }}

                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }

                contentContainerStyle={{
                    flexGrow: 1,
                    overflow: 'visible'
                }}
            >
                {visibleStays.length ?
                    visibleStays.map(stay => (
                        <Patient key={stay.id} stay={stay} navigation={navigation} />
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

function Patient({ stay, navigation }: { stay: Stay, navigation: NativeStackNavigationProp<ScreensParamsList, "Home", undefined> }) {
    return (
        <View
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
                    <Text variant='titleSmall'>{stay.firstName} {stay.lastName}</Text>
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
                        fullName: `${stay.firstName} ${stay.lastName}`
                    })}
            />
        </View>
    )
}