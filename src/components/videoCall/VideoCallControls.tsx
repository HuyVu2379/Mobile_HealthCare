import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../theme';

interface VideoCallControlsProps {
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
    onToggleAudio: () => void;
    onToggleVideo: () => void;
    onSwitchCamera: () => void;
    onEndCall: () => void;
}

export const VideoCallControls: React.FC<VideoCallControlsProps> = ({
    isAudioEnabled,
    isVideoEnabled,
    onToggleAudio,
    onToggleVideo,
    onSwitchCamera,
    onEndCall,
}) => {
    return (
        <View style={styles.container}>
            {/* Mic Control */}
            <TouchableOpacity
                style={[styles.button, !isAudioEnabled && styles.buttonDisabled]}
                onPress={onToggleAudio}
                activeOpacity={0.7}
            >
                <Icon
                    name={isAudioEnabled ? 'mic' : 'mic-off'}
                    size={28}
                    color={isAudioEnabled ? colors.white : colors.error}
                />
                <Text style={styles.buttonText}>
                    {isAudioEnabled ? 'Mic' : 'Muted'}
                </Text>
            </TouchableOpacity>

            {/* Camera Control */}
            <TouchableOpacity
                style={[styles.button, !isVideoEnabled && styles.buttonDisabled]}
                onPress={onToggleVideo}
                activeOpacity={0.7}
            >
                <Icon
                    name={isVideoEnabled ? 'videocam' : 'videocam-off'}
                    size={28}
                    color={isVideoEnabled ? colors.white : colors.error}
                />
                <Text style={styles.buttonText}>
                    {isVideoEnabled ? 'Camera' : 'Off'}
                </Text>
            </TouchableOpacity>

            {/* Switch Camera */}
            <TouchableOpacity
                style={styles.button}
                onPress={onSwitchCamera}
                activeOpacity={0.7}
            >
                <Icon name="camera-reverse" size={28} color={colors.white} />
                <Text style={styles.buttonText}>Đổi</Text>
            </TouchableOpacity>

            {/* End Call */}
            <TouchableOpacity
                style={[styles.button, styles.endCallButton]}
                onPress={onEndCall}
                activeOpacity={0.7}
            >
                <Icon name="call" size={28} color={colors.white} />
                <Text style={styles.buttonText}>Kết thúc</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    buttonDisabled: {
        backgroundColor: 'rgba(255, 59, 48, 0.3)',
    },
    endCallButton: {
        backgroundColor: colors.error || '#FF3B30',
    },
    buttonText: {
        color: colors.white || '#FFFFFF',
        fontSize: 12,
        marginTop: 4,
        fontWeight: '500',
    },
});
