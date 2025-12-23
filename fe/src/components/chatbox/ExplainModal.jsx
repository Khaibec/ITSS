import { useState } from 'react';
import Toast from './Toast';
import { saveDiaryAPI } from '../../services/api';

const ExplainModal = ({
  open,
  message,
  sender,
  explanation,
  loading,
  onClose,
  groupId,
}) => {
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  if (!open) return null;

  const handleSave = async () => {
    if (saving) return;

    setSaving(true);
    try {
      await saveDiaryAPI.saveLearningDiary({ message, groupId });
      setToast({ type: 'success', message: '学習日記に保存しました 🌱' });
    } catch (err) {
      setToast({
        type: 'error',
        message:
          err?.response?.data?.message ||
          '保存に失敗しました。もう一度お試しください。',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Overlay */}
      <div
        className="
          fixed inset-0
          backdrop-blur-sm
          bg-black/20
          flex items-center justify-center
          z-50
        "
      >
        {/* MAIN POPUP */}
        <div className="relative bg-yellow-100 w-[600px] min-h-[280px] rounded-lg shadow-lg p-6">

          {/* Block UI while saving */}
          {saving && (
            <div className="absolute inset-0 bg-white/70 z-50 flex items-center justify-center rounded-lg">
              <div className="text-gray-700 animate-pulse">
                AI が分析中です…
              </div>
            </div>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            disabled={saving}
            className="
              absolute top-3 right-3
              w-7 h-7 flex items-center justify-center
              text-white font-bold
              bg-red-500 rounded-md
              hover:bg-red-600 transition
              disabled:opacity-50
            "
          >
            ×
          </button>

          {/* Sender */}
          {sender && (
            <div className="flex items-center gap-3 mb-4">
              <img
                src={
                  sender.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    sender.name
                  )}&background=4F46E5&color=fff`
                }
                alt={sender.name}
                className="w-12 h-12 rounded-full border object-cover"
              />
              <div className="font-semibold text-gray-800 text-lg">
                {sender.name}
              </div>
            </div>
          )}

          {/* Original */}
          <div className="text-sm text-gray-700 border p-3 rounded-md bg-white mb-4">
            <strong>原文:</strong>
            <div className="mt-1 whitespace-pre-wrap">{message}</div>
          </div>

          {/* Explanation */}
          <div className="text-sm bg-white border p-3 rounded-md mb-4 max-h-48 overflow-y-auto">
            {loading ? (
              <div className="text-gray-500">AI が考え中...</div>
            ) : (
              <div className="whitespace-pre-wrap">{explanation}</div>
            )}
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="
                bg-green-500 text-white px-4 py-2
                rounded-md hover:bg-green-600 transition
                disabled:opacity-60
              "
            >
              学習日記に追加
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExplainModal;
