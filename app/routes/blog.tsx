import { Outlet } from "react-router";

export default function BlogLayout() {
  return (
    <div>
      <header>
        <h1>Our Blog</h1>
        <nav>
          <a href="/blog">Latest Posts</a>
          <a href="/blog/categories">Categories</a>
          <a href="/blog/archive">Archive</a>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}