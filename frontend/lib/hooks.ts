"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "./api";

export const formKeys = {
  all: ["forms"] as const,
  detail: (id: string) => ["forms", id] as const,
  responses: (id: string) => ["forms", id, "responses"] as const,
  summary: (id: string) => ["forms", id, "summary"] as const,
};

export function useForms() {
  return useQuery({ queryKey: formKeys.all, queryFn: api.listForms });
}

export function useForm(id: string) {
  return useQuery({ queryKey: formKeys.detail(id), queryFn: () => api.getForm(id), enabled: !!id });
}

export function useResponses(id: string) {
  return useQuery({
    queryKey: formKeys.responses(id),
    queryFn: () => api.listResponses(id),
    enabled: !!id,
  });
}

export function useSummary(id: string) {
  return useQuery({
    queryKey: formKeys.summary(id),
    queryFn: () => api.getSummary(id),
    enabled: !!id,
  });
}

export function useInvalidateForms() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: formKeys.all });
}
