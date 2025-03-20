from osgeo import ogr, osr, gdal
import os
import re
import sys
import json
import shutil
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation


"""
Retrieve the EPSG code of a .tif file
"""

def get_EPSG(file_path):
    # Open the dataset—GDAL will automatically use any ancillary files.
    ds = gdal.Open(file_path)
    if ds is None:
        print(f"Failed to open {file_path}")
        return

    # Retrieve the projection WKT string.
    projection_wkt = ds.GetProjectionRef()
    print("Projection (WKT):\n", projection_wkt)

    # Retrieve the geotransform (origin, pixel size, rotation, etc.).
    geotransform = ds.GetGeoTransform()
    print("GeoTransform:", geotransform)
    
    # Create a SpatialReference object from the WKT.
    srs = osr.SpatialReference()
    srs.ImportFromWkt(projection_wkt)

    # Retrieve the EPSG code—this assumes that the authority is set.
    # The GetAttrValue("AUTHORITY", 1) call returns the EPSG code if available.
    epsg_code = srs.GetAttrValue("AUTHORITY", 1)
    ds = None
    return epsg_code


"""
This script recursively gathers primary raster files (e.g. .tif, .tiff, .png) from an input directory,
and then “normalizes” them to be comparable. However, instead of forcing all files to use a common union extent,
we choose the valid data footprint of the smallest raster as a reference extent.
• Larger rasters will be cropped to that reference extent.
• Smaller rasters will not be expanded (their valid footprint is used instead).
All outputs are reprojected to a common coordinate system (default EPSG:4326)
and resampled to a common resolution (the smallest native pixel size among the files).
"""

def get_valid_data_extent(filepath):
    """
    Opens a raster (first band only) and computes the georeferenced bounding box (in the file’s own SRS)
    covering all valid (non‑nodata) pixels.
    
    Returns a tuple: (xmin, ymin, xmax, ymax) or None if no valid data.
    """
    ds = gdal.Open(filepath)
    if ds is None:
        print(f"Failed to open {filepath}")
        return None
    band = ds.GetRasterBand(1)
    nodata = band.GetNoDataValue()
    arr = band.ReadAsArray()
    
    # Build a mask of valid pixels.
    if nodata is None:
        mask = np.full(arr.shape, True, dtype=bool)
    else:
        mask = (arr != nodata)
    
    if not np.any(mask):
        ds = None
        return None

    # Find indices of valid pixels.
    valid_rows, valid_cols = np.where(mask)
    row_min = int(valid_rows.min())
    row_max = int(valid_rows.max())
    col_min = int(valid_cols.min())
    col_max = int(valid_cols.max())
    
    gt = ds.GetGeoTransform()
    ds = None

    # Compute georeferenced corners for the pixel window.
    # For a pixel (col, row), coordinate = (gt[0] + col*gt[1] + row*gt[2],
    #                                        gt[3] + col*gt[4] + row*gt[5])
    ul_x = gt[0] + col_min * gt[1] + row_min * gt[2]
    ul_y = gt[3] + col_min * gt[4] + row_min * gt[5]
    lr_x = gt[0] + col_max * gt[1] + row_max * gt[2]
    lr_y = gt[3] + col_max * gt[4] + row_max * gt[5]
    
    xmin = min(ul_x, lr_x)
    xmax = max(ul_x, lr_x)
    ymin = min(ul_y, lr_y)
    ymax = max(ul_y, lr_y)
    
    return (xmin, ymin, xmax, ymax)


def get_native_pixel_size(filepath):
    """
    Opens the file and extracts the native pixel size (absolute value of gt[1]).
    Assumes square pixels.
    """
    ds = gdal.Open(filepath)
    if ds is None:
        print(f"Could not open file: {filepath}")
        return None
    gt = ds.GetGeoTransform()
    ds = None
    return abs(gt[1])

