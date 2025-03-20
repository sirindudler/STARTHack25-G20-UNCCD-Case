import ee

ee.Authenticate()
ee.Initialize(project="ee-start-hack-2025")
collection = ee.ImageCollection('ECMWF/ERA5/MONTHLY')