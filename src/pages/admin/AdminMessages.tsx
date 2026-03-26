import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import type { Message } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { 
  Search, 
  Mail, 
  MailOpen, 
  Trash2, 
  Loader2,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

export function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await api.getMessages();
      if (response.success && response.data) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      toast.error('Gagal memuat pesan');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.markMessageAsRead(id);
      toast.success('Pesan ditandai sebagai dibaca');
      fetchMessages();
    } catch (error) {
      toast.error('Gagal menandai pesan');
    }
  };

  const deleteMessage = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pesan ini?')) return;

    try {
      await api.deleteMessage(id);
      toast.success('Pesan dihapus');
      fetchMessages();
    } catch (error) {
      toast.error('Gagal menghapus pesan');
    }
  };

  const openMessageDetail = (message: Message) => {
    setSelectedMessage(message);
    setShowDetailDialog(true);
    if (message.is_read === 0) {
      markAsRead(message.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredMessages = messages.filter(message =>
    message.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    message.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = messages.filter(m => m.is_read === 0).length;

  return (
    <div className="min-h-screen bg-amber-50/30">
      <header className="bg-white border-b border-amber-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-stone-800">Pesan Masuk</h1>
              <p className="text-stone-500 text-sm">
                {unreadCount > 0 ? `${unreadCount} pesan belum dibaca` : 'Tidak ada pesan baru'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            placeholder="Cari pesan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>

        {/* Messages Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Status</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Pesan</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredMessages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-stone-500">
                      Tidak ada pesan ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMessages.map((message) => (
                    <TableRow 
                      key={message.id}
                      className={message.is_read === 0 ? 'bg-amber-50/50' : ''}
                    >
                      <TableCell>
                        {message.is_read === 0 ? (
                          <Mail className="w-5 h-5 text-amber-500" />
                        ) : (
                          <MailOpen className="w-5 h-5 text-stone-400" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{message.name}</TableCell>
                      <TableCell className="text-stone-500">{message.email}</TableCell>
                      <TableCell>
                        <p className="truncate max-w-xs">{message.message}</p>
                      </TableCell>
                      <TableCell className="text-sm text-stone-500">
                        {formatDate(message.created_at || '')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openMessageDetail(message)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMessage(message.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {/* Message Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Pesan</DialogTitle>
            <DialogDescription>
              Pesan dari {selectedMessage?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-stone-500">Nama</p>
                  <p className="font-medium">{selectedMessage.name}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-500">Email</p>
                  <p className="font-medium">{selectedMessage.email}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-stone-500 mb-2">Pesan</p>
                <div className="p-4 bg-amber-50 rounded-lg">
                  <p className="text-stone-700 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-stone-500">Diterima</p>
                <p className="text-sm">{formatDate(selectedMessage.created_at || '')}</p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDetailDialog(false)}
                >
                  Tutup
                </Button>
                <Button
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={() => window.open(`mailto:${selectedMessage.email}`)}
                >
                  Balas via Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
