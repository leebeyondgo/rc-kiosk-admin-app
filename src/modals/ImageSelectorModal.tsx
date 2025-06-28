import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabaseConfig";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/Modal";
import { Trash2, Upload } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Props {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export default function ImageSelectorModal({ onSelect, onClose }: Props) {
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
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
    <Modal onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">이미지 선택</h2>

      <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
        {images.length === 0 && (
          <p className="text-center text-redCrossWarmGray-400">이미지가 없습니다.</p>
        )}
        {images.map((url) => (
          <div key={url} className="relative group border rounded p-1">
            <img
              src={url}
              alt="img"
              className="w-full aspect-square object-contain rounded cursor-pointer"
              onClick={() => {
                onSelect(url);
                onClose();
              }}
            />
            <button
              className="absolute top-1 right-1 bg-white p-1 rounded-full shadow hidden group-hover:block"
              onClick={() => handleDelete(url)}
              aria-label="이미지 삭제"
            >
              <Trash2 size={14} className="text-redCrossRed" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <label className="flex items-center gap-2 text-sm text-redCrossWarmGray-600">
          <Upload size={16} />
          이미지 업로드:
          <input type="file" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>
    </Modal>
  );
}

