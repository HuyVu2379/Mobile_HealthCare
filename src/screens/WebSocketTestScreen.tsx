import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    TextInput,
    SafeAreaView,
    Alert,
} from 'react-native';
import { useWebSocket } from '../hooks/useWebSocket';

interface LogMessage {
    id: string;
    timestamp: string;
    type: 'sent' | 'received' | 'system';
    content: string;
}

const WebSocketTestScreen: React.FC = () => {
    const [serverUrl, setServerUrl] = useState('ws://10.0.2.2:8080/ws/communication');
    const [messageInput, setMessageInput] = useState('Hello from React Native!');
    const [groupId, setGroupId] = useState('group_123');
    const [logs, setLogs] = useState<LogMessage[]>([]);

    const addLog = useCallback((type: LogMessage['type'], content: string) => {
        const newLog: LogMessage = {
            id: Date.now().toString(),
            timestamp: new Date().toLocaleTimeString(),
            type,
            content,
        };
        setLogs(prevLogs => [newLog, ...prevLogs]);
    }, []);

    const { isConnected, connectionStatus, send, connect, disconnect, lastMessage } = useWebSocket(
        serverUrl,
        {
            onOpen: () => {
                addLog('system', 'WebSocket connected successfully');
            },
            onMessage: (message) => {
                addLog('received', JSON.stringify(message, null, 2));
            },
            onError: (error) => {
                addLog('system', `WebSocket error: ${error}`);
            },
            onClose: () => {
                addLog('system', 'WebSocket connection closed');
            },
        }
    );

    const handleConnect = () => {
        if (isConnected) {
            disconnect();
        } else {
            connect();
        }
    };

    const handleJoinGroup = () => {
        if (!isConnected) {
            Alert.alert('Error', 'Please connect to WebSocket first');
            return;
        }

        send('join_group', { groupId });
        addLog('sent', `join_group: { groupId: "${groupId}" }`);
    };

    const handleSendMessage = () => {
        if (!isConnected) {
            Alert.alert('Error', 'Please connect to WebSocket first');
            return;
        }

        send('send_message', {
            groupId,
            message: messageInput,
            timestamp: new Date().toISOString(),
            sender: 'ReactNative_User'
        });
        addLog('sent', `send_message: { message: "${messageInput}" }`);
    };

    const clearLogs = () => {
        setLogs([]);
    };

    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'connected': return '#4CAF50';
            case 'connecting': return '#FF9800';
            case 'error': return '#F44336';
            default: return '#9E9E9E';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>WebSocket Test</Text>
                <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}>
                    <Text style={styles.statusText}>{connectionStatus.toUpperCase()}</Text>
                </View>
            </View>

            {/* Connection Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Connection</Text>
                <TextInput
                    style={styles.input}
                    value={serverUrl}
                    onChangeText={setServerUrl}
                    placeholder="WebSocket Server URL"
                    editable={!isConnected}
                />
                <TouchableOpacity
                    style={[styles.button, isConnected ? styles.disconnectButton : styles.connectButton]}
                    onPress={handleConnect}
                >
                    <Text style={styles.buttonText}>
                        {isConnected ? 'Disconnect' : 'Connect'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Actions Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Actions</Text>

                <View style={styles.inputRow}>
                    <Text style={styles.label}>Group ID:</Text>
                    <TextInput
                        style={[styles.input, styles.smallInput]}
                        value={groupId}
                        onChangeText={setGroupId}
                        placeholder="group_123"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, styles.actionButton]}
                    onPress={handleJoinGroup}
                    disabled={!isConnected}
                >
                    <Text style={styles.buttonText}>Join Group</Text>
                </TouchableOpacity>

                <View style={styles.inputRow}>
                    <Text style={styles.label}>Message:</Text>
                    <TextInput
                        style={[styles.input, styles.messageInput]}
                        value={messageInput}
                        onChangeText={setMessageInput}
                        placeholder="Enter your message"
                        multiline
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, styles.actionButton]}
                    onPress={handleSendMessage}
                    disabled={!isConnected}
                >
                    <Text style={styles.buttonText}>Send Message</Text>
                </TouchableOpacity>
            </View>

            {/* Logs Section */}
            <View style={styles.section}>
                <View style={styles.logsHeader}>
                    <Text style={styles.sectionTitle}>Messages Log ({logs.length})</Text>
                    <TouchableOpacity onPress={clearLogs} style={styles.clearButton}>
                        <Text style={styles.clearButtonText}>Clear</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.logsContainer} showsVerticalScrollIndicator={true}>
                    {logs.length === 0 ? (
                        <Text style={styles.emptyLog}>No messages yet...</Text>
                    ) : (
                        logs.map((log) => (
                            <View key={log.id} style={[styles.logItem, styles[`${log.type}Log`]]}>
                                <View style={styles.logHeader}>
                                    <Text style={styles.logType}>{log.type.toUpperCase()}</Text>
                                    <Text style={styles.logTimestamp}>{log.timestamp}</Text>
                                </View>
                                <Text style={styles.logContent}>{log.content}</Text>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    statusIndicator: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    section: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        marginBottom: 12,
    },
    smallInput: {
        flex: 1,
        marginLeft: 8,
        marginBottom: 0,
    },
    messageInput: {
        minHeight: 60,
        textAlignVertical: 'top',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    label: {
        fontSize: 16,
        color: '#333',
        minWidth: 80,
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 4,
    },
    connectButton: {
        backgroundColor: '#4CAF50',
    },
    disconnectButton: {
        backgroundColor: '#F44336',
    },
    actionButton: {
        backgroundColor: '#2196F3',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    clearButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#FF9800',
        borderRadius: 4,
    },
    clearButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    logsContainer: {
        maxHeight: 300,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 8,
        backgroundColor: '#f9f9f9',
    },
    emptyLog: {
        textAlign: 'center',
        color: '#999',
        fontStyle: 'italic',
        padding: 20,
    },
    logItem: {
        marginBottom: 8,
        padding: 8,
        borderRadius: 4,
        borderLeftWidth: 4,
    },
    sentLog: {
        backgroundColor: '#E3F2FD',
        borderLeftColor: '#2196F3',
    },
    receivedLog: {
        backgroundColor: '#E8F5E8',
        borderLeftColor: '#4CAF50',
    },
    systemLog: {
        backgroundColor: '#FFF3E0',
        borderLeftColor: '#FF9800',
    },
    logHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    logType: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#666',
    },
    logTimestamp: {
        fontSize: 12,
        color: '#999',
    },
    logContent: {
        fontSize: 14,
        color: '#333',
        fontFamily: 'monospace',
    },
});

export default WebSocketTestScreen;