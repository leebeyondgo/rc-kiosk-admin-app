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
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-center p-4 pt-10 h-screen overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-lg bg-white shadow-lg relative"
        onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫힘 방지
      >
        {/* 닫기 버튼 (선택사항) */}
        <button className="absolute top-3 right-3 ..." onClick={onClose}>✕</button>
        <button
              onClick={() => setShowModal(false)}
              className="text-sm px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
            >닫기
          </button>
        {children}
      </div>
    </div>,
    document.body
  );
}
