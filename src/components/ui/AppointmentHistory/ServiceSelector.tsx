import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Service } from '../../../types/booking';

interface ServiceSelectorProps {
    services: Service[];
    selectedService: Service | null;
    onServiceSelect: (service: Service) => void;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({
    services,
    selectedService,
    onServiceSelect,
}) => {
    const renderServiceItem = (item: Service) => {
        const isSelected = selectedService?.id === item.id;

        return (
            <TouchableOpacity
                key={item.id}
                style={[styles.serviceCard, isSelected && styles.selectedCard]}
                onPress={() => onServiceSelect(item)}
            >
                <View style={styles.serviceHeader}>
                    <Text style={[styles.serviceName, isSelected && styles.selectedText]}>
                        {item.name}
                    </Text>
                </View>
                <Text style={[styles.serviceDescription, isSelected && styles.selectedDescriptionText]}>
                    {item.description}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Chọn dịch vụ</Text>
            <View style={styles.listContainer}>
                {services.map((service) => renderServiceItem(service))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    listContainer: {
        gap: 12,
    },
    serviceCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    selectedCard: {
        borderColor: '#4285F4',
        backgroundColor: '#f0f7ff',
        borderWidth: 2,
    },
    serviceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    serviceName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
    },
    selectedText: {
        color: '#4285F4',
    },
    servicePrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4285F4',
    },
    serviceDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    selectedDescriptionText: {
        color: '#555',
    },
});

export default ServiceSelector;