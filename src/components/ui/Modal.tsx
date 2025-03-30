// components/ui/Modal.tsx
import { useEffect } from "react";

interface Props {
  children: React.ReactNode;
  onClose: () => void;
}

export default function Modal({ children, onClose }: Props) {
  useEffect(() => {
    // 스크롤 막기
    document.body.style.overflow = "hidden";
    return () => {
      // 스크롤 다시 허용
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div
        className="bg-white max-h-[90vh] overflow-y-auto rounded-lg w-full max-w-3xl p-6 shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 (선택 사항) */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
