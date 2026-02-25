import { LogEntry, LogCategory } from './types';

// Let Vite automatically find all .md files in the content/logs folder
// Eager mode bundles them instantly, '?raw' imports them as raw string content
const logFiles = import.meta.glob('./logs/*.md', { eager: true, query: '?raw' });

// A minimal parser to extract YAML-style frontmatter without needing external dependencies
function parseFrontmatter(rawString: string) {
    const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
    const match = rawString.match(frontmatterRegex);
    if (!match) return { attributes: {} as any, body: rawString };

    const lines = match[1].split(/\r?\n/);
    const attributes: Record<string, any> = {};
    let currentTagList: string[] | null = null;

    lines.forEach(line => {
        // Parse list items (like for tags)
        if (line.trim().startsWith('- ') && currentTagList !== null) {
            currentTagList.push(line.replace('-', '').trim());
        } else {
            const colonIdx = line.indexOf(':');
            if (colonIdx !== -1) {
                const key = line.slice(0, colonIdx).trim();
                const value = line.slice(colonIdx + 1).trim();

                if (value === "") {
                    // Empty value implies the start of a list
                    currentTagList = [];
                    attributes[key] = currentTagList;
                } else {
                    currentTagList = null;
                    let cleanValue = value;
                    // Strip surrounding quotes
                    if ((cleanValue.startsWith("'") && cleanValue.endsWith("'")) ||
                        (cleanValue.startsWith('"') && cleanValue.endsWith('"'))) {
                        cleanValue = cleanValue.slice(1, -1);
                    }
                    attributes[key] = cleanValue;
                }
            }
        }
    });

    return { attributes, body: match[2].trim() };
}

// Convert the imported string blobs into our LogEntry structure
export const logs: LogEntry[] = Object.values(logFiles).map((fileModule: any) => {
    const rawContent = fileModule.default as string;
    const { attributes, body } = parseFrontmatter(rawContent);

    return {
        id: attributes.id || 'UNKNOWN-ID',
        date: attributes.date || 'XXXX.XX.XX',
        category: (attributes.category as LogCategory) || LogCategory.DEV,
        title: attributes.title || 'Untitled',
        readTime: attributes.readTime || '0 MIN',
        preview: attributes.preview || '',
        tags: attributes.tags || [],
        content: body,
    };
}).sort((a, b) => {
    // Sort descending by ID so the newest (highest number) comes first
    return b.id.localeCompare(a.id);
});

export const getLogById = (id: string): LogEntry | undefined => {
    return logs.find(log => log.id === id);
};

export const getLogsByCategory = (category: LogCategory): LogEntry[] => {
    return logs.filter(log => log.category === category);
};

export const getAllCategories = (): LogCategory[] => {
    return Object.values(LogCategory);
};
