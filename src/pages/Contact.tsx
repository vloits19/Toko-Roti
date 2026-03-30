import { useState, useEffect, useRef } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MapPin, Phone, Mail, Send, CheckCircle, Store, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import type { Message } from '@/types';

export function Contact() {
  const { isAuthenticated, user } = useAuth();
  
  // States for Guest Contact Form
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // States for Live Chat
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchChatHistory();
      const interval = setInterval(fetchChatHistory, 3000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchChatHistory = async () => {
    try {
      const response = await api.getChatHistory();
      if (response.success && response.data) {
        setChatMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Failed to fetch chat history');
    }
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Mohon lengkapi semua field');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await api.sendMessage(formData.name, formData.email, formData.message);
      if (response.success) {
        setIsSuccess(true);
        setFormData({ name: '', email: '', message: '' });
        toast.success('Pesan berhasil dikirim!');
        setTimeout(() => setIsSuccess(false), 5000);
      }
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengirim pesan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !user) return;

    const tempMessage = chatInput;
    setChatInput(''); // Optimistic clear
    setIsSendingChat(true);

    try {
      const response = await api.sendMessage(user.name, user.email, tempMessage);
      if (response.success) {
        await fetchChatHistory(); // Refresh messages to show the new one
      }
    } catch (error) {
      toast.error('Gagal mengirim pesan');
      setChatInput(tempMessage); // Restore if failed
    } finally {
      setIsSendingChat(false);
    }
  };

  const formatChatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  // --- Guest View ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-amber-50/30 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-stone-800 mb-4">Hubungi Kami</h1>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Punya pertanyaan atau saran? Kami siap membantu! 
              Kirim pesan Anda dan tim kami akan merespons secepatnya.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-8">
                  {isSuccess ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-stone-800 mb-2">Pesan Terkirim!</h3>
                      <p className="text-stone-600">Terima kasih telah menghubungi kami. Tim kami akan merespons pesan Anda secepatnya.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleGuestSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nama Lengkap</Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="Masukkan nama Anda"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="email@anda.com"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Pesan</Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Tulis pesan Anda di sini..."
                          rows={6}
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                          required
                        />
                      </div>
                      <Button type="submit" disabled={isSubmitting} className="w-full bg-amber-500 hover:bg-amber-600 text-white h-12">
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Mengirim...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2"><Send className="w-4 h-4" />Kirim Pesan</span>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
            {/* Contact Info */}
            <div className="space-y-4">
              <Card><CardContent className="p-6"><div className="flex items-start gap-4"><div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center"><MapPin className="w-5 h-5 text-amber-600" /></div><div><h3 className="font-semibold text-stone-800 mb-1">Alamat</h3><p className="text-stone-600 text-sm">Jl. Roti No. 123<br />Jakarta Selatan, 12345</p></div></div></CardContent></Card>
              <Card><CardContent className="p-6"><div className="flex items-start gap-4"><div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center"><Phone className="w-5 h-5 text-amber-600" /></div><div><h3 className="font-semibold text-stone-800 mb-1">Telepon</h3><p className="text-stone-600 text-sm">+62 812-3456-7890</p></div></div></CardContent></Card>
              <Card><CardContent className="p-6"><div className="flex items-start gap-4"><div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center"><Mail className="w-5 h-5 text-amber-600" /></div><div><h3 className="font-semibold text-stone-800 mb-1">Email</h3><p className="text-stone-600 text-sm">hello@rotilezat.com</p></div></div></CardContent></Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Logged In Live Chat View ---
  return (
    <div className="min-h-[calc(100vh-80px)] bg-amber-50/50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col h-[75vh]">
          
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm shadow-sm rounded-full flex items-center justify-center shrink-0 border border-white/30">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg leading-tight">Roti Lezat Official</h3>
                <p className="text-amber-100 text-sm flex items-center gap-1.5 mt-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400 border border-amber-600 shadow-sm"></span> 
                  Online & Siap Membantu
                </p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[#f8f9fa] flex flex-col">
            {chatMessages.length === 0 ? (
              <div className="m-auto text-center flex flex-col items-center opacity-50">
                <MessageSquare className="w-12 h-12 text-stone-400 mb-2" />
                <p className="text-stone-500">Mulai obrolan dengan kami!</p>
                <p className="text-sm text-stone-400">Tanyakan resi, stok, atau komplain pesanan.</p>
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isAdmin = Boolean(msg.is_admin);
                return (
                  <div key={msg.id} className={`flex flex-col max-w-[80%] ${isAdmin ? 'self-start' : 'self-end'}`}>
                    <div 
                      className={`px-4 py-2.5 rounded-2xl ${
                        isAdmin 
                          ? 'bg-white border text-stone-800 border-stone-200 rounded-tl-none shadow-sm' 
                          : 'bg-amber-500 text-white rounded-tr-none shadow-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                    </div>
                    <span className={`text-[11px] text-stone-400 mt-1 px-1 ${isAdmin ? 'text-left' : 'text-right'}`}>
                      {formatChatTime(msg.created_at)}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} className="h-1" />
          </div>

          {/* Message Input Bottom Bar */}
          <div className="p-4 bg-white border-t border-stone-200 shrink-0">
            <form onSubmit={handleSendChat} className="flex gap-2 items-end max-w-4xl mx-auto">
              <Textarea
                placeholder="Ketik pesan Anda..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="resize-none min-h-[50px] max-h-[120px] rounded-xl bg-stone-50 border-stone-200 focus-visible:ring-amber-500"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (chatInput.trim()) handleSendChat(e);
                  }
                }}
              />
              <Button 
                type="submit" 
                disabled={!chatInput.trim() || isSendingChat}
                className="h-[50px] w-[50px] rounded-xl bg-amber-500 hover:bg-amber-600 text-white shrink-0"
                size="icon"
              >
                {isSendingChat ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5 ml-1" />
                )}
              </Button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
