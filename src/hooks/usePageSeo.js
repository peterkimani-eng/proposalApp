import { useEffect } from "react";

function upsertMeta(attrName, attrValue, content) {
  if (!content) return;

  let tag = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attrName, attrValue);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

export function usePageSeo({
  title,
  description,
  noindex = false,
  ogTitle,
  ogDescription,
}) {
  useEffect(() => {
    if (title) {
      document.title = title;
      upsertMeta("property", "og:title", ogTitle || title);
    }

    if (description) {
      upsertMeta("name", "description", description);
      upsertMeta("property", "og:description", ogDescription || description);
    }

    upsertMeta(
      "name",
      "robots",
      noindex ? "noindex, nofollow" : "index, follow"
    );
  }, [title, description, noindex, ogTitle, ogDescription]);
}