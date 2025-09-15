import { DropdownOption } from '../components/HealthForm';

export const PHYSICAL_ACTIVITY_OPTIONS: DropdownOption[] = [
    { label: 'Hàng ngày', value: 'daily' },
    { label: 'Hàng tuần', value: 'weekly' },
    { label: 'Hiếm khi', value: 'rarely' },
];

export const DIET_OPTIONS: DropdownOption[] = [
    { label: 'Cân bằng', value: 'balanced' },
    { label: 'Giàu protein', value: 'high_protein' },
    { label: 'Ít muối', value: 'low_salt' },
];

export const YES_NO_OPTIONS: DropdownOption[] = [
    { label: 'Có', value: 'yes' },
    { label: 'Không', value: 'no' },
];

export const ALCOHOL_OPTIONS: DropdownOption[] = [
    { label: 'Không bao giờ', value: 'never' },
    { label: 'Thỉnh thoảng', value: 'occasionally' },
    { label: 'Hàng ngày', value: 'daily' },
];

export const WEIGHT_CHANGES_OPTIONS: DropdownOption[] = [
    { label: 'Ổn định', value: 'stable' },
    { label: 'Tăng cân', value: 'gain' },
    { label: 'Giảm cân', value: 'loss' },
];

export const STRESS_LEVEL_OPTIONS: DropdownOption[] = [
    { label: 'Thấp', value: 'low' },
    { label: 'Trung bình', value: 'moderate' },
    { label: 'Cao', value: 'high' },
];

export const ANA_OPTIONS: DropdownOption[] = [
    { label: 'Âm tính', value: 'negative' },
    { label: 'Dương tính', value: 'positive' },
];

export const HEMATURIA_OPTIONS: DropdownOption[] = [
    { label: 'Không', value: 'no' },
    { label: 'Vi thể', value: 'microscopic' },
    { label: 'Đại thể', value: 'gross' },
];