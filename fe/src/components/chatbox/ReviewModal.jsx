import { useState } from 'react';
import Toast from './Toast';
import { saveDiaryAPI } from '../../services/api';

const ReviewModal = ({
  open,
  message,
  reviewResult,
  loading,
  onClose,
  groupId,
}) => {
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  /* Step 1: ask confirm */
  const handleAskSave = () => {
    setToast({
      type: 'confirm',
      message: 'この内容を学習日記に保存しますか？',
    });
  };

  /* Step 2: confirm save */
  const handleConfirmSave = async () => {
    if (saving) return;

    setSaving(true);
    try {
      await saveDiaryAPI.saveLearningDiary({
        message,
        groupId,
        warning: reviewResult?.warning,
        suggestion: reviewResult?.suggestion,
      });

      setToast({
        type: 'success',
        message: '学習日記に保存しました 🌱',
      });
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

  const hasWarning =
    reviewResult?.warning && reviewResult.warning.length > 0;

  return (
    <>
      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          loading={saving}
          onConfirm={handleConfirmSave}
          onClose={() => setToast(null)}
        />
      )}

      {/* Overlay (GIỐNG ExplainModal) */}
      <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
        {/* MAIN MODAL */}
        <div className="relative bg-yellow-100 w-[600px] min-h-[280px] max-h-[70vh] rounded-lg shadow-lg p-6">

          {/* Block UI while saving */}
          {saving && (
            <div className="absolute inset-0 bg-white/70 z-40 flex items-center justify-center rounded-lg">
              <div className="text-gray-700 animate-pulse">
                保存中です…
              </div>
            </div>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            disabled={saving}
            className="
              absolute top-3 right-3
              w-7 h-7
              flex items-center justify-center
              text-white font-bold
              bg-red-500 rounded-md
              hover:bg-red-600 transition
              disabled:opacity-50
            "
          >
            ×
          </button>

          {!loading && reviewResult ? (
            <>
              {/* Original Message */}
              <div className="text-sm text-gray-700 border p-3 rounded-md bg-white mb-4">
                <strong>原文:</strong>
                <div className="mt-1 whitespace-pre-wrap">{message}</div>
              </div>

              {/* Analysis Result */}
              <div className="text-sm bg-white border p-3 rounded-md mb-4">
                {hasWarning ? (
                  <div className="text-red-700 font-semibold">
                    ⚠️ {reviewResult.warning}
                  </div>
                ) : (
                  <div className="text-green-700 font-semibold">
                    ✅ 自然な表現です
                  </div>
                )}
              </div>

              {/* Suggestion */}
              {reviewResult?.suggestion && (
                <div className="text-sm bg-white border p-3 rounded-md mb-4 max-h-48 overflow-y-auto">
                  <strong>Suggestion:</strong>
                  <div className="mt-1 whitespace-pre-wrap">
                    {reviewResult.suggestion}
                  </div>
                </div>
              )}

              {/* Save */}
              <div className="flex justify-end">
                <button
                  onClick={handleAskSave}
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
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-60">
              <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-yellow-500 mb-4" />
              <p className="text-gray-600 font-medium">
                AI が分析中...
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ReviewModal;
