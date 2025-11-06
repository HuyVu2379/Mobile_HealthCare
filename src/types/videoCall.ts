export interface VideoCallParticipant {
    userId: string;
    name: string;
    role: 'doctor' | 'patient';
    avatarUrl?: string;
}

export interface VideoCallRoom {
    roomId: string;
    callId: string;
    createdBy: string;
    createdAt: Date;
    status: 'waiting' | 'active' | 'ended';
    participants: VideoCallParticipant[];
}

export interface VideoCallState {
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
    isFrontCamera: boolean;
    isInCall: boolean;
    room?: VideoCallRoom;
}

export interface CreateRoomParams {
    roomId: string;
    doctorInfo: VideoCallParticipant;
}

export interface JoinRoomParams {
    roomId: string;
    patientInfo: VideoCallParticipant;
}
