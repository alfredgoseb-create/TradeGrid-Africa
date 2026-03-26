export function Card({ children, className }: any) {
  return (
    <div className={`border rounded-2xl shadow-sm bg-white ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className }: any) {
  return <div className={className}>{children}</div>;
}