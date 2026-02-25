import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppState, PersonalityMode } from './content/types';

interface AppContextType {
    appState: AppState;
    setAppState: (state: AppState) => void;
    personality: PersonalityMode;
    setPersonality: (mode: PersonalityMode) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [appState, setAppState] = useState<AppState>(AppState.IDLE);
    const [personality, setPersonality] = useState<PersonalityMode>(PersonalityMode.INTROVERT);

    return (
        <AppContext.Provider value={{ appState, setAppState, personality, setPersonality }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppStore = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppStore must be used within an AppProvider");
    }
    return context;
};