import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  // Since we're now using the sonner toast system, this component isn't needed
  // but we'll keep it for backward compatibility
  return (
    <ToastProvider>
      <ToastViewport />
    </ToastProvider>
  );
}
