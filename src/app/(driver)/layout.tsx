import Providers from "@/components/Providers";

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="min-h-screen max-w-md mx-auto bg-white shadow-sm">
        {children}
      </div>
    </Providers>
  );
}
