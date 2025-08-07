# Assaba Environmental Monitor

**🏆 Starthack 2025 - UNCCD Challenge Solution**

An interactive environmental monitoring dashboard for the Assaba region of Mauritania, designed to support the United Nations Convention to Combat Desertification (UNCCD) in tracking land degradation and climate patterns.

## 🌍 Project Overview

This project addresses desertification monitoring in Mauritania's Assaba region through an integrated geospatial dashboard that visualizes critical environmental indicators including precipitation patterns, population density, land cover changes, and ecosystem productivity over a 14-year period (2010-2023).

### Key Features

- **Interactive Regional Map** - Explore Assaba's 5 districts with detailed administrative boundaries
- **Climate Analytics** - Track precipitation trends across 26 monitoring stations with statistical analysis
- **Population Insights** - Visualize demographic patterns and density changes over time
- **Land Cover Monitoring** - Monitor ecosystem changes using MODIS satellite data
- **Ecosystem Health** - Track Gross Primary Production (GPP) as an indicator of land productivity
- **Multi-language Support** - Accessible interface with translation capabilities
- **Real-time Visualizations** - Interactive charts and graphs powered by Recharts

## 🗺️ Study Area

**Assaba Region, Mauritania**
- **Districts Covered**: Boumdeid, Kankoussa, Barkéol (Aftout), Guerou, Kiffa
- **Monitoring Period**: 2010-2023
- **Data Resolution**: 1km pixel resolution for most datasets
- **Focus**: Semi-arid region vulnerable to desertification

## 📊 Data Sources

### Climate Data
- **Precipitation**: Normalized rainfall measurements (2010-2023)
- **Temporal Resolution**: Annual averages
- **Spatial Coverage**: 26 monitoring features across the region

### Population Data
- **Source**: GriddED Population Density datasets
- **Years Available**: 2000, 2005, 2010, 2015, 2020
- **Unit**: Population per square kilometer

### Satellite Imagery
- **MODIS Land Cover**: Annual land classification (2010-2023)
- **MODIS GPP**: Gross Primary Production measurements
- **Resolution**: 1km spatial resolution

### Infrastructure
- **Transportation**: Main road networks
- **Hydrology**: Stream and water body mapping
- **Administrative**: Regional and district boundaries

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Modern web browser

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/assaba-environmental-monitor.git
cd assaba-environmental-monitor

# Navigate to the dashboard
cd unccd-dashboard

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Building for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
├── unccd-dashboard/              # Next.js web application
│   ├── components/ui/           # Reusable UI components
│   ├── pages/                   # Application pages and API routes
│   ├── public/                  # Static assets and map layers
│   ├── utils/                   # Translation and utility functions
│   └── data/                    # Processed datasets
├── precipitation-data/          # Raw climate datasets
│   └── Precipitation_data/      # Annual precipitation TIFF files
├── transformed-data/            # Processed geospatial data
│   └── Transformed/            # Normalized TIFF layers
└── *.py                        # Data processing scripts
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + Shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React

### Data Processing
- **Languages**: Python
- **Geospatial**: GDAL, Rasterio (implied from TIFF processing)
- **Formats**: GeoTIFF, CSV, SVG vector layers

### Development Tools
- **Linting**: ESLint with Next.js configuration
- **Build Tool**: Next.js built-in bundler
- **Package Manager**: npm

## 📈 Key Insights & Analytics

The dashboard provides several analytical capabilities:

### Precipitation Analysis
- **Trend Detection**: Automatically calculates increasing/decreasing precipitation trends
- **Statistical Metrics**: Mean, standard deviation, and variability analysis
- **Regional Comparison**: Compare rainfall patterns across different districts
- **Temporal Visualization**: Multi-year time series with interactive controls

### Environmental Indicators
- **Land Cover Classification**: Track ecosystem type changes over time
- **Productivity Metrics**: Monitor vegetation health through GPP measurements
- **Population Pressure**: Analyze demographic impacts on land use

## 🎯 Use Cases

### For UNCCD Stakeholders
- Monitor progress toward land degradation neutrality targets
- Generate reports on regional environmental status
- Support evidence-based policy development

### For Local Authorities
- Track local environmental conditions
- Plan sustainable development initiatives
- Monitor climate adaptation effectiveness

### For Researchers
- Access processed multi-temporal datasets
- Analyze long-term environmental trends
- Support academic studies on desertification

## 🌐 Multi-language Support

The application includes internationalization support with translation utilities located in `utils/translations.js` and `utils/useTranslation.js`.

## 🤝 Contributing

This project was developed during Starthack 2025 as a solution for the UNCCD challenge. Future contributions should focus on:

- Additional environmental indicators
- Enhanced analytical capabilities  
- Mobile optimization
- API development for data access
- Integration with other monitoring systems

## 📄 License

This project was created for the UNCCD Starthack 2025 challenge. Please refer to the competition guidelines regarding usage and distribution rights.

## 👥 Team

Developed during **Starthack 2025** for the **United Nations Convention to Combat Desertification (UNCCD)** challenge.

## 🔗 Related Resources

- [UNCCD Official Website](https://www.unccd.int/)
- [Starthack 2025](https://starthack.eu/)
- [Mauritania Environmental Data](https://www.unccd.int/land-and-life/country-profiles/mauritania)

---

**Built with ❤️ for environmental sustainability and the fight against desertification.**