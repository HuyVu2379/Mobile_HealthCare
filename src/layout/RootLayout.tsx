import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <SafeAreaView style={styles.wrapper}>
            <ScrollView contentContainerStyle={styles.container}>{children}</ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        // paddingHorizontal: 10,
        // paddingTop: 35,
    },
});