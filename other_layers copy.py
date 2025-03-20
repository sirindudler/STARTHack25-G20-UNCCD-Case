import os
import numpy as np
import rasterio
import matplotlib.pyplot as plt

# Base path: Parent folder that contains all subfolders like Climate_Precipitation_Data, etc.
base_folder = "transformed-data/Transformed/"  # Replace this with the correct path to your data folder
output_folder = "feature_layers/"  # Replace with desired path to save the layers overlay PNGs

# Ensure output folder exists
os.makedirs(output_folder, exist_ok=True)

# Function to process and save raster layers with transparency
def process_folder(folder_path, layer_type, colormap, no_data_value=None):
    """
    Process `.tif` files in a folder into raster layers saved as transparent PNGs
    with appropriate colormap and transparency for no-data values.

    Args:
        folder_path (str): Path to folder containing `.tif` files
        layer_type (str): Descriptive type name for layer (e.g., "Climate_Precipitation")
        colormap (str): Colormap used for visualization (e.g., "Blues", "YlOrRd")
        no_data_value (float): Value representing no-data in the raster (default is None).
    """
    # Loop through all files in the folder
    for file in os.listdir(folder_path):
        if file.endswith(".tif"):  # Only process .tif files
            file_path = os.path.join(folder_path, file)
            with rasterio.open(file_path) as src:
                data = src.read(1)  # Read the first band (assuming single-band raster)
                mask = np.isnan(data) if no_data_value is None else (data == no_data_value)
                bounds = src.bounds  # Get spatial bounds (extent) of the raster

                # Plot raster and save as PNG
                fig, ax = plt.subplots(figsize=(12, 10))
                ax.axis("off")  # Remove axes for clear overlay layers
                # Apply colormap and transparency (mask where data values are no-data)
                cax = ax.imshow(
                    np.ma.masked_where(mask, data),  # Mask no-data values
                    cmap=colormap,
                    extent=[bounds.left, bounds.right, bounds.bottom, bounds.top],
                )
                # Define output filename
                layer_name = f"{layer_type}_{file.replace('.tif', '.png')}"
                output_filename = os.path.join(output_folder, layer_name)
                # Save image (transparent background with masked areas)
                plt.savefig(output_filename, dpi=300, bbox_inches="tight", transparent=True)
                plt.close()
                print(f"Saved layer: {output_filename}")


# Process each folder with appropriate colormaps and transparency
# Note: Assuming `None` for no-data value, change if specific no-data values are used in the rasters.

# Precipitation: Blue colormap (Darker blue for higher precipitation)
process_folder(os.path.join(base_folder, "Climate_Precipitation_Data"), "Climate_Precipitation", colormap="Blues")

# Population Density: Red colormap (Darker red for higher population density)
process_folder(os.path.join(base_folder, "Gridded_Population_Density_Data"), "Population_Density", colormap="Reds")

# GPP (Gross Primary Production): Purple colormap (Darker purple for higher production)
process_folder(os.path.join(base_folder, "MODIS_Gross_Primary_Production_GPP"), "GPP", colormap="Purples")

# Land Cover: Categorical colormap (Set3 colormap for discrete classes)
process_folder(os.path.join(base_folder, "Modis_Land_Cover_Data"), "Land_Cover", colormap="Set3")