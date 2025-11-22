import { Post } from "../types/communication";
import axiosConfig from "./axios.config";
import { CustomApiResponse } from "../types/api";
const api_url = '/posts'

export const getPosts = async (page: number, size: number): Promise<any> => {
    const params = { page, size }
    const result = await axiosConfig.get(`${api_url}/getPostWithPagination`, { params });
    console.log("check result get post:", result);
    return result;
}