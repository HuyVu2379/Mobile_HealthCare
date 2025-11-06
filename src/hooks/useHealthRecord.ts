import { getHealthMetricByPatient, getMedicalRecordByPatient } from "../services/healthRecord.service";
import { HealthMetricPanelResponse } from "../types/healthRecord";
import { useState } from "react";
import { Record } from "../types/healthRecord";
const useHealthRecord = () => {
    const [healthMetrics, setHealthMetrics] = useState<HealthMetricPanelResponse[]>([]);
    const [medicalRecords, setMedicalRecords] = useState<Record[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const handleGetHealthMetricByPatient = async (patientId: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getHealthMetricByPatient(patientId);
            console.log("check response from health metric response: ", response);

            // Response là một array
            setHealthMetrics(Array.isArray(response) ? response : [response]);
            return response;
        } catch (error) {
            console.error("Error fetching health metrics:", error);
            setError("Failed to fetch health metrics");
        } finally {
            setLoading(false);
        }
    };
    const handleGetMedicalRecordByPatient = async (patientId: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getMedicalRecordByPatient(patientId);
            console.log("check response from medical record response: ", response);
            setMedicalRecords(response.records);
            return response;
        } catch (error) {
            console.error("Error fetching medical records:", error);
            setError("Failed to fetch medical records");
        } finally {
            setLoading(false);
        }
    };
    return {
        handleGetHealthMetricByPatient,
        handleGetMedicalRecordByPatient,
        healthMetrics,
        medicalRecords,
        loading,
        error
    };
};


export default useHealthRecord;