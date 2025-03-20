import geopandas as gpd
import matplotlib.pyplot as plt
# File paths for the shapefiles
folder_path = "shp_data/"
districts_path = folder_path + "Assaba_Districts_layer.shp"
regions_path = folder_path + "Assaba_Region_layer.shp"
roads_path = folder_path + "Main_Road.shp"
streams_path = folder_path + "Streamwater.shp"
# Load the shapefile data
districts = gpd.read_file(districts_path)
regions = gpd.read_file(regions_path)
roads = gpd.read_file(roads_path)
streams = gpd.read_file(streams_path)
# Crop roads to match Assaba region
roads_cropped = gpd.overlay(roads, regions, how="intersection")
# Get bounding box for the Assaba region for consistency across all layers
assaba_bounds = regions.total_bounds
# Set common figure size
figsize = (12, 10)
# -------------------
# 1. Base Map Layer
# -------------------
fig, ax = plt.subplots(figsize=figsize)
regions.plot(ax=ax, color="#eaeaea", edgecolor=None, alpha=1)  # Regions filled with light gray, outlines removed
ax.set_xlim(assaba_bounds[0], assaba_bounds[2])
ax.set_ylim(assaba_bounds[1], assaba_bounds[3])
ax.axis("off")
plt.savefig("base_map.svg", format="svg", dpi=300, bbox_inches="tight", transparent=True)
plt.close()
# -------------------
# 2. District Layer
# -------------------
fig, ax = plt.subplots(figsize=figsize)
districts.boundary.plot(ax=ax, color="#d35400", linewidth=1.2, alpha=0.9)  # Dark orange outline
ax.set_xlim(assaba_bounds[0], assaba_bounds[2])
ax.set_ylim(assaba_bounds[1], assaba_bounds[3])
ax.axis("off")
plt.savefig("district_layer.svg", format="svg", dpi=300, bbox_inches="tight", transparent=True)
plt.close()
# -------------------
# 3. Region Layer
# -------------------
fig, ax = plt.subplots(figsize=figsize)
regions.boundary.plot(ax=ax, color="#8B0000", linewidth=1.5, alpha=0.8)  # Dark red outline
ax.set_xlim(assaba_bounds[0], assaba_bounds[2])
ax.set_ylim(assaba_bounds[1], assaba_bounds[3])
ax.axis("off")
plt.savefig("region_layer.svg", format="svg", dpi=300, bbox_inches="tight", transparent=True)
plt.close()
# -------------------
# 4. Stream Layer
# -------------------
fig, ax = plt.subplots(figsize=figsize)
streams.plot(ax=ax, color="#3182bd", linewidth=0.7, alpha=0.6)  # Blue streams
ax.set_xlim(assaba_bounds[0], assaba_bounds[2])
ax.set_ylim(assaba_bounds[1], assaba_bounds[3])
ax.axis("off")
plt.savefig("stream_layer.svg", format="svg", dpi=300, bbox_inches="tight", transparent=True)
plt.close()
# -------------------
# 5. Road Layer
# -------------------
fig, ax = plt.subplots(figsize=figsize)
roads_cropped.plot(ax=ax, color="#4F4F4F", linewidth=2.5, alpha=1.0)  # Dark gray roads
ax.set_xlim(assaba_bounds[0], assaba_bounds[2])
ax.set_ylim(assaba_bounds[1], assaba_bounds[3])
ax.axis("off")
plt.savefig("road_layer.svg", format="svg", dpi=300, bbox_inches="tight", transparent=True)
plt.close()