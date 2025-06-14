import type { LoaderFunctionArgs } from "react-router";

export async function loader() {
  // Mock user data - in real app, this would be from database
  const users = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "admin" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "user" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "user" }
  ];

  return Response.json({
    users,
    total: users.length,
    timestamp: new Date().toISOString()
  });
}

export async function action({ request }: LoaderFunctionArgs) {
  const method = request.method;

  switch (method) {
    case "POST":
      const formData = await request.formData();
      const newUser = {
        id: Date.now(),
        name: formData.get("name"),
        email: formData.get("email"),
        role: formData.get("role") || "user"
      };

      // In real app: save to database
      return Response.json({
        success: true,
        user: newUser,
        message: "User created successfully"
      }, { status: 201 });

    case "DELETE":
      return Response.json({
        success: true,
        message: "User deleted successfully"
      });

    default:
      return Response.json({
        error: "Method not allowed"
      }, { status: 405 });
  }
}
