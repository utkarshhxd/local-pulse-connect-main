
import { toast as sonnerToast } from "sonner";

// Re-export toast directly from sonner
export const toast = sonnerToast;

// Create a hook wrapper for consistency with old API
export function useToast() {
  return {
    toast: sonnerToast,
  };
}
