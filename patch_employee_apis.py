import os
import glob
import re

api_dir = r"c:\Users\vk010\Downloads\startup\axivon-technologies\axivon-technologies\src\app\api\v1\employee"

for root, _, files in os.walk(api_dir):
    for file in files:
        if file == "route.ts":
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()

            if "validateActiveUser" not in content:
                # Add import
                if "import { handleApiError" in content:
                    content = content.replace(
                        "import { handleApiError",
                        "import { validateActiveUser } from '@/lib/auth/permissions';\nimport { handleApiError"
                    )

                # Replace the generic auth check
                content = re.sub(
                    r"const userId = req\.headers\.get\('x-user-id'\);\s+if \(!userId\) throw new ApiError\(401, 'Unauthorized'\);",
                    r"const userId = req.headers.get('x-user-id');\n    const user = await validateActiveUser(userId);",
                    content
                )
                
                with open(path, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"Patched {path}")
