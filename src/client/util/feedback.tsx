import toast from "react-hot-toast";

export function addToasts(promise: Promise<any>, loadingMessage?: string, successMessage?: string) {
  toast.promise(promise, {
    loading: loadingMessage ?? "Submitting...",
    success: <b>{successMessage ?? "Success!"}</b>,
    error: (err) => <b>Error: {err.message}</b>,
  });
}
