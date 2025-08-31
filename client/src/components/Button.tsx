import { ButtonHTMLAttributes } from "react";

export default function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={`w-full rounded-lg px-4 py-3 bg-blue-600 text-white font-medium hover:opacity-95 disabled:opacity-60 ${className}`}
    />
  );
}
