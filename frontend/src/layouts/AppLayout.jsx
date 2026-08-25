import { Outlet } from "react-router-dom";

import { MobileSidebar } from "../components/navigation/MobileSidebar";
import { Navbar } from "../components/navigation/Navbar";
import { Sidebar } from "../components/navigation/Sidebar";
import { useDisclosure } from "../hooks/useDisclosure";

/**
 * Shell for every authenticated route: fixed desktop sidebar + mobile
 * drawer, a top header, and the routed page content.
 */
export function AppLayout() {
  const { isOpen, open, close } = useDisclosure(false);

  return (
    <div className="flex h-screen overflow-hidden bg-paper">
      <Sidebar />
      <MobileSidebar isOpen={isOpen} onClose={close} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={open} />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
