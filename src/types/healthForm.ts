export interface HealthFormData {
    // Chỉ số xét nghiệm máu
    creatinine: string;
    egfr: string;
    bun: string;
    serumCalcium: string;
    ana: string;
    c3: string;
    c4: string;
    hematuria: string;
    oxalateLevels: string;
    urinePH: string;

    // Chỉ số sinh hiệu
    bloodPressureSystolic: string;
    bloodPressureDiastolic: string;
    waterIntake: string;

    // Thói quen sống
    physicalActivity: string;
    diet: string;
    smoking: string;
    alcohol: string;
    painkillerUsage: string;

    // Tiền sử và tình trạng
    familyHistory: string;
    weightChanges: string;
    stressLevel: string;
}

export const initialHealthFormData: HealthFormData = {
    creatinine: '',
    egfr: '',
    bun: '',
    serumCalcium: '',
    ana: '',
    c3: '',
    c4: '',
    hematuria: '',
    oxalateLevels: '',
    urinePH: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    waterIntake: '',
    physicalActivity: '',
    diet: '',
    smoking: '',
    alcohol: '',
    painkillerUsage: '',
    familyHistory: '',
    weightChanges: '',
    stressLevel: '',
};