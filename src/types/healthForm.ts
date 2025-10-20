// Form data interface for UI (all fields as strings for form inputs)
export interface HealthFormData {
    // Essential numerical features (luôn bắt buộc cho primary model, có thể thiếu cho enhanced model)
    serum_creatinine: string; // Will be converted to float
    gfr: string; // Will be converted to float

    // Optional numerical features (có thể thiếu)
    hematuria: string; // 0 or 1, will be converted to int
    bun: string; // Will be converted to float
    serum_calcium: string; // Will be converted to float
    ana: string; // 0 or 1, will be converted to int
    c3_c4: string; // Will be converted to float
    oxalate_levels: string; // Will be converted to float
    urine_ph: string; // Will be converted to float
    blood_pressure: string; // Will be converted to float
    water_intake: string; // Will be converted to float

    // Essential categorical features (luôn bắt buộc cho primary model, có thể thiếu cho enhanced model)
    physical_activity: string; // 'daily', 'weekly', 'rarely'

    // Optional categorical features (có thể thiếu)
    diet: string; // 'balanced', 'high protein', 'low salt'
    smoking: string; // 'yes', 'no'
    alcohol: string; // 'never', 'occasionally', 'daily'
    painkiller_usage: string; // 'yes', 'no'
    family_history: string; // 'yes', 'no'
    weight_changes: string; // 'stable', 'gain', 'loss'
    stress_level: string; // 'low', 'moderate', 'high'
}

export interface CreatePredictRequest {
    patientId: String;
    stage: Number; // 0, 1, 2, 3, 4,
    recommendations: Array<String>;
    confidence: Number; // 0 - 100
    healthMetrics: Array<HealthMetric>;
}

export interface HealthMetric {
    patientId: String;
    metricName: String;
    metricValue: Number;
    unit: String;
    recordId: String | null;
    measuredAt: Date | null;
}
export interface PredictHealthResponse {
    predicted_stage: String,
    confidence: Number,
    stage_description: String,
    recommendations: Array<String>,
    risk_level: String
}
// API data interface matching Python model (with proper data types)
export interface HealthFormApiData {
    // Essential numerical features (luôn bắt buộc cho primary model, có thể thiếu cho enhanced model)
    serum_creatinine?: number; // Optional[float]
    gfr?: number; // Optional[float]

    // Optional numerical features (có thể thiếu)
    hematuria?: number; // Optional[int] - 0 or 1
    bun?: number; // Optional[float]
    serum_calcium?: number; // Optional[float]
    ana?: number; // Optional[int] - 0 or 1
    c3_c4?: number; // Optional[float]
    oxalate_levels?: number; // Optional[float]
    urine_ph?: number; // Optional[float]
    blood_pressure?: number; // Optional[float]
    water_intake?: number; // Optional[float]

    // Essential categorical features (luôn bắt buộc cho primary model, có thể thiếu cho enhanced model)
    physical_activity?: string; // Optional[str] - 'daily', 'weekly', 'rarely'

    // Optional categorical features (có thể thiếu)
    diet?: string; // Optional[str] - 'balanced', 'high protein', 'low salt'
    smoking?: string; // Optional[str] - 'yes', 'no'
    alcohol?: string; // Optional[str] - 'never', 'occasionally', 'daily'
    painkiller_usage?: string; // Optional[str] - 'yes', 'no'
    family_history?: string; // Optional[str] - 'yes', 'no'
    weight_changes?: string; // Optional[str] - 'stable', 'gain', 'loss'
    stress_level?: string; // Optional[str] - 'low', 'moderate', 'high'
}

export const initialHealthFormData: HealthFormData = {
    serum_creatinine: '',
    gfr: '',
    hematuria: '',
    bun: '',
    serum_calcium: '',
    ana: '',
    c3_c4: '',
    oxalate_levels: '',
    urine_ph: '',
    blood_pressure: '',
    water_intake: '',
    physical_activity: '',
    diet: '',
    smoking: '',
    alcohol: '',
    painkiller_usage: '',
    family_history: '',
    weight_changes: '',
    stress_level: '',
};

// Utility function to convert form data to API data format
export const convertFormDataToApiData = (formData: HealthFormData): HealthFormApiData => {
    const apiData: HealthFormApiData = {};

    // Convert numerical fields (empty strings become undefined)
    const numericalFields = [
        'serum_creatinine', 'gfr', 'bun', 'serum_calcium', 'c3_c4',
        'oxalate_levels', 'urine_ph', 'blood_pressure', 'water_intake'
    ] as const;

    numericalFields.forEach(field => {
        const value = formData[field];
        if (value && value.trim() !== '') {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
                apiData[field] = numValue;
            }
        }
    });

    // Convert integer fields (0 or 1)
    const integerFields = ['hematuria', 'ana'] as const;
    integerFields.forEach(field => {
        const value = formData[field];
        if (value && value.trim() !== '') {
            const intValue = parseInt(value);
            if (!isNaN(intValue) && (intValue === 0 || intValue === 1)) {
                apiData[field] = intValue;
            }
        }
    });

    // Convert categorical fields (empty strings become undefined)
    const categoricalFields = [
        'physical_activity', 'diet', 'smoking', 'alcohol',
        'painkiller_usage', 'family_history', 'weight_changes', 'stress_level'
    ] as const;

    categoricalFields.forEach(field => {
        const value = formData[field];
        if (value && value.trim() !== '') {
            apiData[field] = value;
        }
    });

    return apiData;
};
enum Classification {
    "IMPROVING", "STABLE", "WORSENING", "INSUFFICIENT_HISTORY"
}

enum Status {
    "WARNING", "NORMAL", "IMPROVING"
}

export interface TrendResponse {
    classification: Classification,
    stagePrevious: number,
    stageCurrent: number,
    confidenceChange: number,
    metricPrevious: number,
    metricCurrent: number,
    metricChangePct: number,
    metricName: String,
    summary: String
}

export interface MetricComparison {
    metric: String,
    previousValue: number,
    currentValue: number,
    unit: String,
    changePct: number,
    status: Status,
    message: String
}

export interface AlertResponse {
    trend: TrendResponse,
    metricComparisons: MetricComparison[]
}