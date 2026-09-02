from PIL import Image
import os
import base64
from io import BytesIO

img_path = r'C:/Users/vk010/.gemini/antigravity/brain/b9c0653d-8bf3-4588-af1b-50d9071018a3/.user_uploaded/media_1788374804511.jpg'
out_dir = r'public/assets/logo'
os.makedirs(out_dir, exist_ok=True)

img = Image.open(img_path).convert('RGBA')

# Function to make white background transparent
def make_transparent(image):
    data = image.getdata()
    new_data = []
    for item in data:
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
    image.putdata(new_data)
    return image

def make_white(image):
    data = image.getdata()
    new_data = []
    for item in data:
        if item[3] > 0:
            new_data.append((255, 255, 255, item[3]))
        else:
            new_data.append(item)
    white_img = Image.new('RGBA', image.size)
    white_img.putdata(new_data)
    return white_img

def save_svg(image, path):
    buffered = BytesIO()
    image.save(buffered, format='PNG')
    img_str = base64.b64encode(buffered.getvalue()).decode()
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{image.width}" height="{image.height}"><image href="data:image/png;base64,{img_str}" width="{image.width}" height="{image.height}" /></svg>'
    with open(path, 'w') as f:
        f.write(svg)

# Find true bounds by cropping tightly if possible, or just using estimates.
# 1024x1024 image.
box_full = (200, 120, 824, 600)
logo_full = img.crop(box_full)
logo_full = make_transparent(logo_full)
# Let's crop it to its bounding box
bbox = logo_full.getbbox()
if bbox:
    logo_full = logo_full.crop(bbox)

logo_full.save(os.path.join(out_dir, 'logo-full.png'))
save_svg(logo_full, os.path.join(out_dir, 'logo-full.svg'))

logo_white = make_white(logo_full)
logo_white.save(os.path.join(out_dir, 'logo-white.png'))

box_icon = (350, 140, 674, 420)
logo_icon = img.crop(box_icon)
logo_icon = make_transparent(logo_icon)
bbox_icon = logo_icon.getbbox()
if bbox_icon:
    logo_icon = logo_icon.crop(bbox_icon)

# Make icon perfectly square
w, h = logo_icon.size
size = max(w, h)
sq_icon = Image.new('RGBA', (size, size), (255, 255, 255, 0))
sq_icon.paste(logo_icon, ((size - w) // 2, (size - h) // 2))

sq_icon.save(os.path.join(out_dir, 'logo-icon.png'))
save_svg(sq_icon, os.path.join(out_dir, 'logo-icon.svg'))

favicon = sq_icon.resize((32, 32), Image.Resampling.LANCZOS)
favicon.save('public/favicon.ico')

apple_touch = sq_icon.resize((180, 180), Image.Resampling.LANCZOS)
apple_bg = Image.new('RGB', (180, 180), (255, 255, 255))
apple_bg.paste(apple_touch, mask=apple_touch.split()[3])
apple_bg.save('public/apple-touch-icon.png')
apple_bg.save(os.path.join(out_dir, 'apple-touch-icon.png'))

print("Logo generation complete.")
