import { CreatePaymentRequest, CreatePaymentResponse, PaymentStatusResponse } from "../types/payment";
import axiosConfig from "./axios.config";

const payment_api_url = '/payments';

export const createPayment = async (paymentData: CreatePaymentRequest): Promise<CreatePaymentResponse> => {
    try {
        const response = await axiosConfig.post(`${payment_api_url}/create`, paymentData);
        return response.data;
    } catch (error) {
        console.error("Error creating payment:", error);
        throw error;
    }
}

export const getPaymentById = async (paymentId: string): Promise<PaymentStatusResponse> => {
    try {
        const response = await axiosConfig.get(`${payment_api_url}/${paymentId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching payment status:", error);
        throw error;
    }
}

export const cancelPayment = async (orderCode: number): Promise<void> => {
    try {
        await axiosConfig.post(`${payment_api_url}/cancel/orderCode/${orderCode}`);
    } catch (error) {
        console.error("Error cancelling payment:", error);
        throw error;
    }
}