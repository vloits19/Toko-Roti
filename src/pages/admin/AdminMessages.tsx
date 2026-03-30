import { useEffect, useState, useRef } from 'react';
import { api } from '@/services/api';
import type { Message } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Send,
  Loader2,
  MessageSquare,
  User,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

interface Conversation {
  user_id: number;
  name: string;
  email: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export function AdminMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchChat(selectedUserId);
      const interval = setInterval(() => fetchChat(selectedUserId), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedUserId]);

  const fetchConversations = async () => {
    try {
      const response = await api.getConversations();
      if (response.success && response.data) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      console.error('Failed to fetch conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChat = async (userId: number) => {
    try {
      const response = await api.getConversation(userId);
      if (response.success && response.data) {
        setChatMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Failed to fetch chat');
    } finally {
      setIsChatLoading(false);
    }
  };

  const openChat = (userId: number) => {
    setSelectedUserId(userId);
    setIsChatLoading(true);
    setReplyText('');
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedUserId) return;
    setIsReplying(true);
    try {
      const res = await api.replyToUser(selectedUserId, replyText);
      if (res.success) {
        setReplyText('');
        await fetchChat(selectedUserId);
        await fetchConversations();
      }
    } catch (error) {
      toast.error('Gagal mengirim balasan');
    } finally {
      setIsReplying(false);
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  };

  const formatChatTime = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConversation = conversations.find(c => c.user_id === selectedUserId);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  return (
    <div className="min-h-screen bg-amber-50/30">
      <header className="bg-white border-b border-amber-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-stone-800">Live Chat</h1>
              <p className="text-stone-500 text-sm">
                {totalUnread > 0 ? `${totalUnread} pesan belum dibaca` : 'Semua pesan terbaca'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex h-[calc(100vh-160px)]">
          
          {/* Left Panel - Conversation List */}
          <div className={`w-full md:w-[360px] border-r border-stone-200 flex flex-col shrink-0 ${selectedUserId ? 'hidden md:flex' : 'flex'}`}>
            {/* Search */}
            <div className="p-3 border-b border-stone-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input
                  placeholder="Cari nama pengguna..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 bg-stone-50 border-stone-200"
                />
              </div>
            </div>

            {/* Conversation Items */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-stone-400 text-sm">
                  <MessageSquare className="w-8 h-8 mb-2" />
                  Belum ada percakapan
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.user_id}
                    onClick={() => openChat(conv.user_id)}
                    className={`w-full text-left px-4 py-3 border-b border-stone-100 hover:bg-amber-50/50 transition-colors ${
                      selectedUserId === conv.user_id ? 'bg-amber-50 border-l-4 border-l-amber-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-stone-800 text-sm truncate">{conv.name}</span>
                          <span className="text-[11px] text-stone-400 shrink-0 ml-2">{formatTime(conv.last_message_at)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-xs text-stone-500 truncate max-w-[200px]">{conv.last_message}</p>
                          {conv.unread_count > 0 && (
                            <span className="bg-amber-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 ml-2">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Panel - Chat Thread */}
          <div className={`flex-1 flex flex-col ${selectedUserId ? 'flex' : 'hidden md:flex'}`}>
            {selectedUserId && selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-stone-200 bg-white flex items-center gap-3 shrink-0">
                  <button
                    className="md:hidden text-stone-500 hover:text-stone-700"
                    onClick={() => setSelectedUserId(null)}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-800">{selectedConversation.name}</h3>
                    <p className="text-xs text-stone-400">{selectedConversation.email}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 bg-[#f8f9fa] flex flex-col">
                  {isChatLoading ? (
                    <div className="m-auto"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>
                  ) : chatMessages.length === 0 ? (
                    <div className="m-auto text-center text-stone-400 text-sm">
                      <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      Belum ada pesan
                    </div>
                  ) : (
                    chatMessages.map(msg => {
                      const isAdmin = Boolean(msg.is_admin);
                      return (
                        <div key={msg.id} className={`flex flex-col max-w-[75%] ${isAdmin ? 'self-end' : 'self-start'}`}>
                          <div className={`px-4 py-2.5 rounded-2xl ${
                            isAdmin
                              ? 'bg-amber-500 text-white rounded-tr-none shadow-sm'
                              : 'bg-white border border-stone-200 text-stone-800 rounded-tl-none shadow-sm'
                          }`}>
                            <p className="whitespace-pre-wrap leading-relaxed text-sm">{msg.message}</p>
                          </div>
                          <span className={`text-[11px] text-stone-400 mt-1 px-1 ${isAdmin ? 'text-right' : 'text-left'}`}>
                            {formatChatTime(msg.created_at)}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} className="h-1" />
                </div>

                {/* Reply Input */}
                <div className="p-4 bg-white border-t border-stone-200 shrink-0">
                  <form onSubmit={handleSendReply} className="flex gap-2 items-end">
                    <Input
                      placeholder="Ketik balasan..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 h-11 rounded-xl bg-stone-50 border-stone-200 focus-visible:ring-amber-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (replyText.trim()) handleSendReply(e);
                        }
                      }}
                    />
                    <Button
                      type="submit"
                      disabled={!replyText.trim() || isReplying}
                      className="h-11 w-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shrink-0"
                      size="icon"
                    >
                      {isReplying ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="flex-1 flex items-center justify-center text-stone-400">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium text-stone-500">Pilih Percakapan</p>
                  <p className="text-sm">Klik nama pelanggan di samping kiri untuk membuka chat</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
