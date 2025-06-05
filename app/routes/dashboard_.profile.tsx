// This route renders at /dashboard/profile but does NOT nest inside dashboard.tsx
export default function Profile() {
  return (
    <div>
      <h1>User Profile</h1>
      <p>This page doesn't use the dashboard layout (note the trailing underscore).</p>
    </div>
  );
}