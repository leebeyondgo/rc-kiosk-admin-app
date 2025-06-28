import { useEffect, useState, useRef } from "react";
import supabase from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/Modal";
import { Trash2, Upload } from "lucide-react";
import { useToast } from "@/components/ui/Toast";


interface Props {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export default function ImageSelectorModal({ onSelect, onClose }: Props) {
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const fetchImages = async () => {
    const { data } = await supabase.storage.from("gift-images").list("", {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    });

    const urls = data?.map((f) =>
      supabase.storage.from("gift-images").getPublicUrl(f.name).data.publicUrl
    ) || [];

    setImages(urls);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const filename = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("gift-images").upload(filename, file);

    if (!error) {
      await fetchImages();
    } else {
      toast("업로드 실패");
    }

    setUploading(false);
  };

  const handleDelete = async (url: string) => {
    const fileName = url.split("/").pop()?.split("?")[0];
    if (!fileName) return;

    const { error } = await supabase.storage.from("gift-images").remove([fileName]);
    if (!error) {
      await fetchImages();
    } else {
      toast("삭제 실패");
    }
  };

  return (
    <Modal
      onClose={onClose}
      labelledBy="image-selector-title"
      maxWidthClass="max-w-[95vw] sm:max-w-3xl md:max-w-5xl"
    >
      <h2 id="image-selector-title" className="text-lg font-semibold mb-4">
        이미지 선택
      </h2>

      <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
        {images.length === 0 && (
          <p className="text-center text-redCrossWarmGray-400">이미지가 없습니다.</p>
        )}
        {images.map((url) => (
          <div
            key={url}
            className="relative group border rounded p-1 hover:ring-2 hover:ring-redCrossRed focus-within:ring-2"
          >
            <img
              src={url}
              alt={url.split("/").pop()?.split("?")[0] || "image"}
              className="w-full aspect-square object-contain rounded cursor-pointer"
              tabIndex={0}
              onClick={() => {
                onSelect(url);
                onClose();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(url);
                  onClose();
                }
              }}
            />
            <button
              className="absolute top-1 right-1 bg-white p-1 rounded-full shadow hidden group-hover:block group-focus:block"
              onClick={() => handleDelete(url)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleDelete(url);
                }
              }}
              aria-label="이미지 삭제"
            >
              <Trash2 size={14} className="text-redCrossRed" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <label htmlFor="image-upload">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1"
          >
            <Upload size={16} />
            이미지 업로드
          </Button>
        </label>
        <input
          ref={fileInputRef}
          type="file"
          id="image-upload"
          name="image-upload"
          onChange={handleUpload}
          disabled={uploading}
          className="sr-only"
        />
      </div>
    </Modal>
  );
}

