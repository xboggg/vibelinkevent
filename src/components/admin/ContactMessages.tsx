import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Inbox, Mail, MessageSquare, Search, Loader2, CheckCircle2, Archive } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

type MessageStatus = "new" | "read" | "responded" | "archived";

interface ContactMessage {
  id: string;
  name: string;
  email: string | null;
  event_type: string | null;
  message: string;
  source: string | null;
  user_agent: string | null;
  ip_address: string | null;
  status: MessageStatus;
  responded_at: string | null;
  notes: string | null;
  created_at: string;
}

const statusColors: Record<MessageStatus, string> = {
  new: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  read: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200",
  responded: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  archived: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

export const ContactMessages = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | MessageStatus>("all");
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Couldn't load messages", description: error.message, variant: "destructive" });
    } else {
      setMessages((data ?? []) as ContactMessage[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markStatus = async (id: string, status: MessageStatus) => {
    const patch: Record<string, unknown> = { status };
    if (status === "responded") patch.responded_at = new Date().toISOString();

    const { error } = await supabase.from("contact_messages").update(patch).eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status, responded_at: (patch.responded_at as string) ?? m.responded_at } : m))
    );
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const saveNote = async () => {
    if (!selected) return;
    setSavingNote(true);
    const { error } = await supabase
      .from("contact_messages")
      .update({ notes: noteDraft })
      .eq("id", selected.id);
    setSavingNote(false);
    if (error) {
      toast({ title: "Couldn't save note", description: error.message, variant: "destructive" });
      return;
    }
    setMessages((prev) => prev.map((m) => (m.id === selected.id ? { ...m, notes: noteDraft } : m)));
    setSelected({ ...selected, notes: noteDraft });
    toast({ title: "Note saved" });
  };

  const openMessage = async (m: ContactMessage) => {
    setSelected(m);
    setNoteDraft(m.notes ?? "");
    if (m.status === "new") {
      await markStatus(m.id, "read");
    }
  };

  const filtered = messages.filter((m) => {
    if (statusFilter !== "all" && m.status !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      (m.email ?? "").toLowerCase().includes(q) ||
      (m.event_type ?? "").toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q)
    );
  });

  const counts = {
    all: messages.length,
    new: messages.filter((m) => m.status === "new").length,
    responded: messages.filter((m) => m.status === "responded").length,
  };

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Inbox className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Contact Messages</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Inquiries submitted via the website Contact form. {counts.new > 0 && (
            <span className="font-semibold text-blue-700 dark:text-blue-300">{counts.new} unread</span>
          )}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, event type or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ({counts.all})</SelectItem>
            <SelectItem value="new">New ({counts.new})</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="responded">Responded ({counts.responded})</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-base font-medium">No messages match your filter.</p>
            <p className="text-sm mt-1">New inquiries will appear here automatically.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((m) => (
            <Card
              key={m.id}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => openMessage(m)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-base font-semibold">{m.name}</CardTitle>
                    <Badge className={statusColors[m.status]}>{m.status}</Badge>
                    {m.event_type && (
                      <Badge variant="outline" className="text-xs">{m.event_type}</Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                  </span>
                </div>
                {m.email && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Mail className="h-3 w-3" /> {m.email}
                  </p>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-foreground/80 line-clamp-2 whitespace-pre-wrap">{m.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <DialogTitle>{selected.name}</DialogTitle>
                  <Badge className={statusColors[selected.status]}>{selected.status}</Badge>
                </div>
                <DialogDescription className="space-y-1 mt-2">
                  {selected.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3" />
                      <a href={`mailto:${selected.email}`} className="text-primary hover:underline">
                        {selected.email}
                      </a>
                    </div>
                  )}
                  {selected.event_type && (
                    <div className="text-sm text-muted-foreground">
                      Event type: {selected.event_type}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Received {format(new Date(selected.created_at), "PPpp")} ({formatDistanceToNow(new Date(selected.created_at), { addSuffix: true })})
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Message
                  </label>
                  <div className="bg-muted/50 rounded-md p-4 mt-1 whitespace-pre-wrap text-sm">
                    {selected.message}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Internal Notes
                  </label>
                  <Textarea
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder="Notes for your team (visible in admin only)..."
                    rows={3}
                    className="mt-1"
                  />
                  <Button size="sm" variant="outline" className="mt-2" onClick={saveNote} disabled={savingNote}>
                    {savingNote ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
                    Save note
                  </Button>
                </div>

                {(selected.user_agent || selected.ip_address) && (
                  <details className="text-xs text-muted-foreground">
                    <summary className="cursor-pointer">Technical details</summary>
                    <dl className="mt-2 space-y-1 pl-2">
                      {selected.ip_address && <div><span className="font-mono">IP:</span> {selected.ip_address}</div>}
                      {selected.user_agent && <div className="break-all"><span className="font-mono">UA:</span> {selected.user_agent}</div>}
                    </dl>
                  </details>
                )}
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
                {selected.email && (
                  <Button
                    variant="default"
                    onClick={() => {
                      window.location.href = `mailto:${selected.email}?subject=Re: Your message to VibeLink Event`;
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2" /> Reply via Email
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => markStatus(selected.id, "responded")}
                  disabled={selected.status === "responded"}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Responded
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => markStatus(selected.id, "archived")}
                  disabled={selected.status === "archived"}
                >
                  <Archive className="h-4 w-4 mr-2" /> Archive
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactMessages;
