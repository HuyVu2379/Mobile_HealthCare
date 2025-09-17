export interface Service {
    id: string;
    name: string;
    price: number;
    description: string;
}

export interface Doctor {
    id: string;
    name: string;
    avatar: string;
    specialty: string;
    rating: number;
}

export interface TimeSlot {
    id: string;
    time: string;
    available: boolean;
}

export interface BookingMethod {
    id: string;
    name: string;
    icon: string;
    type: 'in-person' | 'online';
}

export interface BookingState {
    service: Service | null;
    doctor: Doctor | null;
    date: Date | null;
    timeSlot: TimeSlot | null;
    method: BookingMethod | null;
}