import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Alert } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { SvgUri } from 'react-native-svg';
import { ScrollView } from 'react-native-gesture-handler';
import * as Location from 'expo-location';
import api from '../../services/api';

interface Params {
    UF: string
    city?: string
}

interface Items {
    id: number
    title: string
    image_url: string
}

interface Points {
    id: number
    image: string
    image_url: string
    name: string
    latitude: number
    longitude: number
}

const Points: React.FC = () => {

    const navigation = useNavigation()
    const route = useRoute()

    const routeParams = route.params as Params

    const [items, setItems] = useState<Items[]>([]);
    const [points, setPoints] = useState<Points[]>();
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);

    // pegando a localização atual do usuário
    useEffect(() => {
        async function loadPosition() {
            // verificando se a permissão foi dada
            const { status } = await Location.requestPermissionsAsync()

            if (status !== 'granted') {
                Alert.alert('Oooops...', 'Precisamos de sua permissão para obter a localização!')
                return
            }

            const location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true })

            const { latitude, longitude } = location.coords
        }

        loadPosition()
    }, []);

    // listando items de coleta
    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data)
        })
    }, []);

    // LISTANDO PONTOS ESPECÍFICOS
    useEffect(() => {

        api.get('points', {
            params: {
                city: routeParams.city,
                uf: routeParams.UF,
                items: selectedItems
            }
        }).then(response => {
            setPoints(response.data)            
        })
    }, [selectedItems]);

    function handleNavigateBack() {
        navigation.navigate('Home')
    }

    function handleNavigateToDetail(_point_id: number) {
        navigation.navigate('Detail', {
            point_id: _point_id
        })
    }

    function handleSelectItem(_itemId: number) {
        const alreadySelectedItem = selectedItems.findIndex(item => item === _itemId)
        // se item já foi selecionado
        if (alreadySelectedItem >= 0) {
            const filteredItems = selectedItems.filter(item => item !== _itemId)
            setSelectedItems(filteredItems)
        } else {
            setSelectedItems([...selectedItems, _itemId])
        }

    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                <TouchableOpacity onPress={() => handleNavigateBack()}>
                    <Icon name='arrow-left' size={20} color='#24cb79'></Icon>
                </TouchableOpacity>
                <Text style={styles.title}>Bem Vindo.</Text>
                <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>
                {/* mapa */}
                <View style={styles.mapContainer}>
                    <MapView style={styles.map} initialRegion={{
                        latitude: -15.838423,
                        longitude: -47.9317159,
                        latitudeDelta: 0.014,
                        longitudeDelta: 0.014
                    }}  >

                        {points?.map(point => (
                            <Marker key={String(point.id)}
                                onPress={() => handleNavigateToDetail(point.id)}
                                coordinate={{
                                    latitude: point.latitude,
                                    longitude: point.longitude,
                                }} >
                                <View style={styles.mapMarkerContainer}>
                                    <Image style={styles.mapMarkerImage} source={{ uri: point.image_url }} />
                                    <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                                </View>
                            </Marker>
                        ))}
                    </MapView>
                </View>
            </View>
            <View style={styles.itemsContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20 }}>
                    {items.map(item => (
                        <TouchableOpacity
                            key={item.id} style={[
                                styles.item,
                                selectedItems.includes(item.id) ? styles.selectedItem : {}
                            ]}
                            onPress={() => handleSelectItem(item.id)}>
                            <SvgUri width={42} height={42} uri={item.image_url} />
                            <Text style={styles.itemTitle}>{item.title}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 32,
        paddingTop: 20,
    },

    title: {
        fontSize: 20,
        fontFamily: 'Ubuntu_700Bold',
        marginTop: 24,
    },

    description: {
        color: '#6C6C80',
        fontSize: 16,
        marginTop: 4,
        fontFamily: 'Roboto_400Regular',
    },

    mapContainer: {
        flex: 1,
        width: '100%',
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 16,
    },

    map: {
        width: '100%',
        height: '100%',
    },

    mapMarker: {
        width: 90,
        height: 80,
    },

    mapMarkerContainer: {
        width: 90,
        height: '100%',
        backgroundColor: '#34CB79',
        flexDirection: 'column',
        borderRadius: 8,
        overflow: 'hidden',
        alignItems: 'center'
    },

    mapMarkerImage: {
        width: 90,
        height: 45,
        resizeMode: 'cover',
    },

    mapMarkerTitle: {
        flex: 1,
        fontFamily: 'Roboto_400Regular',
        color: '#FFF',
        fontSize: 13,
        lineHeight: 18,
        textAlign: 'center',
        margin: 2
    },

    itemsContainer: {
        flexDirection: 'row',
        marginTop: 16,
        marginBottom: 32,
    },

    item: {
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

    selectedItem: {
        borderColor: '#34CB79',
        borderWidth: 2,
    },

    itemTitle: {
        fontFamily: 'Roboto_400Regular',
        textAlign: 'center',
        fontSize: 13,
    },
});

export default Points;