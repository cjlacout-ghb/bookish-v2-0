import os
import sys

def get_covers_dir():
    home = os.path.expanduser("~")
    if sys.platform == "win32":
        try:
            import ctypes
            from ctypes import wintypes
            buf = ctypes.create_unicode_buffer(wintypes.MAX_PATH)
            ctypes.windll.shell32.SHGetFolderPathW(None, 5, None, 0, buf)
            documents = buf.value
        except Exception:
            documents = os.path.join(home, "Documents")
    else:
        documents = os.path.join(home, "Documents")
    
    return os.path.join(documents, "Bookish", "data", "portadas")

covers_dir = get_covers_dir()
print(f"Checking directory: {covers_dir}")
if os.path.exists(covers_dir):
    files = os.listdir(covers_dir)
    print(f"Files found: {len(files)}")
    for f in files:
        print(f" - {f}")
else:
    print("Directory does not exist.")
