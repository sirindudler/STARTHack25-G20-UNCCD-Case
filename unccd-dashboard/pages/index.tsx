import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import { Progress } from "@/components/ui/progress";

import { ScrollArea } from "@/components/ui/scroll-area";

import { Badge } from "@/components/ui/badge";

import { Separator } from "@/components/ui/separator";
import Link from "next/link";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import unccd_logo from "../public/unccd_logo.svg";
import assaba_default from "../public/feature_layers/assaba_default.svg";

import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "@/utils/useTranslation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Type definitions
interface PrecipitationDataItem {
  year: number;
  feature: number;
  mean: number;
  std: number;
}

interface ChartDataItem {
  year: number;
  rainfall: number;
  std: number;
}

interface TrendResult {
  direction: string;
  percentage: number;
}

// Map the region codes from the UI to the feature IDs in the CSV
const regionToFeatureMap: Record<string, number> = {
  'boumeid': 0,  // Boumdeid
  'kankossa': 1, // Kankossa
  'aftout': 2,  // Barkéol - AKA Aftout
  'guerou': 3,   // Guerou
  'kiffa': 4,    // Kiffa
  // Default mappings for regions not in the CSV data
  'assaba': 4,   // Assaba - Using Kiffa data as default
};

// Raw precipitation data from the CSV
const precipitationData: PrecipitationDataItem[] = [
  { year: 2010, feature: 0, mean: 141.40884, std: 33.88568 },
  { year: 2010, feature: 1, mean: 424.94662, std: 29.337643 },
  { year: 2010, feature: 2, mean: 411.3583, std: 54.53192 },
  { year: 2010, feature: 3, mean: 390.18692, std: 43.102715 },
  { year: 2010, feature: 4, mean: 345.3449, std: 76.62251 },
  { year: 2011, feature: 0, mean: 63.387566, std: 13.505282 },
  { year: 2011, feature: 1, mean: 284.89865, std: 33.016678 },
  { year: 2011, feature: 2, mean: 187.40579, std: 37.111362 },
  { year: 2011, feature: 3, mean: 182.73125, std: 30.165611 },
  { year: 2011, feature: 4, mean: 188.88228, std: 45.12693 },
  { year: 2012, feature: 0, mean: 97.10061, std: 29.317152 },
  { year: 2012, feature: 1, mean: 503.27002, std: 43.714466 },
  { year: 2012, feature: 2, mean: 347.0691, std: 46.95946 },
  { year: 2012, feature: 3, mean: 336.8317, std: 39.718555 },
  { year: 2012, feature: 4, mean: 320.73938, std: 84.34201 },
  { year: 2013, feature: 0, mean: 83.477104, std: 21.707628 },
  { year: 2013, feature: 1, mean: 367.66833, std: 37.47414 },
  { year: 2013, feature: 2, mean: 246.49467, std: 38.794167 },
  { year: 2013, feature: 3, mean: 242.6511, std: 28.10459 },
  { year: 2013, feature: 4, mean: 246.88039, std: 62.956543 },
  { year: 2014, feature: 0, mean: 59.293926, std: 16.32382 },
  { year: 2014, feature: 1, mean: 355.32562, std: 39.458103 },
  { year: 2014, feature: 2, mean: 221.17365, std: 52.459785 },
  { year: 2014, feature: 3, mean: 201.26183, std: 30.690683 },
  { year: 2014, feature: 4, mean: 215.57281, std: 66.036385 },
  { year: 2015, feature: 0, mean: 79.36138, std: 22.679724 },
  { year: 2015, feature: 1, mean: 371.19336, std: 35.996758 },
  { year: 2015, feature: 2, mean: 202.93274, std: 39.651875 },
  { year: 2015, feature: 3, mean: 203.05682, std: 25.896189 },
  { year: 2015, feature: 4, mean: 230.59196, std: 54.072628 },
  { year: 2016, feature: 0, mean: 91.48764, std: 27.640648 },
  { year: 2016, feature: 1, mean: 424.55084, std: 47.88551 },
  { year: 2016, feature: 2, mean: 255.68367, std: 47.706318 },
  { year: 2016, feature: 3, mean: 268.78644, std: 34.752052 },
  { year: 2016, feature: 4, mean: 287.3975, std: 66.96966 },
  { year: 2017, feature: 0, mean: 69.68437, std: 11.604135 },
  { year: 2017, feature: 1, mean: 332.41388, std: 26.024097 },
  { year: 2017, feature: 2, mean: 200.16551, std: 43.770054 },
  { year: 2017, feature: 3, mean: 208.81546, std: 37.003937 },
  { year: 2017, feature: 4, mean: 211.60039, std: 61.164787 },
  { year: 2018, feature: 0, mean: 78.63274, std: 21.80756 },
  { year: 2018, feature: 1, mean: 391.11655, std: 50.10065 },
  { year: 2018, feature: 2, mean: 224.6726, std: 35.042286 },
  { year: 2018, feature: 3, mean: 222.90836, std: 20.99028 },
  { year: 2018, feature: 4, mean: 231.04248, std: 60.03273 },
  { year: 2019, feature: 0, mean: 52.464844, std: 13.745661 },
  { year: 2019, feature: 1, mean: 296.37738, std: 49.894573 },
  { year: 2019, feature: 2, mean: 157.58409, std: 32.076527 },
  { year: 2019, feature: 3, mean: 159.851, std: 24.088215 },
  { year: 2019, feature: 4, mean: 165.41852, std: 45.17934 },
  { year: 2020, feature: 0, mean: 81.67166, std: 24.658455 },
  { year: 2020, feature: 1, mean: 541.63983, std: 55.465363 },
  { year: 2020, feature: 2, mean: 312.7552, std: 71.58652 },
  { year: 2020, feature: 3, mean: 284.38168, std: 47.79157 },
  { year: 2020, feature: 4, mean: 331.81036, std: 100.45988 },
  { year: 2021, feature: 0, mean: 63.744755, std: 16.999496 },
  { year: 2021, feature: 1, mean: 324.30203, std: 34.46028 },
  { year: 2021, feature: 2, mean: 237.27635, std: 37.526928 },
  { year: 2021, feature: 3, mean: 207.60844, std: 34.964558 },
  { year: 2021, feature: 4, mean: 202.32378, std: 57.43249 },
  { year: 2022, feature: 0, mean: 89.22108, std: 20.993336 },
  { year: 2022, feature: 1, mean: 506.49216, std: 30.61227 },
  { year: 2022, feature: 2, mean: 240.99869, std: 54.63834 },
  { year: 2022, feature: 3, mean: 232.93425, std: 22.28541 },
  { year: 2022, feature: 4, mean: 293.7181, std: 92.06574 },
  { year: 2023, feature: 0, mean: 79.33613, std: 19.290197 },
  { year: 2023, feature: 1, mean: 372.53757, std: 46.620094 },
  { year: 2023, feature: 2, mean: 221.73122, std: 37.261475 },
  { year: 2023, feature: 3, mean: 213.7821, std: 23.861023 },
  { year: 2023, feature: 4, mean: 228.85042, std: 59.655636 }
];

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  // State hooks
  const [selectedDataType, setSelectedDataType] = useState("rainfall");
  const [selectedMapStyle, setSelectedMapStyle] = useState("default");
  const [currentTimestamp, setCurrentTimestamp] = useState(2010); // Initialize with a default value

  const handleSliderChange = (value) => {
    setCurrentTimestamp(value[0]); // Update the state with the new slider value
  };

  const [currentLanguage, setCurrentLanguage] = useState("en");
  const { t } = useTranslation(currentLanguage);
  const [currentRegion, setCurrentRegion] = useState("assaba");

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'العربية' },
    { code: 'fr', name: 'Français' }
  ];

  const regions = [
    { code: 'assaba', name: 'Assaba' },
    { code: 'boumeid', name: 'Boumeid' },
    { code: 'kiffa', name: 'Kiffa' },
    { code: 'kankossa', name: 'Kankossa' },
    { code: 'guerou', name: 'Guerou' },
    { code: 'aftout', name: 'Aftout' },
  ];

  
  // ========== RainfallChart Component Integrated ==========
    // Get precipitation data for a specific region
    const getPrecipitationDataForRegion = useMemo(() => {
      return (regionCode: string): PrecipitationDataItem[] => {
        // Special case for Assaba - aggregate all regions
        if (regionCode === 'assaba') {
          // Group data by year
          const yearGroups: Record<number, PrecipitationDataItem[]> = {};
          
          precipitationData.forEach(item => {
            if (!yearGroups[item.year]) {
              yearGroups[item.year] = [];
            }
            yearGroups[item.year].push(item);
          });
          
          // Calculate average for each year across all features
          return Object.entries(yearGroups).map(([year, items]) => {
            const numericYear = parseInt(year);
            const totalMean = items.reduce((sum, item) => sum + item.mean, 0);
            const totalStd = items.reduce((sum, item) => sum + item.std, 0);
            const count = items.length;
            
            return {
              year: numericYear,
              feature: -1, // Using -1 to indicate aggregate data
              mean: totalMean / count,
              std: totalStd / count
            };
          }).sort((a, b) => a.year - b.year);
        }
        
        // Normal case for other regions
        const featureId = regionToFeatureMap[regionCode];
    
      if (featureId === undefined) {
        console.warn(`No feature ID mapping found for region: ${regionCode}, using default region`);
        return precipitationData.filter(item => item.feature === 0);
      }
    
      return precipitationData.filter(item => item.feature === featureId);
    
    };
    }, []);
  // Get formatted data for the rainfall chart
