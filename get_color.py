import sys
from collections import Counter
try:
    from PIL import Image
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image

def get_dominant_color(image_path):
    img = Image.open(image_path)
    img = img.convert('RGB')
    
    # Resize for faster processing
    img.thumbnail((150, 150))
    
    pixels = list(img.getdata())
    
    # Filter out pure black, pure white, and near grays to find the actual logo accent color
    valid_pixels = []
    for r, g, b in pixels:
        # Ignore very dark colors
        if r < 30 and g < 30 and b < 30:
            continue
        # Ignore very bright colors
        if r > 240 and g > 240 and b > 240:
            continue
        # Ignore grays (where rgb values are very close)
        if abs(r-g) < 15 and abs(r-b) < 15 and abs(g-b) < 15:
            continue
            
        valid_pixels.append((r, g, b))
        
    if not valid_pixels:
        print("No dominant color found (mostly black/white). Returning most common pixel anyway.")
        valid_pixels = pixels

    counter = Counter(valid_pixels)
    most_common = counter.most_common(5)
    
    for color, count in most_common:
        hex_color = '#{:02x}{:02x}{:02x}'.format(*color)
        print(f"Color: {hex_color} RGB: {color} (Count: {count})")

if __name__ == "__main__":
    get_dominant_color(sys.argv[1])
