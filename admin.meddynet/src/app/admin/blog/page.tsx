"use client";
import { useState } from "react";
import { Plus, Eye, Edit2, Archive, Globe, Trash2 } from "lucide-react";
import { DataTable, Column } from "@/components/admin/ui/DataTable";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { StatCard } from "@/components/admin/ui/StatCard";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";

interface Post {
  id: string;
  title: string;
  author: string;
  category: string;
  date: string;
  status: "Draft" | "Published" | "Archived";
  views: number;
}

const mockPosts: Post[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `PST-${100 + i}`,
  title: i % 2 === 0 ? "5 Benefits of Regular Full Body Checkups" : "MeddyNet Partners with 50 New Labs",
  author: "Dr. Smitha Reddy",
  category: i % 2 === 0 ? "Health Tips" : "Company News",
  date: "10 Mar 2026",
  status: i % 4 === 0 ? "Draft" : i % 3 === 0 ? "Archived" : "Published",
  views: i % 4 === 0 ? 0 : 1200 + i * 50,
}));

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [editorMode, setEditorMode] = useState<{isOpen: boolean, type: 'create' | 'edit', post: Post | null}>({isOpen: false, type: 'create', post: null});
  const [deleteDialog, setDeleteDialog] = useState<{isOpen: boolean, postId: string | null}>({isOpen: false, postId: null});

  const columns: Column<Post>[] = [
    { header: "Post Title", accessor: (p) => <span className="font-bold text-main-text hover:text-primary cursor-pointer truncate max-w-[250px] block transition-all uppercase tracking-tight leading-none py-1">{p.title}</span> },
    { header: "Author", accessor: (p) => <span className="text-[11px] font-black uppercase tracking-widest text-muted/80">{p.author}</span> },
    { header: "Taxonomy", accessor: (p) => <span className="bg-surface border border-border-dim text-muted font-black px-2.5 py-1.5 rounded-lg text-[9px] uppercase tracking-widest group-hover:border-primary/20 transition-all">{p.category}</span> },
    { header: "Lifecycle", accessor: (p) => <StatusBadge status={p.status === 'Published' ? 'success' : p.status === 'Archived' ? 'neutral' : 'warning'} label={p.status.toUpperCase()} /> },
    { header: "Timeline", accessor: (p) => <span className="font-mono text-[10px] text-muted/60 uppercase">{p.date}</span> },
    { header: "Impact", accessor: (p) => <div className="flex items-center gap-2 text-main-text font-black text-xs italic"><Eye size={14} className="text-primary"/> {p.views.toLocaleString()}</div> },
    { 
      header: "Actions", 
      accessor: (p) => (
        <div className="flex items-center justify-end gap-1 text-muted">
          <button onClick={(e) => { e.stopPropagation(); setEditorMode({isOpen: true, type: 'edit', post: p}); }} className="p-2 hover:text-primary hover:bg-primary/10 rounded-xl transition-all" title="Edit Content"><Edit2 size={16}/></button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteDialog({isOpen: true, postId: p.id}); }} className="p-2 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all" title="Purge Post"><Trash2 size={16}/></button>
        </div>
      )
    }
];

  if (editorMode.isOpen) {
     return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-border-dim pb-8">
              <div>
                <h1 className="text-2xl font-black text-main-text tracking-tighter uppercase italic">{editorMode.type === 'create' ? "Initialize Content Stream" : "Refactor Post Logic"}</h1>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted mt-1.5 opacity-80">Content Generation & Distribution Protocol</p>
              </div>
              <div className="flex items-center gap-4">
                 <button onClick={() => setEditorMode({isOpen: false, type: 'create', post: null})} className="px-6 py-3 border border-border-dim text-muted font-black text-[10px] uppercase tracking-widest rounded-2xl hover:text-main-text hover:bg-surface transition-all active:scale-95">Discard Changes</button>
                 <button onClick={() => {
                   if (editorMode.type === 'create') {
                      setPosts([{id: `PST-${Date.now().toString().slice(-4)}`, title: editorMode.post?.title || 'Untitled Draft', author: 'Dr. Smitha Reddy', category: editorMode.post?.category || 'Health Tips', date: 'Today', status: 'Draft', views: 0}, ...posts]);
                   } else if (editorMode.type === 'edit' && editorMode.post) {
                      setPosts(posts.map(p => p.id === editorMode.post?.id ? {...editorMode.post, status: 'Draft'} as Post : p));
                   }
                   setEditorMode({isOpen: false, type: 'create', post: null});
                 }} className="px-6 py-3 bg-surface border border-border-dim text-muted font-black text-[10px] uppercase tracking-widest rounded-2xl hover:text-main-text hover:border-primary/30 transition-all active:scale-95 shadow-sm">Save Draft Protocol</button>
                 
                 <button onClick={() => {
                   if (editorMode.type === 'create') {
                      setPosts([{id: `PST-${Date.now().toString().slice(-4)}`, title: editorMode.post?.title || 'Untitled Post', author: 'Dr. Smitha Reddy', category: editorMode.post?.category || 'Health Tips', date: 'Today', status: 'Published', views: 0}, ...posts]);
                   } else if (editorMode.type === 'edit' && editorMode.post) {
                      setPosts(posts.map(p => p.id === editorMode.post?.id ? {...editorMode.post, status: 'Published'} as Post : p));
                   }
                   setEditorMode({isOpen: false, type: 'create', post: null});
                 }} className="flex items-center gap-2.5 px-8 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-primary/90 transition-all shadow-lg active:scale-95 shadow-primary/20"><Globe size={18}/> Execute Broadcast</button>
              </div>
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                 <input type="text" placeholder="Protocol Title..." 
                   defaultValue={editorMode.post?.title} 
                   onChange={(e) => setEditorMode({...editorMode, post: {...(editorMode.post || {} as Post), title: e.target.value}})} 
                   className="w-full text-5xl font-black py-4 border-none outline-none bg-transparent placeholder:text-muted/20 text-main-text uppercase tracking-tighter italic border-b border-border-dim focus:border-primary/30 transition-all" 
                 />
                 <textarea rows={20} className="w-full p-8 bg-card border border-border-dim rounded-[2.5rem] outline-none focus:ring-4 focus:ring-primary/5 text-main-text font-medium text-[15px] leading-relaxed shadow-inner placeholder:text-muted/30 transition-all" placeholder="Synthesize content logic here (Supports Markdown syntax)..."></textarea>
              </div>
              <div className="lg:col-span-1 space-y-8">
                 <div className="bg-card p-8 rounded-[2.5rem] border border-border-dim shadow-sm space-y-8 transition-all hover:border-primary/20">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-main-text border-b border-border-dim pb-4 italic">Operational parameters</h3>
                    <div className="space-y-4">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted block opacity-80">Distribution Taxonomy</label>
                      <div className="relative">
                        <select 
                          value={editorMode.post?.category || 'Health Tips'} 
                          onChange={(e) => setEditorMode({...editorMode, post: {...(editorMode.post || {} as Post), category: e.target.value}})} 
                          className="w-full p-4 bg-input border border-border-dim rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/50 text-main-text appearance-none cursor-pointer transition-all hover:border-primary/30"
                        >
                          <option value="Health Tips">Health Tips</option>
                          <option value="Company News">Company News</option>
                          <option value="Platform Updates">Platform Updates</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40"><Eye size={14}/></div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[9px] font-black uppercase tracking-widest text-muted block opacity-80">Visual Identity (Cover URL)</label>
                      <input type="text" className="w-full p-4 bg-input border border-border-dim rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary/50 text-main-text transition-all hover:border-primary/30" placeholder="HTTPS://SURFACE.MEDIA/ASSET.JPG..."/>
                    </div>
                    <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary leading-relaxed">Broadcast will be visible to all entities across the diagnostics network.</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
     );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Posts" value="124" icon={Edit2}/>
        <StatCard title="Published" value="98" icon={Globe}/>
        <StatCard title="Drafts" value="12" icon={Archive}/>
        <StatCard title="Total Views" value="45.2k" icon={Eye}/>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-dim pb-6">
        <div>
          <h1 className="text-2xl font-black text-main-text tracking-tight uppercase italic">Content Engine Management</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted mt-1.5 opacity-80">Orchestrate platform-wide communication streams</p>
        </div>
        <button onClick={() => setEditorMode({isOpen: true, type: 'create', post: null})} className="flex items-center gap-2.5 px-8 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95">
          <Plus size={18}/> Initialize Broadcast
        </button>
      </div>
      <DataTable data={posts} columns={columns} searchable />

      <ConfirmDialog 
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({isOpen: false, postId: null})}
        title="Delete Post"
        description="Are you sure you want to completely delete this post? This cannot be undone."
        confirmText="Delete"
        isDestructive={true}
        onConfirm={() => {
           setPosts(posts.filter(p => p.id !== deleteDialog.postId));
           setDeleteDialog({isOpen: false, postId: null});
        }}
      />
    </div>
  );
}
