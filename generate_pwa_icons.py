from PIL import Image, ImageOps

def create_pwa_icons():
    # Source image is avatar.jpg (1280x1280)
    source = Image.open('avatar.jpg').convert('RGBA')

    # 1. 512x512 icon
    icon_512 = source.resize((512, 512), Image.Resampling.LANCZOS)
    icon_512.save('icon-512.png', 'PNG', optimize=True)

    # 2. 192x192 icon
    icon_192 = source.resize((192, 192), Image.Resampling.LANCZOS)
    icon_192.save('icon-192.png', 'PNG', optimize=True)

    # 3. Maskable icon (with safe padding of ~15% on each side)
    maskable_512 = Image.new('RGBA', (512, 512), (32, 26, 14, 255))
    padded_size = int(512 * 0.76) # 389px inside 512px gives ~12% safe zone
    inner = source.resize((padded_size, padded_size), Image.Resampling.LANCZOS)
    offset = (512 - padded_size) // 2
    maskable_512.paste(inner, (offset, offset), inner)
    maskable_512.save('icon-maskable-512.png', 'PNG', optimize=True)

    print("Successfully generated icon-512.png, icon-192.png, and icon-maskable-512.png!")

if __name__ == '__main__':
    create_pwa_icons()
