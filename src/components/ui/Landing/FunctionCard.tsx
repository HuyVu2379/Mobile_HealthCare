import React from 'react'
import { StyleSheet, View, Text, Image, TouchableOpacity, ImageSourcePropType } from 'react-native'

interface FunctionCardProps {
    imageUrl: string | ImageSourcePropType;
    subtitle: string;
    title: string;
    onPress?: () => void;
}

const FunctionCard: React.FC<FunctionCardProps> = ({
    imageUrl,
    subtitle,
    title,
    onPress
}) => {
    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.9}
        >
            {/* Image Section */}
            <View style={styles.imageContainer}>
                <Image
                    source={typeof imageUrl === 'string' ? { uri: imageUrl } : imageUrl}
                    style={styles.image}
                    resizeMode="cover"
                />
                {/* Subtitle Label - positioned on top left of image */}
                <View style={styles.subtitleLabel}>
                    <Text style={styles.subtitleText}>{subtitle}</Text>
                </View>
            </View>

            {/* Content Section */}
            <View style={styles.contentContainer}>
                <Text style={styles.smallText}>{subtitle}</Text>
                <Text style={styles.titleText}>{title}</Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        margin: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
        overflow: 'hidden',
        width: 110, // Kích thước phù hợp cho grid 3 cột
        height: 160, // Chiều cao cố định
    },
    imageContainer: {
        position: 'relative',
        height: 100,
        width: '100%',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    subtitleLabel: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(200, 200, 200, 0.9)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
    },
    subtitleText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#1e40af', // Xanh đậm
    },
    contentContainer: {
        padding: 8,
        paddingTop: 6,
        flex: 1,
        alignItems: 'flex-start',
    },
    smallText: {
        fontSize: 10,
        color: '#6b7280', // Xám
        marginBottom: 2,
    },
    titleText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1e40af', // Xanh đậm
        lineHeight: 16,
        textAlign: 'center',
    },
})

export default FunctionCard;