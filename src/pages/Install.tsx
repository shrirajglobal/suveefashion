import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, Check, Share, MoreVertical } from "lucide-react";
import SEOHead from "@/components/SEOHead";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setIsInstalled(true));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Install Suvee Fashion App"
        description="Install the Suvee Fashion app on your phone for quick access to catalogues, orders, and more."
      />

      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <div className="mb-8">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <Smartphone className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Install Suvee Fashion
          </h1>
          <p className="mt-2 text-muted-foreground">
            Get quick access to catalogues, place orders, and track deliveries — right from your home screen.
          </p>
        </div>

        {isInstalled ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-6">
            <Check className="mx-auto mb-3 h-12 w-12 text-green-600" />
            <h2 className="text-lg font-semibold text-green-800">App Installed!</h2>
            <p className="mt-1 text-sm text-green-700">
              Suvee Fashion is installed on your device. Open it from your home screen.
            </p>
          </div>
        ) : deferredPrompt ? (
          <div className="space-y-4">
            <Button onClick={handleInstall} size="lg" className="w-full gap-2 text-base">
              <Download className="h-5 w-5" />
              Install App
            </Button>
            <p className="text-xs text-muted-foreground">
              No app store needed. Installs instantly and works offline.
            </p>
          </div>
        ) : isIOS ? (
          <div className="space-y-6 text-left">
            <p className="text-center text-sm font-medium text-foreground">
              To install on your iPhone/iPad:
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">1</div>
                <div>
                  <p className="font-medium">Tap the Share button</p>
                  <p className="text-sm text-muted-foreground">
                    Look for the <Share className="inline h-4 w-4" /> icon at the bottom of Safari
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">2</div>
                <div>
                  <p className="font-medium">Tap "Add to Home Screen"</p>
                  <p className="text-sm text-muted-foreground">Scroll down in the share menu to find this option</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">3</div>
                <div>
                  <p className="font-medium">Tap "Add"</p>
                  <p className="text-sm text-muted-foreground">The app icon will appear on your home screen</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-left">
            <p className="text-center text-sm font-medium text-foreground">
              To install on your Android phone:
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">1</div>
                <div>
                  <p className="font-medium">Tap the menu button</p>
                  <p className="text-sm text-muted-foreground">
                    Look for <MoreVertical className="inline h-4 w-4" /> in Chrome's top-right corner
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">2</div>
                <div>
                  <p className="font-medium">Tap "Add to Home Screen"</p>
                  <p className="text-sm text-muted-foreground">Or "Install App" if the option appears</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">3</div>
                <div>
                  <p className="font-medium">Tap "Install"</p>
                  <p className="text-sm text-muted-foreground">The app will install and appear on your home screen</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Benefits */}
        <div className="mt-10 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
          {[
            { title: "Fast Access", desc: "Open from home screen instantly" },
            { title: "Works Offline", desc: "Browse catalogues without internet" },
            { title: "No App Store", desc: "Installs directly, no downloads" },
          ].map((b) => (
            <div key={b.title} className="rounded-lg border bg-card p-4 text-center">
              <p className="font-semibold text-foreground">{b.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Install;
