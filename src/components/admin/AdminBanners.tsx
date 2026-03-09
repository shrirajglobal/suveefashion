import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, Upload, GripVertical, Eye, EyeOff } from "lucide-react";

interface Banner {
  id: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    const { data, error } = await supabase
      .from("hero_banners")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) {
      toast.error("Failed to load banners");
    } else {
      setBanners(data ?? []);
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const maxOrder = banners.length > 0 ? Math.max(...banners.map(b => b.display_order)) : -1;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split(".").pop();
      const fileName = `banner-${Date.now()}-${i}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("hero-banners")
        .upload(fileName, file);

      if (uploadError) {
        toast.error(`Failed to upload ${file.name}`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("hero-banners")
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from("hero_banners")
        .insert({
          image_url: urlData.publicUrl,
          display_order: maxOrder + 1 + i,
          is_active: true,
        });

      if (insertError) {
        toast.error(`Failed to save banner record`);
      }
    }

    toast.success(`${files.length} banner(s) uploaded!`);
    setUploading(false);
    fetchBanners();
    e.target.value = "";
  };

  const toggleActive = async (id: string, currentValue: boolean) => {
    const { error } = await supabase
      .from("hero_banners")
      .update({ is_active: !currentValue })
      .eq("id", id);
    if (error) {
      toast.error("Failed to update");
    } else {
      setBanners(prev => prev.map(b => b.id === id ? { ...b, is_active: !currentValue } : b));
    }
  };

  const deleteBanner = async (banner: Banner) => {
    // Extract filename from URL
    const urlParts = banner.image_url.split("/");
    const fileName = urlParts[urlParts.length - 1];

    await supabase.storage.from("hero-banners").remove([fileName]);
    const { error } = await supabase.from("hero_banners").delete().eq("id", banner.id);
    if (error) {
      toast.error("Failed to delete banner");
    } else {
      toast.success("Banner deleted");
      fetchBanners();
    }
  };

  const moveOrder = async (id: string, direction: "up" | "down") => {
    const idx = banners.findIndex(b => b.id === id);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= banners.length) return;

    const currentOrder = banners[idx].display_order;
    const swapOrder = banners[swapIdx].display_order;

    await Promise.all([
      supabase.from("hero_banners").update({ display_order: swapOrder }).eq("id", banners[idx].id),
      supabase.from("hero_banners").update({ display_order: currentOrder }).eq("id", banners[swapIdx].id),
    ]);

    fetchBanners();
  };

  if (loading) return <p className="text-muted-foreground py-4">Loading banners...</p>;

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Hero Banners</h3>
          <p className="text-sm text-muted-foreground">
            Upload banner images (recommended: 1920×1080px, 16:9 ratio). Active banners show on homepage carousel.
          </p>
        </div>
        <div>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
            id="banner-upload"
            disabled={uploading}
          />
          <Label htmlFor="banner-upload">
            <Button asChild disabled={uploading}>
              <span>
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? "Uploading..." : "Upload Banners"}
              </span>
            </Button>
          </Label>
        </div>
      </div>

      {banners.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">No banners yet. Upload your first banner image.</p>
            <p className="text-xs text-muted-foreground mt-1">Recommended size: 1920×1080px (16:9)</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {banners.map((banner, idx) => (
            <Card key={banner.id} className={`overflow-hidden ${!banner.is_active ? "opacity-50" : ""}`}>
              <CardContent className="flex items-center gap-4 p-3">
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={idx === 0}
                    onClick={() => moveOrder(banner.id, "up")}
                  >
                    ▲
                  </Button>
                  <GripVertical className="h-4 w-4 text-muted-foreground mx-auto" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    disabled={idx === banners.length - 1}
                    onClick={() => moveOrder(banner.id, "down")}
                  >
                    ▼
                  </Button>
                </div>

                <img
                  src={banner.image_url}
                  alt={`Banner ${idx + 1}`}
                  className="h-20 w-36 rounded object-cover"
                />

                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Slide #{idx + 1}</p>
                  <p className="text-xs text-muted-foreground">Order: {banner.display_order}</p>
                </div>

                <div className="flex items-center gap-2">
                  {banner.is_active ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Switch
                    checked={banner.is_active}
                    onCheckedChange={() => toggleActive(banner.id, banner.is_active)}
                  />
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => deleteBanner(banner)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
