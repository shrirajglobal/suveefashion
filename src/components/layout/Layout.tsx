import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import WhatsAppButton from "./WhatsAppButton";
import MobileCTABar from "./MobileCTABar";

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const isAdvisor = pathname.startsWith("/advisor");

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className={`flex-1 ${isAdvisor ? "" : "pb-16 md:pb-0"}`}>{children}</main>
      {!isAdvisor && <Footer />}
      {!isAdvisor && <WhatsAppButton />}
      {!isAdvisor && <MobileCTABar />}
    </div>
  );
}