"""
Recursively collects primary raster files.
We consider files ending in .tif, .tiff, or .png. Any auxiliary files 
(like .tfw, .ovr, .aux.xml, .xml) are assumed to accompany these primary files.

Files which have a different EPSG code than 4326 are reprojected to 4326.
"""
def gather_raster_files(root_dir, temp_folder="temp"):
    """
    Recursively collects primary raster files.
    We consider files ending in .tif, .tiff, or .png. Any auxiliary files 
    (like .tfw, .ovr, .aux.xml, .xml) are assumed to accompany these primary files.
    """
    """
    if os.path.exists(temp_folder):
        shutil.rmtree(temp_folder)
    """
    if not os.path.exists(temp_folder):
        os.makedirs(temp_folder)
    valid_extensions = ['.tif', '.tiff', '.png']
    full_list = []
    for dirpath, _, filenames in os.walk(root_dir):
        for f in filenames:
            local_dir = os.path.relpath(dirpath, root_dir)
            ext = os.path.splitext(f)[1].lower()

            if ext in valid_extensions:
                to_add = os.path.join(dirpath, f)
                if get_EPSG(to_add) != '4326' and get_EPSG(to_add) is not None:
                    os.makedirs(os.path.join(temp_folder, local_dir), exist_ok=True)
                    output_file = os.path.join(temp_folder, local_dir, f)
                    ds = gdal.Warp(output_file, to_add, dstSRS="EPSG:4326")
                    ds = None
                    to_add = output_file
                full_list.append(to_add)
            
    return full_list

def compute_reference_extent(file_list, target_srs="EPSG:4326"):
    """
    For all rasters, compute each file’s valid data extent (transformed to target_srs),
    then choose the one with the smallest area. This serves as the reference extent.
    
    Returns: (xmin, ymin, xmax, ymax) in the target SRS.
    """
    srs_target = osr.SpatialReference()
    srs_target.ImportFromEPSG(int(target_srs.split(':')[1]))
    
    ref_extent = None
    ref_area = float('inf')
    
    for filepath in file_list:
        ve = get_valid_data_extent(filepath)
        if ve is None:
            continue
        # Transform the valid extent from the file’s SRS into the target SRS.
        ds = gdal.Open(filepath)
        proj = ds.GetProjection()
        srs_source = osr.SpatialReference()
        if proj and proj.strip():
            srs_source.ImportFromWkt(proj)
        else:
            srs_source.ImportFromEPSG(int(target_srs.split(':')[1]))
        ds = None
        transform = osr.CoordinateTransformation(srs_source, srs_target)
        xmin, ymin, xmax, ymax = ve
        corners = [
            transform.TransformPoint(xmin, ymin),
            transform.TransformPoint(xmin, ymax),
            transform.TransformPoint(xmax, ymin),
            transform.TransformPoint(xmax, ymax)
        ]
        xs = [pt[0] for pt in corners]
        ys = [pt[1] for pt in corners]
        txmin, tymin, txmax, tymax = min(xs), min(ys), max(xs), max(ys)
        area = (txmax - txmin) * (tymax - tymin)
        if area < ref_area:
            ref_area = area
            ref_extent = (txmin, tymin, txmax, tymax)
    return ref_extent


