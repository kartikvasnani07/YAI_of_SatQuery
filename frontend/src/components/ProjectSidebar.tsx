import React, { useState } from 'react';
import { Folder, Trash2, MessageSquare, Plus, Check } from 'lucide-react';

interface ProjectSidebarProps {
  projects: any[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onCreateProject: (name: string) => void;
  chats: any[];
  activeChatId?: string;
  onSelectChat: (chat: any) => void;
  onDeleteChat: (chatId: string) => void;
  onClearChats: () => void;
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  chats,
  activeChatId,
  onSelectChat,
  onDeleteChat,
  onClearChats,
}) => {
  const [newProjName, setNewProjName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjName.trim()) {
      onCreateProject(newProjName.trim());
      setNewProjName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="w-64 h-full bg-[#1E1E1E] border-r border-[#373737] flex flex-col z-20 shrink-0 select-none">
      {/* Sidebar Header */}
      <div className="p-3 border-b border-[#373737] flex items-center justify-between bg-[#000000]">
        <div className="flex items-center space-x-2 text-xs font-bold text-white uppercase tracking-wide font-mono">
          <Folder className="w-4 h-4 text-[#6C6C6C]" />
          <span>Projects & History</span>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="p-1 rounded bg-[#1E1E1E] hover:bg-[#373737] text-[#6C6C6C] hover:text-white transition-colors text-xs flex items-center space-x-1 border border-[#373737]"
          title="Create New Project"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* New Project Input */}
      {isCreating && (
        <form onSubmit={handleCreateSubmit} className="p-2 border-b border-[#373737] flex items-center space-x-1.5 bg-[#000000]">
          <input
            type="text"
            value={newProjName}
            onChange={(e) => setNewProjName(e.target.value)}
            placeholder="Project Name..."
            className="flex-1 bg-[#1E1E1E] border border-[#373737] rounded px-2 py-1 text-xs text-white placeholder-[#545454] focus:outline-none"
            autoFocus
          />
          <button type="submit" className="p-1 bg-[#373737] text-white rounded hover:bg-[#545454]">
            <Check className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      {/* Project Selector List */}
      <div className="p-2 border-b border-[#373737] space-y-1">
        <label className="text-[10px] font-semibold text-[#545454] uppercase tracking-wider px-1 font-mono">Projects:</label>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {projects.map((proj) => (
            <button
              key={proj.id}
              onClick={() => onSelectProject(proj.id)}
              className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition-all ${
                proj.id === activeProjectId
                  ? 'bg-[#373737] text-white font-semibold border border-[#6C6C6C]'
                  : 'text-[#545454] hover:text-slate-200 hover:bg-[#000000]'
              }`}
            >
              <span className="truncate">{proj.name}</span>
              <span className="text-[10px] font-mono text-[#545454]">({proj.chats?.length || 0})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat History List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <div className="flex items-center justify-between px-1 pb-1">
          <span className="text-[10px] font-semibold text-[#545454] uppercase tracking-wider font-mono">Conversations:</span>
          {chats.length > 0 && (
            <button
              onClick={onClearChats}
              className="text-[10px] text-red-400 hover:text-red-300 transition-colors flex items-center space-x-1"
              title="Clear All Project History"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {chats.length === 0 ? (
          <p className="text-[11px] text-[#545454] italic p-2">No conversation history in this project.</p>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className={`group flex items-start justify-between p-2 rounded text-xs cursor-pointer border transition-all ${
                chat.id === activeChatId
                  ? 'bg-[#373737] border-[#6C6C6C] text-white shadow-sm font-medium'
                  : 'bg-[#000000] border-[#373737] text-slate-300 hover:border-[#545454]'
              }`}
            >
              <div className="flex items-start space-x-2 min-w-0 flex-1">
                <MessageSquare className="w-3.5 h-3.5 text-[#6C6C6C] shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium line-clamp-2 leading-tight text-xs">{chat.query}</p>
                  {chat.location?.name && (
                    <span className="text-[9px] font-mono text-[#6C6C6C] block truncate pt-0.5">
                      📍 {chat.location.name}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-[#545454] hover:text-red-400 p-1 transition-opacity shrink-0 ml-1"
                title="Delete this chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
