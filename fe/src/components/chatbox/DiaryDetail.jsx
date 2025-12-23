import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { diariesAPI } from "../../services/api";
import ReactMarkdown from "react-markdown";

// 学習日記詳細：タイトル → 学習日 → 状況 → 学んだこと
const DiaryDetail = () => {
  const { diaryId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await diariesAPI.getById(diaryId);
        if (res.success && res.data) {
          setItem(res.data);
        } else if (res && res.diary_id) {
          setItem(res);
        } else {
          setError("学習日記の取得に失敗しました。");
        }
      } catch (e) {
        setError(e.message || "学習日記の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [diaryId]);

  const formatDate = (iso) => {
    try {
      const d = new Date(iso);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${dd}`;
    } catch {
      return iso;
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* 戻るボタン（右上） */}
      <div className="flex justify-end mb-2">
        <button
          aria-label="戻る"
          onClick={handleBack}
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          <span className="text-xl">⬅</span>
          <span className="text-sm">戻る</span>
        </button>
      </div>

      {loading && <div className="text-gray-600">読み込み中...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {item && (
        <div className="bg-white border border-gray-300 rounded-md p-6">
          {/* タイトル */}
          <div className="mb-4">
            <div className="text-xl font-bold">日記タイトル: {item.title || "(未設定)"}</div>
          </div>

          <hr className="my-2" />

          {/* 学習日 */}
          <div className="mb-4 flex items-center gap-4">
            <div className="text-lg font-semibold">学習日:</div>
            <div className="text-lg">{formatDate(item.learning_date)}</div>
          </div>

          <hr className="my-2" />

          {/* 状況 */}
          <div className="mb-4">
            <div className="text-lg font-bold">状況:</div>
            <div className="mt-2 leading-7 text-gray-800 prose prose-slate max-w-none">
              <ReactMarkdown>{item.situation || ""}</ReactMarkdown>
            </div>
          </div>

          <hr className="my-2" />

          {/* 学んだこと */}
          <div>
            <div className="text-lg font-bold">学んだこと:</div>
            <div className="mt-2 leading-7 text-gray-800 prose prose-slate max-w-none">
              <ReactMarkdown>{item.learning_content || ""}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiaryDetail;
