const GroupList = ({ groups, selectedGroupId, onSelectGroup }) => {
  // Function to generate initials from group name
  const getInitials = (name) => {
    if (!name) return "G";
    return name.substring(0, 1).toUpperCase();
  };

  // Function to generate a consistent color based on string
  const getBackgroundColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      "#ef4444", "#f97316", "#f59e0b", 
      "#22c55e", "#10b981", "#14b8a6",
      "#06b6d4", "#0ea5e9", "#3b82f6", 
      "#6366f1", "#8b5cf6", "#a855f7", 
      "#d946ef", "#ec4899", "#f43f5e"
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <aside className="w-[280px] bg-white border-r-2 border-gray-300 flex flex-col overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 bg-gray-100">
        <h3 className="text-base font-semibold text-gray-800">グループ</h3>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {groups.map((group) => {
          // Allow ui-avatars since it works for messages
          const hasImage = group.icon_url && group.icon_url.trim() !== "" && !group.icon_url.includes("ui-avatars.com");
          const bgColor = getBackgroundColor(group.group_name || "");
          
          return (
            <div
              key={group.group_id}
              className={`
                flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors border-b-2 border-gray-300
                hover:bg-sky-50
                ${
                  selectedGroupId === group.group_id
                    ? "bg-sky-100 hover:bg-sky-100 border-l-4 border-l-blue-500"
                    : ""
                }
              `}
              onClick={() => onSelectGroup(group.group_id)}
            >
              {hasImage ? (
                <img
                  src={group.icon_url}
                  alt={group.group_name}
                  className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-gray-100 bg-gray-50"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    // Show the fallback div which is the next sibling
                    const nextSibling = e.target.nextElementSibling;
                    if (nextSibling) {
                       nextSibling.style.display = 'flex';
                    }
                  }}
                />
              ) : (
                <div 
                  className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-white text-lg font-bold shadow-sm"
                  style={{ backgroundColor: bgColor }}
                >
                  {getInitials(group.group_name)}
                </div>
              )}
              
              {/* Fallback div for when image fails to load (hidden by default) */}
              {hasImage && (
                <div 
                  className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-white text-lg font-bold shadow-sm"
                  style={{ display: 'none', backgroundColor: bgColor }}
                >
                  {getInitials(group.group_name)}
                </div>
              )}

              <span
                className={`
                  text-[15px] font-medium overflow-hidden text-ellipsis whitespace-nowrap
                  ${
                    selectedGroupId === group.group_id
                      ? "text-blue-800 font-semibold"
                      : "text-gray-700"
                  }
                `}
              >
                {group.group_name}
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default GroupList;

