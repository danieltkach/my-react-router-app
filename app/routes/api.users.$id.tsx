import type { LoaderFunctionArgs } from "react-router";

export async function loader({ params }: LoaderFunctionArgs) {
  const userId = params.id;

  // Mock user lookup
  const users = {
    "1": { id: 1, name: "John Doe", email: "john@example.com", role: "admin" },
    "2": { id: 2, name: "Jane Smith", email: "jane@example.com", role: "user" },
    "3": { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "user" }
  };

  const user = users[userId as keyof typeof users];

  if (!user) {
    return Response.json({
      error: "User not found"
    }, { status: 404 });
  }

  return Response.json({
    user,
    timestamp: new Date().toISOString()
  });
}

export async function action({ request, params }: LoaderFunctionArgs) {
  const method = request.method;
  const userId = params.id;

  switch (method) {
    case "PUT":
      const formData = await request.formData();
      const updatedUser = {
        id: parseInt(userId!),
        name: formData.get("name"),
        email: formData.get("email"),
        role: formData.get("role")
      };

      return Response.json({
        success: true,
        user: updatedUser,
        message: "User updated successfully"
      });

    case "DELETE":
      return Response.json({
        success: true,
        message: `User ${userId} deleted successfully`
      });

    default:
      return Response.json({
        error: "Method not allowed"
      }, { status: 405 });
  }
}
