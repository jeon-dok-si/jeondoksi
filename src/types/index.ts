export interface User {
    userId: number;
    email: string;
    nickname: string;
    level: number;
    currentXp: number;
    point: number;
    stats: {
        logic: number;
        emotion: number;
        action: number;
        total: number;
        average: number;
    };
    dominantType: string;
    character: {
        headUrl: string | null;
        faceUrl: string | null;
        bodyUrl: string | null;
    };
}

export interface Book {
    isbn: string;
    title: string;
    author: string;
    thumbnail: string;
    description: string;
}

export interface Question {
    questionNo: number;
    questionId?: number;
    type: 'MULTIPLE' | 'OX' | 'SHORT';
    question: string;
    options: string[];
    optionsJson?: string;
    answer: string;
}

export interface Quiz {
    quizId: number;
    questions: Question[];
}

export interface Item {
    itemId: number;
    name: string;
    category: 'HEAD' | 'FACE' | 'BODY';
    rarity: 'COMMON' | 'RARE' | 'EPIC';
    imageUrl: string;
}

export interface InventoryItem extends Item {
    invenId: number;
    isEquipped: boolean;
}

export interface Report {
    reportId: number;
    bookTitle: string;
    bookThumbnail: string;
    resultType: string;
    createdAt: string;
}

export interface AuthResponse {
    accessToken: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string | null;
    errorCode: string | null;
}

export interface ReportSubmissionResponse {
    reportId: number;
    book: {
        isbn: string;
        title: string;
        author: string;
        thumbnail: string;
    };
    userContent: string;
    analysisResult: {
        type: string;
        typeName: string;
        scores: {
            logic: number;
            emotion: number;
            action: number;
        };
        feedback: string;
    };
    createdAt: string;
}
