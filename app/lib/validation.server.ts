// Server-side validation utilities
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  success: boolean;
  errors: ValidationError[];
  data?: any;
}

// 🎯 Teaching Point: Reusable validation schemas
export function validateEmail(email: string): ValidationError | null {
  if (!email) {
    return { field: "email", message: "Email is required" };
  }

  if (!email.includes("@") || !email.includes(".")) {
    return { field: "email", message: "Please enter a valid email address" };
  }

  return null;
}

export function validatePassword(password: string): ValidationError | null {
  if (!password) {
    return { field: "password", message: "Password is required" };
  }

  if (password.length < 6) {
    return { field: "password", message: "Password must be at least 6 characters" };
  }

  return null;
}

export function validateLoginForm(formData: FormData): ValidationResult {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const errors: ValidationError[] = [];

  const emailError = validateEmail(email);
  if (emailError) errors.push(emailError);

  const passwordError = validatePassword(password);
  if (passwordError) errors.push(passwordError);

  return {
    success: errors.length === 0,
    errors,
    data: errors.length === 0 ? { email, password } : undefined
  };
}

export function validateContactForm(formData: FormData): ValidationResult {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  const errors: ValidationError[] = [];

  if (!firstName?.trim()) {
    errors.push({ field: "firstName", message: "First name is required" });
  }

  if (!lastName?.trim()) {
    errors.push({ field: "lastName", message: "Last name is required" });
  }

  const emailError = validateEmail(email);
  if (emailError) errors.push(emailError);

  if (!message?.trim() || message.length < 10) {
    errors.push({ field: "message", message: "Message must be at least 10 characters" });
  }

  return {
    success: errors.length === 0,
    errors,
    data: errors.length === 0 ? { firstName, lastName, email, message } : undefined
  };
}