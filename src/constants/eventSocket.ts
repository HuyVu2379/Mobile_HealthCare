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
    },
    ROOM:
    {
        CREATE_ROOM: 'create_room',
        GET_ROOM_BY_DATE: 'get_rooms_by_date',
        UPDATE_ROOM_STATUS: 'update_room_status',
        CREATE_ROOM_RESPONSE: 'create_room_response',
        GET_ROOM_BY_DATE_RESPONSE: 'get_rooms_by_date_response',
        UPDATE_ROOM_STATUS_RESPONSE: 'update_room_status_response',
    },
    APPOINTMENT_RESPONSE: "schedule_appointment_response",
    APPOINTMENT: "schedule_appointment"
};
