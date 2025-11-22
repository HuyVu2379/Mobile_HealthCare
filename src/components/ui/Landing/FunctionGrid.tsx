import React from 'react';
import { View, FlatList, StyleSheet, Dimensions } from 'react-native';
import FunctionCard from './FunctionCard';
import ROUTING from '../../../constants/routing';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';// Lấy kích thước màn hình
const { width } = Dimensions.get('window');

// Data cho 6 function cards (3 cột x 2 hàng)
const gridData = [
    {
        id: 1,
        routing: ROUTING.CHATBOT,
        imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
        subtitle: 'Chatbot AI',
        title: 'Hỗ trợ 24/7'
    },
    {
        id: 2,
        routing: ROUTING.PREDICT,
        imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400',
        subtitle: 'Phân tích bằng AI',
        title: 'Gợi ý cá nhân hóa'
    },
    {
        id: 3,
        routing: ROUTING.BOTTOM_TAB,
        imageUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=400',
        subtitle: 'Hồ sơ bệnh án',
        title: 'Theo dõi và lưu trữ hồ sơ'
    },
    {
        id: 4,
        routing: ROUTING.FORUM,
        imageUrl: 'https://salavietnam.vn/dataimages/images/diendan.jpg',
        subtitle: 'Diễn đàn chăm sóc sức khỏe',
        title: 'Diễn đàn'
    },
    {
        id: 5,
        routing: ROUTING.APPOINTMENT,
        imageUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400',
        subtitle: 'Đặt lịch khám',
        title: 'Đặt lịch nhanh chóng'
    },
    {
        id: 6,
        routing: ROUTING.CHAT_WITH_DOCTOR,
        imageUrl: 'https://suckhoedoisong.qltns.mediacdn.vn/2015/1-1869-nguyen-nhan-rung-toc-do-stress3-1429501110789.jpg',
        subtitle: 'Tư vấn trực tuyến',
        title: 'Chat với bác sĩ đã hẹn'
    }
];

const FunctionGrid: React.FC = () => {
    const navigation = useNavigation<NavigationProp<ParamListBase>>();

    // Render item cho FlatList
    const renderItem = ({ item }: { item: typeof gridData[0] }) => (
        <FunctionCard
            imageUrl={item.imageUrl}
            subtitle={item.subtitle}
            title={item.title}
            onPress={() => {
                navigation.navigate(item.routing);
            }}
        />
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={gridData}
                renderItem={renderItem}
                keyExtractor={(item) => String(item.id)}
                numColumns={3} // 3 cột
                columnWrapperStyle={styles.row} // Style cho mỗi hàng
                contentContainerStyle={styles.gridContainer}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false} // Vô hiệu hóa scroll vì chỉ có 2 hàng
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
    },
    gridContainer: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    row: {
        justifyContent: 'space-evenly', // Phân bố đều các items trong hàng
        marginBottom: 15, // Khoảng cách giữa các hàng
    },
});

export default FunctionGrid;