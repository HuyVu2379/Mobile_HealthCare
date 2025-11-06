import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Alert,
    TextInput,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import {
    StreamCall,
    CallContent,
    useCallStateHooks,
} from '@stream-io/video-react-native-sdk';
import { useSelector } from 'react-redux';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

import { useVideoCall } from '../contexts/VideoCallContext';
import { VideoCallControls, ParticipantInfo, WaitingRoom } from '../components/videoCall';
import { RootState } from '../store/store';
import { colors } from '../theme';

type VideoCallScreenParams = {
    mode: 'create' | 'join';
    roomId?: string;
};

type VideoCallRoute = RouteProp<{ params: VideoCallScreenParams }, 'params'>;

export const VideoCallScreen: React.FC = () => {
    const route = useRoute<VideoCallRoute>();
    const navigation = useNavigation();
    const { user } = useSelector((state: RootState) => state.user);

    const {
        currentCall,
        callState,
        initializeClient,
        createRoom,
        joinRoom,
        leaveCall,
        toggleAudio,
        toggleVideo,
        switchCamera,
    } = useVideoCall();

    const [isInitialized, setIsInitialized] = useState(false);
    const [roomIdInput, setRoomIdInput] = useState(route.params?.roomId || '');
    const [isLoading, setIsLoading] = useState(false);

    // Initialize Stream client when component mounts
    useEffect(() => {
        const init = async () => {
            if (!user?.userId || !user?.fullName) {
                Alert.alert('Lỗi', 'Vui lòng đăng nhập để sử dụng video call');
                navigation.goBack();
                return;
            }

            try {
                const userRole = user.role === 'DOCTOR' ? 'doctor' : 'patient';
                await initializeClient(user.userId, user.fullName, userRole);
                setIsInitialized(true);
            } catch (error) {
                console.error('Failed to initialize video client:', error);
                Alert.alert('Lỗi', 'Không thể khởi tạo dịch vụ video call');
                navigation.goBack();
            }
        };

        init();
    }, [user]);

    // Handle create or auto-join room
    useEffect(() => {
        if (!isInitialized || !user) return;

        const setupCall = async () => {
            const mode = route.params?.mode;

            if (mode === 'create' && user.role === 'DOCTOR') {
                // Doctor creates room
                const roomId = generateRoomId();
                setRoomIdInput(roomId);
                await handleCreateRoom(roomId);
            } else if (mode === 'join' && route.params?.roomId) {
                // Patient joins with roomId
                await handleJoinRoom(route.params.roomId);
            }
        };

        setupCall();
    }, [isInitialized]);

    const generateRoomId = (): string => {
        return `call-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    };

    const handleCreateRoom = async (roomId: string) => {
        if (!user) return;

        setIsLoading(true);
        try {
            await createRoom({
                roomId,
                doctorInfo: {
                    userId: user.userId!,
                    name: user.fullName,
                    role: 'doctor',
                    avatarUrl: user.avatarUrl,
                },
            });
        } catch (error) {
            console.error('Failed to create room:', error);
            Alert.alert('Lỗi', 'Không thể tạo phòng video call');
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinRoom = async (roomId: string) => {
        if (!user || !roomId.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập mã phòng');
            return;
        }

        setIsLoading(true);
        try {
            await joinRoom({
                roomId: roomId.trim(),
                patientInfo: {
                    userId: user.userId!,
                    name: user.fullName,
                    role: 'patient',
                    avatarUrl: user.avatarUrl,
                },
            });
        } catch (error) {
            console.error('Failed to join room:', error);
            Alert.alert('Lỗi', 'Không thể tham gia phòng. Vui lòng kiểm tra mã phòng.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEndCall = async () => {
        Alert.alert(
            'Kết thúc cuộc gọi',
            'Bạn có chắc chắn muốn kết thúc cuộc gọi?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Kết thúc',
                    style: 'destructive',
                    onPress: async () => {
                        await leaveCall();
                        navigation.goBack();
                    },
                },
            ]
        );
    };

    // Render Setup Screen (for manual join)
    if (!currentCall && route.params?.mode !== 'create') {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={24} color={colors.gray[900]} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Tham gia cuộc gọi</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={styles.setupContainer}>
                    <Icon name="videocam" size={80} color={colors.primary[500]} />
                    <Text style={styles.setupTitle}>Nhập mã phòng</Text>
                    <Text style={styles.setupSubtitle}>
                        Nhập mã phòng mà bác sĩ đã cung cấp để tham gia cuộc gọi
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Ví dụ: call-1234567890-abc"
                        value={roomIdInput}
                        onChangeText={setRoomIdInput}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <TouchableOpacity
                        style={[styles.joinButton, isLoading && styles.buttonDisabled]}
                        onPress={() => handleJoinRoom(roomIdInput)}
                        disabled={isLoading || !roomIdInput.trim()}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.joinButtonText}>
                            {isLoading ? 'Đang tham gia...' : 'Tham gia phòng'}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        );
    }

    // Render Video Call UI
    return (
        <SafeAreaView style={styles.container}>
            {currentCall ? (
                <StreamCall call={currentCall}>
                    <VideoCallUI
                        callState={callState}
                        onToggleAudio={toggleAudio}
                        onToggleVideo={toggleVideo}
                        onSwitchCamera={switchCamera}
                        onEndCall={handleEndCall}
                        user={user}
                        roomId={roomIdInput}
                    />
                </StreamCall>
            ) : (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Đang khởi tạo cuộc gọi...</Text>
                </View>
            )}
        </SafeAreaView>
    );
};

// Video Call UI Component
interface VideoCallUIProps {
    callState: any;
    onToggleAudio: () => void;
    onToggleVideo: () => void;
    onSwitchCamera: () => void;
    onEndCall: () => void;
    user: any;
    roomId: string;
}

const VideoCallUI: React.FC<VideoCallUIProps> = ({
    callState,
    onToggleAudio,
    onToggleVideo,
    onSwitchCamera,
    onEndCall,
    user,
    roomId,
}) => {
    const { useParticipants, useCallCallingState } = useCallStateHooks();
    const participants = useParticipants();
    const callingState = useCallCallingState();

    const isWaiting = participants.length < 2;
    const isDoctor = user?.role === 'DOCTOR';

    return (
        <View style={styles.callContainer}>
            {/* Video Content */}
            <View style={styles.videoContainer}>
                {isWaiting && isDoctor ? (
                    <WaitingRoom roomId={roomId} doctorName={user.fullName} />
                ) : (
                    <CallContent />
                )}
            </View>

            {/* Participant Info Overlay */}
            {!isWaiting && (
                <View style={styles.participantOverlay}>
                    {participants.map((participant) => (
                        <ParticipantInfo
                            key={participant.userId}
                            name={participant.name || participant.userId}
                            role={participant.userId === user?.userId
                                ? (isDoctor ? 'doctor' : 'patient')
                                : (isDoctor ? 'patient' : 'doctor')
                            }
                            isCurrentUser={participant.userId === user?.userId}
                        />
                    ))}
                </View>
            )}

            {/* Call Status */}
            <View style={styles.statusBar}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>
                    {callingState === 'joined' ? 'Đang kết nối' : 'Đang gọi...'}
                </Text>
            </View>

            {/* Controls */}
            <View style={styles.controlsContainer}>
                <VideoCallControls
                    isAudioEnabled={callState.isAudioEnabled}
                    isVideoEnabled={callState.isVideoEnabled}
                    onToggleAudio={onToggleAudio}
                    onToggleVideo={onToggleVideo}
                    onSwitchCamera={onSwitchCamera}
                    onEndCall={onEndCall}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[200],
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.gray[900],
    },
    setupContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    setupTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: colors.gray[900],
        marginTop: 24,
        marginBottom: 12,
    },
    setupSubtitle: {
        fontSize: 16,
        color: colors.gray[600],
        textAlign: 'center',
        marginBottom: 32,
    },
    input: {
        width: '100%',
        height: 56,
        borderWidth: 1,
        borderColor: colors.gray[300],
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: colors.white,
        marginBottom: 24,
    },
    joinButton: {
        width: '100%',
        height: 56,
        backgroundColor: colors.primary[500],
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    joinButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: colors.gray[600],
    },
    callContainer: {
        flex: 1,
        backgroundColor: colors.black,
    },
    videoContainer: {
        flex: 1,
    },
    participantOverlay: {
        position: 'absolute',
        top: 60,
        left: 16,
        right: 16,
        flexDirection: 'column',
        gap: 12,
    },
    statusBar: {
        position: 'absolute',
        top: 16,
        left: 16,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4CAF50',
        marginRight: 8,
    },
    statusText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '500',
    },
    controlsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
});
