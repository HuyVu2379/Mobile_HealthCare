import { CreatePredictRequest } from "../types";
import { ApiSuccessResponse } from "../types/api";
import { PredictResponse } from "../types/IAI";
import axiosConfig from "./axios.config";
const api_url_predict = 'predicts';

export const createPredict = async (data: CreatePredictRequest): Promise<ApiSuccessResponse<PredictResponse>> => {
    return await axiosConfig.post(`${api_url_predict}/create-predict`, data)
}
