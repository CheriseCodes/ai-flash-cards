export interface Image {
    id: string;
    userId: string;
    flashCardId: string;
    prompt: string;
    s3Key?: string;
}