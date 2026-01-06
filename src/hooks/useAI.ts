import { predictCKD, getAlert } from "../services/AI.service"
import { createPredict } from "../services/predict.service"
import { CreatePredictRequest, HealthFormApiData } from "../types"
import { PredictResponse } from "../types/IAI"
const useAI = () => {
    const handlePredictCKD = async (data: HealthFormApiData) => {
        try {
            const response = await predictCKD(data)
            console.log("CKD prediction response:", response)
            return response
        } catch (error) {
            console.error("Error during CKD prediction:", error);
        }
    }

    const handleCreatePredict = async (data: CreatePredictRequest) => {
        try {
            const response = await createPredict(data)
            console.log("Create prediction response:", response)
            return response
        } catch (error) {
            console.error("Error during create prediction:", error);
        }
    }
    const handleGetAlert = async (request: PredictResponse) => {
        try {
            const response = await getAlert(request)
            console.log("Get alert response:", response)
            return response
        } catch (error) {
            console.error("Error during get alert:", error);
        }
    }

    return {
        handlePredictCKD,
        handleCreatePredict,
        handleGetAlert
    }
}

export default useAI;