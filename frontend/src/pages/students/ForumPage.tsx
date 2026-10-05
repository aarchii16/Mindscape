import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Users,
  MessageSquare,
  Plus,
  Search,
  Heart,
  MessageCircle,
  Eye,
  Clock,
  Shield,
  Flame,
  TrendingUp,
  User,
  Lock,
  Loader2,
} from "lucide-react";
import { fetchWithAuth, API_BASE } from "@/lib/api";
import { toast } from "@/components/ui/sonner";

// Removed synthetic posts; we now render only real topics from backend
const forumPosts: any[] = [];

const categories = [
  { name: "All Topics", color: "bg-primary/10 text-primary" },
  { name: "Anxiety", color: "bg-red-100 text-red-700" },
  { name: "Depression", color: "bg-blue-100 text-blue-700" },
  { name: "Social Anxiety", color: "bg-purple-100 text-purple-700" },
  { name: "Academic Stress", color: "bg-orange-100 text-orange-700" },
  { name: "Sleep & Health", color: "bg-green-100 text-green-700" },
  { name: "Mindfulness", color: "bg-teal-100 text-teal-700" },
  { name: "Success Stories", color: "bg-yellow-100 text-yellow-700" },
];

// local liked-topic ids to prevent double-like in UI
function getLikedTopicIds(): Set<string> {
  try {
    const raw = localStorage.getItem("likedTopics");
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}
function setLikedTopicIds(s: Set<string>) {
  try {
    localStorage.setItem("likedTopics", JSON.stringify(Array.from(s)));
  } catch {}
}

function displayAuthor(author: any): string {
  if (!author) return "Anonymous";
  if (typeof author === "string") return author || "Anonymous";
  return (
    author.username || `${author.firstName || ""} ${author.lastName || ""}`.trim() || "Anonymous"
  );
}

export default function ForumPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Topics");
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "General",
    isAnonymous: true,
  });

  // Forum posts from backend (MongoDB Atlas)
  const [topics, setTopics] = useState<any[]>([]);
  const [createdPosts, setCreatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [likedSet, setLikedSet] = useState<Set<string>>(() => getLikedTopicIds());

  // replies panel state by topic id
  type ReplyPanel = {
    open: boolean;
    loading: boolean;
    items: any[];
    newReply: string;
    sending: boolean;
  };
  const [replies, setReplies] = useState<Record<string, ReplyPanel>>({});

  // Simple relative time helper
  const timeAgoFrom = (iso: string) => {
    const d = new Date(iso);
    const s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 60) return "just now";
    const m = Math.floor(s / 60);
    if (m < 60) return `${m} min${m > 1 ? "s" : ""} ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
    const days = Math.floor(h / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth(`${API_BASE}/api/forum/topics`);
      if (res.status === 401) {
        setTopics([]);
        return;
      }
      const data = await res.json().catch(() => null);
      if (res.ok && data?.data) {
        const mapped = data.data.map((t: any) => ({
          id: t._id,
          title: t.title,
          content: t.content,
          author: displayAuthor(t.isAnonymous ? null : t.author),
          timeAgo: t.createdAt ? timeAgoFrom(t.createdAt) : "just now",
          category: t.category || "General",
          replies: t.replies || 0,
          likes: t.likes || 0,
          views: t.views || 0,
          isHot: !!t.isHot,
          isPinned: !!t.isPinned,
          tags: t.tags || [],
        }));
        setTopics(mapped);
      } else {
        setTopics([]);
      }
    } catch {
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const allPosts = useMemo(() => [...topics, ...createdPosts, ...forumPosts], [topics, createdPosts]);
  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    allPosts.forEach((p: any) => {
      const key = p.category || "General";
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [allPosts]);
  const filteredPosts = allPosts.filter((post) => {
    const matchesCategory = selectedCategory === "All Topics" || post.category === selectedCategory;
    const base = `${post.title} ${post.content} ${(post.tags || []).join(" ")}`.toLowerCase();
    const matchesSearch = base.includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error("Title and content are required.");
      return;
    }

    try {
      setCreating(true);
      const res = await fetchWithAuth(`${API_BASE}/api/forum/topics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newPost.title,
          content: newPost.content,
          category: newPost.category,
          tags: [],
          isAnonymous: newPost.isAnonymous,
        }),
      });

      if (res.status === 401) {
        toast.error("Session expired. Please sign in again.");
        window.location.href = "/auth";
        return;
      }

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || `Failed to create post (${res.status})`);
      }

      // Optimistically add to UI
      setCreatedPosts((prev) => [
        {
          id: data?.data?.id || String(Date.now()),
          title: newPost.title,
          content: newPost.content,
          author: newPost.isAnonymous ? "Anonymous" : "You",
          timeAgo: "just now",
          category: newPost.category,
          replies: 0,
          likes: 0,
          views: 0,
          isHot: false,
          isPinned: false,
          tags: [],
        },
        ...prev,
      ]);

      // Refresh from backend so everyone sees it and clear optimistic entries
      await fetchTopics();
      setCreatedPosts([]);

      setShowNewPost(false);
      setNewPost({ title: "", content: "", category: "General", isAnonymous: true });
      toast.success("Post created");
    } catch (err: any) {
      toast.error(err?.message || "Failed to create post.");
    } finally {
      setCreating(false);
    }
  };

  async function toggleLike(postId: string) {
    try {
      const liked = likedSet.has(postId);
      const endpoint = liked ? "unlike" : "like";
      const res = await fetchWithAuth(`${API_BASE}/api/forum/topics/${postId}/${endpoint}`, { method: "POST" });
      if (res.status === 401) {
        toast.error("Please sign in to like posts.");
        window.location.href = "/auth";
        return;
      }
      if (!res.ok) throw new Error(`Failed to ${endpoint}`);

      setTopics((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likes: Math.max(0, (p.likes || 0) + (liked ? -1 : 1)) } : p
        )
      );
      const next = new Set(likedSet);
      if (liked) next.delete(postId);
      else next.add(postId);
      setLikedSet(next);
      setLikedTopicIds(next);
    } catch (e: any) {
      toast.error(e?.message || "Action failed");
    }
  }

  async function toggleReplies(postId: string) {
    setReplies((prev) => {
      const panel = prev[postId];
      const next: Record<string, ReplyPanel> = {
        ...prev,
        [postId]: panel
          ? { ...panel, open: !panel.open }
          : { open: true, loading: true, items: [], newReply: "", sending: false },
      };
      return next;
    });

    // If opening and we haven't loaded items, fetch
    const panel = replies[postId];
    const willOpen = !(panel && panel.open);
    if (willOpen) {
      try {
        // mark loading
        setReplies((prev) => ({
          ...prev,
          [postId]: {
            open: true,
            loading: true,
            items: prev[postId]?.items || [],
            newReply: prev[postId]?.newReply || "",
            sending: false,
          },
        }));
        const res = await fetchWithAuth(`${API_BASE}/api/forum/topics/${postId}/posts`);
        if (res.status === 401) {
          toast.error("Please sign in to view replies.");
          window.location.href = "/auth";
          return;
        }
        const data = await res.json().catch(() => null);
        const items = Array.isArray(data?.data)
          ? data.data.map((r: any) => ({
              id: r._id,
              content: r.content,
              author: displayAuthor(r.author),
              createdAt: r.createdAt,
              timeAgo: r.createdAt ? timeAgoFrom(r.createdAt) : "just now",
              likes: r.likes || 0,
            }))
          : [];
        setReplies((prev) => ({
          ...prev,
          [postId]: { open: true, loading: false, items, newReply: "", sending: false },
        }));
      } catch {
        setReplies((prev) => ({
          ...prev,
          [postId]: { open: true, loading: false, items: [], newReply: "", sending: false },
        }));
      }
    }
  }

  async function submitReply(postId: string) {
    const panel = replies[postId];
    const content = panel?.newReply?.trim();
    if (!content) {
      toast.error("Reply cannot be empty");
      return;
    }
    try {
      setReplies((prev) => ({
        ...prev,
        [postId]: { ...(prev[postId] as ReplyPanel), sending: true },
      }));
      const res = await fetchWithAuth(`${API_BASE}/api/forum/topics/${postId}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.status === 401) {
        toast.error("Session expired. Please sign in again.");
        window.location.href = "/auth";
        return;
      }
      if (!res.ok) throw new Error("Failed to post reply");
      const data = await res.json().catch(() => null);
      const newItem = {
        id: data?.data?.id || String(Date.now()),
        content,
        author: "You",
        createdAt: new Date().toISOString(),
        timeAgo: "just now",
        likes: 0,
      };
      setReplies((prev) => ({
        ...prev,
        [postId]: {
          ...(prev[postId] as ReplyPanel),
          sending: false,
          newReply: "",
          items: [newItem, ...(prev[postId]?.items || [])],
        },
      }));
      // bump replies count in topics
      setTopics((prev) => prev.map((p) => (p.id === postId ? { ...p, replies: (p.replies || 0) + 1 } : p)));
      toast.success("Reply posted");
    } catch (e: any) {
      setReplies((prev) => ({
        ...prev,
        [postId]: { ...(prev[postId] as ReplyPanel), sending: false },
      }));
      toast.error(e?.message || "Failed to post reply");
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 gradient-text">Peer Support Community</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A safe, anonymous space where students support each other through shared experiences and encouragement
          </p>

          <div className="flex flex-wrap gap-2 justify-center mt-6">
            <Badge variant="secondary" className="glass">
              <Shield className="w-3 h-3 mr-1" />
              Moderated Community
            </Badge>
            <Badge variant="secondary" className="glass">
              <Lock className="w-3 h-3 mr-1" />
              Anonymous Options
            </Badge>
            <Badge variant="secondary" className="glass">
              <Users className="w-3 h-3 mr-1" />
              Peer Support
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* New Post Button */}
            <Button className="w-full rounded-xl hover-glass" onClick={() => setShowNewPost(true)} size="lg">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>

            {/* Categories */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.name}
                    className={`p-3 rounded-xl cursor-pointer transition-all hover-glass ${
                      selectedCategory === category.name ? "bg-primary/10" : ""
                    }`}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{category.name}</span>
                      <Badge className={category.color} variant="secondary">
                        {category.name === 'All Topics' ? allPosts.length : (categoryCounts.get(category.name) || 0)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Community Guidelines */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-primary" />
                  Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Be respectful and supportive</p>
                <p>• No medical advice or diagnosis</p>
                <p>• Maintain confidentiality</p>
                <p>• Report concerning content</p>
                <p>• Use trigger warnings when needed</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Filters */}
            <Card className="glass-card">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search posts, topics, or tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 glass border-border/30"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="glass">
                      <Flame className="w-3 h-3 mr-1" />
                      Hot
                    </Button>
                    <Button variant="outline" size="sm" className="glass">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </Button>
                    <Button variant="outline" size="sm" className="glass">
                      <Clock className="w-3 h-3 mr-1" />
                      Recent
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* New Post Modal/Form */}
            {showNewPost && (
              <Card className="glass-card border-primary/20">
                <CardHeader>
                  <CardTitle>Create New Post</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Post title..."
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    className="glass"
                  />

                  <Textarea
                    placeholder="Share what's on your mind..."
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    className="glass min-h-32"
                  />

                  <div className="flex flex-col sm:flex-row gap-4">
                    <select
                      value={newPost.category}
                      onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                      className="p-2 rounded-xl glass border border-border/30"
                    >
                      {categories.slice(1).map((cat) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="anonymous"
                        checked={newPost.isAnonymous}
                        onChange={(e) => setNewPost({ ...newPost, isAnonymous: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor="anonymous" className="text-sm">
                        Post anonymously
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleCreatePost} className="rounded-xl hover-glass" disabled={creating}>
                      {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                      {creating ? "Posting..." : "Post"}
                    </Button>
                    <Button variant="outline" onClick={() => setShowNewPost(false)} className="rounded-xl glass">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Posts List */}
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="glass-card hover-glass">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {/* Post Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {post.isPinned && (
                              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                                Pinned
                              </Badge>
                            )}
                            {post.isHot && (
                              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                                <Flame className="w-2 h-2 mr-1" />
                                Hot
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs glass">
                              {post.category}
                            </Badge>
                          </div>

                          <h3 className="font-semibold text-lg leading-tight hover:text-primary cursor-pointer">
                            {post.title}
                          </h3>

                          <p className="text-muted-foreground mt-2 line-clamp-2">{post.content}</p>

                          <div className="flex flex-wrap gap-1 mt-3">
                            {(post.tags || []).map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-xs glass">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Post Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-border/20">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {displayAuthor(post.author)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {post.timeAgo}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                            <Eye className="w-3 h-3" />
                            {post.views}
                          </button>
                          <button
                            className={`flex items-center gap-1 text-sm transition-colors ${
                              likedSet.has(post.id)
                                ? "text-secondary-dark"
                                : "text-muted-foreground hover:text-secondary-dark"
                            }`}
                            onClick={() => toggleLike(post.id)}
                            aria-pressed={likedSet.has(post.id)}
                          >
                            <Heart className="w-3 h-3" />
                            {post.likes}
                          </button>
                          <button
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                            onClick={() => toggleReplies(post.id)}
                          >
                            <MessageCircle className="w-3 h-3" />
                            {post.replies}
                          </button>
                        </div>
                      </div>

                      {/* Replies panel */}
                      {replies[post.id]?.open && (
                        <div className="mt-4 border-t border-border/20 pt-4 space-y-4">
                          <div className="flex items-start gap-2">
                            <Textarea
                              placeholder="Write a reply..."
                              value={replies[post.id]?.newReply || ""}
                              onChange={(e) =>
                                setReplies((prev) => ({
                                  ...prev,
                                  [post.id]: {
                                    ...(prev[post.id] as ReplyPanel),
                                    newReply: e.target.value,
                                  },
                                }))
                              }
                              className="glass min-h-20 flex-1"
                            />
                            <Button
                              className="rounded-xl hover-glass"
                              onClick={() => submitReply(post.id)}
                              disabled={replies[post.id]?.sending}
                            >
                              {replies[post.id]?.sending ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Sending
                                </>
                              ) : (
                                <>Send</>
                              )}
                            </Button>
                          </div>

                          {replies[post.id]?.loading ? (
                            <div className="text-sm text-muted-foreground">Loading replies...</div>
                          ) : replies[post.id]?.items?.length ? (
                            <div className="space-y-3">
                              {replies[post.id].items.map((r) => (
                                <div key={r.id} className="p-3 rounded-xl bg-background/40 border border-border/20">
                                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                    <div className="flex items-center gap-2">
                                      <User className="w-3 h-3" /> {displayAuthor(r.author)}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" /> {r.timeAgo}
                                    </div>
                                  </div>
                                  <div className="text-sm">{r.content}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">Be the first to reply.</div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {loading && (
              <Card className="glass-card text-center py-6">
                <Loader2 className="w-5 h-5 mx-auto animate-spin mb-2" />
                <div className="text-sm text-muted-foreground">Loading topics...</div>
              </Card>
            )}

            {filteredPosts.length === 0 && !loading && (
              <Card className="glass-card text-center py-12">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No posts found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "Try adjusting your search terms." : "Be the first to start a conversation!"}
                </p>
                <Button onClick={() => setShowNewPost(true)} className="rounded-xl hover-glass">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Post
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}