// import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
// import { Call, StreamCall, StreamVideoClient } from '@stream-io/video-react-native-sdk';
// import Toast from 'react-native-toast-message';

// import {
//     VideoCallState,
//     CreateRoomParams,
//     JoinRoomParams,
//     VideoCallRoom
// } from '../types/videoCall';
// import {
//     initializeStreamClient,
//     getStreamClient,
//     disconnectStreamClient,
//     generateStreamToken
// } from '../services/videoCall.service';

// interface VideoCallContextType {
//     // State
//     callState: VideoCallState;
//     currentCall: Call | null;
//     client: StreamVideoClient | null;

//     // Actions
//     initializeClient: (userId: string, userName: string, userRole: 'doctor' | 'patient') => Promise<void>;
//     createRoom: (params: CreateRoomParams) => Promise<Call | null>;
//     joinRoom: (params: JoinRoomParams) => Promise<Call | null>;
//     leaveCall: () => Promise<void>;
//     toggleAudio: () => void;
//     toggleVideo: () => void;
//     switchCamera: () => void;
// }

// const VideoCallContext = createContext<VideoCallContextType | null>(null);

// interface VideoCallProviderProps {
//     children: React.ReactNode;
// }

// export const VideoCallProvider: React.FC<VideoCallProviderProps> = ({ children }) => {
//     const [client, setClient] = useState<StreamVideoClient | null>(null);
//     const [currentCall, setCurrentCall] = useState<Call | null>(null);
//     const [callState, setCallState] = useState<VideoCallState>({
//         isAudioEnabled: true,
//         isVideoEnabled: true,
//         isFrontCamera: true,
//         isInCall: false,
//     });

//     /**
//      * Khởi tạo Stream Video Client
//      */
//     const initializeClient = useCallback(async (
//         userId: string,
//         userName: string,
//         userRole: 'doctor' | 'patient'
//     ) => {
//         try {
//             console.log('🎥 Initializing Stream Video Client...', { userId, userName, userRole });

//             // Verify user đã login (có accessToken)
//             // Generate token sẽ check accessToken và return empty string nếu chưa login
//             // Empty string sẽ trigger development mode
//             let token: string | undefined;
//             try {
//                 token = await generateStreamToken(userId);
//                 if (!token || token === '') {
//                     console.log('📱 Using Stream development mode (no backend token API)');
//                 }
//             } catch (error) {
//                 console.warn('⚠️ Failed to generate token, using development mode:', error);
//                 token = '';
//             }

//             // Initialize client
//             const streamClient = await initializeStreamClient(userId, userName, userRole, token);
//             setClient(streamClient);

//             console.log('✅ Stream Video Client initialized successfully');
//             Toast.show({
//                 type: 'success',
//                 text1: 'Kết nối thành công',
//                 text2: 'Sẵn sàng thực hiện cuộc gọi video',
//             });
//         } catch (error) {
//             console.error('❌ Failed to initialize Stream Video Client:', error);
//             Toast.show({
//                 type: 'error',
//                 text1: 'Lỗi kết nối',
//                 text2: 'Không thể khởi tạo dịch vụ video call',
//             });
//             throw error;
//         }
//     }, []);

//     /**
//      * Tạo phòng mới (Bác sĩ tạo)
//      */
//     const createRoom = useCallback(async (params: CreateRoomParams): Promise<Call | null> => {
//         try {
//             if (!client) {
//                 throw new Error('Stream client not initialized');
//             }

//             console.log('🏥 Creating video call room...', params);

//             // Tạo call với callId = roomId
//             const call = client.call('default', params.roomId);

//             // Join call với role là host
//             await call.join({
//                 create: true,
//                 data: {
//                     custom: {
//                         doctorId: params.doctorInfo.userId,
//                         doctorName: params.doctorInfo.name,
//                         createdAt: new Date().toISOString(),
//                     },
//                 },
//             });

//             setCurrentCall(call);
//             setCallState(prev => ({ ...prev, isInCall: true }));

//             console.log('✅ Room created successfully:', params.roomId);
//             Toast.show({
//                 type: 'success',
//                 text1: 'Phòng đã được tạo',
//                 text2: `Mã phòng: ${params.roomId}`,
//             });

//             return call;
//         } catch (error) {
//             console.error('❌ Failed to create room:', error);
//             Toast.show({
//                 type: 'error',
//                 text1: 'Lỗi tạo phòng',
//                 text2: 'Không thể tạo phòng video call',
//             });
//             return null;
//         }
//     }, [client]);

