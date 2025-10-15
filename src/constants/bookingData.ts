import { Service, Doctor } from '../types/booking';
import { ConsultationType } from '../types/appointment';

// TimeSlot được định nghĩa trong booking constants, không dùng từ types
interface TimeSlot {
    id: string;
    time: string;
    available: boolean;
}

export const SERVICES: Service[] = [
    {
        id: '1',
        name: 'Tư vấn thận học',
        description: 'Tư vấn chuyên khoa về các vấn đề liên quan đến thận'
    },
    {
        id: '2',
        name: 'Khám tổng quát',
        description: 'Khám sức khỏe tổng quát và tư vấn chế độ sinh hoạt'
    },
    {
        id: '3',
        name: 'Tư vấn dinh dưỡng',
        description: 'Tư vấn chế độ ăn uống phù hợp với bệnh thận'
    },
    {
        id: '4',
        name: 'Theo dõi định kỳ',
        description: 'Khám theo dõi tình trạng bệnh định kỳ'
    },
    {
        id: '5',
        name: 'Tư vấn điều trị',
        description: 'Tư vấn các phương pháp điều trị bệnh thận'
    },
    {
        id: '6',
        name: 'Khám chuyên sâu',
        description: 'Khám và chẩn đoán các bệnh lý thận phức tạp'
    }
];

export const DOCTORS: Doctor[] = [
    {
        id: '1',
        name: 'BS. Trần Minh Hoàng',
        avatar: 'https://via.placeholder.com/50',
        specialty: 'Thần học',
        rating: 4.9
    },
    {
        id: '2',
        name: 'BS. Lê Thị Mai',
        avatar: 'https://via.placeholder.com/50',
        specialty: 'Nội tổng quát',
        rating: 4.8
    },
    {
        id: '3',
        name: 'BS. Nguyễn Văn Đức',
        avatar: 'https://via.placeholder.com/50',
        specialty: 'Dinh dưỡng',
        rating: 4.7
    }
];

export const TIME_SLOTS: TimeSlot[] = [
    { id: '1', time: '09:30', available: true },
    { id: '2', time: '11:30', available: true },
    { id: '3', time: '14:30', available: true },
    { id: '4', time: '16:30', available: true }
];

// Sử dụng trực tiếp ConsultationType enum
export const CONSULTATION_TYPES = [
    ConsultationType.DIRECT_CONSULTATION,
    ConsultationType.ONLINE_CONSULTATION,
    ConsultationType.LAB_TEST,
    ConsultationType.FOLLOW_UP
];

// Map icon cho từng loại consultation với fallback
export const CONSULTATION_TYPE_ICONS: Record<ConsultationType, string> = {
    [ConsultationType.ALL]: 'list',
    [ConsultationType.DIRECT_CONSULTATION]: 'home',         // Icon nhà - khám trực tiếp
    [ConsultationType.ONLINE_CONSULTATION]: 'video',        // Icon video - tư vấn trực tuyến
    [ConsultationType.LAB_TEST]: 'clipboard',               // Icon clipboard - xét nghiệm
    [ConsultationType.FOLLOW_UP]: 'calendar'                // Icon calendar - tái khám
};