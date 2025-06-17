// app/routes/contact.advanced.tsx - FIXED TYPES
import { useState, useEffect } from "react";
import { useActionData, useFetcher, Form } from "react-router";
import type { ActionFunctionArgs } from "react-router";

interface FieldValidation {
  isValid: boolean;
  message: string;
  isValidating?: boolean;
}

interface FormValidation {
  [key: string]: FieldValidation;
}

// Add proper return types
interface FieldValidationResponse {
  field: string;
  isValid: boolean;
  message: string;
}

interface FormSubmissionResponse {
  success: boolean;
  message?: string;
  data?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
    priority: string;
  };
  errors?: Record<string, string>;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  // Real-time field validation
  if (intent === "validate-field") {
    const field = formData.get("field") as string;
    const value = formData.get("value") as string;

    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate API call

    switch (field) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValidEmail = emailRegex.test(value);

        // Simulate checking if email already exists
        const emailExists = value === "taken@example.com";

        return Response.json({
          field: "email",
          isValid: isValidEmail && !emailExists,
          message: !value ? "Email is required" :
            !isValidEmail ? "Please enter a valid email address" :
              emailExists ? "This email is already registered" :
                "Email is available"
        });

      case "phone":
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const isValidPhone = phoneRegex.test(value.replace(/\s/g, ''));

        return Response.json({
          field: "phone",
          isValid: isValidPhone,
          message: !value ? "Phone number is required" :
            !isValidPhone ? "Please enter a valid phone number" :
              "Phone number is valid"
        });

      case "company":
        // Simulate company lookup
        const companies = ["Apple", "Google", "Microsoft", "Amazon"];
        const isKnownCompany = companies.some(company =>
          company.toLowerCase() === value.toLowerCase()
        );

        return Response.json({
          field: "company",
          isValid: true,
          message: !value ? "" :
            isKnownCompany ? "Recognized company" :
              "New company - we'll add to our records"
        });

      default:
        return Response.json({
          field,
          isValid: true,
          message: ""
        });
    }
  }

  // Form submission
  if (intent === "submit") {
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const company = formData.get("company") as string;
    const message = formData.get("message") as string;
    const priority = formData.get("priority") as string;

    // Server-side validation
    const errors: Record<string, string> = {};

    if (!firstName?.trim()) errors.firstName = "First name is required";
    if (!lastName?.trim()) errors.lastName = "Last name is required";
    if (!email?.trim()) errors.email = "Email is required";
    if (!message?.trim() || message.length < 10) {
      errors.message = "Message must be at least 10 characters";
    }

    if (Object.keys(errors).length > 0) {
      return Response.json({ success: false, errors });
    }

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    return Response.json({
      success: true,
      message: "Thank you! Your message has been sent successfully.",
      data: { firstName, lastName, email, phone, company, priority }
    });
  }

  return Response.json({ error: "Invalid intent" });
}

