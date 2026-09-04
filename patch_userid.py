"""
Fix all employee API routes that use raw `userId` (string | null) in Prisma queries.
After patching, the user is validated and we have `user.id` (string). All DB queries must use user.id.
"""

import os, re

def patch_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content

    # Fix: where: { userId, ... } → where: { userId: user.id, ... }
    # Match "userId," or "userId ," inside where clauses (shorthand property)
    content = re.sub(r'\bwhere:\s*\{\s*userId,', 'where: { userId: user.id,', content)
    # Fix: where: { userId } (end of object)
    content = re.sub(r'\bwhere:\s*\{\s*userId\s*\}', 'where: { userId: user.id }', content)
    # Fix: notif.userId !== userId  → notif.userId !== user.id
    content = re.sub(r'(\.\w+\.userId)\s*!==\s*userId', r'\1 !== user.id', content)
    # Fix: task.userId !== userId
    content = re.sub(r'task\.userId\s*!==\s*userId', 'task.userId !== user.id', content)

    if content != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched: {path}")
    else:
        print(f"No change: {path}")

base = r"c:\Users\vk010\Downloads\startup\axivon-technologies\axivon-technologies\src\app\api\v1\employee"
for root, _, files in os.walk(base):
    for fname in files:
        if fname == "route.ts":
            patch_file(os.path.join(root, fname))
