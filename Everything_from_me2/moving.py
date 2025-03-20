import shutil
import os
from pathlib import Path

if __name__ == "__main__":
    rel = Path("Transformed")
    temp = Path("temp")


    for dirpath, _, filenames in os.walk(rel):
        for filename in filenames:
            os.remove(os.path.join(dirpath, filename))

        break

    for dirpath, dirnames, filenames in os.walk(temp):
        for dirname in dirnames:
            shutil.move(os.path.join(dirpath, dirname), rel)
        break