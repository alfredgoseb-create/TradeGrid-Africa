export function Button({ children, className }: any) {
  return (
    <button
      className={`px-4 py-2 rounded-xl bg-black text-white hover:opacity-90 ${className}`}
    >
      {children}
    </button>
  );
}