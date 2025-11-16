"use client";

const ModalClose: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <button
      onClick={onClose}
      className="text-gray-400 hover:text-white transition-colors cursor-pointer"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
};

export default ModalClose;
