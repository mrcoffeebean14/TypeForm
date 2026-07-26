"use client";

import { motion } from "framer-motion";

export function ProgressBar({ percent, accent }: { percent: number; accent: string }) {
  return (
    <div className="fixed left-0 top-0 z-40 h-1.5 w-full bg-black/5">
      <motion.div
        className="h-full"
        style={{ backgroundColor: accent }}
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      />
    </div>
  );
}
