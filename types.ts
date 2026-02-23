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
}

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
