"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface WelcomeScreenProps {
  title: string;
  buttonText: string;
  description?: string | null;
  accent: string;
  onStart: () => void;
}

export function WelcomeScreen({ title, buttonText, description, accent, onStart }: WelcomeScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
      className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center"
    >
      <h1 className="text-3xl font-semibold leading-tight md:text-5xl">{title}</h1>
      {description && <p className="mt-4 max-w-lg text-lg opacity-60">{description}</p>}
      <button
        onClick={onStart}
        className="mt-8 inline-flex items-center gap-2 rounded-lg px-7 py-3.5 text-lg font-medium text-white shadow-md transition-transform hover:scale-[1.03]"
        style={{ backgroundColor: accent }}
      >
        {buttonText} <ArrowRight size={18} />
      </button>
      <p className="mt-4 text-sm opacity-50">
        press <kbd className="rounded bg-black/10 px-1.5 py-0.5 text-xs">Enter ↵</kbd>
      </p>
    </motion.div>
  );
}
