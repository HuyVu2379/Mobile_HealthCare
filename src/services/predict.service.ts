import { CreatePredictRequest } from "../types";
import axiosConfig from "./axios.config";
const api_url_predict = 'predicts';

export const createPredict = async (data: CreatePredictRequest): Promise<any> => {
    return await axiosConfig.post(`${api_url_predict}/create-predict`, data)
}