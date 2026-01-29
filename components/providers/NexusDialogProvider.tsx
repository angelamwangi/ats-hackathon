"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Info, AlertCircle, X, Check, Zap, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type DialogType = "alert" | "confirm" | "prompt";

interface DialogState {
    isOpen: boolean;
    type: DialogType;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    placeholder?: string;
    onConfirm: (value?: string) => void;
    onCancel: () => void;
}

interface NexusDialogContextType {
    alert: (title: string, message: string) => Promise<void>;
    confirm: (title: string, message: string) => Promise<boolean>;
    prompt: (title: string, message: string, defaultValue?: string) => Promise<string | null>;
}

const NexusDialogContext = createContext<NexusDialogContextType | undefined>(undefined);

export function NexusDialogProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<DialogState>({
        isOpen: false,
        type: "alert",
        title: "",
        message: "",
        onConfirm: () => { },
        onCancel: () => { },
    });

    const [inputValue, setInputValue] = useState("");

    const showDialog = (options: Partial<DialogState>) => {
        return new Promise<any>((resolve) => {
            setInputValue("");
            setState({
                isOpen: true,
                type: options.type || "alert",
                title: options.title || "Nexus Notification",
                message: options.message || "",
                confirmText: options.confirmText || "Confirm",
                cancelText: options.cancelText || "Cancel",
                placeholder: options.placeholder || "Enter value...",
                onConfirm: (value) => {
                    setState((s) => ({ ...s, isOpen: false }));
                    resolve(options.type === "prompt" ? value : true);
                },
                onCancel: () => {
                    setState((s) => ({ ...s, isOpen: false }));
                    resolve(options.type === "confirm" ? false : null);
                },
            });
        });
    };

    const alert = (title: string, message: string) => showDialog({ type: "alert", title, message, confirmText: "Acknowledge" });
    const confirm = (title: string, message: string) => showDialog({ type: "confirm", title, message });
    const prompt = (title: string, message: string, defaultValue = "") => {
        setInputValue(defaultValue);
        return showDialog({ type: "prompt", title, message });
    };

    return (
        <NexusDialogContext.Provider value={{ alert, confirm, prompt }}>
            {children}
            {state.isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-zinc-950 border-2 border-zinc-800 rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <div className="flex items-start gap-4 mb-8">
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                                state.type === "alert" ? "bg-zinc-900 text-primary border border-zinc-800" :
                                    state.type === "confirm" ? "bg-zinc-900 text-yellow-500 border border-zinc-800" :
                                        "bg-zinc-900 text-blue-500 border border-zinc-800"
                            )}>
                                {state.type === "alert" && <Info className="w-6 h-6" />}
                                {state.type === "confirm" && <HelpCircle className="w-6 h-6" />}
                                {state.type === "prompt" && <Zap className="w-6 h-6" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-2 leading-tight">
                                    {state.title}
                                </h3>
                                <p className="text-zinc-400 text-sm font-bold uppercase tracking-tight leading-relaxed">
                                    {state.message}
                                </p>
                            </div>
                        </div>

                        {state.type === "prompt" && (
                            <div className="mb-8">
                                <input
                                    autoFocus
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={state.placeholder}
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-primary transition-all shadow-inner"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") state.onConfirm(inputValue);
                                        if (e.key === "Escape") state.onCancel();
                                    }}
                                />
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4">
                            {state.type !== "alert" && (
                                <button
                                    onClick={state.onCancel}
                                    className="flex-1 py-4 bg-zinc-900 border border-zinc-700 text-zinc-500 font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:bg-zinc-800 hover:text-white transition-all shadow-lg active:scale-95"
                                >
                                    {state.cancelText}
                                </button>
                            )}
                            <button
                                onClick={() => state.onConfirm(inputValue)}
                                className={cn(
                                    "flex-1 py-4 font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2",
                                    state.type === "alert" ? "bg-primary text-black hover:bg-zinc-200" :
                                        state.type === "confirm" ? "bg-yellow-600 text-white hover:bg-yellow-700" :
                                            "bg-white text-black hover:bg-zinc-200"
                                )}
                            >
                                <Check className="w-3 h-3" /> {state.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </NexusDialogContext.Provider>
    );
}

export function useNexusDialog() {
    const context = useContext(NexusDialogContext);
    if (!context) {
        throw new Error("useNexusDialog must be used within a NexusDialogProvider");
    }
    return context;
}
