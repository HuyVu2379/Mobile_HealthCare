import axiosConfig from "./axios.config";
const api_url_predict = 'analysis';
const api_url_chatbot = 'chat';
import { ChatRequest, ChatResponse, PredictResponse } from "../types/IAI";
import { AlertResponse, HealthFormApiData, PredictHealthResponse } from "../types";
export const predictCKD = async (data: HealthFormApiData): Promise<PredictHealthResponse> => {
    return await axiosConfig.post(`${api_url_predict}/ckd-prediction`, data)
}
export const askAI = async (data: ChatRequest): Promise<ChatResponse> => {
    return await axiosConfig.post(`${api_url_chatbot}/ask`, data, {
        timeout: 60000 // 60 seconds for AI response
    })
}

export const getAlert = async (request: PredictResponse): Promise<AlertResponse> => {
    return await axiosConfig.post(`${api_url_predict}/predict-current-trends`, request)
}