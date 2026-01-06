import { useState, useCallback, useRef } from 'react';
import { getPaymentById } from '../services/payment.service';

interface UsePaymentPollingResult {
    isPolling: boolean;
    startPolling: (paymentId: string, onSuccess: () => void, onFailed: (error: string) => void) => void;
    stopPolling: () => void;
}

/**
 * Hook để polling trạng thái thanh toán
 * Gọi API mỗi 2s, tối đa 10 lần
 */
export const usePaymentPolling = (): UsePaymentPollingResult => {
    const [isPolling, setIsPolling] = useState(false);
    const intervalRef = useRef<number | null>(null);
    const attemptCountRef = useRef(0);
    const maxAttempts = 100;
    const pollingInterval = 2000; // 2 seconds

    const stopPolling = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsPolling(false);
        attemptCountRef.current = 0;
    }, []);

    const startPolling = useCallback((
        paymentId: string,
        onSuccess: () => void,
        onFailed: (error: string) => void
    ) => {
        // Reset và bắt đầu polling
        stopPolling();
        setIsPolling(true);
        attemptCountRef.current = 0;

        console.log(`🔄 Starting payment polling for paymentId: ${paymentId}`);

        const checkPaymentStatus = async () => {
            try {
                attemptCountRef.current += 1;
                console.log(`🔍 Payment polling attempt ${attemptCountRef.current}/${maxAttempts}`);

                const response = await getPaymentById(paymentId);
                console.log('💳 Payment status:', response);

                if (response.status === 'PAID') {
                    console.log('✅ Payment successful!');
                    stopPolling();
                    onSuccess();
                    return;
                }

                if (response.status === 'EXPIRED' || response.status === 'CANCELLED') {
                    console.log('❌ Payment failed:', response.status);
                    stopPolling();
                    onFailed(
                        response.status === 'EXPIRED'
                            ? 'Thanh toán đã hết hạn'
                            : 'Thanh toán đã bị hủy'
                    );
                    return;
                }

                // Nếu đã đạt số lần thử tối đa
                if (attemptCountRef.current >= maxAttempts) {
                    console.log('⏰ Max polling attempts reached');
                    stopPolling();
                    onFailed('Không thể xác nhận trạng thái thanh toán. Vui lòng kiểm tra lại sau.');
                }
            } catch (error) {
                console.error('❌ Error checking payment status:', error);

                // Nếu đã đạt số lần thử tối đa, dừng polling
                if (attemptCountRef.current >= maxAttempts) {
                    stopPolling();
                    onFailed('Không thể kiểm tra trạng thái thanh toán. Vui lòng thử lại sau.');
                }
                // Nếu chưa đạt max attempts, tiếp tục polling ở lần interval tiếp theo
            }
        };

        // Gọi ngay lần đầu tiên
        checkPaymentStatus();

        // Sau đó gọi mỗi 2 giây
        intervalRef.current = setInterval(checkPaymentStatus, pollingInterval);
    }, [stopPolling]);

    return {
        isPolling,
        startPolling,
        stopPolling,
    };
};
