from osgeo import gdal
import numpy as np

# Load images using GDAL
raster1 = gdal.Open('temp_diff/Modis_Land_Cover_Data/2010LCT_norm.tif_diff.tif')
raster2 = gdal.Open('temp_diff/Modis_Land_Cover_Data/2011LCT_norm.tif_diff.tif')

# Read image data as numpy arrays
band1 = raster1.GetRasterBand(1).ReadAsArray().astype(np.float32)
band2 = raster2.GetRasterBand(1).ReadAsArray().astype(np.float32)

# Check for same dimensions
if band1.shape != band2.shape:
    print("Images must have the same dimensions. Resize if needed!")
    exit()

# Compute Pearson correlation
correlation = np.corrcoef(band1.flatten(), band2.flatten())[0, 1]

print(f"Correlation Coefficient: {correlation}")


# Function to load raster as NumPy array
def load_raster_as_array(filepath):
    dataset = gdal.Open(filepath)
    if dataset is None:
        raise FileNotFoundError(f"Unable to load file: {filepath}")
    band = dataset.GetRasterBand(1)  # Assuming single-band raster
    return band.ReadAsArray().astype(np.float32)

# Function to compute auto-correlation between two images
def compute_autocorrelation(image1, image2):
    if image1.shape != image2.shape:
        raise ValueError("Images must have the same dimensions.")

    # Subtract mean (mean-centering)
    mean_centered1 = image1 - np.mean(image1)
    mean_centered2 = image2 - np.mean(image2)

    # Perform FFT on both images
    fft_image1 = np.fft.fft2(mean_centered1)
    fft_image2 = np.fft.fft2(mean_centered2)

    # Compute cross power spectrum (correlation in frequency domain)
    cross_power_spectrum = fft_image1 * np.conj(fft_image2)

    # Transform back to spatial domain to get correlation
    auto_corr = np.fft.ifft2(cross_power_spectrum).real

    # Normalize result
    auto_corr /= np.max(np.abs(auto_corr))
    return auto_corr

from pathlib import Path
folder = Path("temp_diff/MODIS_Gross_Primary_Production_GPP")
image_files =  list(folder.glob("*.tif"))
reference_image = load_raster_as_array(image_files[0])  # Choose one as reference

results = {}
for file in image_files[1:]:
    target_image = load_raster_as_array(file)
    correlation = compute_autocorrelation(reference_image, target_image)
    results[file] = correlation
    print(f"Computed auto-correlation for {file}.")

import matplotlib.pyplot as plt

# Plot the auto-correlation result
for filename, auto_corr in results.items():
    plt.figure(figsize=(8, 6))
    plt.imshow(auto_corr, cmap="viridis")
    plt.colorbar(label="Auto-Correlation Value")
    plt.title(f"Auto-Correlation for {filename}")
    plt.xlabel("X Pixel Offset")
    plt.ylabel("Y Pixel Offset")
    plt.show()

print(results)


