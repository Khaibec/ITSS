const Toast = ({
  type,
  message,
  onClose,
  onConfirm,
  loading,
}) => {
  return (
    <div className="fixed top-6 right-6 z-[999]">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      {/* toast box */}
      <div
        className="
          relative z-10
          bg-yellow-100
          border border-yellow-300
          rounded-lg shadow-xl
          w-[360px]
          p-5
          text-gray-800
        "
      >
        {/* message */}
        <div className="text-sm mb-4 text-center">
          {message}
        </div>

        {/* loading */}
        {loading && (
          <div className="text-center text-sm text-gray-600 animate-pulse">
            保存中です…
          </div>
        )}

        {/* actions */}
        {!loading && (
          <div className="flex justify-center gap-4">
            {type === 'confirm' ? (
              <>
                {/* cancel */}
                <button
                  onClick={onClose}
                  className="
                    px-4 py-1.5
                    rounded-md
                    bg-gray-300
                    hover:bg-gray-400
                    transition
                  "
                >
                  ✖
                </button>

                {/* confirm */}
                <button
                  onClick={onConfirm}
                  className="
                    px-4 py-1.5
                    rounded-md
                    bg-green-500 text-white
                    hover:bg-green-600
                    transition
                  "
                >
                  ✔
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="
                  px-6 py-1.5
                  rounded-md
                  bg-blue-500 text-white
                  hover:bg-blue-600
                  transition
                "
              >
                OK
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Toast;
