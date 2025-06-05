import { useParams } from "react-router";

export async function serverLoader({ params }: { params: { slug: string; }; }) {
  // Simulate fetching blog post data
  return {
    title: `Blog Post: ${params.slug}`,
    content: `This is the content for ${params.slug}`,
    date: "2024-01-15"
  };
}

export default function BlogPost() {
  const params = useParams();

  return (
    <article>
      <h2>Blog Post: {params.slug}</h2>
      <p>Reading blog post with slug: {params.slug}</p>
    </article>
  );
}