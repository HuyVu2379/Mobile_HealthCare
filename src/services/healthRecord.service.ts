import { HealthMetricPanelResponse, RecordResponse } from "../types/healthRecord";
import axiosConfig from "./axios.config";

const api_url_metric = '/health-metrics/by-patient';
const api_url_record = '/medical-records/patient';
export const getHealthMetricByPatient = async (patientId: string): Promise<HealthMetricPanelResponse> => {
    try {
        const response = await axiosConfig.get(`${api_url_metric}`,
            {
                params: {
                    patientId: patientId
                }
            }
        );
        console.log("check response health metric: ", response);

        return response.data;
    } catch (error) {
        console.error("Error fetching health metrics:", error);
        throw error;
    }
};

export const getMedicalRecordByPatient = async (patientId: string): Promise<RecordResponse> => {
    try {
        const response = await axiosConfig.get(`${api_url_record}/${patientId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching medical records:", error);
        throw error;
    }
}