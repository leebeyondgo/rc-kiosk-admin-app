import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabaseConfig";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface GiftItem {
  id: string;
  name: string;
  image_url?: string;
  description?: string;
}

interface LocationGiftItem {
  id: string;
  location_id: string;
  gift_item_id: string;
  category: "A" | "B";
  sort_order: number;
  allow_multiple: boolean;
  visible: boolean;
}

interface Props {
  locationId: string;
}

export default function AdminItems({ locationId }: Props) {
  const [giftItems, setGiftItems] = useState<GiftItem[]>([]);
  const [locationItems, setLocationItems] = useState<LocationGiftItem[]>([]);
  const [newGiftItemId, setNewGiftItemId] = useState<string>("");
  const [newCategory, setNewCategory] = useState<"A" | "B">("A");

  const fetchData = async () => {
    const { data: giftData } = await supabase.from("gift_items").select("*");
    const { data: locData } = await supabase
      .from("location_gift_items")
      .select("*")
      .eq("location_id", locationId);

    setGiftItems(giftData || []);
    setLocationItems(locData || []);
  };

  useEffect(() => {
    fetchData();
  }, [locationId]);

  const handleFieldChange = async (
    id: string,
    field: keyof LocationGiftItem,
    value: any
  ) => {
    setLocationItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );

    const { error } = await supabase
      .from("location_gift_items")
      .update({ [field]: value })
      .eq("id", id);

    if (error) {
      alert("변경 저장 실패: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      await supabase.from("location_gift_items").delete().eq("id", id);
      fetchData();
    }
  };

  const handleAddItem = async () => {
    if (!newGiftItemId) return;

    const existing = locationItems.find((i) => i.gift_item_id === newGiftItemId);
    if (existing) {
      alert("이미 추가된 기념품입니다.");
      return;
    }

    const categoryItems = locationItems
      .filter((i) => i.category === newCategory)
      .sort((a, b) => a.sort_order - b.sort_order);

    const nextOrder = categoryItems.length + 1;

    const { error } = await supabase.from("location_gift_items").insert([
      {
        location_id: locationId,
        gift_item_id: newGiftItemId,
        category: newCategory,
        sort_order: nextOrder,
        allow_multiple: false,
        visible: true,
      },
    ]);

    if (error) {
      alert("추가 실패: " + error.message);
    } else {
      setNewGiftItemId("");
      fetchData();
    }
  };

  const moveItem = async (category: "A" | "B", index: number, direction: "up" | "down") => {
    const categoryItems = locationItems
      .filter((item) => item.category === category)
      .sort((a, b) => a.sort_order - b.sort_order);

    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= categoryItems.length) return;

    const updated = [...categoryItems];
    const temp = updated[index].sort_order;
    updated[index].sort_order = updated[targetIndex].sort_order;
    updated[targetIndex].sort_order = temp;

    await Promise.all(
      updated.slice(index, targetIndex + 1).map((item) =>
        supabase
          .from("location_gift_items")
          .update({ sort_order: item.sort_order })
          .eq("id", item.id)
      )
    );

    fetchData();
  };

  const renderCategory = (category: "A" | "B") => {
    const filtered = locationItems
      .filter((item) => item.category === category)
      .sort((a, b) => a.sort_order - b.sort_order);

    return (
      <div className="space-y-4">
        {filtered.map((item, index) => {
          const gift = giftItems.find((g) => g.id === item.gift_item_id);

          return (
            <div
              key={item.id}
              className="p-4 border rounded shadow bg-white relative flex flex-col gap-2"
            >
              {gift?.image_url && (
                <img
                  src={gift.image_url}
                  alt={gift.name}
                  className="w-full max-w-xs aspect-[2/1] object-contain rounded"
                />
              )}
              <div className="text-base font-semibold">{gift?.name ?? "알 수 없음"}</div>

              <div className="text-sm flex gap-4 items-center flex-wrap">
                <label>
                  <input
                    type="checkbox"
                    checked={item.visible}
                    onChange={() =>
                      handleFieldChange(item.id, "visible", !item.visible)
                    }
                  />
                  사용자에게 보임
                </label>
                {item.category === "A" && (
                  <label>
                    <input
                      type="checkbox"
                      checked={item.allow_multiple}
                      onChange={() =>
                        handleFieldChange(item.id, "allow_multiple", !item.allow_multiple)
                      }
                    />
                    중복 선택 허용
                  </label>
                )}

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => moveItem(category, index, "up")}
                  disabled={index === 0}
                >
                  <ArrowUp size={16} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => moveItem(category, index, "down")}
                  disabled={index === filtered.length - 1}
                >
                  <ArrowDown size={16} />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  className="text-red-500 ml-auto"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      {/* 추가 폼 */}
      <div className="border p-4 rounded mb-6 space-y-3 bg-gray-50">
        <h3 className="font-semibold text-lg">기념품 추가</h3>
        <select
          value={newGiftItemId}
          onChange={(e) => setNewGiftItemId(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="">기념품 선택</option>
          {giftItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value as "A" | "B")}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="A">A 품목</option>
          <option value="B">B 품목</option>
        </select>
        <Button onClick={handleAddItem}>추가</Button>
      </div>

      {/* 항목 목록 */}
      <div className="space-y-8 mt-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">A 품목</h2>
          {renderCategory("A")}
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">B 품목</h2>
          {renderCategory("B")}
        </div>
      </div>
    </div>
  );
}
