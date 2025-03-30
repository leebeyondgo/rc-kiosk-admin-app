import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { GripVertical } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabaseConfig";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface GiftItem {
  id: string;
  name: string;
  image_url?: string;
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
  const [newGiftItemId, setNewGiftItemId] = useState("");
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

  const handleToggle = async (id: string, field: keyof LocationGiftItem, value: boolean) => {
    const { error } = await supabase
      .from("location_gift_items")
      .update({ [field]: value })
      .eq("id", id);

    if (!error) {
      setLocationItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        )
      );
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

    const alreadyExists = locationItems.some(
      (i) => i.gift_item_id === newGiftItemId
    );
    if (alreadyExists) {
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

    if (!error) {
      setNewGiftItemId("");
      fetchData();
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const category = result.type as "A" | "B";
    const categoryItems = [...locationItems]
      .filter((i) => i.category === category)
      .sort((a, b) => a.sort_order - b.sort_order);

    const [moved] = categoryItems.splice(source.index, 1);
    categoryItems.splice(destination.index, 0, moved);

    await Promise.all(
      categoryItems.map((item, index) =>
        supabase
          .from("location_gift_items")
          .update({ sort_order: index + 1 })
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
      <Droppable droppableId={category} type={category}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
            {filtered.map((item, index) => {
              const gift = giftItems.find((g) => g.id === item.gift_item_id);

              return (
                <Draggable draggableId={item.id} index={index} key={item.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="p-4 border rounded shadow bg-white relative flex flex-col"
                    >
                      <div className="flex items-center gap-4">
                        <div {...provided.dragHandleProps} className="text-gray-400 cursor-grab">
                          <GripVertical size={16} />
                        </div>
                        {gift?.image_url && (
                          <img
                            src={gift.image_url}
                            alt={gift.name}
                            className="w-24 h-16 object-contain rounded"
                          />
                        )}
                        <div className="text-base font-semibold">{gift?.name ?? "알 수 없음"}</div>
                      </div>

                      <div className="flex gap-4 mt-2 text-sm">
                        <label>
                          <input
                            type="checkbox"
                            checked={item.visible}
                            onChange={() =>
                              handleToggle(item.id, "visible", !item.visible)
                            }
                          />{" "}
                          사용자에게 보임
                        </label>
                        {item.category === "A" && (
                          <label>
                            <input
                              type="checkbox"
                              checked={item.allow_multiple}
                              onChange={() =>
                                handleToggle(item.id, "allow_multiple", !item.allow_multiple)
                              }
                            />{" "}
                            중복 선택 허용
                          </label>
                        )}
                        <Button
                          variant="ghost"
                          className="text-red-500 ml-auto"
                          onClick={() => handleDelete(item.id)}
                        >
                          삭제
                        </Button>
                      </div>
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  };

  return (
    <div>
      {/* ➕ 기념품 추가 폼 */}
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

      {/* 🔀 정렬 리스트 */}
      <DragDropContext onDragEnd={handleDragEnd}>
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
      </DragDropContext>
    </div>
  );
}
