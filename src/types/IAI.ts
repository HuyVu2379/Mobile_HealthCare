export type ChatRequest = {
    message: String,
    user_id: String,
    group_id: String,
}

export type ChatResponse = {
    response: String,
    confidence: Number,
}
export interface PredictResponse {
    predictId: string;
    patientId: string;
    stage: number;
    recommendations: string[];
    confidence: number;
    createdAt: string;
    updatedAt: string;
}