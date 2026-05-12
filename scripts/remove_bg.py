from PIL import Image

def remove_background(input_path, output_path, tolerance=25):
    img = Image.open(input_path)
    img = img.convert("RGBA")
    
    datas = img.getdata()
    
    newData = []
    for item in datas:
        # Check if the pixel is white-ish
        if item[0] >= 255 - tolerance and item[1] >= 255 - tolerance and item[2] >= 255 - tolerance:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save(output_path, "PNG")

remove_background("/home/laptopmint/Documents/Echoir-Music/public/logo.png", "/home/laptopmint/Documents/Echoir-Music/public/logo.png", tolerance=25)
print("Background removed")