def process_raster(input_filepath, output_filepath, reference_extent, target_resolution, target_srs):
    """
    Reprojects/resamples a single raster to a cropped grid. If the raster’s valid extent,
    transformed into the target SRS, completely covers the reference_extent,
    then the output grid is forced to that reference (i.e. the file is cropped).
    Otherwise (if the valid area is smaller), we use the file’s valid extent to avoid expansion.
    
    The target_resolution is applied in all cases. The resampling method is chosen by comparing the source's
    native pixel size to the target_resolution.
    """
    # First, get the file's valid extent and transform it into target SRS.
    ve = get_valid_data_extent(input_filepath)
    srs_target = osr.SpatialReference()
    srs_target.ImportFromEPSG(int(target_srs.split(':')[1]))
    if ve is not None:
        ds = gdal.Open(input_filepath)
        proj = ds.GetProjection()
        srs_source = osr.SpatialReference()
        if proj and proj.strip():
            srs_source.ImportFromWkt(proj)
        else:
            srs_source.ImportFromEPSG(int(target_srs.split(':')[1]))
        ds = None
        transform = osr.CoordinateTransformation(srs_source, srs_target)
        xmin, ymin, xmax, ymax = ve
        corners = [
            transform.TransformPoint(xmin, ymin),
            transform.TransformPoint(xmin, ymax),
            transform.TransformPoint(xmax, ymin),
            transform.TransformPoint(xmax, ymax)
        ]
        xs = [pt[0] for pt in corners]
        ys = [pt[1] for pt in corners]
        file_extent = (min(xs), min(ys), max(xs), max(ys))
    else:
        # If no valid extent can be determined, default to the reference.
        file_extent = reference_extent

    # Determine the effective crop extent:
    # If the file's valid extent completely covers the reference extent,
    # then crop to the reference. Otherwise, keep the file's own extent.
    (ref_xmin, ref_ymin, ref_xmax, ref_ymax) = reference_extent
    (f_xmin, f_ymin, f_xmax, f_ymax) = file_extent
    if (f_xmin <= ref_xmin) and (f_ymin <= ref_ymin) and (f_xmax >= ref_xmax) and (f_ymax >= ref_ymax):
        crop_extent = reference_extent
    else:
        crop_extent = file_extent

    # Choose a resampling method based on native resolution.
    native_pix = get_native_pixel_size(input_filepath)
    if native_pix is None:
        resample_alg = "nearest"
    elif native_pix > target_resolution * 1.01:
        resample_alg = "average"
    else:
        resample_alg = "bilinear"

    warp_options = gdal.WarpOptions(
        format="GTiff",
        dstSRS=target_srs,
        outputBounds=crop_extent,
        xRes=target_resolution,
        yRes=target_resolution,
        resampleAlg=resample_alg,
        dstNodata=0
    )
    
    print(f"Processing: {input_filepath}")
    print(f"  -> Output: {output_filepath}")
    print(f"  Using crop extent: {crop_extent}")
    print(f"  Native pixel size: {native_pix} | Target resolution: {target_resolution}")
    print(f"  Resampling method: {resample_alg}")

    result = gdal.Warp(output_filepath, input_filepath, options=warp_options)
    if result is None:
        print(f"Error processing {input_filepath}")
    else:
        result = None  # Flush & close
        print(f"Saved normalized raster to {output_filepath}\n")
        
    return reference_extent, target_resolution


"""
Convert .shp file to .tif file
"""
def rasterize_shapefile(shapefile_path, output_tif, target_extent, pixel_size, target_srs):
    """
    Rasterize a shapefile to a GeoTIFF that matches the normalized grid.
    
    Parameters:
      shapefile_path (str): Path to the .shp (shapefile) file.
      output_tif (str): Path to the output GeoTIFF.
      target_extent (tuple): (xmin, ymin, xmax, ymax) of the output grid.
      pixel_size (float): Target pixel resolution.
      target_srs (str): Target spatial reference as string, e.g. "EPSG:4326" or "EPSG:3857".
    """
    xmin, ymin, xmax, ymax = target_extent
    # Determine image dimensions from the target extent and pixel size.
    x_pixels = int((xmax - xmin) / pixel_size)
    y_pixels = int((ymax - ymin) / pixel_size)
    
    # Create the output GeoTIFF.
    driver = gdal.GetDriverByName('GTiff')
    target_ds = driver.Create(output_tif, x_pixels, y_pixels, 1, gdal.GDT_Byte)
    if target_ds is None:
        raise RuntimeError("Could not create output raster.")

    # Create geotransform.
    # Note: The geotransform is defined as:
    # (top left x, w-e pixel resolution, rotation (0 if north is up),
    #  top left y, rotation (0 if north is up), n-s pixel resolution (negative))
    geotransform = (xmin, pixel_size, 0, ymax, 0, -pixel_size)
    target_ds.SetGeoTransform(geotransform)
    
    # Set the projection.
    srs = osr.SpatialReference()
    srs.ImportFromEPSG(int(target_srs.split(":")[1]))
    target_ds.SetProjection(srs.ExportToWkt())
    
    # Initialize the raster band.
    band = target_ds.GetRasterBand(1)
    band.Fill(0)  # Fill with 0 (nodata or background value)
    band.SetNoDataValue(0)
    
    # Open the vector shapefile.
    vector_ds = ogr.Open(shapefile_path)
    if vector_ds is None:
        raise RuntimeError("Could not open shapefile: " + shapefile_path)
    layer = vector_ds.GetLayer()
    
    # Rasterize: burn value 255 into the pixels where features exist.
    # You may also choose to burn an attribute value using the "ATTRIBUTE=fieldName" option.
    ret = gdal.RasterizeLayer(target_ds, [1], layer, burn_values=[255])
    if ret != 0:
        raise RuntimeError("Rasterization failed with code " + str(ret))
    
    # Clean up
    target_ds = None
    vector_ds = None
    print(f"Rasterization complete. Output saved to {output_tif}")


