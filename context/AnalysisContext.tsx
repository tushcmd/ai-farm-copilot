import { createContext, useContext, useState, ReactNode } from "react";
import { AnalysisState, ParsedData, Insight, PlantingRecommendation, Message } from "@/types";

interface AnalysisContextType extends AnalysisState {
  setFileName: (name: string) => void;
  setParsedData: (data: ParsedData) => void;
  setInsights: (insights: Insight[]) => void;
  setPlanting: (p: PlantingRecommendation) => void;
  setIsAnalyzing: (v: boolean) => void;
  setAnalysisError: (e: string | null) => void;
  addMessage: (msg: Message) => void;
  setIsChatLoading: (v: boolean) => void;
  resetAll: () => void;
}

const defaultState: AnalysisState = {
  parsedData: null,
  insights: [],
  planting: null,
  isAnalyzing: false,
  analysisError: null,
  messages: [],
  isChatLoading: false,
  fileName: null,
};

const AnalysisContext = createContext<AnalysisContextType | null>(null);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AnalysisState>(defaultState);

  const setFileName = (fileName: string) => setState((s) => ({ ...s, fileName }));
  const setParsedData = (parsedData: ParsedData) => setState((s) => ({ ...s, parsedData }));
  const setInsights = (insights: Insight[]) => setState((s) => ({ ...s, insights }));
  const setPlanting = (planting: PlantingRecommendation) => setState((s) => ({ ...s, planting }));
  const setIsAnalyzing = (isAnalyzing: boolean) => setState((s) => ({ ...s, isAnalyzing }));
  const setAnalysisError = (analysisError: string | null) => setState((s) => ({ ...s, analysisError }));
  const setIsChatLoading = (isChatLoading: boolean) => setState((s) => ({ ...s, isChatLoading }));
  const addMessage = (msg: Message) => setState((s) => ({ ...s, messages: [...s.messages, msg] }));
  const resetAll = () => setState(defaultState);

  return (
    <AnalysisContext.Provider
      value={{
        ...state,
        setFileName,
        setParsedData,
        setInsights,
        setPlanting,
        setIsAnalyzing,
        setAnalysisError,
        addMessage,
        setIsChatLoading,
        resetAll,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used within AnalysisProvider");
  return ctx;
}
