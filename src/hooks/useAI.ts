import { predictCKD } from "../services/AI.service"
import { createPredict } from "../services/predict.service"
import { CreatePredictRequest, HealthFormApiData } from "../types"
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
    return {
        handlePredictCKD,
        handleCreatePredict
    }
}

export default useAI;