def convert_shape_files(root_dir, output_folder, target_extent, pixel_size, target_srs):
    """
    Recursively collects primary shapefiles.
    We consider files ending in .shp.
    """
    if os.path.exists(output_folder):
        shutil.rmtree(output_folder)
    os.makedirs(output_folder)
    valid_extensions = ['.shp']
    full_list = []
    for dirpath, _, filenames in os.walk(root_dir):
        for f in filenames:
            ext = os.path.splitext(f)[1].lower()
            if ext in valid_extensions:
                rasterize_shapefile(os.path.join(dirpath, f), os.path.join(output_folder, f.replace(".shp", ".tif")), target_extent, pixel_size, target_srs)

"""
Input a root directory contained subdirectories with raster files
 - Valid main extensions: .tif and .shp
"""
def create_transformed_files(root_dir, output_root, target_srs="EPSG:4326"):
    raster_files = gather_raster_files(root_dir, temp_folder="temp")
    print(f"Found {len(raster_files)} raster files.")

    # Compute the reference extent from the smallest valid footprint.
    ref_extent = compute_reference_extent(raster_files, target_srs)
    if ref_extent is None:
        print("Couldn't determine a reference extent from the data. Exiting.")
        sys.exit(1)
    print("Reference extent (from the smallest raster) in target SRS:")
    print(f"  xmin: {ref_extent[0]}, ymin: {ref_extent[1]}, xmax: {ref_extent[2]}, ymax: {ref_extent[3]}")


    # Determine the smallest (finest) pixel size among all files.
    target_resolution = float('inf')
    for f in raster_files:
        pix = get_native_pixel_size(f)
        if pix is not None:
            target_resolution = min(target_resolution, pix)
    print(f"Chosen target resolution (smallest native pixel): {target_resolution}\n")

    with open("extent.txt", "w") as f:
        f.write(json.dumps(ref_extent, indent=4))
        f.write("\n")
        f.write(str(target_resolution))

    temp_folder = str(np.random.randint(1000, 1e9))
    os.makedirs(temp_folder, exist_ok=True)
    convert_shape_files(root_dir, output_root, ref_extent, target_resolution, target_srs)
    raster_files2 = gather_raster_files(temp_folder)
    print(f"Found {len(raster_files2)} raster files.")

    raster_files.extend(raster_files2)

    for f in raster_files:
        rel_path = os.path.relpath(f, root_dir)
        base, _ = os.path.splitext(rel_path)
        out_file = os.path.join(output_root, base + "_norm.tif")
        os.makedirs(os.path.dirname(out_file), exist_ok=True)
        process_raster(f, out_file, ref_extent, target_resolution, target_srs)

    shutil.rmtree(temp_folder)

    # NOTE: DOES NOT WORK YET!
    # Clean up all directories:
    temp_folder = "temp"

    rel = output_root
    temp = temp_folder


    for dirpath, _, filenames in os.walk(rel):
        for filename in filenames:
            if "_norm" in filename:
                os.remove(os.path.join(dirpath, filename))

        break

    for dirpath, dirnames, filenames in os.walk(temp):
        for dirname in dirnames:
            shutil.move(os.path.join(dirpath, dirname), rel)
            for dirpath2, _, filenames2 in os.walk(os.path.join(rel, dirname)):
                for filename in filenames2:
                    if "_norm" not in filename:
                        os.remove(os.path.join(dirpath2, filename))
        break
    
    shutil.rmtree(temp_folder)
    

# TODO:
def sort_file_by_year(files):
    files.sort(key=lambda f: int(''.join(filter(str.isdigit, f))))
    print("HGJSKG", files, "\n")
    return files


