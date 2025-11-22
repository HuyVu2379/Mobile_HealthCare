import { Comment, CreateCommentRequest } from "../types/communication";
import axiosConfig from "./axios.config";
import { CustomApiResponse } from "../types/api";
const api_url = '/comments'

export const getCommentsByDoctorId = async (doctorId: string, page: number, size: number): Promise<Comment[]> => {
    const params = { page, size }
    const result = await axiosConfig.get(`${api_url}/doctor/${doctorId}`, { params });
    return result.data.content;
}

export const postComment = async (comment: CreateCommentRequest): Promise<any> => {
    const result = await axiosConfig.post(`${api_url}/create`, comment);
    return result;
}

export const getCommentByPostId = async (postId: string, page: number, size: number): Promise<any> => {
    const params = { page, size }
    const result = await axiosConfig.get(`${api_url}/byPost/${postId}`, { params });
    return result;
}