"use client";

import { Check, Copy, ExternalLink, Globe, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import type { Form } from "@/lib/types";

interface SharePanelProps {
  form: Form;
  onPublish: () => void;
  onUnpublish: () => void;
}

export function SharePanel({ form, onPublish, onUnpublish }: SharePanelProps) {
  const [copied, setCopied] = useState(false);
  const isPublished = form.status === "published";
  const shareUrl =
    typeof window !== "undefined" && form.public_slug
      ? `${window.location.origin}/f/${form.public_slug}`
      : "";

  const copy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <div className="rounded-2xl border border-line bg-surface p-8">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-full ${
              isPublished ? "bg-success/15 text-success" : "bg-surface-2 text-ink-faint"
            }`}
          >
            {isPublished ? <Globe size={20} /> : <Lock size={20} />}
          </div>
          <div>
            <h2 className="font-semibold">{isPublished ? "Your form is live" : "Not published yet"}</h2>
            <p className="text-sm text-ink-faint">
              {isPublished
                ? "Anyone with the link can respond — no login required."
                : "Publish to generate a shareable link."}
            </p>
          </div>
        </div>

        {isPublished && shareUrl && (
          <div className="mt-6">
            <label className="text-xs font-medium text-ink-faint">Public link</label>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                readOnly
                value={shareUrl}
                className="tf-field flex-1 rounded-lg bg-surface-2 px-3 py-2 text-sm"
              />
              <Button variant="secondary" onClick={copy}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
              <Link href={`/f/${form.public_slug}`} target="_blank">
                <Button variant="secondary">
                  <ExternalLink size={16} />
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-2">
          {isPublished ? (
            <Button variant="secondary" onClick={onUnpublish}>
              Unpublish
            </Button>
          ) : (
            <Button onClick={onPublish}>Publish form</Button>
          )}
        </div>
      </div>
    </div>
  );
}
