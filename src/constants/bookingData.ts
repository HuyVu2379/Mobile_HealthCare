import { Service, Doctor, TimeSlot, BookingMethod } from '../types/booking';

export const SERVICES: Service[] = [
    {
        id: '1',
        name: 'Tư vấn thần học',
        price: 500000,
        description: 'Tư vấn chuyên khoa về các vấn đề liên quan đến thần'
    },
    {
        id: '2',
        name: 'Khám tổng quát',
        price: 300000,
        description: 'Khám sức khỏe tổng quát và tư vấn chế độ sinh hoạt'
    },
    {
        id: '3',
        name: 'Tư vấn dinh dưỡng',
        price: 200000,
        description: 'Tư vấn chế độ ăn uống phù hợp với bệnh thần'
    },
    {
        id: '4',
        name: 'Theo dõi định kỳ',
        price: 250000,
        description: 'Khám theo dõi tình trạng bệnh định kỳ'
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

export const BOOKING_METHODS: BookingMethod[] = [
    {
        id: '1',
        name: 'Khám trực tiếp',
        icon: 'map-pin',
        type: 'in-person'
    },
    {
        id: '2',
        name: 'Tư vấn online',
        icon: 'video',
        type: 'online'
    }
];