export default function AdvancedContactForm() {
  const actionData = useActionData<FormSubmissionResponse>();
  const validationFetcher = useFetcher<FieldValidationResponse>();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    message: "",
    priority: "medium"
  });

  const [validation, setValidation] = useState<FormValidation>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time field validation
  const validateField = (field: string, value: string) => {
    // Set validating state
    setValidation(prev => ({
      ...prev,
      [field]: { ...prev[field], isValidating: true }
    }));

    // Submit validation request
    const formData = new FormData();
    formData.append("intent", "validate-field");
    formData.append("field", field);
    formData.append("value", value);

    validationFetcher.submit(formData, { method: "post" });
  };

  // Handle validation response
  useEffect(() => {
    if (validationFetcher.data && 'field' in validationFetcher.data) {
      const { field, isValid, message } = validationFetcher.data;
      setValidation(prev => ({
        ...prev,
        [field]: { isValid, message, isValidating: false }
      }));
    }
  }, [validationFetcher.data]);

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Validate after user stops typing (debounced)
    clearTimeout((window as any)[`${field}Timeout`]);
    (window as any)[`${field}Timeout`] = setTimeout(() => {
      if (value.trim()) {
        validateField(field, value);
      } else {
        setValidation(prev => ({
          ...prev,
          [field]: { isValid: false, message: "" }
        }));
      }
    }, 500);
  };

  const getFieldStatus = (field: string) => {
    const fieldValidation = validation[field];
    if (!fieldValidation) return "";

    if (fieldValidation.isValidating) return "validating";
    if (fieldValidation.isValid) return "valid";
    return "invalid";
  };

  const getFieldClasses = (field: string) => {
    const status = getFieldStatus(field);
    const baseClasses = "w-full px-4 py-3 border rounded-lg focus:ring-2 transition-colors";

    switch (status) {
      case "validating":
        return `${baseClasses} border-yellow-300 focus:ring-yellow-500`;
      case "valid":
        return `${baseClasses} border-green-300 focus:ring-green-500`;
      case "invalid":
        return `${baseClasses} border-red-300 focus:ring-red-500`;
      default:
        return `${baseClasses} border-gray-300 focus:ring-blue-500`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* RR7 Feature Demo */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <h2 className="text-green-800 font-semibold mb-2">🚀 Advanced Form Validation Demo</h2>
        <div className="text-green-700 text-sm space-y-1">
          <p><strong>✅ Real-time Validation:</strong> Field validation with API calls</p>
          <p><strong>✅ Debounced Input:</strong> Reduces server requests</p>
          <p><strong>✅ Visual Feedback:</strong> Color-coded validation states</p>
          <p><strong>✅ Progressive Enhancement:</strong> Works without JavaScript</p>
          <p><strong>✅ Server + Client Validation:</strong> Double validation security</p>
        </div>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Advanced Contact Form</h1>
        <p className="text-xl text-gray-600">
          Featuring real-time validation and progressive enhancement
        </p>
      </div>

      {/* Success Message */}
      {actionData?.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h3 className="text-green-800 font-semibold mb-2">✅ Message Sent!</h3>
          <p className="text-green-700">{actionData.message}</p>
          <div className="mt-4 text-sm text-green-600">
            <p>We'll respond to: <strong>{actionData.data?.email}</strong></p>
            <p>Priority level: <strong>{actionData.data?.priority}</strong></p>
          </div>
        </div>
      )}

      {/* Contact Form */}
      <div className="bg-white p-8 rounded-lg shadow-sm border">
        <Form method="post" className="space-y-6">
          <input type="hidden" name="intent" value="submit" />

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={(e) => handleFieldChange("firstName", e.target.value)}
                className={getFieldClasses("firstName")}
                placeholder="John"
                required
              />
              {actionData?.errors?.firstName && (
                <p className="text-red-600 text-sm mt-1">{actionData.errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={(e) => handleFieldChange("lastName", e.target.value)}
                className={getFieldClasses("lastName")}
                placeholder="Doe"
                required
              />
              {actionData?.errors?.lastName && (
                <p className="text-red-600 text-sm mt-1">{actionData.errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email Field with Real-time Validation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                className={getFieldClasses("email")}
                placeholder="john@example.com"
                required
              />
              {validation.email?.isValidating && (
                <div className="absolute right-3 top-3">
                  <svg className="animate-spin h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
              {validation.email?.isValid && !validation.email?.isValidating && (
                <div className="absolute right-3 top-3">
                  <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {validation.email?.message && (
              <p className={`text-sm mt-1 ${validation.email.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {validation.email.message}
              </p>
            )}
            {actionData?.errors?.email && (
              <p className="text-red-600 text-sm mt-1">{actionData.errors.email}</p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={(e) => handleFieldChange("phone", e.target.value)}
              className={getFieldClasses("phone")}
              placeholder="+1 (555) 123-4567"
            />
            {validation.phone?.message && (
              <p className={`text-sm mt-1 ${validation.phone.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {validation.phone.message}
              </p>
            )}
          </div>

          {/* Company Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={(e) => handleFieldChange("company", e.target.value)}
              className={getFieldClasses("company")}
              placeholder="Your company name"
            />
            {validation.company?.message && (
              <p className="text-sm mt-1 text-blue-600">{validation.company.message}</p>
            )}
          </div>

          {/* Priority Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority Level
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low - General inquiry</option>
              <option value="medium">Medium - Standard request</option>
              <option value="high">High - Urgent matter</option>
              <option value="critical">Critical - Emergency</option>
            </select>
          </div>

          {/* Message Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Tell us about your project or inquiry..."
              required
            />
            <div className="flex justify-between text-sm text-gray-500 mt-1">
              <span>{formData.message.length} characters</span>
              <span>Minimum 10 characters</span>
            </div>
            {actionData?.errors?.message && (
              <p className="text-red-600 text-sm mt-1">{actionData.errors.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-lg transition-colors"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending Message...
              </span>
            ) : (
              "Send Message"
            )}
          </button>
        </Form>

        {/* Demo Instructions */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Try the validation features:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Type "taken@example.com" to see email validation error</li>
            <li>• Enter a company name like "Apple" to see recognition</li>
            <li>• Phone numbers are validated in real-time</li>
            <li>• All fields show visual validation states</li>
          </ul>
        </div>
      </div>
    </div>
  );
}