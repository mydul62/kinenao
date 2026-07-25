"use client";

import React from "react";

interface RichTextContentProps {
  content: string;
  className?: string;
}

export default function RichTextContent({
  content,
  className = "",
}: RichTextContentProps) {
  if (!content) {
    return (
      <p className="text-xs text-slate-500 italic">
        No description provided for this product.
      </p>
    );
  }

  // If content is plain text (does not start with HTML tags like <p>, <div>, <h1>, etc.) wrap in simple paragraph
  const isHtml = /<[a-z][\s\S]*>/i.test(content);

  if (!isHtml) {
    return (
      <div className={`text-xs text-slate-700 leading-relaxed ${className}`}>
        {content}
      </div>
    );
  }

  return (
    <div
      className={`prose prose-sm max-w-none text-slate-800 text-xs leading-relaxed
        [&_h1]:text-xl [&_h1]:font-black [&_h1]:text-slate-900 [&_h1]:mt-4 [&_h1]:mb-2
        [&_h2]:text-lg [&_h2]:font-extrabold [&_h2]:text-slate-900 [&_h2]:mt-3 [&_h2]:mb-2
        [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-slate-800 [&_h3]:mt-3 [&_h3]:mb-1.5
        [&_h4]:text-sm [&_h4]:font-bold [&_h4]:text-slate-800 [&_h4]:mt-2 [&_h4]:mb-1
        [&_p]:my-2 [&_p]:leading-relaxed
        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2
        [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2
        [&_li]:my-0.5
        [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-3 [&_blockquote]:text-slate-600
        [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:p-3 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:my-3 [&_pre]:font-mono [&_pre]:text-[11px]
        [&_code]:bg-slate-100 [&_code]:text-slate-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-[11px]
        [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_table]:text-xs
        [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-100 [&_th]:p-2 [&_th]:text-left [&_th]:font-bold
        [&_td]:border [&_td]:border-slate-200 [&_td]:p-2
        [&_img]:rounded-2xl [&_img]:max-w-full [&_img]:h-auto [&_img]:my-4 [&_img]:shadow-sm
        [&_hr]:my-4 [&_hr]:border-slate-200
        [&_a]:text-primary [&_a]:underline [&_a]:font-semibold
        ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
