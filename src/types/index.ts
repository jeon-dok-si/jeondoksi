export interface Character {
    characterId: number;
    name: string;
    rarity: 'COMMON' | 'RARE' | 'EPIC' | 'UNIQUE';
    level: number;
    currentXp: number;
    requiredXp: number;
    imageUrl: string;
    isEquipped: boolean;
}

export interface Book {
    isbn: string;
    title: string;
    author: string;
    thumbnail: string;
    description?: string;
    keywords?: string;
}



export interface Question {
    questionNo: number;
    questionId: number;
    question: string;
    type: 'MULTIPLE' | 'OX' | 'SHORT';
    options?: string[];
    optionsJson?: string;
}

export interface Quiz {
    quizId: number;
    questions: Question[];
}

export interface User {
    userId: number;
    email: string;
    nickname: string;
    point: number;
    stats: {
        logic: number;
        emotion: number;
        action: number;
        total: number;
        average: number;
    };
    dominantType: string;
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

export interface Guild {
    id: number;
    name: string;
    description: string;
    maxMembers: number;
    currentMemberCount: number;
    isPrivate: boolean;
    hasPassword: boolean;
    leaderName: string;
    joinCode?: string;
    currentBossId?: number;
}

export interface Boss {
    id: number;
    name: string;
    description: string;
    level: number;
    maxHp: number;
    currentHp: number;
    imageUrl: string;
    isActive: boolean;
    startAt?: string;
    endAt?: string;
}

export interface GuildMember {
    userId: number;
    nickname: string;
    role: 'LEADER' | 'OFFICER' | 'MEMBER';
    joinedAt: string;
}
