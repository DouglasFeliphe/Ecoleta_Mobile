import React, { useState, useEffect, ReactText } from 'react';
import { View, ImageBackground, Text, Image, StyleSheet, TextStyle, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import { RectButton } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import api from '../../services/api';

interface IBGE_UF_Response {
    id: number
    sigla: string
    nome: string
}
interface IBGE_City_Response {
    nome: string
}

const Home: React.FC = () => {

    const navigation = useNavigation()

    const [cities, setCities] = useState<string[]>([])
    const [selectedCity, setSelectedCity] = useState<ReactText>('0');
    const [ufs, setUfs] = useState<string[]>([])
    const [selectedUf, setSelectedUf] = useState<ReactText>('0')
    const [keybordAvoidingView, setKeybordAvoidingView] = useState(false);

    // listando as UF da API
    useEffect(() => {
        api.get<IBGE_UF_Response[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
            .then(response => {
                const ufInitials = response.data.map(uf => uf.sigla)
                setUfs(ufInitials)
            })
    }, [])

    // carregar as cidades sempre que a UF mudar 
    useEffect(() => {
        if (selectedUf === '0') {
            return
        }
        api.get<IBGE_City_Response[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
            .then(response => {
                const cityNames = response.data.map(city => city.nome)
                setCities(cityNames)
            })
    }, [selectedUf])

    /**
     * Esta função será chamada sempre que o usuário pressionar nos campos de texto
     * escondendo os textos da tela, impedindo que eles se sobreponham.
     */
    function handleKeybordAvoidingView() {
        setKeybordAvoidingView(true)
    }

    function handleSelectUf(itemValue: ReactText) {
        let uf = itemValue
        setSelectedUf(uf)

    }

    function handleSelectCity(itemValue: ReactText) {
        let city = itemValue
        setSelectedCity(city)
    }

    function handleNavigateToPoints() {
        navigation.navigate('Points', {
            selectedCity,
            selectedUf
        })
        console.log('selectedUf :>> ', selectedUf);
        setKeybordAvoidingView(false)
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ImageBackground source={require('../../assets/home-background.png')}
                style={styles.container}
                imageStyle={{ width: 274, height: 368 }}>
                <View style={styles.main} >
                    <Image source={require('../../assets/logo.png')} />
                    {keybordAvoidingView ? undefined :
                        <View>
                            <Text style={styles.title}>
                                Seu marketplace de coleta de resíduos
                            </Text>
                            <Text style={styles.description}>
                                Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente
                    </Text>
                        </View>
                    }
                </View>
                <View style={styles.select}>

                    <Picker
                        style={styles.input}
                        selectedValue={selectedUf}
                        onValueChange={(itemValue: ReactText, itemIndex) =>
                            handleSelectUf(itemValue)
                        }
                        mode='dropdown'
                    >
                        {ufs.map(uf => (
                            <Picker.Item
                                key={uf}
                                label={uf}
                                value={uf}
                            />
                        ))}
                    </Picker>

                    <Picker
                        style={styles.input}
                        selectedValue={selectedCity}
                        onValueChange={(itemValue: ReactText, itemIndex) =>
                            handleSelectCity(itemValue)
                        }
                        mode='dropdown'
                    >
                        {cities.map(city => (
                            <Picker.Item
                                key={city}
                                label={city}
                                value={city}
                            />
                        ))}
                    </Picker>

                    <RectButton style={styles.button}
                        onPress={handleNavigateToPoints}>
                        <View style={styles.buttonIcon}>
                            <Icon name='arrow-right' color='#fff' size={24} />
                        </View>
                        <Text style={styles.buttonText}>
                            Entrar
                     </Text>
                    </RectButton>
                </View>
            </ImageBackground>
        </KeyboardAvoidingView >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 32
    },

    main: {
        flex: 1,
        justifyContent: 'center',
    },
    mainHidden: {
        display: 'none'
    },

    title: {
        color: '#322153',
        fontSize: 32,
        fontFamily: 'Ubuntu_700Bold',
        maxWidth: 260,
        marginTop: 64,
    },

    description: {
        color: '#6C6C80',
        fontSize: 16,
        marginTop: 16,
        fontFamily: 'Roboto_400Regular',
        maxWidth: 260,
        lineHeight: 24,
    },

    footer: {},

    select: {},

    input: {
        height: 60,
        backgroundColor: '#FFF',
        borderRadius: 10,
        marginBottom: 8,
        paddingHorizontal: 24,
        fontSize: 16
    },

    button: {
        backgroundColor: '#34CB79',
        height: 60,
        flexDirection: 'row',
        borderRadius: 10,
        overflow: 'hidden',
        alignItems: 'center',
        marginTop: 8,
    },

    buttonIcon: {
        height: 60,
        width: 60,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center'
    },

    buttonText: {
        flex: 1,
        justifyContent: 'center',
        textAlign: 'center',
        color: '#FFF',
        fontFamily: 'Roboto_500Medium',
        fontSize: 16,
    }
});

export default Home;

