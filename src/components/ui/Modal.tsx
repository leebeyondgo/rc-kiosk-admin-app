import { useEffect } from "react";
import { createPortal } from "react-dom";

interface Props {
  children: React.ReactNode;
  onClose: () => void;
}

export default function Modal({ children, onClose }: Props) {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-start overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-lg bg-white shadow-lg relative p-6 mt-10 mb-10" // 상단 마진만 고정
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 우측 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition"
          aria-label="닫기"
        >
          ✕
        </button>

        {/* 컨텐츠 */}
        <div className="pb-4 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
}