"""
Create an animation of all .tif files contained in a folder.
It saves a .gif file
"""
def create_test_animation(folder, output_file):
    files = sort_file_by_year([os.path.join(folder, p) for p in os.listdir(folder) if p.endswith(".tif")])
    
    def read_tif(file):
        print(file)
        ds = gdal.Open(file)
        band = ds.GetRasterBand(1)
        data = band.ReadAsArray()
        ds = None
        return data

    # Read the first file to get the dimensions
    sample_data = read_tif(files[0])

    # Create a figure and axis for the animation
    fig, ax = plt.subplots(figsize=(8, 6))
    img = ax.imshow(sample_data, cmap='viridis', animated=True)
    plt.colorbar(img, ax=ax, label="Pixel Values")
    ax.set_title("TIF File Animation")
    ax.set_xlabel("X")
    ax.set_ylabel("Y")

    def update(frame):
        data = read_tif(files[frame])
        img.set_array(data)
        matches = re.search(r'\d{4}', files[frame])
        ax.set_title(f"Year {matches.group(0)}")
        return img,

    ani = FuncAnimation(
        fig, update, frames=len(files), interval=1000, blit=True
    )

    ani.save(output_file, writer="imagemagick")

def show_img(file, save=None):
    ds = gdal.Open(file)
    band = ds.GetRasterBand(1)
    data = band.ReadAsArray()
    plt.imshow(data, cmap='viridis')
    plt.colorbar()
    if save is not None:
        plt.savefig(save)
        plt.close("all")
    else:
        plt.show()




if __name__ == "__main__":
    
    input_root = "Datasets_Hackathon"
    output_root = "Transformed"
    target_srs = "EPSG:4326"

    create_transformed_files(input_root, output_root, target_srs)

    """
    create_transformed_files(input_root, output_root, target_srs)
    create_test_animation("Transformed/Climate_Precipitation_Data", "climate_precipitation.gif")
    create_test_animation("Transformed/Gridded_Population_Density_Data", "gridded_population_density_data.gif")
    create_test_animation("Transformed/MODIS_Gross_Primary_Production_GPP", "modis_gross_primary_production_gpp.gif")
    create_test_animation("Transformed/Modis_Land_Cover_Data", "modis_land_cover_data.gif")"
    """


    from pathlib import Path


    def save_imgs(difference=False):
        if difference:
            folder = Path("Transformed")
            where = Path("Imgs_diff")
        else:
            folder = Path("Transformed")
            where = Path("Imgs")
        if where.exists():
            shutil.rmtree(where)


        os.makedirs(where)
        subdirs = list(folder.glob("*/"))
        for subdir in subdirs:
            os.makedirs(where / subdir.name)
            files = list(subdir.glob("*.tif"))
            if difference:
                n_years = len(files)
                for i in range(1, n_years):
                    temp = Path("temp_diff")
                    ds1 = gdal.Open(files[i-1])
                    ds2 = gdal.Open(files[i])
                    band1 = ds1.GetRasterBand(1)
                    band2 = ds2.GetRasterBand(1)
                    data1 = band1.ReadAsArray()
                    data2 = band2.ReadAsArray()
                    if data2.shape != data1.shape:
                        if data2.shape[0] >= data1.shape[0]:
                            data2 = data2[:data1.shape[0], :]
                        else:
                            data1 = data1[:data2.shape[0], :]
                        if data2.shape[1] >= data1.shape[1]:
                            data2 = data2[:, :data1.shape[1]]
                        else:
                            data1 = data1[:, :data2.shape[1]]
                    diff = np.abs(data2 - data1)
                    os.makedirs(temp, exist_ok=True)
                    os.makedirs(temp / subdir.name, exist_ok=True)
                    diff_file = temp / subdir.name / f"{files[i].name}_diff.tif"
                    driver = gdal.GetDriverByName("GTiff")
                    outdata = driver.Create(str(diff_file), ds1.RasterXSize, ds1.RasterYSize, 1, gdal.GDT_Float32)
                    outdata.SetGeoTransform(ds1.GetGeoTransform())
                    outdata.SetProjection(ds1.GetProjection())

                    outband = outdata.GetRasterBand(1)
                    outband.WriteArray(diff)
                    outband.SetNoDataValue(0)

                    outband = None
                    outdata = None
                    ds1 = None
                    ds2 = None

                    show_img(diff_file, save=where /subdir.name / str(files[i].name).replace(".tif", ".png"))
            else:
                for file in files:
                    show_img(file, save=where /subdir.name / str(file.name).replace(".tif", ".png"))

    #save_imgs(difference=True)