export type ChatRequest = {
    message: String,
    user_id: String,
    group_id: String,
}

export type ChatResponse = {
    response: String,
    confidence: Number,
}
