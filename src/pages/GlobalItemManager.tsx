import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabaseConfig";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, Upload } from "lucide-react";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface GiftItem {
  id: string;
  name: string;
  image_url?: string;
  description?: string;
}

export default function GlobalItemManager() {
  const [items, setItems] = useState<GiftItem[]>([]);
  const [newItem, setNewItem] = useState<Partial<GiftItem>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    const { data } = await supabase.from("gift_items").select("*").order("name", { ascending: true });
    setItems(data || []);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAdd = async () => {
    if (!newItem.name) {
      alert("기념품 이름을 입력해주세요.");
      return;
    }

    setLoading(true);

    let image_url = "";

    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("gift-images")
        .upload(fileName, imageFile);

      if (uploadError) {
        alert("이미지 업로드 실패");
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("gift-images").getPublicUrl(fileName);
      image_url = urlData?.publicUrl ?? "";
    }

    const { error } = await supabase.from("gift_items").insert([
      {
        name: newItem.name,
        description: newItem.description,
        image_url,
      },
    ]);

    if (error) {
      alert("추가 실패: " + error.message);
    } else {
      setNewItem({});
      setImageFile(null);
      fetchItems();
    }

    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("gift_items").delete().eq("id", id);
    if (error) {
      alert("삭제 실패: " + error.message);
    } else {
      fetchItems();
    }
  };

  return (
    <div className="space-y-8">
      {/* ➕ 새 기념품 추가 */}
      <div className="border rounded p-4 shadow bg-white space-y-3">
        <h3 className="font-semibold text-lg">기념품 항목 추가</h3>

        <Input
          placeholder="기념품 이름"
          value={newItem.name ?? ""}
          onChange={(e) => setNewItem((prev) => ({ ...prev, name: e.target.value }))}
        />

        <Textarea
          placeholder="기념품 설명 (선택)"
          value={newItem.description ?? ""}
          onChange={(e) => setNewItem((prev) => ({ ...prev, description: e.target.value }))}
        />

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <Upload size={16} />
          이미지 업로드:
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
        </label>

        <Button onClick={handleAdd} disabled={loading}>
          {loading ? "추가 중..." : "기념품 추가"}
        </Button>
      </div>

      {/* 📋 현재 항목 목록 */}
      <div>
        <h3 className="font-semibold mb-3">기존 기념품 목록 ({items.length})</h3>
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between border rounded px-4 py-2 bg-white shadow-sm"
            >
              <div className="flex flex-col">
                <span className="font-medium">{item.name}</span>
                {item.description && (
                  <span className="text-sm text-gray-500">{item.description}</span>
                )}
              </div>
              <Button
                variant="ghost"
                onClick={() => handleDelete(item.id)}
                className="text-red-500"
              >
                <Trash2 size={16} />
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
