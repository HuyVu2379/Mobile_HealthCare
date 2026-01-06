
export interface CreatePaymentRequest {
    appointmentId: string;
    amount: number;
    description: string;
    returnUrl: string;
    cancelUrl: string;
}

export interface CreatePaymentResponse {
    paymentId: string;
    appointmentId: string;
    orderCode: string;
    paymentUrl: string;
    amount: number;
    expiresAt: string;
    status: string;
    message: string;
}

export interface PaymentStatusResponse {
    paymentId: string;
    appointmentId: string;
    orderCode: number;
    amount: number;
    status: string;
    paymentMethod: string;
    createdAt: string;
    paidAt: string | null;
    expiresAt: string;
    transactionId: string | null;
}