const getChartData = (regionCode: string): PrecipitationDataItem[] => {
  const regionData = getPrecipitationDataForRegion(regionCode);

  // Sort by year
  return [...regionData].sort((a, b) => a.year - b.year);
};
  const chartData = useMemo(() => getChartData(currentRegion), [currentRegion]);
  // Format data for the chart
  const formattedData = useMemo(() => {
    return chartData.map(item => ({
      year: item.year,
      rainfall: item.mean,
      std: item.std
    }));
  }, [chartData]);
  // Calculate min and max values for better chart scaling
  const maxValue = useMemo(() =>
    Math.max(...formattedData.map(item => item.rainfall + item.std)),
    [formattedData]);



  // calculate maxValue rounded up to the next 50
  const roundedMaxValue = useMemo(() => Math.ceil(maxValue / 50) * 50, [maxValue]);

  const minValue = useMemo(() =>
    Math.max(0, Math.min(...formattedData.map(item => item.rainfall - item.std))),
    [formattedData]);

  // Custom tooltip formatter that ensures we're working with numbers
  const tooltipFormatter = (value: number) => {
    return [`${value.toFixed(1)} mm`, 'Rainfall'];
  };
  // Calculate year-over-year trend
const getPrecipitationTrend = (regionCode: string): TrendResult => {
  const regionData = getPrecipitationDataForRegion(regionCode);

  // Sort by year
  const sortedData = [...regionData].sort((a, b) => a.year - b.year);

  // Need at least 2 years of data to calculate trend
  if (sortedData.length < 2) return { direction: "n/a", percentage: 0 };

  // Get first and last year data points
  const firstYearData = sortedData[0];
  const lastYearData = sortedData[sortedData.length - 1];

  const percentChange = ((lastYearData.mean - firstYearData.mean) / firstYearData.mean * 100);


  return {
    direction: percentChange >= 0 ? "up" : "down",
    percentage: Math.abs(Number(percentChange.toFixed(1)))
  };
};

  // Calculate the average precipitation for a region
  const getAveragePrecipitation = (regionCode: string): string => {
    const regionData = getPrecipitationDataForRegion(regionCode);
    const sum = regionData.reduce((total, item) => total + item.mean, 0);
    return (sum / regionData.length).toFixed(1);
  };
  const trend = useMemo(() => getPrecipitationTrend(currentRegion), [currentRegion]);
  const avgPrecipitation = useMemo(() => getAveragePrecipitation(currentRegion), [currentRegion]);











  // Calculate rainfall data for the current region
  






  return (
    <div className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
      {/* Navigation Bar */}
      <nav className="bg-gray-100 p-4 border-b border-gray-200">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
          <Image src={unccd_logo} alt="UNCCD Logo" width={232.58} height={64} />
          </Link>

          <div className="mx-auto">
            <Select
              value={currentRegion}
              onValueChange={setCurrentRegion}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
      {regions.map((region) => (
        <SelectItem key={region.code} value={region.code}>
          {t(`${region.code}`)}
        </SelectItem>
      ))}
    </SelectContent>
            </Select>
          </div>

          <ul className="flex space-x-4">
            <Select
              value={currentLanguage}
              onValueChange={setCurrentLanguage}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((language) => (
                  <SelectItem key={language.code} value={language.code}>
                    {language.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side - Map Section with Tabs */}
          <div className="lg:w-1/2 w-full h-[70vh] lg:h-[85vh]">
            <Card className="h-full relative">
              {/* Map Mockup */}
              <div className="absolute inset-0 rounded-md overflow-hidden border border-gray-200 m-2 flex flex-col border-gray-200">
                <div className="z-10 m-2 flex justify-between items-center space-x-4">
                  <Select
                  value={selectedDataType}
                  onValueChange={setSelectedDataType}
                  >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('selectDataType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rainfall">{t('rainfall')}</SelectItem>
                    <SelectItem value="lcc">{t('LCC')}</SelectItem>
                    <SelectItem value="pop">{t('Population Density')}</SelectItem>
                    <SelectItem value="gpp">{t('GPP')}</SelectItem>
                  </SelectContent>
                  </Select>

                  {selectedDataType === "rainfall" && (
                  <Slider
                    defaultValue={[2010]}
                    min={2010}
                    max={2023}
                    step={1}
                    onValueChange={handleSliderChange}
                    className="w-64"
                  />
                  )}

                  {selectedDataType === "lcc" && (
                  <Slider
                    defaultValue={[2010]}
                    min={2010}
                    max={2023}
                    step={1}
                    onValueChange={handleSliderChange}
                    className="w-64"
                  />
                  )}

                  {selectedDataType === "pop" && (
                  <Slider
                    defaultValue={[2010]}
                    min={2010}
                    max={2020}
                    step={5}
                    onValueChange={handleSliderChange}
                    className="w-64"
                  />
                  )}
                  {selectedDataType === "gpp" && (
                    <Badge className="bg-blue-500 text-white">
                      {t("negligible change in GPP over time")}
                    </Badge>
                  )}
                </div>
                
                <div className="relative flex-grow">
                  {/* Map style i.e. default or satellite */}
                  {selectedMapStyle === "default" && (
                    <Image
                      src={assaba_default}
                      alt="Assaba Default"
                      layout="fill"
                      objectFit="contain"
                    />
                  )}
                  {selectedMapStyle === "satellite" && (
                    <Image
                      src="/feature_layers/assaba_sat.png"
                      alt="Satellite"
                      layout="fill"
                      objectFit="contain"
                      style={
                        {
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: '100%',
                          height: '100%',
                          transform: 'scale(1.05, 1) translate(0%, 0)',
                                            }
                      }
                    />
                  )}
                  {/* Interactive SVG Map */}
                  <div className="absolute inset-0">
                    {/* Add click handlers to each region */}
                    {regions.map((region) => (
                      <div
                      key={region.code}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        cursor: 'pointer',
                        background: 'none',
                        pointerEvents: 'none',

                      }}
                      >
                      <svg
                      viewBox="0 0 500 760"
                        style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '100%',
                        height: '100%',
                        transform: 'scale(1.05, 1) translate(-1%, 0)',
                  
                        pointerEvents: 'none',
                        
                        }}
                      >
                        <path
                        onClick={() => setCurrentRegion(region.code)}
                        id={region.code}
                        d={
                          region.code === 'assaba' ? "M409.609 200.266L409.393 198.355L408.268 196.299L407.422 194.965L405.943 190.921L404.617 188.838L404.007 186.732L402.357 182.718L402.095 181.671L401.831 178.56L402.238 177.07L402.108 175.089L402.447 171.706L402.308 170.263L401.606 167.156L400.629 164.593L399.649 162.901L399.063 161.398L398.293 159.989L397.536 159.096L397.089 158.273L396.416 156.144L396.638 154.878L397.122 153.96L397.202 152.692L397.84 150.446L398.412 147.427L398.633 144.688L400.347 136.193L415.488 50.9551L423.653 9L422.454 9.26838L420.584 11.0176L416.153 13.6011L415.173 14.4402L414.114 14.9601L413.002 14.956L411.832 14.3204L411.36 13.1594L410.405 12.2024L409.699 11.7289L408.003 11.5683L405.417 12.8765L398.227 16.2492L397.016 16.4968L395.171 17.7935L394.164 19.8481L392.713 22.2663L389.84 22.4052L388.214 22.9076L386.864 23.7416L385.172 25.5797L383.215 27.6015L382.255 30.2879L381.402 31.8629L380.298 32.8686L379.117 34.3829L378.454 36.0673L377.551 37.4724L376.065 38.9895L375.098 40.172L371.889 43.8401L371.387 44.6577L371.571 45.692L371.932 46.2668L372.761 46.2837L374.459 45.4019L378.655 43.205L379.89 44.0741L379.223 45.6514L375.046 49.6638L373.614 50.3831L371.576 52.301L371.813 53.8488L373.302 57.5113L373.357 58.3363L373.222 59.2989L372.132 60.3899L371.408 60.2826L371.24 59.0972L370.223 57.9389L369.241 57.6496L365.088 57.9316L364.039 58.1612L362.84 58.1501L361.961 57.4585L360.883 56.937L359.9 56.895L358.413 57.3374L356.651 58.5122L354.266 60.7465L353.603 61.6036L352.515 62.469L351.855 62.8636L350.677 63.1098L348.133 63.8465L346.093 65.4205L343.606 67.0253L342.363 68.091L341.788 68.4284L340.548 67.6992L340.967 65.3915L340.717 64.317L340.392 63.5578L337.658 63.0995L335.722 63.1966L334.104 63.645L332.661 64.6334L332.219 65.0186L331.573 64.4135L331.236 63.891L330.712 63.6028L327.897 61.1278L326.037 60.1468L321.678 61.2762L317.504 62.9562L316.486 63.1307L314.488 63.0585L313.448 62.6643L312.89 61.5393L311.777 61.7932L310.936 62.2928L309.14 62.9103L308.903 64.0709L308.885 64.9635L307.279 67.0448L306.786 68.3242L306.718 69.0795L307.355 71.6089L307.678 72.3144L307.715 73.237L307.438 73.948L306.437 73.4553L305.601 72.7296L304.523 70.8756L304.494 69.8773L303.265 70.4911L302.27 71.234L301.516 71.9983L299.94 72.391L298.446 71.297L295.927 71.0226L295.305 70.7494L294.846 70.168L294.395 69.812L293.835 69.7081L294.23 73.5377L294.447 74.3233L293.725 77.2465L293.997 78.3198L294.514 79.2424L295.593 80.3011L296.334 80.2993L296.494 80.7059L294.504 81.9511L293.622 81.9798L292.319 82.3709L291.559 82.4692L290.429 83.0893L289.02 84.3881L287.544 88.3335L287.047 89.237L285.692 91.0705L285.261 91.9926L284.964 93.0161L285.532 94.1298L286.59 94.6629L287.921 94.6896L289.363 94.4854L290.235 94.4789L291.317 94.8281L292.006 97.022L292.54 100.534L294.365 103.344L294.831 104.354L295.806 105.547L296.85 106.564L298.063 107.982L300.594 110.169L302.218 110.419L303.607 111.077L304.612 112.214L306 112.561L309.128 114.41L310.029 115.401L309.576 117.514L309.435 117.995L309.609 118.742L309.033 120.731L307.797 122.695L307.509 122.946L306.755 123.355L305.298 123.026L304.414 122.987L303.633 122.492L302.663 121.629L301.965 121.275L301.162 121.133L300.403 121.462L300.022 122.006L300.006 122.753L300.783 123.92L300.82 124.604L301.52 126.48L302.072 127.456L302.801 128.432L303.366 129.523L306.527 131.857L307.646 133.1L308.047 133.937L308.398 134.397L308.776 134.799L308.435 134.875L308.321 135.065L308.52 135.736L308.276 136.813L308.971 136.852L309.401 136.548L310.747 137.88L310.352 138.88L309.668 139.374L309.136 139.842L309.287 140.07L309.602 140.146L311.118 140.034L311.775 140.086L314.014 142.445L314.263 143.319L314.837 143.684L315.372 144.017L316.416 145.184L317.194 146.376L317.255 147.035L317.518 147.681L318.297 148.746L318.421 149.367L318.193 149.506L317.003 150.151L317.254 150.506L318.542 150.507L319.467 149.85L319.935 149.787L320.174 150.028L320.084 150.484L319.82 150.826V151.012L321.036 152.428L322.848 155.332L323.285 155.985L323.69 156.65L324.454 157.345L324.508 157.785L324.143 157.865L323.052 158.558L322.791 158.954L323.059 160.008L323.067 161.223L323.577 161.903L323.977 162.402L324.563 164.114L327.377 168.419L327.776 169.568L326.882 170.382L326.16 170.855L325.008 171.218L322.507 172.748L321.467 173.181L319.101 174.243L316.992 177.099L316.247 177.809L315.044 177.466L314.376 177.108L313.494 177.148L311.644 178.026L310.347 178.868L309.499 179.991L308.847 180.321L308.324 179.796L307.945 178.234L307.506 177.361L307.039 176.866L305.769 176.192L304.759 176.549L304.277 176.506L304.063 177.397L304.272 178.258L305.103 179.93L305.539 181.028L305.449 182.289L304.866 183.25L304.11 183.155L303.511 182.354L302.894 181.93L302.232 182.013L302.161 183.22L302.598 184.319L303.788 185.437L303.577 185.898L302.745 186.343L302.846 186.951L303.635 187.045L306.555 185.915L307.419 185.995L308.146 186.435L308.811 187.512L309.805 187.576L309.36 184.93L309.692 184.496L313.477 184.016L314.081 183.312L315.277 183.226L317.067 184.092L317.95 184.88L318.268 186.543L317.683 187.46L316.782 187.812L315.587 188.747L314.885 190.519L314.938 191.559L315.292 193.317L315.668 194.246L314.973 194.599L314.122 194.293L311.742 193.411L310.501 192.649L309.437 190.601L308.875 189.906L308.075 189.534L306.868 189.63L306.225 190.981L306.331 192.513L307.48 195.589L308.232 196.942L308.593 198.054L307.4 198.483L306.438 198.129L304.167 196.715L302.947 196.468L303.035 198.098L303.868 199.823L305.203 201.58L306.006 203.091L305.735 204.479L303.558 204.856L305.576 208.914L306.205 209.649L307.478 209.949L308.509 209.997L308.539 210.686L309.213 211.782L310.809 212.958L311.051 213.807L309.973 214.661L308.803 215.39L307.743 216.405L307.003 217.802L306.03 218.813L304.02 220.869L303.049 221.385L302.964 225.226L301.994 226.043L301.465 227.507L301.449 231.172L300.094 232.167L298.654 232.414L292.685 233.917L290.339 236.02L288.534 237.218L284.659 239.799L300.164 271.047L291.711 282.607L250.93 278.664L221.675 289.893L219.901 289.942M269.635 541.954L287.859 550.312L276.814 564.972L290.863 575.124L288.874 576.739L285.337 583.431L284.453 585.739V590.354L282.464 593.124L281.58 596.124L280.032 599.124L276.716 601.431L275.169 602.816L272.738 606.047L270.969 610.2L270.748 612.047V615.047L270.969 616.431L269.864 619.662L269.643 621.97V627.508L266.991 634.893L265.586 636.694L268.282 639.445L268.983 640.471L270.676 643.204L271.548 646.612L271.715 648.139L271.434 649.938L270.907 651.792L272.932 651.635L275.169 652.2L279.5 651.258L326.673 628.431L347.673 658.2L400.899 706.278L402.127 726.427L436.013 743.371L436.487 744.768L436.737 745.948L439.628 748.2L439.837 747.907L442.805 743.598L443.394 742.263L443.964 740.398L446.039 727.431L448.884 725.322L453.333 723.507L454.973 719.99L455.765 714.969L455.323 709.431L458.859 708.277L462.175 702.277L468.807 701.584L470.575 697.2L473.712 695.787L476.543 693.507L478.419 689.99L479.417 685.431L477.043 674.323L479.417 671.815L482.635 672.725L490.027 673.662L492.807 676.232L494.218 677L495.868 677.359L499.466 676.977L501.037 676.482L502.486 676.407L503.718 676.806L504.882 675.961L508.816 674.584L499.251 615.653L489.702 554.762L489.29 553.306L487.013 551.695L486.749 549.763L485.959 549.528L484.917 549.965L484.285 549.352L483.875 548.068L484.008 546.804L486.8 544.339L485.428 543.955L483.207 543.841L481.536 543.406L478.362 543.056L477.12 542.592L474.254 541.067L472.808 540.613L471.536 539.868L470.405 538.832L469.66 537.984L468.592 537.165L467.619 536.649L466.81 534.017L467.336 532.357L467.892 531.054L467.86 529.498L467.092 528.747L466.52 527.565L466.732 526.367L467.243 525.463L468.293 522.511L469.296 521.763L471.522 519.425L472.767 517.89L473.056 516.412L474.45 511.691L474.131 509.744L474.114 507.366L473.781 505.862L473.318 504.508L472.911 502.722L473.103 501.372L472.746 500.203L471.224 498.321L470.21 497.384L467.719 494.349L466.59 491.531L465.237 490.083L463.441 488.934L461.781 488.37L460.134 487.557L455.796 486.356L454.351 485.739L453.175 485.081L452.001 484.089L450.872 482.815L450.506 481.375L451.729 479.743L453.742 478.067L455.455 477.11L454.303 475.952L454.258 475.879L453.284 474.294L453.258 473.285L452.938 472.095L452.183 471.453L451.448 471.441L450.566 471.777L448.428 472.573L448.723 471.387L449.674 469.911L450.378 469.24L450.527 468.37L447.64 467.581L446.959 466.124L447.399 465.175L448.387 464.74L449.475 464.466L451.888 464.708L452.832 464.925L453.836 464.858L454.694 464.457L454.627 463.547L453.836 463.415L452.556 463.8L452.212 463.218L452.178 462.415L451.95 461.583L453.682 458.133L453.766 457.242L454.066 456.349L456.69 454.754L457.35 455.495L457.892 454.87L458.373 453.768L458.146 453.098L458.118 451.905L458.286 450.829L458.127 449.594L457.718 448.991L453.912 450.307L452.776 450.223L451.864 449.952L452.132 449.081L453.583 448.51L455.988 447.471L456.961 446.776L457.727 445.92L457.987 445.256L457.587 444.533L456.788 443.859L455.146 443.196L453.981 443.297L451.477 444.239L450.697 444.856L450.152 446.034L449.901 447.328L449.244 448.172L447.051 448.242L445.064 447.637L443.626 446.124L441.417 445.12L440.922 444.508L441.04 443.736L441.93 443.28L443.171 443.167L445.573 444.071L447.481 444.472L449.562 443.394L450.109 442.411L450.19 441.27L449.69 440.387L448.705 439.531L448.16 439.201L447.181 439.56L446.093 439.747L445.489 439.136L445.358 438.28L444.858 437.396L444.598 436.618L444.926 435.388L445.857 434.075L445.509 433.211L443.528 432.237L442.144 432.199L439.588 432.534L438.604 433.273L437.933 433.943L437.092 434.051L436.765 433.154L437.037 431.806L435.809 431.354L433.872 431.579L433.272 431.442L432.506 431.596L431.444 432.368L428.783 435.627L427.219 436.612L425.804 437.334L421.67 438.469L420.976 438.272L420.786 437.851L421.419 436.802L422.621 435.55L424.173 434.49L425.569 434.625L426.662 433.982L428.318 431.249L429.325 429.946L429.907 428.355L430.755 427.932L431.662 427.183L434.078 426.883L438.577 426.351L440.005 426.431L441.89 428.188L443.12 425.851L444.488 426.29L447.041 425.706L450.929 427.742L453.443 428.872L455.242 428.525L457.022 427.56L458.059 426.798L460.791 425.181L461.501 425.704L461.484 426.713L461.149 427.477L462.21 427.562L463.7 426.73L464.924 425.511L467.88 424.401L469.059 422.314L469.987 421.424L470.227 420.162L470.008 418.483L470.895 417.105L472.412 415.926L473.472 415.346L469.298 405.623L466.045 406.303L464.604 406.06L463.622 405.486L461.97 404.844L459.264 404.562L430.919 390.288L425.16 386.57L429.238 385.558L444.595 385.416L444.663 384.905L445.176 383.781L445.404 382.4L446.07 380.667L446.214 378.712L444.787 377.2L443.673 377.126L442.555 376.12L442.336 374.484L441.847 372.787L440.726 371.552L439.711 370.198L438.028 368.905L436.492 368.088L434.683 367.806L433.464 367.962L431.474 367.878L430.278 366.634L429.456 362.998L429.303 361.416L428.375 360.071L426.453 358.727L424.516 357.828L423.078 356.283L423.192 355.262L423.021 353.897L421.207 352.595L421.248 351.683L420.287 350.306L419.784 346.97L420.014 344.298L420.739 342.857L420.807 340.892L419.437 337.437L419.235 336.18L419.64 334.374L420.271 333.184L420.475 331.608L419.63 330.067L419.151 328.369L418.359 322.335L418.242 320.264L418.587 318.741L418.6 317.45L418.171 315.437L418.156 310.847L419.012 307.321L419.321 305.56L419.76 302.397L421.136 296.065L421.499 291.374L421.527 283.811L420.442 282.066L419.247 280.876L416.252 279.361L415.196 278.082L414.606 276.95L414.59 275.855L414.155 273.484L416.187 266.254L416.609 263.136L417.204 260.627L418.051 258.866L418.991 254.088L419.441 253.266L421.459 247.712L422.283 244.788L421.185 241.729L419.945 239.582L419.451 238.295L419.402 237.262L419.478 236.488L419.945 233.817L420.971 231.659L421.181 229.823L421.366 227.395L421.296 222.78L419.415 219.193L418.348 217.662L415.665 214.795L415.323 214.134L414.877 211.783L414.572 210.736L411.93 205.149L410.553 202.849L409.608 200.266M193.604 527.556L192.41 528.798L190.786 529.613L188.219 529.823L185.607 529.54L183.41 528.718L183.277 527.463L182.952 526.296L182.444 525.109L181.659 523.912L179.983 522.228L179.155 520.967L177.329 519.177L173.523 517.271L172.032 516.466L170.596 515.906L168.272 515.3L166.493 514.657L164.707 514.873L163.309 515.944L162.084 517.229L160.54 516.542L159.605 515.571L155.632 514.675L152.933 514.103L151.293 513.395L147.059 514.313L144.862 510.562L143.372 506.892L143.827 505.43L143.982 504.034L143.963 501.76L143.324 496.914L143.347 494.404L142.918 491.124L142.441 489.582L141.666 488.353L140.517 487.149L138.493 486.84L137.145 486.924L134.102 485.796L131.545 483.045L130.709 482.675L129.126 482.846L124.079 484.049L122.337 484.565L120.617 485.37L117.703 487.417L116.297 489.025L114.622 490.431L113.418 491.716L112.447 492.451L111.079 492.954L109.199 493.954L105.591 496.434L104.009 496.852L102.745 496.517L101.756 495.419L101.409 494.016L101.242 492.44L100.763 491.586L101.205 488.586L101.782 487.844L101.445 486.495L100.596 485.449L100.527 484.087L101.144 483.214L101.913 482.887L102.694 482.774L103.067 482.45L103.868 482.059L103.973 481.264L103.766 477.403L104.336 475.307L105.589 472.842L105.746 471.693L105.866 469.525L104.937 464.252L104.091 461.254L103.248 459.017L103.092 457.366L103.279 455.755L103.154 454.018L103.714 451.998L103.181 449.727L101.936 448.544L100.879 446.266L99.7503 445.029L99.968 443.161L100.552 441.858L100.717 440.216L48.8409 429.165L46.9202 430.647L45.1799 431.7L41.9261 434.382L40.4104 435.411L39.1626 436.535L35.8261 437.169L33.7854 436.201L33.3433 435.74L32.0172 435.278L31.3541 435.509H30.4699L29.1434 435.97L26.8085 436.344L26.1361 433.662L26.0952 432.42L26.543 431.668L26.8032 430.54L25.7647 428.371L26.8414 427.514L27.9066 427.283L28.9347 426.74L30.4447 424.871L32.191 419.671L33.3059 417.841L33.567 416.076L33.0128 414.819L32.6839 414.283L30.8815 413.173L30.0333 412.244L29.5028 411.116L29.3675 409.994L29.698 409.244L29.6657 407.872L28.0094 405.15L26.7726 401.935L26.7114 400.758L26.5162 399.896L23.3565 393.315L22.4752 392.311L20.4577 391.106L18.3752 390.529L16.0947 390.279L15.1371 389.86L11.4598 386.398L10.6846 385.36L10.1561 384.362L10 383.273L10.0296 380.376L10.4911 377.084L11.9764 373.649L12.3053 370.079L12.3462 368.231L13.9779 366.505L14.2377 365.094L16.6616 348.53L15.8903 327.556L16.788 324.396L17.5847 322.803L18.6702 321.208L20.368 317.335L25.0684 312.282L26.8699 310.415L28.2673 309.257L29.6124 308.347L31.0817 306.353L32.2539 305.057L33.6273 303.16L35.7816 301.193L39.8895 300.898L41.999 301.217L44.8027 301.273L46.9423 301.098L49.4766 300.598L51.1654 300.062L54.0686 298.079L56.3513 296.133L59.0328 294.935L62.292 293.68L63.8727 292.875L65.5581 291.459L67.1665 289.442L68.9256 287.713L70.4621 286.48L72.6968 286.047L76.6134 286.021L78.6015 285.439L82.5429 283.472L83.7684 282.112L85.2063 277.414L86.0883 275.766L88.9623 271.66L93.4657 268.326L95.4319 267.583L97.1221 267.39L98.3635 267.456L99.583 267.352L100.586 266.616L101.651 265.117L103.294 263.916L104.789 263.026L106.112 261.987L111.06 260.195L112.906 258.917L114.832 258.657L117.508 258.994L119.574 259.173L122.698 259.088L132.876 259.395L132.992 259.469L133.162 259.633L134.499 260.318L136.949 261.998L138.666 263.502L141.436 265.002L144.856 266.389L147.324 266.793L148.717 267.093L150.278 267.727L151.816 268.842L188.335 281.712L199.422 286.675L206.71 289.791L213.147 292.621L217.146 290.847L218.258 289.987L219.948 289.979L221.729 290.523M269.635 542.953L268.096 540.585L266.769 538.97L263.576 538.2L262.569 535.739L259.696 536.431L256.601 535.97L255.275 534.816L254.17 533.201L251.517 532.508L250.191 531.816H249.528L248.865 532.508L246.891 530.699L245.619 531.181L244.545 532.853L243.56 536.893L240.125 535.991L239.5 535.137L239.303 534.034L236.265 533.432V535.047L237.37 536.662L237.31 537.92L236.928 538.739L236.707 540.124L236.265 541.509L236.928 542.662L238.475 544.97L240.443 546.606L240.686 547.047L240.907 547.97L241.128 549.585L241.57 550.97L240.907 552.585H239.802L238.696 553.97V555.124L237.37 555.816L236.383 555.83L236.265 555.585L234.054 556.047L232.507 556.739L231.844 557.893V559.508L232.065 560.662L232.728 561.585L233.612 562.509V564.816H232.507L230.739 564.585H228.97L226.981 564.124L225.212 563.431L224.107 563.201L222.781 562.739L219.907 563.201L215.929 564.354L213.939 564.585L211.95 565.047L208.413 566.432L207.529 566.201L206.645 565.047L205.318 561.585L203.771 559.97L202.666 558.585L201.34 557.893H199.35L194.929 557.431L194.646 555.885L195.143 554.099L195.226 551.483L194.893 549.413L193.91 547.253L194.037 545.861L192.896 544.471L192.646 543.377L195.156 537.298L195.74 533.847L195.709 531.521L195.303 530.35L193.604 528.556L192.857 529.4" :
                          region.code === 'boumeid' ? "M405.786 204.45L390.707 220.047L352.066 220.825L299.806 271.647L284.301 240.399L288.176 237.818L289.982 236.62L292.328 234.517L298.296 233.014L299.736 232.767L301.092 231.772L301.107 228.107L301.637 226.643L302.607 225.826L302.691 221.985L303.663 221.469L305.673 219.413L306.646 218.402L307.385 217.005L308.446 215.99L309.616 215.261L310.693 214.407L310.452 213.558L308.856 212.382L308.181 211.286L308.152 210.597L307.121 210.549L305.848 210.249L305.218 209.514L303.201 205.456L305.377 205.079L305.648 203.691L304.846 202.18L303.51 200.423L302.677 198.698L302.589 197.068L303.81 197.315L306.08 198.729L307.043 199.083L308.236 198.654L307.875 197.542L307.122 196.189L305.973 193.113L305.868 191.581L306.511 190.23L307.717 190.134L308.517 190.506L309.079 191.201L310.143 193.249L311.384 194.011L313.764 194.893L314.616 195.199L315.31 194.846L314.935 193.917L314.58 192.159L314.528 191.119L315.23 189.347L316.424 188.412L317.326 188.06L317.91 187.143L317.592 185.48L316.71 184.692L314.92 183.826L313.724 183.912L313.12 184.616L309.334 185.096L309.003 185.53L309.448 188.176L308.453 188.112L307.788 187.035L307.062 186.595L306.197 186.515L303.277 187.645L302.488 187.551L302.388 186.943L303.22 186.498L303.43 186.037L302.24 184.919L301.803 183.82L301.875 182.613L302.536 182.53L303.153 182.954L303.752 183.755L304.509 183.85L305.091 182.889L305.182 181.628L304.745 180.53L303.914 178.858L303.705 177.997L303.92 177.106L304.401 177.149L305.412 176.792L306.682 177.466L307.149 177.961L307.588 178.834L307.967 180.396L308.49 180.921L309.141 180.591L309.99 179.468L311.286 178.626L313.137 177.748L314.018 177.708L314.687 178.066L315.889 178.409L316.635 177.699L318.743 174.843L321.11 173.781L322.15 173.348L324.65 171.818L325.802 171.455L326.524 170.982L327.418 170.168L327.02 169.019L324.206 164.714L323.619 163.002L323.22 162.503L322.709 161.823L322.702 160.608L322.434 159.554L322.695 159.158L323.785 158.465L324.151 158.385L324.096 157.945L323.333 157.25L322.927 156.585L322.491 155.932L320.679 153.028L319.463 151.612V151.426L319.726 151.084L319.816 150.628L319.577 150.387L319.11 150.45L318.185 151.107L316.897 151.106L316.645 150.751L317.835 150.106L318.063 149.967L317.939 149.346L317.16 148.281L316.898 147.635L316.837 146.976L316.058 145.784L315.014 144.617L314.48 144.284L313.906 143.919L313.656 143.045L311.417 140.686L310.761 140.634L309.244 140.746L308.929 140.67L308.778 140.442L309.311 139.974L309.995 139.48L310.39 138.48L309.044 137.148L308.613 137.452L307.918 137.413L308.163 136.336L307.963 135.665L308.078 135.475L308.419 135.399L308.04 134.997L307.69 134.537L307.289 133.7L306.169 132.457L303.008 130.123L302.444 129.032L301.715 128.056L301.163 127.08L300.463 125.204L300.425 124.52L299.649 123.353L299.665 122.606L300.046 122.062L300.805 121.733L301.608 121.875L302.306 122.229L303.275 123.092L304.056 123.587L304.941 123.626L306.397 123.955L307.151 123.546L307.44 123.295L308.676 121.331L309.252 119.342L309.078 118.595L309.219 118.114L309.671 116.001L308.77 115.01L305.643 113.161L304.255 112.814L303.25 111.677L301.86 111.019L300.236 110.769L297.706 108.582L296.493 107.164L295.449 106.147L294.474 104.954L294.008 103.943L292.183 101.134L291.648 97.622L290.96 95.4281L289.877 95.0789L289.005 95.0854L287.564 95.2896L286.232 95.2629L285.175 94.7298L284.607 93.6161L284.903 92.5926L285.335 91.6705L286.689 89.837L287.187 88.9336L288.663 84.9881L290.071 83.6893L291.202 83.0692L291.961 82.9709L293.264 82.5798L294.146 82.5511L296.136 81.3059L295.976 80.8993L295.235 80.9011L294.157 79.8424L293.64 78.9198L293.368 77.8464L294.089 74.9233L293.872 74.1377L293.477 70.3081L294.038 70.412L294.488 70.768L294.948 71.3494L295.569 71.6226L298.088 71.897L299.582 72.991L301.158 72.5983L301.912 71.834L302.907 71.0911L304.136 70.4773L304.166 71.4756L305.244 73.3296L306.08 74.0553L307.081 74.548L307.357 73.837L307.32 72.9144L306.997 72.2089L306.361 69.6795L306.428 68.9242L306.922 67.6448L308.528 65.5635L308.546 64.6709L308.783 63.5103L310.578 62.8928L311.42 62.3932L312.532 62.1393L313.09 63.2643L314.131 63.6585L316.129 63.7307L317.147 63.5562L321.32 61.8762L325.679 60.7468L327.539 61.7278L330.354 64.2028L330.878 64.491L331.216 65.0135L331.862 65.6186L332.304 65.2334L333.747 64.245L335.364 63.7966L337.301 63.6995L340.034 64.1578L340.359 64.917L340.61 65.9915L340.19 68.2992L341.43 69.0284L342.005 68.691L343.249 67.6253L345.735 66.0205L347.776 64.4465L350.319 63.7098L351.497 63.4636L352.157 63.069L353.245 62.2036L353.909 61.3465L356.293 59.1122L358.056 57.9374L359.542 57.495L360.525 57.537L361.604 58.0585L362.482 58.7501L363.682 58.7612L364.73 58.5316L368.884 58.2496L369.866 58.5389L370.883 59.6972L371.051 60.8826L371.774 60.9899L372.864 59.8989L373 58.9363L372.945 58.1113L371.456 54.4488L371.219 52.901L373.256 50.9831L374.688 50.2638L378.865 46.2514L379.532 44.6741L378.298 43.805L374.102 46.0019L372.404 46.8837L371.575 46.8668L371.213 46.292L371.03 45.2577L371.531 44.4401L374.741 40.772L375.707 39.5895L377.194 38.0724L378.097 36.6673L378.759 34.9829L379.941 33.4686L381.045 32.4629L381.897 30.8879L382.857 28.2015L384.814 26.1797L386.506 24.3416L387.857 23.5076L389.483 23.0052L392.356 22.8663L393.806 20.4481L394.813 18.3935L396.658 17.0968L397.869 16.8492L405.059 13.4765L407.645 12.1682L409.342 12.3289L410.048 12.8024L411.002 13.7594L411.474 14.9204L412.645 15.5559L413.757 15.5601L414.815 15.0402L415.795 14.2011L420.226 11.6176L422.096 9.86836L423.296 9.59998L415.131 51.5551L399.989 136.793L398.276 145.288L398.055 148.027L397.483 151.046L396.844 153.292L396.764 154.56L396.28 155.478L396.058 156.744L396.732 158.873L397.179 159.696L397.935 160.589L398.705 161.998L399.292 163.501L400.271 165.193L401.248 167.756L401.95 170.863L402.089 172.306L401.75 175.689L401.881 177.67L401.474 179.16L401.737 182.271L401.999 183.318L403.65 187.332L404.259 189.438L405.586 191.521L407.064 195.565L407.91 196.899L409.036 198.955L409.251 200.866L405.786 204.45Z"  :
                          region.code === 'kankossa' ? "M439.48 748.507L439.271 748.8L436.38 746.548L436.13 745.368L435.656 743.971L401.77 727.027L400.542 706.878L347.316 658.8L326.316 629.031L279.143 651.858L274.812 652.8L272.575 652.235L270.55 652.392L271.077 650.538L271.358 648.739L271.191 647.212L270.319 643.804L268.626 641.071L267.925 640.045L265.229 637.294L266.634 635.493L269.286 628.108V622.57L269.507 620.262L270.612 617.031L270.391 615.647L270.391 612.647L270.612 610.8L272.381 606.647L274.812 603.416L276.359 602.031L279.675 599.724L281.223 596.724L282.107 593.724L284.096 590.955V586.339L284.98 584.031L288.517 577.339L290.506 575.724L276.457 565.572L287.502 550.912L269.278 542.554L277.313 473.277L290.803 473.04L323.876 472.531L341.421 472.373L375.879 472.048L416.371 471.901L455.098 477.71L453.385 478.667L451.372 480.343L450.149 481.975L450.515 483.415L451.644 484.689L452.818 485.681L453.994 486.339L455.439 486.956L459.777 488.157L461.424 488.97L463.084 489.535L464.88 490.683L466.233 492.131L467.362 494.949L469.853 497.984L470.867 498.921L472.389 500.803L472.746 501.972L472.554 503.322L472.961 505.108L473.424 506.462L473.757 507.966L473.774 510.344L474.093 512.291L472.699 517.012L472.41 518.49L471.165 520.025L468.939 522.363L467.936 523.111L466.886 526.063L466.375 526.967L466.163 528.165L466.735 529.347L467.503 530.098L467.535 531.654L466.979 532.957L466.453 534.617L467.262 537.249L468.235 537.765L469.303 538.584L470.048 539.433L471.179 540.468L472.451 541.213L473.897 541.667L476.763 543.192L478.005 543.656L481.179 544.006L482.85 544.441L485.071 544.556L486.443 544.939L483.651 547.404L483.518 548.668L483.928 549.952L484.56 550.565L485.602 550.128L486.392 550.363L486.656 552.295L488.933 553.906L489.345 555.362L498.894 616.253L508.459 675.184L504.525 676.561L503.361 677.406L502.129 677.007L500.68 677.082L499.109 677.577L495.511 677.959L493.861 677.6L492.45 676.832L489.67 674.262L482.278 673.325L479.06 672.415L476.686 674.923L479.06 686.031L478.062 690.59L476.186 694.108L473.355 696.387L470.218 697.8L468.45 702.185L461.818 702.877L458.502 708.877L454.966 710.031L455.408 715.569L454.616 720.59L452.976 724.108L448.527 725.922L445.682 728.031L443.607 740.998L443.037 742.863L442.448 744.198L439.48 748.507Z" :
                          region.code === 'aftout' ? "M175.837 373.67L175.916 373.681L175.302 375.444L175.167 376.679L175.923 378.38L175.562 379.294L175.188 382.172L172.392 384.358L171.681 385.939L170.671 387.673L171.544 389.32L172.49 390.687L173.043 392.572L172.441 394.56L172.149 396.676L171.546 398.557L171.146 400.395L170.005 404.361L169.797 405.993L170.121 406.892L171.318 406.423L171.344 407.549L171.21 408.891L171.858 410.539L172.45 411.597L173.292 413.416L173.073 414.994L172.48 416.801L171.599 418.534L171.881 419.701L172.472 420.405L172.797 421.53L173.429 421.633L173.805 421.942L174.682 421.786L175.761 421.328L176.553 421.484L177.155 422.123L178.136 421.302L178.667 420.214L178.62 418.97L176.874 415.731L176.55 414.907L177.633 412.561L178.098 410.873L179.026 410.052L181.104 410.703L182.022 410.172L183.538 409.046L184.107 409.557L185.808 412.41L186.047 413.417L186.213 414.779L186.297 417.203L186.729 418.466L186.049 419.801L185.336 420.739L184.967 422.19L185.207 423.422L185.917 424.479L188.613 427.026L190.676 429.48L192.129 431.82L192.583 432.986L190.606 433.578L189.475 434.573L187.489 435.691L186.991 437.1L187.542 438.438L188.339 439.773L189.37 440.807L190.7 441.689L192.316 441.818L195.566 441.002L197.248 441.324L198.908 441.881L200.683 441.558L203.33 439.642L204.375 438.476L205.682 441.826L206.414 442.958L207.775 443.539L208.561 444.822L208.965 447.169L208.746 448.586L207.924 449.15L204.867 450.221L203.04 450.727L203.505 452.236L203.38 453.085L202.152 453.833L201.161 454.752L200.898 456.095L201.426 457.153L201.003 458.54L200.817 460.343L202.08 460.217L202.956 459.847L203.482 460.38L200.254 464.338L199.709 467.367L199.031 469.217L198.609 470.861L197.169 472.094L195.311 473.147L192.942 474.944L191.611 476.605L191.316 478.034L191.676 479.791L192.087 481L192.593 481.737L193.58 482.525L193.36 483.588L192.819 484.954L191.703 486.957L189.504 488.603L188.803 489.82L189.006 492.661L189.545 493.655L190.414 494.336L191.349 495.371L191.577 496.41L191.368 497.699L190.635 499.088L189.973 499.661L191.016 503.699L190.549 504.839L190.318 505.881L190.462 507.296L192.976 518.652L193.042 521.881L193.228 522.974L193.713 524.13L193.858 525.523L193.83 526.725L193.247 528.156L192.053 529.398L190.429 530.213L187.862 530.423L185.25 530.14L183.053 529.318L182.92 528.063L182.595 526.896L182.087 525.709L181.302 524.512L179.626 522.828L178.798 521.567L176.972 519.777L173.166 517.871L171.675 517.066L170.239 516.506L167.915 515.9L166.136 515.257L164.35 515.473L162.952 516.544L161.727 517.829L160.183 517.142L159.248 516.171L155.275 515.275L152.576 514.703L150.936 513.995L146.702 514.913L144.505 511.162L143.015 507.492L143.47 506.03L143.625 504.634L143.606 502.36L142.967 497.514L142.99 495.004L142.561 491.724L142.084 490.182L141.309 488.953L140.16 487.749L138.136 487.44L136.788 487.524L133.745 486.396L131.188 483.645L130.352 483.275L128.769 483.446L123.722 484.649L121.98 485.165L120.26 485.97L117.346 488.017L115.94 489.625L114.265 491.031L113.061 492.316L112.09 493.051L110.722 493.554L108.842 494.554L105.234 497.034L103.652 497.452L102.388 497.117L101.399 496.019L101.052 494.616L100.886 493.04L100.406 492.186L100.848 489.186L101.425 488.444L101.088 487.095L100.239 486.049L100.17 484.687L100.787 483.814L101.556 483.487L102.337 483.374L102.71 483.05L103.512 482.659L103.616 481.864L103.409 478.003L103.979 475.907L105.232 473.442L105.389 472.293L105.509 470.125L104.58 464.852L103.734 461.854L102.891 459.617L102.735 457.966L102.922 456.356L102.797 454.618L103.357 452.598L102.824 450.327L101.579 449.144L100.522 446.866L99.3934 445.629L99.6111 443.761L100.195 442.458L100.36 440.816L48.484 429.765L46.5633 431.247L44.823 432.3L41.5692 434.982L40.0535 436.011L38.8057 437.135L35.4692 437.769L33.4285 436.801L32.9864 436.34L31.6603 435.878L30.9972 436.109H30.113L28.7865 436.57L26.4516 436.944L25.7792 434.262L25.7383 433.02L26.1861 432.268L26.4463 431.14L25.4078 428.971L26.4845 428.114L27.5497 427.883L28.5778 427.34L30.0878 425.471L31.8341 420.271L32.949 418.441L33.2101 416.676L32.6559 415.419L32.327 414.883L30.5246 413.773L29.6764 412.844L29.1459 411.716L29.0106 410.594L29.3411 409.844L29.3088 408.472L27.6525 405.75L26.4157 402.535L26.3545 401.358L26.1593 400.496L22.9996 393.915L22.1183 392.911L20.1008 391.706L18.0183 391.129L15.7378 390.879L14.7802 390.46L11.1029 386.998L10.3277 385.96L9.79913 384.962L9.64307 383.873L9.67268 380.976L10.1342 377.685L11.6194 374.249L11.9483 370.679L11.9893 368.831L13.621 367.105L13.8807 365.694L16.3047 349.13L15.5334 328.156L16.4311 324.996L17.2277 323.403L18.3133 321.808L20.0111 317.935L24.7115 312.882L26.513 311.015L27.9104 309.857L29.2555 308.947L30.7248 306.953L31.897 305.657L33.2704 303.76L35.4247 301.793L39.5326 301.498L41.6421 301.817L44.4458 301.873L46.5854 301.698L49.1197 301.199L50.8085 300.662L53.7117 298.679L55.9944 296.733L58.6759 295.535L61.9351 294.28L63.5158 293.475L65.2012 292.059L66.8096 290.042L68.5687 288.313L70.1052 287.08L72.3399 286.647L76.2565 286.621L78.2445 286.039L82.186 284.072L83.4115 282.712L84.8494 278.014L85.7314 276.367L88.6054 272.26L93.1088 268.926L95.075 268.183L96.7652 267.99L98.0066 268.056L99.2261 267.952L100.229 267.216L101.294 265.717L102.937 264.516L104.432 263.626L105.755 262.587L110.703 260.795L112.549 259.517L114.475 259.257L117.151 259.594L119.217 259.773L122.341 259.688L132.519 259.995L133.153 270.41L134.957 270.553L134.994 272.579L135.773 273.417L135.872 275.327L135.331 276.647L135.994 280.801L135.552 281.724L135.577 285.221L135.988 286.291L139.117 287.59L139.624 288.745L139.382 289.659L138.651 291.659L139.032 293.513L139.158 295.647L138.662 297.742L137.918 298.906L138.129 301.072L138.479 303.097L137.931 305.279L137.619 307.574L137.258 308.009L137.739 309.642L137.763 311.921L137.246 313.888L137.254 316.098L136.661 317.947L134.813 318.785L133.315 318.581L132.525 319.219L133.546 320.424L136.157 323.24L137.092 324.317L138.304 325.039L139.15 325.247L141.115 327.101L142.432 327.361L144.151 329.249L145.289 330.196L148.882 332.339L150.233 332.996L151.68 333.887L152.074 336.148L152.241 338.014L151.827 338.854L150.769 339.097L151.223 340.295L152.148 341.641L153.481 343.22L154.64 344.242L155.638 344.89L157.599 348.611L158.505 353.347L159.109 354.781L158.814 355.845L158.732 359.772L158.043 361.461L158.22 363.112L158.996 364.641L160.318 366.177L160.734 368.685L161.187 369.69L162.605 371.097L163.863 372.752L164.66 374.045L166.041 374.304L166.508 373.131L166.46 371.855L166.614 370.019L167.485 368.34L168.874 367.783L170.287 367.785L170.633 368.77L169.813 369.998L168.99 370.293L168.624 372.409L168.857 374.671L169.889 375.92L171.685 375.425L175.145 373.579L175.837 373.67Z"  :
                          region.code === 'guerou' ? "M206.353 290.391L212.79 293.221L216.789 291.447L217.901 290.587L219.591 290.579L221.372 291.123L223.372 291.125L225.072 291.832L225.747 292.454L228.568 296.146L229.104 297.176L228.392 298.109L228.182 299.992L230.823 303.186L232.813 305.724L234.581 307.109L237.233 306.416L239.223 308.955L238.56 311.263L238.339 312.647L239.002 314.493L239.886 315.416L242.318 317.032L243.644 317.262L245.412 316.801L249.833 314.032H252.044L253.812 314.493L256.023 315.878L256.907 317.032L257.57 319.109V321.185L257.919 321.905L263.171 327.005L264.627 328.614L268.613 332.232L270.113 335.049L270.618 336.658L270.952 338.711L271.247 343.024L270.934 345.796L269.778 346.241L267.976 347.164L265.492 348.67L263.452 349.491L262.433 349.696L261.548 350.244L260.968 351.236L259.403 352.263L258.418 352.262L256.073 352.741L255.835 353.739L254.141 353.983L254.136 356.061L253.834 356.602L253.425 356.948L252.82 358.268L252.625 358.939L252.666 359.719L252.339 361.667L252.228 365.038L250.59 367.945L249.83 370.599L248.82 373.127L247.173 379.699L246.667 381.089L243.909 392.263L242.469 395.591L241.199 397.033L239.712 397.587L237.962 397.464L235.575 398.178L234.265 398.199L233.039 398.87L231.729 398.783L230.224 399.281L228.244 400.536L227.535 400.73L225.858 401.444L224.673 402.656L222.073 403.175L220.782 403.716L219.857 404.279L219.426 404.993L218.868 405.227L217.903 406.378L215.316 406.444L213.615 406.056L212.142 406.592L210.594 407.471L206.927 408.322L197.195 412.592L195.273 413.521L193.276 414.707L188.357 416.761L186.729 418.466L186.297 417.203L185.808 412.41L185.452 411.576L184.107 409.557L183.538 409.046L181.104 410.703L179.026 410.052L178.098 410.873L177.633 412.561L176.55 414.907L176.874 415.731L178.62 418.97L178.667 420.214L178.136 421.302L177.155 422.123L176.553 421.484L175.761 421.328L174.682 421.786L173.805 421.942L173.429 421.633L172.797 421.53L172.472 420.405L171.881 419.701L171.599 418.534L172.48 416.801L173.073 414.994L173.292 413.416L171.21 408.891L171.318 406.423L170.121 406.892L169.797 405.993L170.005 404.361L173.043 392.571L172.49 390.687L171.544 389.32L170.671 387.673L171.681 385.939L172.392 384.358L175.188 382.172L175.429 380.926L175.562 379.294L175.923 378.38L175.167 376.679L175.302 375.444L175.916 373.681L175.145 373.578L171.685 375.425L169.889 375.92L168.857 374.671L168.665 371.948L168.99 370.293L169.813 369.998L170.633 368.77L170.287 367.785L168.874 367.783L167.485 368.34L166.614 370.019L166.46 371.855L166.508 373.131L166.041 374.304L164.66 374.045L163.863 372.752L162.605 371.097L161.187 369.69L160.734 368.685L160.318 366.177L158.996 364.641L158.22 363.112L158.043 361.461L158.732 359.772L158.814 355.845L159.109 354.781L158.505 353.347L157.991 350.486L157.599 348.611L155.638 344.89L154.64 344.242L153.481 343.22L152.148 341.641L151.223 340.295L150.769 339.097L151.827 338.854L152.241 338.014L152.074 336.148L151.68 333.887L150.233 332.996L147.037 331.322L145.289 330.196L144.151 329.249L142.432 327.361L141.115 327.101L139.15 325.247L138.304 325.039L137.092 324.317L132.525 319.219L133.314 318.581L134.813 318.785L136.661 317.947L137.254 316.098L137.246 313.888L137.763 311.921L137.739 309.642L137.258 308.009L137.619 307.574L137.931 305.279L138.479 303.097L138.129 301.072L137.918 298.906L138.662 297.742L139.158 295.647L139.032 293.513L138.65 291.659L139.624 288.745L139.117 287.59L135.988 286.291L135.577 285.221L135.552 281.724L135.994 280.801L135.331 276.647L135.872 275.327L135.773 273.417L134.994 272.579L134.957 270.553L133.153 270.41L132.519 259.995L132.635 260.069L132.805 260.233L134.142 260.918L136.592 262.598L138.309 264.102L141.079 265.602L144.499 266.989L146.967 267.393L148.36 267.693L149.921 268.327L151.459 269.442L187.978 282.312L199.065 287.275L206.353 290.391Z"  :
                          region.code === 'kiffa' ? "M453.901 476.479L453.946 476.552L455.098 477.71L416.371 471.901L375.879 472.048L289.065 473.071L277.308 473.364L269.278 542.553L267.739 540.185L266.412 538.57L263.219 537.8L262.212 535.339L259.339 536.031L256.244 535.57L254.918 534.416L253.812 532.801L251.16 532.108L249.833 531.416H249.17L248.507 532.108L246.534 530.299L245.262 530.781L244.187 532.453L243.202 536.493L239.768 535.591L239.143 534.737L238.946 533.634L235.908 533.032L235.908 534.647L237.013 536.262L236.953 537.52L236.571 538.339L236.35 539.724L235.908 541.109L236.571 542.262L238.118 544.57L240.085 546.206L240.328 546.647L240.55 547.57L240.771 549.185L241.213 550.57L240.55 552.185H239.444L238.339 553.57L238.339 554.724L237.013 555.416L236.025 555.43L235.908 555.185L233.697 555.647L232.15 556.339L231.487 557.493V559.108L231.708 560.262L232.371 561.185L233.255 562.109L233.255 564.416H232.15L230.381 564.185H228.613L226.624 563.724L224.855 563.031L223.75 562.801L222.424 562.339L219.55 562.801L215.571 563.954L213.582 564.185L211.592 564.647L208.056 566.032L207.172 565.801L206.288 564.647L204.961 561.185L203.414 559.57L202.308 558.185L200.982 557.493H198.993L194.572 557.031L194.289 555.485L194.786 553.699L194.869 551.083L194.535 549.013L193.553 546.853L193.679 545.461L192.539 544.071L192.288 542.977L194.799 536.898L195.382 533.447L195.351 531.121L194.946 529.95L193.247 528.156L193.83 526.725L193.858 525.523L193.713 524.13L193.227 522.974L193.041 521.881L192.604 516.509L191.918 513.23L191.138 510.854L190.317 505.881L190.549 504.839L191.016 503.698L190.873 502.82L190.473 501.664L189.973 499.661L190.635 499.088L191.368 497.699L191.577 496.41L191.349 495.371L190.414 494.336L189.544 493.655L189.006 492.661L188.841 491.493L188.803 489.82L189.504 488.602L189.996 488.363L190.337 487.985L191.702 486.957L193.359 483.588L193.58 482.525L192.593 481.737L192.087 481L191.676 479.791L191.316 478.033L191.611 476.605L192.942 474.944L198.609 470.861L199.031 469.217L199.709 467.367L199.834 466.401L200.254 464.338L200.913 463.186L203.482 460.38L202.955 459.847L202.079 460.217L200.817 460.343L201.003 458.54L201.426 457.153L200.898 456.094L201.16 454.752L202.152 453.833L203.38 453.085L203.505 452.236L203.039 450.727L206.193 449.815L207.924 449.149L208.746 448.586L208.9 447.059L208.804 446.944L208.561 444.822L207.775 443.539L206.413 442.958L205.682 441.826L204.374 438.476L203.33 439.642L200.683 441.558L198.908 441.881L197.247 441.324L195.566 441.002L192.316 441.818L190.7 441.689L189.37 440.807L188.338 439.773L187.542 438.437L186.991 437.1L187.489 435.691L189.475 434.573L190.606 433.578L191.45 433.401L192.583 432.986L192.129 431.82L190.676 429.48L188.612 427.026L185.917 424.479L185.207 423.422L184.967 422.19L185.336 420.739L186.049 419.801L186.729 418.466L188.357 416.761L193.276 414.707L195.273 413.521L201.175 410.756L208.569 407.895L210.594 407.471L212.142 406.592L213.614 406.056L215.316 406.444L217.903 406.378L218.867 405.227L219.426 404.993L219.857 404.279L220.782 403.716L222.889 402.959L224.673 402.656L225.858 401.444L228.244 400.536L230.976 399.043L231.729 398.783L233.039 398.87L234.265 398.199L235.575 398.178L237.961 397.464L239.711 397.587L241.199 397.033L242.469 395.591L243.247 393.98L244.352 391.32L246.16 383.237L246.667 381.089L247.172 379.699L248.059 376.286L248.82 373.126L249.83 370.599L250.59 367.945L252.228 365.038L252.339 361.666L252.405 360.801L252.666 359.719L252.625 358.939L253.058 357.598L253.425 356.948L253.834 356.602L254.136 356.061L254.14 354.546L254.141 353.983L255.835 353.739L256.073 352.741L258.418 352.262L259.403 352.263L260.968 351.236L261.548 350.244L262.433 349.696L263.452 349.491L265.492 348.67L269.778 346.241L270.934 345.796L271.247 343.024L270.952 338.711L270.618 336.658L270.113 335.049L269.471 333.68L268.613 332.232L267.1 330.942L264.627 328.614L263.171 327.005L257.919 321.905L257.57 321.185V319.109L256.907 317.032L256.022 315.878L253.812 314.493L252.044 314.032H249.833L245.412 316.801L243.644 317.262L242.318 317.032L239.886 315.416L239.002 314.493L238.339 312.647L238.56 311.263L239.223 308.955L237.233 306.416L234.581 307.109L232.813 305.724L228.182 299.992L228.391 298.109L229.104 297.176L228.568 296.146L225.475 292.185L225.072 291.832L223.372 291.125L221.372 291.123L219.544 290.542L221.318 290.493L250.572 279.264L291.354 283.207L299.807 271.647L352.066 220.825L390.707 220.047L409.251 200.866L410.196 203.449L411.573 205.749L414.215 211.336L414.52 212.383L414.966 214.734L415.308 215.395L417.991 218.262L419.058 219.793L420.939 223.38L421.009 227.995L420.824 230.423L420.614 232.259L419.588 234.417L419.121 237.088L419.045 237.862L419.094 238.895L419.588 240.182L420.828 242.329L421.926 245.388L421.102 248.313L419.084 253.866L418.634 254.688L417.694 259.466L416.847 261.227L416.252 263.736L415.83 266.854L413.798 274.084L414.233 276.455L414.249 277.55L414.839 278.682L415.895 279.961L418.89 281.476L420.085 282.666L421.17 284.411L421.142 291.974L420.779 296.665L419.403 302.997L418.964 306.16L418.655 307.921L417.799 311.447L417.814 316.037L418.243 318.05L418.23 319.341L417.885 320.864L418.002 322.935L418.794 328.969L419.273 330.667L420.118 332.208L419.914 333.784L419.283 334.974L418.878 336.78L419.08 338.037L420.45 341.492L420.382 343.457L419.657 344.898L419.427 347.57L419.93 350.906L420.891 352.283L420.85 353.195L422.664 354.497L422.835 355.862L422.721 356.883L424.159 358.428L426.096 359.327L428.018 360.671L428.946 362.016L429.099 363.598L429.921 367.234L431.117 368.478L433.107 368.562L434.326 368.406L436.135 368.688L437.671 369.505L439.354 370.798L440.369 372.152L441.49 373.387L441.979 375.084L442.198 376.72L443.316 377.726L444.43 377.8L445.857 379.312L445.713 381.267L445.047 383L444.819 384.381L444.306 385.505L444.238 386.016L428.881 386.158L424.803 387.17L430.562 390.888L458.907 405.162L461.613 405.444L463.265 406.086L464.247 406.66L465.688 406.903L468.941 406.223L473.115 415.946L472.055 416.526L470.538 417.705L469.651 419.083L469.87 420.762L469.63 422.024L468.702 422.914L467.523 425.001L464.567 426.111L463.343 427.33L461.853 428.162L460.792 428.077L461.127 427.313L461.144 426.304L460.434 425.781L457.702 427.398L456.665 428.16L454.885 429.125L453.086 429.472L450.572 428.342L446.684 426.306L444.131 426.89L442.763 426.451L441.533 428.788L439.648 427.031L438.22 426.951L433.721 427.483L431.305 427.783L430.398 428.532L429.55 428.955L428.968 430.546L427.961 431.849L426.305 434.582L425.212 435.225L423.816 435.09L422.264 436.15L421.062 437.402L420.429 438.451L420.619 438.872L421.313 439.07L425.446 437.934L426.862 437.212L428.426 436.227L431.087 432.968L432.149 432.196L432.915 432.042L433.515 432.179L435.452 431.954L436.68 432.406L436.408 433.754L436.735 434.651L437.576 434.543L438.247 433.873L439.231 433.134L441.787 432.799L443.171 432.837L445.152 433.811L445.5 434.675L444.569 435.988L444.241 437.218L444.501 437.996L445.001 438.88L445.132 439.736L445.736 440.347L446.824 440.16L447.803 439.801L448.348 440.131L449.333 440.987L449.833 441.87L449.752 443.011L449.205 443.994L447.124 445.072L445.216 444.671L442.814 443.767L441.573 443.88L440.683 444.336L440.565 445.108L441.06 445.72L443.269 446.724L444.707 448.237L446.694 448.842L448.887 448.772L449.544 447.928L449.795 446.634L450.34 445.456L451.12 444.839L453.624 443.897L454.789 443.796L456.431 444.46L457.23 445.133L457.63 445.856L457.37 446.521L456.604 447.376L455.631 448.071L453.226 449.11L451.775 449.681L451.507 450.552L452.419 450.823L453.555 450.907L457.361 449.591L457.77 450.194L457.929 451.429L457.761 452.505L457.789 453.698L458.016 454.368L457.535 455.47L456.993 456.095L456.333 455.354L453.709 456.949L453.409 457.842L453.325 458.733L451.593 462.183L451.821 463.015L451.855 463.818L452.199 464.4L453.479 464.015L454.27 464.147L454.337 465.057L453.479 465.458L452.475 465.525L451.531 465.308L449.118 465.066L448.03 465.34L447.042 465.775L446.602 466.724L447.283 468.181L450.17 468.97L450.021 469.84L449.317 470.511L448.366 471.987L448.071 473.173L450.209 472.377L451.091 472.041L451.826 472.054L452.581 472.695L452.901 473.885L452.927 474.894L453.901 476.479Z"  :
                          ""
                        }
                        fill="transparent"
                        
                        stroke="black"
                        strokeWidth="2"
                        pointerEvents="all"
                        />
                        
                      </svg>
                      </div>
                    ))}
                    </div>
                  {/*Overlay png rain data on map*/}

                    <div className="absolute inset-0 w-full h-full pointer-events-none">
                      {selectedDataType === 'rainfall' && (
                      <Image
                      key={currentTimestamp}
                      src={`/feature_layers/clim_prec/${currentTimestamp}.png`}
                      objectFit="contain"
                      style={{ mixBlendMode: 'multiply' }}
                      layout="fill"
                      alt="Rainfall data overlay"
                      />
                      )}

                        {selectedDataType === 'lcc' && (
                        <Image
                        key={currentTimestamp}
                        src={`/feature_layers/lcc/${currentTimestamp}.png`}
                        objectFit="contain"
                        style={{ mixBlendMode: 'multiply',
                        filter: 'brightness(0.8) saturate(1.2)  hue-rotate(90deg) contrast(1.5)'
                         }}
                        layout="fill"
                        alt="Rainfall data overlay"
                        />
                        )}

                      {selectedDataType === 'pop' && (
                      <Image
                      key={currentTimestamp}
                      src={`/feature_layers/pop/${currentTimestamp}.png`}
                      objectFit="contain"
                      style={{ mixBlendMode: 'multiply' }}
                      layout="fill"
                      alt="Rainfall data overlay"
                      />
                      )}

                      {selectedDataType === 'gpp' && (
                      <Image
                      key={currentTimestamp}
                      src={`/feature_layers/gpp_${currentTimestamp}.png`}
                      objectFit="contain"
                      style={{ mixBlendMode: 'multiply' }}
                      layout="fill"
                      alt="Rainfall data overlay"
                      />
                      )}


                    </div>

                  {/* Map style choice */}
                    <div className="absolute bottom-0 left-0 p-2  m-2 flex items-center w-full" style={{ justifyContent: 'space-between' }}>
                      <Tabs value={selectedMapStyle} onValueChange={setSelectedMapStyle} >
                      <TabsList>
                        <TabsTrigger value="satellite">{t('satellite')}</TabsTrigger>
                        <TabsTrigger value="default">{t('default')}</TabsTrigger>
                      </TabsList>
                      </Tabs>
                      <div className="ml-4 mr-8 p-2 rounded-md" style={{ backdropFilter: 'blur(10px)' }}>
                      
                       
                        <div className="flex items-center gap-2"></div>
                         {/*<div className="w-3 h-3 bg-gradient-to-r from-[#f8fbfe] to-[#1f366f]"></div>
                        <span className="text-xs">{t('rainfall')}</span>*/}
                       {selectedDataType === 'rainfall' && (
                       <div> 
                        <p className="text-xs font-medium mb-1">{t(selectedDataType)} (mm/year)</p>

                        <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#f8fbfe]"></div>
                        <span className="text-xs">0 mm</span>
                        </div>
                        <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#c2d9f2]"></div>
                        <span className="text-xs">100 mm</span>
                        </div>
                        <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#8bb8e6]"></div>
                        <span className="text-xs">200 mm</span>
                        </div>
                        <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#5487d9]"></div>
                        <span className="text-xs">300 mm</span>
                        </div>
                        <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#1f366f]"></div>
                        <span className="text-xs">400 mm</span>
                        </div>
                        </div>
                        )}
                        {selectedDataType === 'lcc' && (
                          
                        <div>
                          <p className="text-xs font-medium mb-1">Land Cover Classification</p>

                        <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#d6c39f]"></div>
                        <span className="text-xs">Barren</span>
                        </div>
                        <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#45ffbc]"></div>
                        <span className="text-xs">Shurbs etc.</span>
                        </div>
                        </div>
                        )}
                        {selectedDataType === 'pop' && (
                          <div>
                            <p className="text-xs font-medium mb-1">Population Density(/km^2)</p>

                          <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-[#fbf3ee]"></div>
                          <span className="text-xs">0</span>
                          </div>
                          <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-[#5a1718]"></div>
                          <span className="text-xs">14</span>
                          </div>
                          </div>
                          )}
                          {selectedDataType === 'gpp' && (
                          <div>
                            <p className="text-xs font-medium mb-1">{t(selectedDataType)} (kg_C/m²/year)</p>

                          <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-[#3a1276]"></div>
                          <span className="text-xs">False</span>
                          </div>
                          <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-[#f8f8fa]"></div>
                          <span className="text-xs">True</span>
                          </div>
                          </div>
                          )}



                      </div>
                    </div>

                 
                </div>
              </div>
            </Card>
          </div>

          {/* Right side - Data Cards */}
          <div className="lg:w-1/2 w-full">
            <ScrollArea className="h-[85vh]">
              <div className="space-y-6 pr-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center">
                        {t(currentRegion) || currentRegion} {}
                      </CardTitle>
                      <Badge>{t('regionInfo')}</Badge>
                    </div>
                    <CardDescription>
                      {t(`${currentRegion}Description`) || t('assabaDescription')}
                    </CardDescription>
                  </CardHeader>
                </Card>
                {/* Conditionally render cards based on selectedDataType */}
                {selectedDataType === "rainfall" && (
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center">
                          {t('rainfallAnalysis')}
                        </CardTitle>
                        <Badge>{t('rainfall')}</Badge>
                      </div>
                      <CardDescription>
                        {t('monthlyPatterns')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Rainfall Chart integrated directly */}
                      <div className="space-y-4">
                        <div className="h-64 bg-gray-50 rounded-md flex items-center justify-center relative p-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={formattedData}
                              margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 30,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="year"
                                angle={-45}
                                textAnchor="end"
                                height={50}
                                tick={{ fontSize: 12 }}
                              />
                              <YAxis
                                domain={[0, roundedMaxValue]}
                                label={{ value: 'mm', angle: -90, position: 'insideLeft' }}
                              />
                              <RechartsTooltip formatter={tooltipFormatter} />
                              <Legend />
                              <Bar dataKey="rainfall" fill="#3b82f6" name="Annual Rainfall (mm)" barSize={15} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <Separator className="my-4" />
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-4 rounded-md">
                            <p className="text-sm text-gray-500">
                              {t('averageRainfall')}
                            </p>
                            <p className="text-2xl font-bold">{avgPrecipitation} mm</p>
                          </div>
                          <div className="bg-blue-50 p-4 rounded-md">
                            <p className="text-sm text-gray-500">{t('trend')}</p>
                            <p className="text-2xl font-bold capitalize">
                              {t(trend.direction)}
                              <span className="text-sm ml-1">({trend.percentage}%)</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedDataType === "lcc" && (
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center">
                          {t('soilComposition')}
                        </CardTitle>
                        <Badge>{t('soilQuality')}</Badge>
                      </div>
                      <CardDescription>
                        {t('soilDistribution')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 bg-gray-50 rounded-md p-4 grid grid-cols-2 gap-4">
                        {/* Left side - Composition visual */}
                        <div className="flex items-center justify-center">
                          <div className="relative w-40 h-40">
                            {/* Clay segment - 30% */}
                            <div
                              className="absolute top-0 left-0 w-full h-full bg-amber-700 rounded-full"
                              style={{
                                clipPath:
                                  "polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%, 50% 50%)",
                              }}
                            ></div>
                            {/* Silt segment - 45% */}
                            <div
                              className="absolute top-0 left-0 w-full h-full bg-gray-400 rounded-full"
                              style={{
                                clipPath:
                                  "polygon(50% 50%, 100% 50%, 100% 100%, 0% 100%, 0% 80%, 50% 50%)",
                              }}
                            ></div>
                            {/* Sand segment - 25% */}
                            <div
                              className="absolute top-0 left-0 w-full h-full bg-yellow-400 rounded-full"
                              style={{
                                clipPath:
                                  "polygon(50% 50%, 0% 80%, 0% 0%, 50% 0%, 50% 50%)",
                              }}
                            ></div>
                            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                          </div>
                        </div>
                        {/* Right side - Composition table */}
                        <div className="flex flex-col justify-center">
                          <h4 className="text-sm font-medium mb-2">
                            {t('soilComposition')}
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-amber-700 mr-2"></div>
                              <span className="text-sm">{t('clay')} - 30%</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-gray-400 mr-2"></div>
                              <span className="text-sm">{t('silt')} - 45%</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-yellow-400 mr-2"></div>
                              <span className="text-sm">{t('sand')} - 25%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 p-4 rounded-md">
                          <p className="text-sm text-gray-500">{t('soilPH')}</p>
                          <p className="text-2xl font-bold">6.5 pH</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-md">
                          <p className="text-sm text-gray-500">{t('organicMatter')}</p>
                          <p className="text-2xl font-bold">3.2%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedDataType === "lcc" && (
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center">
                          {t('ndviAnalysis')}
                        </CardTitle>
                        <Badge>vegetation</Badge>
                      </div>
                      <CardDescription>
                        {t('vegetationIndex')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 bg-gray-50 rounded-md p-4">
                        <h4 className="text-sm font-medium mb-2">{t('vegetationHealth')}</h4>
                        <div className="space-y-4">
                          {/* NDVI visualization would go here */}
                          <div className="flex items-center justify-between">
                            <span>{t('vegetationDensity')}</span>
                            <Progress value={65} className="w-1/2" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span>{t('growthRate')}</span>
                            <Progress value={42} className="w-1/2" />
                          </div>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 p-4 rounded-md">
                          <p className="text-sm text-gray-500">{t('averageNDVI')}</p>
                          <p className="text-2xl font-bold">0.68</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-md">
                          <p className="text-sm text-gray-500">{t('yearOverYear')}</p>
                          <p className="text-2xl font-bold">+12%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}