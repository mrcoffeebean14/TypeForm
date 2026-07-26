"use client";

import { useQuery } from "@tanstack/react-query";

import { FormRunner } from "@/components/respondent/FormRunner";
import { api } from "@/lib/api";

export default function PublicFormPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { data: form, isLoading, isError } = useQuery({
    queryKey: ["public-form", slug],
    queryFn: () => api.getPublicForm(slug),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-accent" />
      </div>
    );
  }

  if (isError || !form) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-white px-6 text-center">
        <h1 className="text-2xl font-semibold">Form not found</h1>
        <p className="text-ink-faint">This form doesn’t exist or isn’t published.</p>
      </div>
    );
  }

  return <FormRunner form={form} />;
}
