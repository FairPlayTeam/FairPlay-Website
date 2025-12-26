import Topbar from "@/components/layout/Topbar";
import Sidebar from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/context/SidebarContext";

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background text-text">
        <Topbar />
        <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 lg:ml-60">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}