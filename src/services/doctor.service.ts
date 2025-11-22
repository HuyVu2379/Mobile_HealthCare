import { DoctorResponse } from "../types/IUser";
import axiosConfig from "./axios.config";
const api_url = '/doctors'
export const getOutstandingDoctors = async (): Promise<DoctorResponse[]> => {
    const result = await axiosConfig.get(`${api_url}/outstanding`);
    console.log("check fetch outStanding doctor:", result);
    return result.data;
}