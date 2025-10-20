import axiosConfig from "./axios.config";
const api_url_predict = 'analysis';
const api_url_chatbot = 'chat';
import { ChatRequest, ChatResponse } from "../types/IAI";
import { AlertResponse, HealthFormApiData, PredictHealthResponse } from "../types";
export const predictCKD = async (data: HealthFormApiData): Promise<PredictHealthResponse> => {
    return await axiosConfig.post(`${api_url_predict}/ckd-prediction`, data)
}
export const askAI = async (data: ChatRequest): Promise<ChatResponse> => {
    return await axiosConfig.post(`${api_url_chatbot}/ask`, data)
}

export const getAlert = async (patientId: String): Promise<AlertResponse> => {
    return await axiosConfig.get(`${api_url_predict}/predict-current-trends/${patientId}`)
}