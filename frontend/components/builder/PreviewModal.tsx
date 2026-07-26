"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { FormRunner } from "@/components/respondent/FormRunner";
import type { Form } from "@/lib/types";

interface PreviewModalProps {
  open: boolean;
  form: Form;
  onClose: () => void;
}

export function PreviewModal({ open, form, onClose }: PreviewModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/60 p-4 md:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative mx-auto h-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            initial={{ scale: 0.97, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.97, y: 10 }}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-black/10 text-neutral-700 backdrop-blur hover:bg-black/20"
              aria-label="Close preview"
            >
              <X size={18} />
            </button>
            <div className="h-full overflow-y-auto">
              {/* Reuses the real respondent flow in preview mode (no persistence). */}
              <FormRunner form={{ ...form, questions: form.questions }} preview />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
