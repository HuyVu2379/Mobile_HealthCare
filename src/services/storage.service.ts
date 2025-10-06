import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
    CURRENT_GROUP_AI_ID: 'currentGroupAIId',
};

export const StorageService = {
    // Save current AI group ID
    async saveCurrentGroupAIId(groupId: string): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_GROUP_AI_ID, groupId);
        } catch (error) {
            console.error('Error saving currentGroupAIId to storage:', error);
        }
    },

    // Get current AI group ID
    async getCurrentGroupAIId(): Promise<string | null> {
        try {
            const groupId = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_GROUP_AI_ID);
            return groupId;
        } catch (error) {
            console.error('Error getting currentGroupAIId from storage:', error);
            return null;
        }
    },

    // Clear current AI group ID
    async clearCurrentGroupAIId(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_GROUP_AI_ID);
        } catch (error) {
            console.error('Error clearing currentGroupAIId from storage:', error);
        }
    },

    // Check if current AI group ID exists in storage
    async hasCurrentGroupAIId(): Promise<boolean> {
        try {
            const groupId = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_GROUP_AI_ID);
            return groupId !== null;
        } catch (error) {
            console.error('Error checking currentGroupAIId in storage:', error);
            return false;
        }
    },
};