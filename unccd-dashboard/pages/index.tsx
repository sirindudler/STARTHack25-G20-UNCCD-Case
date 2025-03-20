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
  'kankossa': 1, // Kankoussa
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
            {t('dashboard')}
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
                    {region.name}
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
                <div className="z-10 m-2">
                  <Select
                    value={selectedDataType}
                    onValueChange={setSelectedDataType}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t('selectDataType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rainfall">{t('rainfall')}</SelectItem>
                      <SelectItem value="soil">{t('soilQuality')}</SelectItem>
                      <SelectItem value="ndvi">{t('ndvi')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative flex-grow">
                  {/* Static Map Mockup with colored regions */}
                  <div className="absolute inset-0 grid grid-cols-2 grid-rows-3 gap-2">
                    <Image
                      src="/final_base_map.png"
                      alt="Base Map"
                      fill
                      style={{ objectFit: "contain" }}
                      priority
                    />
                  </div>
                  {/* Map Legend */}
                  <div className="absolute bottom-0 right-0 bg-white p-2 rounded shadow m-2">
                    <p className="text-xs font-medium mb-1">{t('legend') || 'Legend'}</p>
                    <div className="flex items-center gap-2">
                      {/* Add dynamic legend based on selected data type */}
                      {selectedDataType === "rainfall" && (
                        <>
                          <div className="w-3 h-3 bg-blue-200"></div>
                          <span className="text-xs">0-100 mm</span>
                          <div className="w-3 h-3 bg-blue-400"></div>
                          <span className="text-xs">100-300 mm</span>
                          <div className="w-3 h-3 bg-blue-600"></div>
                          <span className="text-xs">300+ mm</span>
                        </>
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
                        {t(currentRegion) || currentRegion} {t('dashboard').split(' ')[0]}
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

                {selectedDataType === "soil" && (
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

                {selectedDataType === "ndvi" && (
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