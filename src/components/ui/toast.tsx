import { toast as sonnerToast } from "sonner";

type ToastOptions = {
  title: string;
  description: string;
};

const toast = ({ title, description }: ToastOptions) => {
  // Ensure description is always a string
  const safeDescription = description ?? "An error occurred.";
  sonnerToast(`${title}: ${safeDescription}`);
};

export { toast };
