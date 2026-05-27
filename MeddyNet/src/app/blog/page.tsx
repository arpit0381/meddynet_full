"use client";

import Link from "next/link";
import { motion, useScroll, useSpring, type Variants } from "framer-motion";
import { 
  ArrowRight, Search, Clock, Calendar, 
  Tag, Mail, Sparkles, BookOpen, User
} from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { AnimatePresence } from "framer-motion";

export default function BlogPage() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 300, damping: 30 });

  const categories = [
    { key: "All", label: t("blog.categories.all") },
    { key: "Health Tips", label: t("blog.categories.healthTips") },
    { key: "Medical Insights", label: t("blog.categories.medicalInsights") },
    { key: "Company News", label: t("blog.categories.companyNews") },
    { key: "Diagnostics", label: t("blog.categories.diagnostics") },
    { key: "Wellness", label: t("blog.categories.wellness") }
  ];

  const featuredPost = {
    id: "featured-1",
    title: t("blog.posts.featured.title"),
    excerpt: t("blog.posts.featured.excerpt"),
    category: "Medical Insights",
    categoryLabel: t("blog.categories.medicalInsights"),
    date: "Oct 12, 2026",
    readTime: `8 ${t("blog.readTime")}`,
    author: t("blog.posts.featured.author"),
    imageGradient: "from-primary/20 via-primary/5 to-accent/20"
  };

  const recentPosts = [
    {
      id: "post-1",
      title: t("blog.posts.p1.title"),
      excerpt: t("blog.posts.p1.excerpt"),
      category: "Health Tips",
      categoryLabel: t("blog.categories.healthTips"),
      date: "Oct 10, 2026",
      readTime: `5 ${t("blog.readTime")}`,
      author: t("blog.posts.p1.author"),
      gradient: "from-blue-500/10 to-indigo-500/10"
    },
    {
      id: "post-2",
      title: t("blog.posts.p2.title"),
      excerpt: t("blog.posts.p2.excerpt"),
      category: "Diagnostics",
      categoryLabel: t("blog.categories.diagnostics"),
      date: "Oct 05, 2026",
      readTime: `6 ${t("blog.readTime")}`,
      author: t("blog.posts.p2.author"),
      gradient: "from-emerald-500/10 to-teal-500/10"
    },
    {
      id: "post-3",
      title: t("blog.posts.p3.title"),
      excerpt: t("blog.posts.p3.excerpt"),
      category: "Company News",
      categoryLabel: t("blog.categories.companyNews"),
      date: "Sep 28, 2026",
      readTime: `4 ${t("blog.readTime")}`,
      author: t("blog.posts.p3.author"),
      gradient: "from-purple-500/10 to-fuchsia-500/10"
    },
    {
      id: "post-4",
      title: t("blog.posts.p4.title"),
      excerpt: t("blog.posts.p4.excerpt"),
      category: "Medical Insights",
      categoryLabel: t("blog.categories.medicalInsights"),
      date: "Sep 20, 2026",
      readTime: `7 ${t("blog.readTime")}`,
      author: t("blog.posts.p4.author"),
      gradient: "from-orange-500/10 to-amber-500/10"
    },
    {
      id: "post-5",
      title: t("blog.posts.p5.title"),
      excerpt: t("blog.posts.p5.excerpt"),
      category: "Wellness",
      categoryLabel: t("blog.categories.wellness"),
      date: "Sep 15, 2026",
      readTime: `3 ${t("blog.readTime")}`,
      author: t("blog.posts.p5.author"),
      gradient: "from-rose-500/10 to-pink-500/10"
    },
    {
      id: "post-6",
      title: t("blog.posts.p6.title"),
      excerpt: t("blog.posts.p6.excerpt"),
      category: "Health Tips",
      categoryLabel: t("blog.categories.healthTips"),
      date: "Sep 10, 2026",
      readTime: `6 ${t("blog.readTime")}`,
      author: t("blog.posts.p6.author"),
      gradient: "from-yellow-500/10 to-orange-500/10"
    }
  ];

  /* ─────────────────── Animation Variants ─────────────────── */
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  const stagger: Variants = { visible: { transition: { staggerChildren: 0.1 } } };

  // Filter logic
  const filteredPosts = recentPosts.filter(post => {
    const matchCategory = activeCategory === "All" || post.category === activeCategory;
    const matchSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <main className="min-h-screen bg-surface overflow-hidden">
      {/* Scroll Progress Bar */}
      <motion.div
        style={{ scaleX, transformOrigin: "left" }}
        className="fixed top-0 left-0 right-0 h-1 bg-linear-to-r from-primary to-accent z-9999 shadow-sm"
      />

      {/* ═══════════════ HEADER & SEARCH ═══════════════ */}
      <section className="relative pt-[120px] sm:pt-[160px] pb-12 sm:pb-20 bg-white border-b border-slate-100">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="text-center max-w-3xl mx-auto">
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.12em] text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full mb-4 sm:mb-6">
                <BookOpen className="w-3 h-3" /> {t("blog.tag")}
              </span>
            </motion.div>
            
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-dark tracking-tight mb-6 leading-tight">
              {t("blog.title")} <br className="hidden sm:block" />
              <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">{t("blog.titleHighlight")}</span>
            </motion.h1>
            
            <motion.p variants={fadeUp} custom={2} className="text-base sm:text-lg text-slate-500 leading-relaxed mb-10">
              {t("blog.desc")}
            </motion.p>

            {/* Search Bar */}
            <motion.div variants={fadeUp} custom={3} className="relative max-w-xl mx-auto">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder={t("blog.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-dark focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium shadow-sm"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ FEATURED POST ═══════════════ */}
      {searchQuery === "" && activeCategory === "All" && (
        <section className="py-12 sm:py-20 relative bg-surface">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
            <motion.div 
              initial={{ opacity: 0, y: 40 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="group relative bg-white rounded-4xl sm:rounded-[3rem] overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-primary/30 transition-all duration-500"
            >
              <div className="grid lg:grid-cols-2">
                <div className={`relative h-[300px] lg:h-full min-h-[400px] bg-linear-to-br ${featuredPost.imageGradient} overflow-hidden`}>
                  <div className="absolute inset-0 bg-white/5 pattern-dots pattern-slate-500 pattern-bg-transparent pattern-size-4 pattern-opacity-10" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/20 backdrop-blur-2xl rounded-full border border-white/40 shadow-2xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-700">
                    <Sparkles className="w-16 h-16 text-primary" />
                  </div>
                  <div className="absolute bottom-8 right-8 w-32 h-32 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 rotate-12" />
                  <div className="absolute top-8 left-8 w-24 h-24 rounded-full bg-linear-to-tr from-accent/40 to-transparent blur-xl" />
                </div>

                <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase bg-primary/10 text-primary">
                      <Tag className="w-3.5 h-3.5" /> {t("blog.featured")}
                    </span>
                    <span className="text-sm font-semibold text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" /> {featuredPost.date}
                    </span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark tracking-tight mb-6 leading-tight group-hover:text-primary transition-colors duration-300">
                    <Link href={`/blog/${featuredPost.id}`}>
                      {featuredPost.title}
                    </Link>
                  </h2>

                  <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-8 border-l-4 border-slate-100 pl-4">
                    {featuredPost.excerpt}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-8 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-dark border border-slate-200">
                        {featuredPost.author.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-dark">{featuredPost.author}</p>
                        <p className="text-xs text-slate-400">{featuredPost.readTime}</p>
                      </div>
                    </div>
                    <Link href={`/blog/${featuredPost.id}`} className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-dark group-hover:bg-primary group-hover:text-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/20">
                      <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ═══════════════ CATEGORIES & LATEST POSTS ═══════════════ */}
      <section className="py-12 sm:py-20 relative bg-surface">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
          
          {/* Categories Filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
              {searchQuery ? t("blog.searchResults") : t("blog.latestArticles")}
            </h2>
            
            <div className="flex overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                    activeCategory === cat.key 
                      ? "bg-dark text-white shadow-md" 
                      : "bg-white text-slate-500 border border-slate-200 hover:border-primary hover:text-primary"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 min-h-[400px]">
            <AnimatePresence mode="popLayout">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <motion.article 
                    layout
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-primary/30 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-400"
                  >
                    <div className={`relative h-48 w-full bg-linear-to-br ${post.gradient} flex flex-col items-center justify-center p-6 border-b border-slate-100 overflow-hidden`}>
                      <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="absolute top-4 right-4 px-3 py-1 bg-white/80 backdrop-blur-md rounded-full text-[10px] sm:text-xs font-bold text-dark shadow-sm">
                        {post.categoryLabel}
                      </div>

                      <BookOpen className="w-12 h-12 text-slate-400 opacity-20 group-hover:scale-110 group-hover:opacity-40 transition-all duration-500" />
                    </div>

                    <div className="p-6 sm:p-7 grow flex flex-col">
                      <div className="flex items-center gap-3 text-xs font-semibold text-slate-400 mb-4">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {post.date}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
                      </div>

                      <h3 className="text-xl font-bold text-dark mb-3 leading-snug group-hover:text-primary transition-colors">
                        <Link href={`/blog/${post.id}`} className="focus:outline-none">
                          {post.title}
                          <span className="absolute inset-0 z-10" aria-hidden="true" />
                        </Link>
                      </h3>

                      <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">
                        {post.excerpt}
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-5 border-t border-slate-50">
                        <span className="text-sm font-bold text-dark">{t("blog.authorBy")} {post.author}</span>
                        <span className="text-primary group-hover:translate-x-1 transition-transform">
                          <ArrowRight className="w-5 h-5" />
                        </span>
                      </div>
                    </div>
                  </motion.article>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-100 px-4"
                >
                  <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-dark mb-2">{t("blog.noResults")}</h3>
                  <p className="text-slate-500">{t("blog.noResultsDesc")}</p>
                  <button 
                    onClick={() => {setSearchQuery(""); setActiveCategory("All");}}
                    className="mt-6 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-dark font-bold rounded-xl transition-colors"
                  >
                    {t("blog.clearSearch")}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ═══════════════ NEWSLETTER CTA ═══════════════ */}
      <section className="py-16 sm:py-24 bg-white relative">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="relative z-10 p-8 sm:p-12 lg:p-16 rounded-4xl bg-slate-900 overflow-hidden shadow-2xl border border-white/5">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/20 rounded-full blur-[80px] pointer-events-none" />
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative z-10 max-w-2xl mx-auto"
            >
              <div className="w-16 h-16 mx-auto bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                {subscribed ? <User className="w-8 h-8 text-primary-light" /> : <Mail className="w-8 h-8 text-primary-light" />}
              </div>
              
              <AnimatePresence mode="wait">
                {!subscribed ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight">{t("blog.newsletter.title")}</h2>
                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
                      {t("blog.newsletter.desc")}
                    </p>
                    <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={handleSubscribe}>
                      <input 
                        type="email" 
                        placeholder={t("blog.newsletter.placeholder")} 
                        className="w-full px-5 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border border-white/20 bg-white/5 text-white placeholder-slate-400 focus:bg-white/10 focus:border-primary-light focus:ring-4 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                        required
                      />
                      <button type="submit" className="shrink-0 px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold transition-colors shadow-lg shadow-primary/20 text-sm">
                        {t("blog.newsletter.cta")}
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-8"
                  >
                    <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-primary-light">You&apos;re All Set!</h2>
                    <p className="text-white/60 text-sm font-medium italic">We only share the best health tips from our experts and won&apos;t spam you.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  );
}