//     /**
//      * Tham gia phòng (Bệnh nhân join)
//      */
//     const joinRoom = useCallback(async (params: JoinRoomParams): Promise<Call | null> => {
//         try {
//             if (!client) {
//                 throw new Error('Stream client not initialized');
//             }

//             console.log('👤 Joining video call room...', params);

//             // Get or create call với roomId
//             const call = client.call('default', params.roomId);

//             // Join call
//             await call.join({
//                 create: false,
//                 data: {
//                     custom: {
//                         patientId: params.patientInfo.userId,
//                         patientName: params.patientInfo.name,
//                         joinedAt: new Date().toISOString(),
//                     },
//                 },
//             });

//             setCurrentCall(call);
//             setCallState(prev => ({ ...prev, isInCall: true }));

//             console.log('✅ Joined room successfully:', params.roomId);
//             Toast.show({
//                 type: 'success',
//                 text1: 'Đã tham gia phòng',
//                 text2: 'Bắt đầu cuộc gọi video',
//             });

//             return call;
//         } catch (error) {
//             console.error('❌ Failed to join room:', error);
//             Toast.show({
//                 type: 'error',
//                 text1: 'Lỗi tham gia phòng',
//                 text2: 'Không thể tham gia phòng video call',
//             });
//             return null;
//         }
//     }, [client]);

//     /**
//      * Rời khỏi cuộc gọi
//      */
//     const leaveCall = useCallback(async () => {
//         try {
//             if (currentCall) {
//                 console.log('👋 Leaving call...');
//                 await currentCall.leave();
//                 setCurrentCall(null);
//                 setCallState(prev => ({
//                     ...prev,
//                     isInCall: false,
//                     isAudioEnabled: true,
//                     isVideoEnabled: true,
//                 }));

//                 console.log('✅ Left call successfully');
//                 Toast.show({
//                     type: 'info',
//                     text1: 'Đã rời phòng',
//                     text2: 'Cuộc gọi đã kết thúc',
//                 });
//             }
//         } catch (error) {
//             console.error('❌ Failed to leave call:', error);
//         }
//     }, [currentCall]);

//     /**
//      * Bật/tắt mic
//      */
//     const toggleAudio = useCallback(() => {
//         if (currentCall) {
//             const newState = !callState.isAudioEnabled;
//             currentCall.microphone.toggle();
//             setCallState(prev => ({ ...prev, isAudioEnabled: newState }));
//             console.log('🎤 Audio toggled:', newState);
//         }
//     }, [currentCall, callState.isAudioEnabled]);

//     /**
//      * Bật/tắt camera
//      */
//     const toggleVideo = useCallback(() => {
//         if (currentCall) {
//             const newState = !callState.isVideoEnabled;
//             currentCall.camera.toggle();
//             setCallState(prev => ({ ...prev, isVideoEnabled: newState }));
//             console.log('📹 Video toggled:', newState);
//         }
//     }, [currentCall, callState.isVideoEnabled]);

//     /**
//      * Đổi camera trước/sau
//      */
//     const switchCamera = useCallback(() => {
//         if (currentCall) {
//             currentCall.camera.flip();
//             setCallState(prev => ({ ...prev, isFrontCamera: !prev.isFrontCamera }));
//             console.log('🔄 Camera switched');
//         }
//     }, [currentCall]);

//     /**
//      * Cleanup khi unmount
//      */
//     useEffect(() => {
//         return () => {
//             if (currentCall) {
//                 currentCall.leave().catch(console.error);
//             }
//             if (client) {
//                 disconnectStreamClient().catch(console.error);
//             }
//         };
//     }, []);

//     const value: VideoCallContextType = {
//         callState,
//         currentCall,
//         client,
//         initializeClient,
//         createRoom,
//         joinRoom,
//         leaveCall,
//         toggleAudio,
//         toggleVideo,
//         switchCamera,
//     };

//     return (
//         <VideoCallContext.Provider value={value}>
//             {children}
//         </VideoCallContext.Provider>
//     );
// };

// export const useVideoCall = (): VideoCallContextType => {
//     const context = useContext(VideoCallContext);
//     if (!context) {
//         throw new Error('useVideoCall must be used within VideoCallProvider');
//     }
//     return context;
// };
