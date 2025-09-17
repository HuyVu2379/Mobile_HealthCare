import axiosConfig from "./axios.config";
const api_url_predict = 'analysis';
const api_url_chatbot = 'chat';
import { ChatRequest } from "../types/IAI";
export const predictCKD = async (data: FormData) => {
    return await axiosConfig.post(`${api_url_predict}/ckd-prediction`, data)
}
export const askAI = async (data: ChatRequest) => {
    return await axiosConfig.post(`${api_url_chatbot}/ask`, data)
}
