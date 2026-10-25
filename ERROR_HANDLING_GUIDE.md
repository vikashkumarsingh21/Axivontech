# Axivon Technologies — Error Handling & Notification Developer Guide

This guide establishes the mandatory standard for handling API calls and rendering errors across the Axivon Technologies platform.

---

## 1. The Cardinal Rule

> [!CAUTION]
> **NEVER** write `throw new Error(data.error)` or `setError(data.error)`.  
> If `data.error` is an object, JavaScript coerces it to the string `"[object Object]"`, which breaks user experience.

Always use the central helpers:
```ts
import { getErrorMessage, parseApiResponse } from "@/lib/errors/client";
import { toast } from "@/lib/notifications/toast";
```

---

## 2. Server-Side Standard: Return ONE Error Shape

Every backend API route that fails (status $\ge$ 400) **MUST** return:

```ts
import { createErrorResponse } from "@/lib/errors/server";

// In any API Route:
return createErrorResponse({
  status: 400, // or 401, 403, 404, 409, 429, 500
  code: "VALIDATION_ERROR", // Machine-readable code
  message: "Full name is required.", // Human-readable string
  fields: { name: ["Full name is required."] }, // Optional field errors
  retryAfter: 30, // Optional for 429 rate limiting
});
```

Or catch exceptions using `handleServerApiError`:
```ts
import { handleServerApiError } from "@/lib/errors/server";

export async function POST(req: NextRequest) {
  try {
    // your logic
  } catch (err) {
    return handleServerApiError(err);
  }
}
```

---

## 3. Client-Side Pattern 1: `parseApiResponse` (Recommended for Forms)

When handling form submissions with custom state:

```ts
import { parseApiResponse, getErrorMessage } from "@/lib/errors/client";
import { toast } from "@/lib/notifications/toast";

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  setFieldErrors({});

  try {
    const res = await fetch("/api/v1/resource", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const parsed = await parseApiResponse<MyData>(res);

    if (!parsed.ok) {
      // 1. Set field-level errors if present
      if (Object.keys(parsed.fieldErrors).length > 0) {
        setFieldErrors(parsed.fieldErrors);
      }
      
      // 2. Show toast or general error
      const message = parsed.errorMessage || "Something went wrong. Please try again.";
      setError(message);
      toast.error(message);
      return;
    }

    // Success
    toast.success("Saved successfully!");
    onSuccess(parsed.data);
  } catch (err) {
    const cleanErr = getErrorMessage(err);
    setError(cleanErr);
    toast.error(cleanErr);
  } finally {
    setLoading(false);
  }
};
```

---

## 4. Client-Side Pattern 2: `useApiAction` Hook (For Buttons & Actions)

For quick action buttons (delete, update status, approve):

```ts
import { useApiAction } from "@/lib/hooks/useApiAction";

export function DeleteButton({ id }: { id: string }) {
  const { execute, loading } = useApiAction({
    action: () => fetch(`/api/v1/items/${id}`, { method: "DELETE" }),
    successMessage: "Item permanently deleted.",
    onSuccess: () => refetch(),
  });

  return (
    <button 
      disabled={loading} 
      onClick={() => {
        if (confirm("Are you sure?")) execute();
      }}
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
```

---

## 5. Client-Side Pattern 3: Global `toast` API

Trigger notifications imperatively from anywhere:

```ts
import { toast } from "@/lib/notifications/toast";

toast.success("Project updated successfully!");
toast.error("Could not reach the server. Check your connection.");
toast.warning("Please acknowledge the policy before proceeding.");
toast.info("A new announcement was posted.");
```

- **Stacking:** Maximum 3 visible toasts.
- **Auto-dismiss:** Errors stay for 7s; Success/Warning/Info stay for 5s.
- **Accessibility:** Automatically complies with screen readers (`role="alert"` / `role="status"`).
- **Positioning:** Fixed top-right overlay (`z-[9999]`), never covers action buttons or bottom-right AI Copilot widgets.

---

## 6. Pre-Commit Verification

Before submitting any code changes, always run:

```bash
npm run check:errors
npx tsc --noEmit
npm test
```

`npm run check:errors` will fail if:
- Any `alert(...)` call is detected in portal code.
- Any raw `throw new Error(data.error)` is used without `getErrorMessage`.
- Any raw `setError(data.error)` is used without `getErrorMessage`.
