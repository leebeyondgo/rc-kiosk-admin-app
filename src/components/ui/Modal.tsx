// components/ui/Modal.tsx
import { useEffect } from "react";

interface Props {
  children: React.ReactNode;
  onClose: () => void;
}

export default function Modal({ children, onClose }: Props) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 overflow-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-white max-w-3xl mx-auto my-10 rounded-lg p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
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
export default function Modal({ children, onClose }: Props) {
    useEffect(() => {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }, []);
  
    return (
      <div
        className="fixed inset-0 z-50 bg-black bg-opacity-50 overflow-auto"
        onClick={onClose}
      >
        <div
          className="relative bg-white max-w-3xl mx-auto my-10 rounded-lg p-6 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
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
  