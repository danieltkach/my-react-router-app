export async function loader() {
  const posts = [
    {
      title: "Getting Started with React Router 7",
      link: "https://example.com/blog/react-router-7",
      description: "Learn the new file-based routing system",
      pubDate: new Date("2024-01-15").toUTCString()
    },
    {
      title: "Building Modern Web Apps",
      link: "https://example.com/blog/modern-web-apps",
      description: "Best practices for scalable applications",
      pubDate: new Date("2024-01-12").toUTCString()
    }
  ];

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Our Blog</title>
    <link>https://example.com</link>
    <description>Latest posts from our blog</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${posts.map(post => `
    <item>
      <title>${post.title}</title>
      <link>${post.link}</link>
      <description>${post.description}</description>
      <pubDate>${post.pubDate}</pubDate>
      <guid>${post.link}</guid>
    </item>`).join('')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
