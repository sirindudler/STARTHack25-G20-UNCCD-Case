import rasterio
import matplotlib.pyplot as plt
import os

# Debug working directory
print("Current Working Directory:", os.getcwd())

# Filepath to the GeoTIFF you want to visualize
file_path = "Gridded_Population_Density_Data/mrt_pd_2010_1km.tif"

# Open the GeoTIFF file using Rasterio
with rasterio.open(file_path) as dataset:
    data = dataset.read(1)  # Read the first band (raster data)
    profile = dataset.profile  # Metadata of the GeoTIFF

# Print metadata (optional, for debugging)
print("GeoTIFF Metadata:")
print(profile)

# Visualize the raster data
plt.title("Population Density - 2010 (1km)")
plt.imshow(data, cmap='viridis')
plt.colorbar(label="Population Density")
plt.xlabel("Pixel X")
plt.ylabel("Pixel Y")
plt.show()
