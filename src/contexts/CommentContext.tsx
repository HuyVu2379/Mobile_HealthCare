import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Comment } from '../types/communication';

interface CommentContextType {
    // Comments by target ID (post_id or doctor_id)
    commentsByTarget: Record<string, Comment[]>;

    // Add a new comment to a target
    addComment: (targetId: string, comment: Comment) => void;

    // Set comments for a target
    setCommentsForTarget: (targetId: string, comments: Comment[]) => void;

    // Get comments for a target
    getCommentsForTarget: (targetId: string) => Comment[];

    // Clear comments for a target
    clearCommentsForTarget: (targetId: string) => void;

    // Clear all comments
    clearAllComments: () => void;
}

const CommentContext = createContext<CommentContextType | undefined>(undefined);

interface CommentProviderProps {
    children: ReactNode;
}

export const CommentProvider: React.FC<CommentProviderProps> = ({ children }) => {
    const [commentsByTarget, setCommentsByTarget] = useState<Record<string, Comment[]>>({});

    // Add a new comment to the beginning of the list for a target
    const addComment = useCallback((targetId: string, comment: Comment) => {
        setCommentsByTarget(prev => ({
            ...prev,
            [targetId]: [comment, ...(prev[targetId] || [])]
        }));
    }, []);

    // Set all comments for a target (replace existing)
    const setCommentsForTarget = useCallback((targetId: string, comments: Comment[]) => {
        setCommentsByTarget(prev => ({
            ...prev,
            [targetId]: comments
        }));
    }, []);

    // Get comments for a target
    const getCommentsForTarget = useCallback((targetId: string): Comment[] => {
        return commentsByTarget[targetId] || [];
    }, [commentsByTarget]);

    // Clear comments for a specific target
    const clearCommentsForTarget = useCallback((targetId: string) => {
        setCommentsByTarget(prev => {
            const newState = { ...prev };
            delete newState[targetId];
            return newState;
        });
    }, []);

    // Clear all comments
    const clearAllComments = useCallback(() => {
        setCommentsByTarget({});
    }, []);

    const value: CommentContextType = {
        commentsByTarget,
        addComment,
        setCommentsForTarget,
        getCommentsForTarget,
        clearCommentsForTarget,
        clearAllComments,
    };

    return (
        <CommentContext.Provider value={value}>
            {children}
        </CommentContext.Provider>
    );
};

// Custom hook to use the Comment context
export const useComments = (): CommentContextType => {
    const context = useContext(CommentContext);
    if (!context) {
        throw new Error('useComments must be used within a CommentProvider');
    }
    return context;
};

export default CommentContext;
