"use client";

import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, Share2, Bookmark } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function BlogPostDetail() {
  const { t } = useLanguage();
  const params = useParams();
  const id = params.id as string;

  // In a real app, you'd fetch this data. For now we use placeholder content.
  const isFeatured = id === "featured-1";
  
  const title = isFeatured ? t("blog.posts.featured.title") : t(`blog.posts.${id.replace('post-', 'p')}.title`);
  const author = isFeatured ? t("blog.posts.featured.author") : t(`blog.posts.${id.replace('post-', 'p')}.author`);
  const excerpt = isFeatured ? t("blog.posts.featured.excerpt") : t(`blog.posts.${id.replace('post-', 'p')}.excerpt`);

  return (
    <main className="min-h-screen bg-white pt-24 sm:pt-32 pb-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary font-bold mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-bold text-slate-400 mb-6 uppercase tracking-wider">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full uppercase">Articles</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Oct 2026</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 5-8 min read</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-dark tracking-tight leading-tight mb-8">
            {title || "Blog Post Content Details"}
          </h1>

          <p className="text-xl text-slate-500 leading-relaxed mb-10 max-w-3xl border-l-4 border-primary/20 pl-6 italic">
            {excerpt || "Detailed medical and laboratory research insights from MeddyNet's expert healthcare research team."}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-6 pt-10 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-black text-xl text-dark border border-slate-200">
                {(author || "M")[0]}
              </div>
              <div>
                <p className="text-sm font-black text-dark">{author || "MeddyNet Expert"}</p>
                <p className="text-xs text-slate-400 font-bold">Medical Research Team</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-primary transition-all border border-slate-200">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-primary transition-all border border-slate-200">
                <Bookmark className="w-4 h-4" />
              </button>
              <button className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-primary transition-all shadow-lg shadow-black/5">
                Save Article
              </button>
            </div>
          </div>
        </motion.header>

        {/* Content Placeholder */}
        <motion.article 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="prose prose-lg max-w-none text-slate-700 leading-loose"
        >
          <p className="mb-8">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </p>
          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 mb-10">
            <h3 className="text-2xl font-black text-dark mb-4">Key Takeaways</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" /> Regular checkups can detect 90% of asymptomatic conditions.</li>
              <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" /> Digital health records reduce treatment delays by 40%.</li>
              <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" /> Local diagnostic networks improve clinical outcomes in urban areas.</li>
            </ul>
          </div>
          <p className="mb-8">
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
          </p>
          <h2 className="text-3xl font-black text-dark mb-6 mt-12 tracking-tight">Advanced Diagnostics in 2026</h2>
          <p className="mb-8">
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
          </p>
        </motion.article>

        {/* Footer Navigation */}
        <div className="mt-20 pt-12 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-10">
          <div className="text-center sm:text-left">
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Previous Article</h4>
            <Link href="/blog" className="text-xl font-black text-dark hover:text-primary transition-colors">
              The Rise of Telemedicine in India
            </Link>
          </div>
          <div className="text-center sm:text-right">
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Next Article</h4>
            <Link href="/blog" className="text-xl font-black text-dark hover:text-primary transition-colors">
              Modern Clinical Best Practices
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
