import React from "react";
import useToast from "../context/useToastHook";

export const Toasts = () => {
  const { toasts, remove } = useToast();

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          aria-live="polite"
          className={`max-w-sm w-full px-4 py-2 rounded shadow-md text-sm flex justify-between items-center ${
            t.type === "error"
              ? "bg-red-100 text-red-800 border border-red-200"
              : t.type === "success"
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-gray-100 text-gray-800 border border-gray-200"
          }`}
        >
          <div className="truncate">{t.message}</div>
          <button
            onClick={() => remove(t.id)}
            className="ml-3 text-xs opacity-80 hover:opacity-100"
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toasts;
