// src/components/ui/Modal.tsx
import { useEffect } from "react";
import { createPortal } from "react-dom";

interface Props {
  children: React.ReactNode;
  onClose: () => void;
}

export default function Modal({ children, onClose }: Props) {
  // 스크롤 막기
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 h-screen overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-lg bg-white shadow-lg relative p-6"
        onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫힘 방지
      >
        {/* 상단 우측 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition"
        >
          ✕
        </button>

        {/* 실제 컨텐츠 */}
        <div className="pb-4">
          {children}
        </div>

        {/* 하단 우측 닫기 버튼 */}
        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="text-sm px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            닫기
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
