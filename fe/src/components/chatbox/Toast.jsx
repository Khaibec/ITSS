import { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colorMap = {
    success: 'bg-yellow-100 border-yellow-400 text-gray-800',
    error: 'bg-red-100 border-red-400 text-red-700',
  };

  return (
    <div className="fixed top-4 right-4 z-[9999]">
      <div
        className={`
          min-w-[320px]
          border-l-4
          rounded-lg
          shadow-lg
          px-4 py-3
          ${colorMap[type]}
        `}
      >
        <div className="flex justify-between items-start gap-3">
          <div className="text-sm whitespace-pre-wrap">{message}</div>
          <button
            onClick={onClose}
            className="font-bold text-lg leading-none hover:opacity-70"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
