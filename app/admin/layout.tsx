// Layout racine admin — minimal, sans nav
// La nav est dans (dashboard)/layout.tsx
// La page de login hérite de ce layout seul
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0f0f0] font-inter">
      {children}
    </div>
  );
}
