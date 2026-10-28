export default function ContentHtml({ html, className = '' }) {
  if (!html) return null;
  return (
    <div
      className={`text-sm leading-relaxed text-hitam-0/70 [&_a]:font-semibold [&_a]:text-biru-0 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-biru-0/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:font-tomorrow [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-hitam-0 [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:font-tomorrow [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-hitam-0 [&_li]:mb-1.5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-4 [&_strong]:font-semibold [&_strong]:text-hitam-0 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
