import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { diariesAPI } from "../../services/api";

// 学習日記一覧（タイトル＋学習日）
const DiaryList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await diariesAPI.getList();
        if (res.success && Array.isArray(res.data)) {
          setItems(res.data);
        } else if (Array.isArray(res)) {
          // Fallback: if backend returns raw array
          setItems(res);
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

    // 戻ってきたらスクロール位置を復元
    const container = document.querySelector(".scrollbar-thin");
    const saved = sessionStorage.getItem("diaryListScroll");
    if (container && saved) {
      container.scrollTop = Number(saved);
      sessionStorage.removeItem("diaryListScroll");
    }
  }, []);

  const onClickItem = (id) => {
    // スクロール位置を保存
    const container = document.querySelector(".scrollbar-thin");
    if (container) {
      sessionStorage.setItem("diaryListScroll", String(container.scrollTop));
    }
    navigate(`/chatbox/diary/${id}`);
  };

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

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">学習日記一覧</h2>

      {loading && <div className="text-gray-600">読み込み中...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && !error && (
        <ul className="divide-y divide-gray-200 bg-white border border-gray-300 rounded-md">
          {items.length === 0 && (
            <li className="p-4 text-gray-500">学習日記がありません。</li>
          )}
          {items.map((it) => (
            <li
              key={it.diary_id}
              className="p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
              onClick={() => onClickItem(it.diary_id)}
            >
              <div className="font-medium text-gray-900">
                {it.title || "(タイトル未設定)"}
              </div>
              <div className="text-gray-600">{formatDate(it.learning_date)}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DiaryList;
