"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, AlertCircle } from "lucide-react";
import { parseCsv, analyzeData, ColumnValidation } from "@/lib/csvParser";
import { ColumnValidator } from "./ColumnValidator";
import { useAnalysis } from "@/context/AnalysisContext";
import { useRouter } from "next/navigation";
import { Insight, PlantingRecommendation } from "@/types";

export function CsvDropzone() {
  const router = useRouter();
  const { setParsedData, setInsights, setPlanting, setIsAnalyzing, setAnalysisError, setFileName, isAnalyzing } = useAnalysis();
  const [validation, setValidation] = useState<ColumnValidation[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<{ parsedData: ReturnType<typeof analyzeData>; name: string } | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setParseError(null);
    setValidation(null);
    setPendingFile(null);

    try {
      const { validation: val } = await parseCsv(file);
      setValidation(val);
      const allRequired = val.filter(v => v.required).every(v => v.present);
      if (!allRequired) { setParseError("Some required columns are missing. Check your CSV export."); return; }

      // Re-parse for the actual data
      const { rows } = await parseCsv(file);
      if (rows.length === 0) { setParseError("No data rows found."); return; }

      const parsed = analyzeData(rows);
      setPendingFile({ parsedData: parsed, name: file.name });
    } catch (err: unknown) {
      setParseError(err instanceof Error ? err.message : "Failed to parse CSV");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"], "application/vnd.ms-excel": [".csv"] },
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    if (!pendingFile) return;
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      setParsedData(pendingFile.parsedData);
      setFileName(pendingFile.name);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvSummary: pendingFile.parsedData.csvSummary }),
      });

      if (!res.ok) throw new Error(`Analysis failed: ${res.statusText}`);
      const data = await res.json();
      setInsights((data.insights || []) as Insight[]);
      setPlanting((data.planting || null) as PlantingRecommendation);
      router.push("/dashboard");
    } catch (err: unknown) {
      setAnalysisError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4 w-full max-w-xl">
      <div
        {...getRootProps()}
        data-testid="dropzone-upload"
        className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-8 py-12 text-center cursor-pointer transition-all"
        style={{
          borderColor: isDragActive ? "var(--primary)" : "var(--border)",
          background: isDragActive ? "color-mix(in srgb, var(--primary) 5%, var(--background))" : "var(--card)",
        }}
      >
        <input {...getInputProps()} data-testid="input-csv" />
        <div className="mb-4 w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: "color-mix(in srgb, var(--primary) 12%, var(--background))" }}>
          {pendingFile
            ? <FileText className="w-6 h-6" style={{ color: "var(--primary)" }} />
            : <UploadCloud className="w-6 h-6" style={{ color: "var(--primary)" }} />}
        </div>
        {pendingFile ? (
          <div>
            <p className="font-medium text-sm" style={{ color: "var(--foreground)" }}>{pendingFile.name}</p>
            <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
              {pendingFile.parsedData.rows.length} records parsed · Click to replace
            </p>
          </div>
        ) : isDragActive ? (
          <p className="font-medium text-sm" style={{ color: "var(--foreground)" }}>Drop it here</p>
        ) : (
          <div>
            <p className="font-medium text-sm" style={{ color: "var(--foreground)" }}>Drop your Odoo CSV export here</p>
            <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>or click to browse · .csv files only</p>
          </div>
        )}
      </div>

      {parseError && (
        <div className="flex items-start gap-2 p-3 rounded-lg text-xs border"
          style={{ background: "#fef2f2", borderColor: "#fecaca", color: "#991b1b" }}>
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{parseError}</span>
        </div>
      )}

      {validation && <ColumnValidator validation={validation} />}

      {pendingFile && !parseError && (
        <button
          data-testid="button-analyze"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full py-3 px-6 rounded-lg text-sm font-medium transition-opacity disabled:opacity-60"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          {isAnalyzing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
              Analyzing with DeepSeek V4 Flash…
            </span>
          ) : "Analyze My Farm →"}
        </button>
      )}
    </div>
  );
}
