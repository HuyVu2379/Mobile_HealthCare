import { UploadFile } from "../types/communication";
import axiosConfig from "./axios.config";
const api_url = '/upload'

export const uploadMutiFiles = async (formData: FormData): Promise<UploadFile> => {
    const result = await axiosConfig.post(`${api_url}/multiple`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return result.data;
}