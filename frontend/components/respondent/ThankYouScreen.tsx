"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface ThankYouScreenProps {
  title: string;
  description: string;
  accent: string;
}

export function ThankYouScreen({ title, description, accent }: ThankYouScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
      >
        <CheckCircle2 size={64} style={{ color: accent }} />
      </motion.div>
      <h1 className="mt-6 text-3xl font-semibold md:text-4xl">{title}</h1>
      <p className="mt-3 max-w-md text-lg opacity-60">{description}</p>
      <p className="mt-10 text-sm opacity-40">Powered by Typeclone</p>
    </motion.div>
  );
}
