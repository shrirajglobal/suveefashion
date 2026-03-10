import { MessageCircle } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function WhatsAppButton() {
  const location = useLocation();

  // Hide on catalogues page where a contextual sticky bar replaces this
  if (location.pathname.startsWith("/catalogues")) return null;

  return (
    <a
      href="https://wa.me/919831640808?text=Hi%20Suvee%20Fashion!%20I%27m%20interested%20in%20your%20wholesale%20kurtis."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110 hover:shadow-xl md:bottom-8 md:right-8"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" fill="white" />
    </a>
  );
}
