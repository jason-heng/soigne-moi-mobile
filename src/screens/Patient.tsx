import { RefreshControl, ScrollView, StyleProp, View, ViewStyle } from 'react-native'
import React, { Dispatch, PropsWithChildren, SetStateAction, useCallback, useEffect, useState } from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ScreensParamsList } from '../../App'
import axios, { AxiosError } from 'axios'
import { API_URL, useAuth } from '../context/AuthContext'
import { ActivityIndicator, Button, IconButton, Text, TextInput } from 'react-native-paper'
import colors from '../lib/Colors'
import { formatDate } from '../lib/utils'
import { DateTimePickerAndroid, DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Modal from "react-native-modal"

interface Stay {
    id: number
    firstName: string;
    lastName: string;
    reason: string;
    start: string;
    end: string;
}

interface Prescription {
    start: string;
    end: string;
    drugs: {
        id: number;
        name: string;
        dosage: string;
    }[]
}

interface Opinion {
    doctor: {
        firstName: string;
        lastName: string;
    };
    id: number;
    title: string;
    description: string;
    created: string;
}

export default function PatientScreen({ route, navigation }: NativeStackScreenProps<ScreensParamsList, 'Patient'>) {
    const { id } = route.params

    const [stay, setStay] = useState<Stay>()
    const [prescription, setPrescription] = useState<Prescription>()
    const [opinions, setOpinions] = useState<Opinion[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const { onLogout } = useAuth()

    const getPatientData = useCallback(async () => {
        try {
            const res = await axios.get<{
                stay: Stay,
                prescription: Prescription,
                opinions: Opinion[]
            }>(`${API_URL}/doctor/stays/${id}/`)

            setStay(res.data.stay)
            setPrescription(res.data.prescription)
            setOpinions(res.data.opinions)
        } catch (e) {
            const error = e as AxiosError
            const status = (error.toJSON() as any).status

            if (status === 403) {
                onLogout!()
            } else if (status === 404) {
                navigation.navigate('Home')
            }
        }
    }, [])

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await getPatientData()
        setRefreshing(false)
    }, []);

    useEffect(() => {
        async function load() {
            setLoading(true)
            await getPatientData()
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

    if (!stay || !prescription || !opinions) {
        return (
            <View style={{
                height: '100%',
                justifyContent: 'center',
                backgroundColor: 'white'
            }}>
                <Text>Une erreur est survenue !</Text>
            </View>
        )
    }

    return (
        <ScrollView
            contentContainerStyle={{
                padding: 15
            }}

            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }

            style={{
                backgroundColor: 'white',
                height: '100%',
                gap: 20
            }}>
            <Card>
                <Text variant='titleMedium' style={{ color: colors.primary }}>Séjour</Text>
                <View>
                    <Text variant='titleSmall'>{stay.firstName} {stay.lastName}</Text>
                    <Text variant='bodySmall' style={{ opacity: 0.5 }}>{formatDate(stay.start)} - {formatDate(stay.end)}</Text>
                </View>
                <Text variant='bodyMedium'>{stay.reason}</Text>
            </Card>

            <PrescriptionCard prescription={prescription} setPrescription={setPrescription} stayId={stay.id} />
            <OpinionsCard opinions={opinions} setOpinions={setOpinions} stayId={stay.id} />
        </ScrollView>
    )
}

function Card({ children, styles }: PropsWithChildren & { styles?: StyleProp<ViewStyle> }) {
    return (
        <View
            style={[{
                backgroundColor: 'white',
                padding: 15,
                marginHorizontal: 5,
                marginVertical: 10,
                borderRadius: 10,
                elevation: 3,
                gap: 5,
                justifyContent: 'space-between',
                shadowColor: '#52006A',

            }, styles]}
        >
            {children}
        </View>
    )
}

function PrescriptionCard({ stayId, prescription, setPrescription }: { stayId: number, prescription: Prescription, setPrescription: Dispatch<SetStateAction<Prescription | undefined>> }) {
    const [modalVisible, setModalVisible] = useState(false)

    const [name, setName] = useState("")
    const [dosage, setDosage] = useState("")

    const [nameError, setNameError] = useState("")
    const [dosageError, setDosageError] = useState("")

    const [pending, setPending] = useState(false)

    function toggleModal() {
        setModalVisible(prev => !prev);
        setName("")
        setDosage("")
    };

    async function handleSave() {
        setNameError("")
        setDosageError("")

        setPending(true)

        try {
            const { data } = await axios.post(`${API_URL}/doctor/stays/${stayId}/prescription`, {
                name,
                dosage
            })

            setPrescription(data)

            toggleModal()
        } catch (error) {
            const errors = (error as any).response.data.errors

            setNameError(errors.title)
            setDosageError(errors.description)
        }

        setPending(false)
    }

    async function editEndDate(event: DateTimePickerEvent, selectedDate: Date | undefined) {
        if (selectedDate && event.type === 'set') {
            try {
                await axios.put(`${API_URL}/doctor/stays/${stayId}/prescription`, {
                    end: selectedDate.toISOString()
                })

                setPrescription({ ...prescription, end: selectedDate.toISOString() })
            } catch (error) {
            }
        }
    }

    return (
        <>
            <Card>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <Text variant='titleMedium' style={{ color: colors.primary }}>Prescription</Text>
                        <Text variant='bodySmall' style={{ opacity: 0.5 }}>{formatDate(prescription.start)} - <Text style={{ color: colors.primary }} onPress={() => DateTimePickerAndroid.open({ value: new Date(prescription.end), minimumDate: new Date(), onChange: editEndDate })}>{formatDate(prescription.end)}</Text></Text>
                    </View>
                    <IconButton onPress={toggleModal} iconColor='white' size={20} icon="plus" style={{
                        backgroundColor: colors.primary,
                    }} />
                </View>
                {prescription.drugs.length ? (
                    prescription.drugs.map(drug => (
                        <Card key={drug.id} styles={{ elevation: 5 }}>
                            <Text variant='titleSmall'>{drug.name}</Text>
                            <Text variant='bodyMedium' style={{ opacity: 0.8 }}>{drug.dosage}</Text>
                        </Card>
                    ))
                ) : (
                    <View style={{ alignItems: 'center', height: 50, justifyContent: 'center' }}>
                        <Text style={{ opacity: 0.7 }}>Aucun médicament pour l'instant</Text>
                    </View>
                )}
            </Card>

            <View style={{ flex: 1 }}>
                <Modal isVisible={modalVisible}>
                    <View style={{
                        padding: 20,
                        gap: 20,
                        borderRadius: 10,
                        backgroundColor: 'white'
                    }}>
                        <Text variant='titleMedium'>Ajouter un médicament</Text>

                        <View>
                            <TextInput
                                mode='outlined'
                                label="Nom"
                                placeholder='Entrez le nom du médicament...'
                                value={name}
                                onChangeText={setName}
                            />
                            {nameError && <Text style={{ color: 'red', opacity: 0.5 }}>{nameError}</Text>}
                        </View>

                        <View>
                            <TextInput
                                mode='outlined'
                                label="Posologie"
                                placeholder='Entrez la posologie...'
                                value={dosage}
                                onChangeText={setDosage}
                            />
                            {dosageError && <Text style={{ color: 'red', opacity: 0.5 }}>{dosageError}</Text>}
                        </View>

                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            gap: 10
                        }}>
                            <Button mode='contained-tonal' onPress={toggleModal}>Annuler</Button>
                            <Button mode='contained' disabled={pending} loading={pending} onPress={handleSave}>Ajouter</Button>
                        </View>
                    </View>
                </Modal>
            </View>
        </>
    )
}

