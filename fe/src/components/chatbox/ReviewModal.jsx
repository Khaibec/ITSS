
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
        <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Modal Container: Light Yellow Background, Rounded */}
            <div className="relative bg-[#FFFDE7] w-[560px] min-h-[220px] max-h-[70vh] flex flex-col rounded-3xl shadow-2xl p-6 border-4 border-white ring-4 ring-yellow-100/50">

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
                        z-50
                    "
                >
                    ✕
                </button>

                {/* Content */}
                {!loading && reviewResult ? (
                    <div className="mt-4 flex flex-col flex-1 min-h-0">

                        {/* Review Area - Pink Box (Center) */}
                        <div className="
                            flex-1 min-h-0
                            bg-[#FFCDD2] 
                            rounded-3xl 
                            flex flex-col
                            text-left
                            shadow-inner
                            mb-16 relative
                            overflow-hidden
                        ">
                            {/* 1. FIXED TOP SECTION: Reviewing Message */}
                            <div className="shrink-0 p-6 pb-2 z-30 bg-[#FFCDD2]">
                                <div className="bg-white/40 p-3 rounded-xl border border-white/50">
                                    <p className="text-xs text-red-800 font-bold mb-1 uppercase opacity-70">Reviewing Message</p>
                                    <p className="text-gray-900 font-medium text-lg leading-relaxed max-h-[80px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/50">
                                        {message}
                                    </p>
                                </div>
                            </div>

                            {/* 2. SCROLLABLE CONTENT AREA */}
                            <div className="flex-1 overflow-y-auto p-6 pt-2 pb-20 space-y-6">

                                {/* Section A: Analysis Result */}
                                <div className="relative">
                                    <h3 className="
                                        text-gray-800 font-bold text-lg mb-2 
                                        sticky top-0 z-20 
                                        bg-[#FFCDD2]/95 backdrop-blur-sm
                                        pb-2 border-b-2 border-red-200/50
                                        w-full
                                    ">
                                        Analysis Result
                                    </h3>

                                    <div className="pt-2">
                                        {hasWarning ? (
                                            <div className="text-red-900 font-semibold text-lg mb-3">
                                                ⚠️ {reviewResult.warning}
                                            </div>
                                        ) : (
                                            <div className="text-green-800 font-semibold text-lg mb-3">
                                                ✅ 自然な表現です
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Section B: Suggestion */}
                                {reviewResult.suggestion && (
                                    <div className="relative">
                                        <h3 className="
                                            text-gray-800 font-bold text-lg mb-2 
                                            sticky top-0 z-20 
                                            bg-[#FFCDD2]/95 backdrop-blur-sm
                                            pb-2 border-b-2 border-red-200/50
                                            w-full
                                        ">
                                            Suggestion
                                        </h3>

                                        <div className="bg-white/60 p-4 rounded-xl w-full text-left shadow-sm mt-2">
                                            <p className="text-gray-900 text-lg whitespace-pre-wrap leading-relaxed">{reviewResult.suggestion}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
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
                                z-50
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
