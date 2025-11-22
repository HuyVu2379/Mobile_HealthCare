export interface Comment {
    comment_id: string;
    target_id: string;
    target_type: CommentTargetType;
    author_id: string;
    author_name: string;
    author_avatar: string;
    content: string;
    rating: number;
    imageUrls: string[];
    createdAt: string;
    updatedAt: string;
}

export enum CommentTargetType {
    POST, DOCTOR
}

export interface CreateCommentRequest {
    target_id: string
    target_type: CommentTargetType
    author_id: string,
    author_name: string,
    author_avatar: string,
    content: string,
    rating: number,
    imageUrls: string[]
}

export interface UploadFile {
    imageUrls: string[];
    publicIds: string[];
}

export interface Post {
    post_id: string;
    author_id: string;
    author_name: string;
    author_avatar: string;
    title: string;
    content: string;
    image_urls: string[];
    category: 'BLOG' | 'NEW';
    createdAt?: string;
    updatedAt?: string;
}

export enum PostCategory {
    BLOG = 'BLOG',
    NEW = 'NEW'
}