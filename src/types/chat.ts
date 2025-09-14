export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

export interface SuggestionItem {
    id: string;
    text: string;
}