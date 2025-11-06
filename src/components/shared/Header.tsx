import React from 'react'
import { StyleSheet, View, Image, TouchableOpacity, Text } from 'react-native'
import { Lucide } from '@react-native-vector-icons/lucide';
import { theme } from '../../theme';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
import ROUTING from '../../constants/routing';
import { useSelector } from 'react-redux';
import { useAuthContext } from '../../contexts';
const Header: React.FC = () => {
    const navigation = useNavigation<NavigationProp<ParamListBase>>();
    const { isLoggedIn } = useSelector((state: any) => state.user);
    const { handleLogout } = useAuthContext();
    return (
        <View style={styles.container}>
            <View style={[theme.layout.dflexRow, { gap: 10 }]}>
                <Image style={styles.logo} source={require('../../assets/Logo.png')} />
                <Lucide name="align-justify" size={24} color="blue" />
            </View>
            <View>
                {!isLoggedIn ? (
                    <TouchableOpacity onPress={() => navigation.navigate(ROUTING.LOGIN)} style={styles.buttonLogin}>
                        <Text style={styles.buttonLoginText}>Đăng nhập</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={handleLogout} style={styles.buttonLogout}>
                        <Text style={styles.buttonLogoutText}>Đăng xuất</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        ...theme.components.header,
    },
    logo: {
        width: 60,
        resizeMode: 'contain',
    },
    buttonLogin: {
        width: 120,
        height: 40,
        backgroundColor: theme.colors.primary[600],
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: theme.borderRadius['2xl'],
    },
    buttonLoginText: {
        color: theme.colors.white,
    },
    buttonLogout: {
        width: 120,
        height: 40,
        backgroundColor: theme.colors.error?.[600] || '#DC2626',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: theme.borderRadius['2xl'],
    },
    buttonLogoutText: {
        color: theme.colors.white,
    }
})

export default Header;