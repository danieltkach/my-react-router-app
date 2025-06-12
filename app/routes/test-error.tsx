export async function loader() {
  console.log("Loader is running...");
  throw new Error("This is a loader error that should be caught!");
}

export default function TestError() {
  return <div>This should never show</div>;
}