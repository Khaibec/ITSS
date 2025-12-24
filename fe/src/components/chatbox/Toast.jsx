const Toast = ({
  type,
  message,
  onClose,
  onConfirm,
  loading,
}) => {
  return (
    <>
      {/* ===== Backdrop: FULL SCREEN ===== */}
      <div
        className="fixed inset-0 bg-black/30 z-[998]"
        onClick={onClose}
      />

      {/* ===== Toast Wrapper ===== */}
      <div className="fixed top-6 right-6 z-[999]">
        <div
          className="
            bg-yellow-100
            border border-yellow-300
            rounded-lg
            shadow-xl
            w-[360px]
            p-5
            text-gray-800
            overflow-hidden
          "
        >
          {/* Message */}
          <div className="text-sm mb-4 text-center">
            {message}
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center text-sm text-gray-600 animate-pulse">
              保存中です…
            </div>
          )}

          {/* Actions */}
          {!loading && (
            <div className="flex justify-center gap-4">
              {type === 'confirm' ? (
                <>
                  <button
                    onClick={onClose}
                    className="
                      w-10 h-10
                      flex items-center justify-center
                      rounded-md
                      bg-gray-300
                      hover:bg-gray-400
                      transition
                    "
                  >
                    ✖
                  </button>

                  <button
                    onClick={onConfirm}
                    className="
                      w-10 h-10
                      flex items-center justify-center
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
                    px-6 py-2
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
    </>
  );
};

export default Toast;
