import React, { forwardRef, HTMLProps } from "react";

type Props = HTMLProps<HTMLInputElement> & { label?: string; error?: string };

const Input = forwardRef<HTMLInputElement, Props>(({ label, error, ...rest }, ref) => {
  return (
    <label className="block">
      {label && <div className="mb-1 text-sm text-gray-600">{label}</div>}
      <input
        ref={ref}   // ✅ properly forwards ref for react-hook-form
        {...rest}
        className={`w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-400" : "border-gray-300"}`}
      />
      {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
    </label>
  );
});

export default Input;
