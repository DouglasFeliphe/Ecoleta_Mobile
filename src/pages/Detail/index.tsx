import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, Linking } from 'react-native';
import { FontAwesome as FAIcon } from '@expo/vector-icons';
import { Feather as Icon } from '@expo/vector-icons';
import { SvgUri, Path } from 'react-native-svg';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RectButton } from 'react-native-gesture-handler';
import * as MailComposer from 'expo-mail-composer';
import api from '../../services/api';

interface Params {
    point_id: number
}

interface Data {
    point: {
        image: string
        image_url: string
        name: string,
        email: string
        whatsapp: string
        city: string
        uf: string
    }
    items: {
        id: number
        title: string
        image_url: string
    }[]
}

interface Item {
    id: number
    title: string
    image_url: string
}

const Detail: React.FC = () => {

    const [data, setData] = useState<Data>({} as Data);
    const navigation = useNavigation()
    const route = useRoute()

    const routeParams = route.params as Params

    // listando os items do ponto de coleta específico
    useEffect(() => {
        api.get(`points/${routeParams.point_id}`)
            .then(response => {
                response.data.items.map((item: { image_url: string; image: {}; }) => {
                    item.image_url = `http://192.168.42.52:3333/uploads/${item.image}`
                    return item
                })

                setData(response.data)
            })
    }, []);


    // voltar á página anterior
    function handleNavigateBack() {
        navigation.goBack()
    }

    // contato por whatsapp
    function handleWhatsapp() {
        Linking.openURL(`whatsapp://send?phone=${data.point.whatsapp}&text=Tenho interesse sobre coleta de resíduos`)
    }
    // contato por email
    function handleComposeMail() {
        MailComposer.composeAsync({
            subject: 'Interesse na coleta de resíduos',
            recipients: [data.point.email]
        })
    }

    if (!data.point) {
        return null
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                <TouchableOpacity onPress={() => handleNavigateBack()}>
                    <Icon name='arrow-left' color='#34CB79' size={24}></Icon>
                </TouchableOpacity>
                <Image style={styles.pointImage} source={{ uri: data.point.image_url }}></Image>
                <Text style={styles.pointName}>{data.point.name}</Text>
                <View style={styles.pointItemsContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20 }}>
                        {data.items.map(item => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.pointItems}>
                                <SvgUri width={42} height={42} uri={item.image_url} />
                                <Text style={styles.pointItemsTitle}>{item.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
                <View style={styles.address}>
                    <Text style={styles.addressTitle}>Endereço</Text>
                    <Text style={styles.addressContent} >{data.point.city}, {data.point.uf}</Text>
                </View>
            </View>
            <View style={styles.footer}>
                <RectButton style={styles.button} onPress={() => handleWhatsapp()}>
                    <FAIcon name='whatsapp' color='#fff' size={20} ></FAIcon>
                    <Text style={styles.buttonText}>Whatsapp</Text>
                </RectButton>
                <RectButton style={styles.button} onPress={() => handleComposeMail()}>
                    <Icon name='mail' color='#fff' size={20} ></Icon>
                    <Text style={styles.buttonText}>Email</Text>
                </RectButton>
            </View>
        </SafeAreaView >
    )
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        padding: 32,
        paddingTop: 20,
    },

    pointImage: {
        width: '100%',
        height: 120,
        resizeMode: 'cover',
        borderRadius: 10,
        marginTop: 32,
    },

    pointName: {
        color: '#322153',
        fontSize: 28,
        fontFamily: 'Ubuntu_700Bold',
        marginTop: 24,
    },

    // pointItems: {
    //     fontFamily: 'Roboto_400Regular',
    //     fontSize: 16,
    //     lineHeight: 24,
    //     marginTop: 8,
    //     color: '#6C6C80'
    // },
    pointItemsContainer: {
        flexDirection: 'row',
        marginTop: 16,
        marginBottom: 32,
    },
    pointItems: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#eee',
        height: 120,
        width: 120,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 16,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'space-between',
        textAlign: 'center',
    },
    pointItemsTitle: {
        fontFamily: 'Roboto_400Regular',
        textAlign: 'center',
        fontSize: 13,
    },

    address: {
        marginTop: 32,
    },

    addressTitle: {
        color: '#322153',
        fontFamily: 'Roboto_500Medium',
        fontSize: 16,
    },

    addressContent: {
        fontFamily: 'Roboto_400Regular',
        lineHeight: 24,
        marginTop: 8,
        color: '#6C6C80'
    },

    footer: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: '#999',
        paddingVertical: 20,
        paddingHorizontal: 32,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    button: {
        width: '48%',
        backgroundColor: '#34CB79',
        borderRadius: 10,
        height: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },

    buttonText: {
        marginLeft: 8,
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Roboto_500Medium',
    },
});

export default Detail;