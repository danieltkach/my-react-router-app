import { useParams } from "react-router";

export async function serverLoader({ params }: { params: { "*": string; }; }) {
  const filePath = params["*"];
  return {
    path: filePath,
    files: [
      { name: "document.pdf", type: "file" },
      { name: "images", type: "folder" },
      { name: "videos", type: "folder" }
    ]
  };
}

export default function FileBrowser() {
  const params = useParams();
  const filePath = params["*"] || "";

  return (
    <div>
      <h1>File Browser</h1>
      <p>Current path: /{filePath}</p>
      <p>This route matches /files/any/nested/path/structure</p>
    </div>
  );
}