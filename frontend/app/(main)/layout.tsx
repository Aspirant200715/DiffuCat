import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen bg-void">
      <Sidebar />
      <div className="flex-1 ml-16 lg:ml-[260px] flex flex-col min-h-screen transition-all duration-300">
        <Header />
        <main className="flex-1 p-6 lg:p-10 overflow-x-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
}
