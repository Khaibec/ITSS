import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI, groupsAPI } from '../../services/api';

const CreateGroup = () => {
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [members, setMembers] = useState([]); // {user_id,name,email}
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchQuery || searchQuery.trim().length === 0) return;
    try {
      setLoading(true);
      const res = await usersAPI.searchUsers(searchQuery.trim());
      setSearchResults(res.data || []);
    } catch (err) {
      console.error('Search error', err);
      alert('ユーザー検索に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const addMember = (user) => {
    if (members.find((m) => m.user_id === user.user_id)) return;
    setMembers((s) => [...s, user]);
  };

  const removeMember = (userId) => {
    setMembers((s) => s.filter((m) => m.user_id !== userId));
  };

  const handleCreate = async () => {
    if (!groupName || groupName.trim().length === 0) {
      alert('グループ名を入力してください');
      return;
    }

    try {
      setLoading(true);
      const payload = { group_name: groupName.trim(), member_ids: members.map((m) => m.user_id) };
      const res = await groupsAPI.createGroup(payload);
      if (res && res.success) {
        alert('グループが作成されました');
        navigate('/chatbox/groups');
      } else {
        alert('グループ作成に失敗しました');
      }
    } catch (err) {
      console.error('Create group error', err);
      alert('グループ作成中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">グループを作成</h2>

        <label className="block text-sm font-medium text-gray-700">グループの名前</label>
        <input
          className="mt-1 block w-full border rounded p-2 mb-4"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="グループ名を入力"
        />

        <label className="block text-sm font-medium text-gray-700">メンバー検索</label>
        <div className="flex gap-2 mb-2">
          <input
            className="flex-1 border rounded p-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="名前で検索"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="px-4 bg-gray-200 rounded" onClick={handleSearch} disabled={loading}>
            🔍
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="border rounded mb-4">
            {searchResults.map((u) => (
              <div key={u.user_id} className="flex items-center justify-between px-3 py-2">
                <div>{u.name} <span className="text-xs text-gray-500">{u.email}</span></div>
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
                  onClick={() => addMember(u)}
                  disabled={members.find((m) => m.user_id === u.user_id)}
                >
                  追加
                </button>
              </div>
            ))}
          </div>
        )}

        <label className="block text-sm font-medium text-gray-700">メンバー一覧</label>
        <div className="border rounded p-2 mb-4 min-h-[48px]">
          {members.length === 0 && <div className="text-sm text-gray-500">メンバーがまだ追加されていません</div>}
          {members.map((m) => (
            <div key={m.user_id} className="flex items-center justify-between py-1">
              <div>{m.name}</div>
              <button className="px-2 text-red-600" onClick={() => removeMember(m.user_id)}>×</button>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={handleCreate}
            disabled={loading}
          >
            作成
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;
