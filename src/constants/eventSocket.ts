export const SOCKET_ACTIONS = {
    AUTHENTICATION: 'authenticate',
    JOIN_GROUP: 'join_group',
    SEND_MESSAGE: 'send_message',
    LEAVE_GROUP: 'leave_group',
    HEARTBEAT: 'heartbeat',
    ERROR: 'error',
    GROUP: {
        CREATE_GROUP: 'create_group',
        SEND_MESSAGE: 'send_message',
        GET_MESSAGES: 'get_messages',
        GET_GROUPS: 'get_groups',
        JOIN_GROUP: 'join_group',
        LEAVE_GROUP: 'leave_group',

        GROUP_CREATED: 'group_created',
        GET_MESSAGES_RESPONSE: "messages",
        GET_GROUPS_RESPONSE: "groups",
        MESSAGE_RECEIVED: 'message_received',
        DELETE_GROUP: 'delete_group',
        GROUP_DELETED: 'group_deleted',
    }
};