function OpinionsCard({ stayId, opinions, setOpinions }: { stayId: number, opinions: Opinion[], setOpinions: Dispatch<SetStateAction<Opinion[]>> }) {
    const [modalVisible, setModalVisible] = useState(false)

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")

    const [titleError, setTitleError] = useState("")
    const [descriptionError, setDescriptionError] = useState("")

    const [pending, setPending] = useState(false)

    function toggleModal() {
        setModalVisible(prev => !prev);
        setTitle("")
        setDescription("")
    };

    async function handleSave() {
        setTitleError("")
        setDescriptionError("")

        setPending(true)

        try {
            const { data } = await axios.post(`${API_URL}/doctor/stays/${stayId}/opinions`, {
                title,
                description
            })

            setOpinions(data)

            toggleModal()
        } catch (error) {
            const errors = (error as any).response.data.errors

            setTitleError(errors.title)
            setDescriptionError(errors.description)
        }

        setPending(false)
    }

    return (
        <>
            <Card>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                        <Text variant='titleMedium' style={{ color: colors.primary }}>Avis</Text>
                    </View>
                    <IconButton iconColor='white' size={20} icon="plus" onPress={toggleModal} style={{
                        backgroundColor: colors.primary,
                    }} />
                </View>
                {opinions.length ? (
                    opinions.map(opinion => (
                        <Card key={opinion.id} styles={{ elevation: 5 }}>
                            <Text variant='bodyMedium' style={{ opacity: 0.8 }}>{formatDate(opinion.created)}</Text>
                            <Text variant='titleSmall'>{opinion.doctor.firstName} {opinion.doctor.lastName}</Text>
                            <Text variant='bodyMedium' style={{ opacity: 0.8 }}>{opinion.title}</Text>
                            <Text variant='bodyMedium' style={{ opacity: 0.8 }}>{opinion.description}</Text>
                        </Card>
                    ))
                ) : (
                    <View style={{ alignItems: 'center', height: 50, justifyContent: 'center' }}>
                        <Text style={{ opacity: 0.7 }}>Aucun avis pour l'instant</Text>
                    </View>
                )}
            </Card>


            <View style={{ flex: 1 }}>
                <Modal isVisible={modalVisible}>
                    <View style={{
                        padding: 20,
                        gap: 20,
                        borderRadius: 10,
                        backgroundColor: 'white'
                    }}>
                        <Text variant='titleMedium'>Ajouter un avis</Text>

                        <View>
                            <TextInput
                                mode='outlined'
                                label="Titre"
                                placeholder='Entrez un titre...'
                                value={title}
                                onChangeText={setTitle}
                            />
                            {titleError && <Text style={{ color: 'red', opacity: 0.5 }}>{titleError}</Text>}
                        </View>

                        <View>
                            <TextInput
                                mode='outlined'
                                label="Description"
                                placeholder='Entrez une description...'
                                value={description}
                                onChangeText={setDescription}
                            />
                            {descriptionError && <Text style={{ color: 'red', opacity: 0.5 }}>{descriptionError}</Text>}
                        </View>

                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            gap: 10
                        }}>
                            <Button mode='contained-tonal' onPress={toggleModal}>Annuler</Button>
                            <Button mode='contained' disabled={pending} loading={pending} onPress={handleSave}>Ajouter</Button>
                        </View>
                    </View>
                </Modal>
            </View>
        </>
    )
}