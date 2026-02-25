export enum AppState {
    IDLE = 'IDLE',
    OVERCLOCKED = 'OVERCLOCKED'
}

export enum PersonalityMode {
    INTROVERT = 'INTROVERT',
    EXTROVERT = 'EXTROVERT'
}

export interface Artifact {
    id: string;
    title: string;
    category: string;
    date: string;
    description: string;
    techStack: string[];
    projectUrl?: string;
    sourceUrl?: string;
}

export enum LogCategory {
    DEV = 'DEV',
    RESEARCH = 'RESEARCH',
    SYSTEM = 'SYSTEM',
    THOUGHTS = 'THOUGHTS',
    TUTORIAL = 'TUTORIAL',
    HARDWARE = 'HARDWARE',
    TECH = 'NODE',
}

export const CATEGORY_COLORS: Record<LogCategory, string> = {
    [LogCategory.DEV]: '#60ff60',
    [LogCategory.RESEARCH]: '#a78bfa',
    [LogCategory.SYSTEM]: '#fbbf24',
    [LogCategory.THOUGHTS]: '#00FFFF',
    [LogCategory.TUTORIAL]: '#f472b6',
    [LogCategory.HARDWARE]: '#fb923c',
    [LogCategory.TECH]: '#ef4444',
};

export interface LogEntry {
    id: string;
    date: string;
    category: LogCategory;
    title: string;
    readTime: string;
    preview: string;
    content: string;
    tags?: string[];
}
