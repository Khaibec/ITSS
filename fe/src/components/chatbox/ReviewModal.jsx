
import { useState } from 'react';
import { diariesAPI } from '../../services/api';

const ReviewModal = ({ open, message, reviewResult, loading, onClose }) => {
    if (!open) return null;

    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        try {
            setSaving(true);
            await diariesAPI.saveEntry({
                original: message,
                warning: reviewResult.warning,
                suggestion: reviewResult.suggestion
            });
            alert('学習日記に保存しました！'); // Checkmark success would be better but alert is simple
            onClose();
        } catch (err) {
            console.error(err);
            alert('保存に失敗しました');
        } finally {
            setSaving(false);
        }
    };

    const hasWarning = reviewResult?.warning && reviewResult.warning.length > 0;

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50">
            {/* Modal Container: Light Yellow Background, Rounded */}
            <div className="relative bg-[#FFFDE7] w-[600px] min-h-[320px] rounded-3xl shadow-2xl p-6 border-4 border-white ring-4 ring-yellow-100/50">

                {/* Close Button: Top Right, Red Square, White X */}
                <button
                    onClick={onClose}
                    className="
                        absolute top-4 right-4 
                        w-10 h-10 
                        bg-red-500 hover:bg-red-600 
                        text-white font-bold text-xl
                        rounded-md shadow-md
                        flex items-center justify-center
                        transition-transform hover:scale-105 active:scale-95
                        z-10
                    "
                >
                    ✕
                </button>

                {/* Content */}
                {!loading && reviewResult ? (
                    <div className="mt-4 flex flex-col h-full">

                        {/* Review Area - Pink Box (Center) */}
                        <div className="
                            flex-1 bg-[#FFCDD2] 
                            rounded-3xl 
                            p-8 
                            flex flex-col items-center 
                            text-center
                            shadow-inner
                            mb-16 relative
                            min-h-[220px] max-h-[400px] overflow-y-auto
                        ">
                            {/* Warning/Suggestion Display inside the Pink Box */}
                            <h3 className="text-gray-800 font-bold text-lg mb-2 sticky top-0 bg-[#FFCDD2] w-full pb-2">自分のメッセージをレビューした結果</h3>

                            {hasWarning ? (
                                <div className="text-red-900 font-semibold text-lg">
                                    ⚠️ {reviewResult.warning}
                                </div>
                            ) : (
                                <div className="text-green-800 font-semibold text-lg">
                                    ✅ 自然な表現です
                                </div>
                            )}

                            {reviewResult.suggestion && (
                                <div className="mt-4 bg-white/60 p-3 rounded-xl w-full text-left">
                                    <p className="text-gray-700 font-medium text-center">提案:</p>
                                    <p className="text-gray-900 text-lg whitespace-pre-wrap">{reviewResult.suggestion}</p>
                                </div>
                            )}
                        </div>

                        {/* Save Button: Bottom Right inside Modal (Green) */}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="
                                absolute bottom-6 right-6
                                bg-[#4ADE80] hover:bg-[#22c55e]
                                text-black font-bold text-lg
                                px-6 py-2
                                rounded-full
                                shadow-lg
                                transition-all hover:scale-105 active:scale-95
                                disabled:opacity-70 disabled:grayscale
                                flex items-center gap-2
                            "
                        >
                            {saving ? '保存中...' : '学習日記に保存'}
                        </button>

                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-60">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pink-400 mb-4"></div>
                        <p className="text-pink-600 font-bold text-lg">AIが分析中...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewModal;
