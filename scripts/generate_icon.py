import zlib
import struct

def make_png(width, height):
    # RGBA red pixel: \xff\x00\x00\xff
    # Let's make it blue/dark theme: \x0f\x17\x2a\xff (slate-900)
    # With a simple white box in middle? Too complex for byte manipulation.
    # Let's just make a solid blue-ish icon for now.
    pixel = b'\x3b\x82\xf6\xff' # Blue-500
    
    # Raw data: 1 byte filter type (0) per scanline + pixels
    line_data = b'\x00' + (pixel * width)
    raw_data = line_data * height
    
    def png_pack(png_tag, data):
        chunk_head = png_tag + data
        return struct.pack('!I', len(data)) + chunk_head + struct.pack('!I', 0xFFFFFFFF & zlib.crc32(chunk_head))
    
    signature = b'\x89PNG\r\n\x1a\n'
    ihdr = png_pack(b'IHDR', struct.pack('!2I5B', width, height, 8, 6, 0, 0, 0))
    idat = png_pack(b'IDAT', zlib.compress(raw_data))
    iend = png_pack(b'IEND', b'')
    
    return signature + ihdr + idat + iend

with open('public/logo.png', 'wb') as f:
    f.write(make_png(512, 512))

