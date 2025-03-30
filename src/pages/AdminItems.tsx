import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, GripVertical, Upload } from "lucide-react";
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
  const [newItemId, setNewItemId] = useState<string | null>(null);

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

  const handleFieldChange = (id: string, field: keyof LocationGiftItem, value: any) => {
    setLocationItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSave = async (id: string) => {
    const item = locationItems.find((i) => i.id === id);
    if (!item) return;

    const { error } = await supabase
      .from("location_gift_items")
      .update(item)
      .eq("id", id);

    if (error) {
      alert("저장 실패: " + error.message);
    } else {
      alert("저장 완료");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      await supabase.from("location_gift_items").delete().eq("id", id);
      fetchData();
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const category = result.type as "A" | "B";
    const sorted = [...locationItems]
      .filter((i) => i.category === category)
      .sort((a, b) => a.sort_order - b.sort_order);

    const [movedItem] = sorted.splice(source.index, 1);
    sorted.splice(destination.index, 0, movedItem);

    await Promise.all(
      sorted.map((item, index) =>
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
                      className="p-4 border rounded shadow bg-white relative"
                    >
                      <div {...provided.dragHandleProps} className="absolute left-2 top-2 text-gray-400 cursor-grab">
                        <GripVertical size={16} />
                      </div>

                      <div className="ml-6 space-y-2">
                        {gift?.image_url && (
                          <img
                            src={gift.image_url}
                            alt={gift.name}
                            className="w-full max-w-xs aspect-[2/1] object-contain rounded"
                          />
                        )}
                        <div className="text-base font-semibold">{gift?.name ?? "알 수 없음"}</div>
                        <Textarea
                          value={gift?.description ?? ""}
                          readOnly
                          className="text-sm text-gray-500"
                        />

                        <div className="text-sm flex gap-4">
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
                        </div>

                        <div className="flex justify-between pt-2">
                          <Button onClick={() => handleSave(item.id)}>저장</Button>
                          <Button variant="destructive" onClick={() => handleDelete(item.id)}>
                            삭제
                          </Button>
                        </div>
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
  );
}
