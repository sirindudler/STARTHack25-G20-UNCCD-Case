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
} from "@/components/ui/select"

import { useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  // Move the useState hook inside the component function
  const [selectedDataType, setSelectedDataType] = useState("rainfall");

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
      {/* Navigation Bar */}
      <nav className="bg-gray-100 p-4 border-b border-gray-200">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            UNCCD Dashboard
          </Link>

          <div className="mx-auto">
            <Select defaultValue="assaba">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="assaba">Assaba</SelectItem>
                <SelectItem value="kifa">Kiffa</SelectItem>
                <SelectItem value="kankoussa">Kankoussa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ul className="flex space-x-4">
            <li>
              <Select defaultValue="eng" >
                <SelectTrigger>
                  <SelectValue>English</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eng">English</SelectItem>
                  <SelectItem value="fr">français</SelectItem>
                  <SelectItem value="arb">System</SelectItem>
                </SelectContent>
              </Select>

            </li>
            <li>
              <Link href="/dashboard/reports" className="hover:text-blue-500">
                Github
              </Link>
            </li>
            {/* Add more navigation links here */}
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
                      <SelectValue placeholder="Select data type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rainfall">Rainfall</SelectItem>
                      <SelectItem value="soil">Soil Quality</SelectItem>
                      <SelectItem value="ndvi">NDVI</SelectItem>
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
                    <p className="text-xs font-medium mb-1">Placeholder </p>
                    <div className="flex items-center gap-2"></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right side - Data Cards */}
          <div className="lg:w-1/2 w-full">
            {/* Add the data type selector here */}
            

            <ScrollArea className="h-[85vh]">
              <div className="space-y-6 pr-4">
              <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center">
                          Assaba Region
                        </CardTitle>
                        <Badge>Info</Badge>
                      </div>
                      <CardDescription>
                      Assaba, Mauritania, exemplifies a BWh (hot desert) climate characterized by its stark temperature fluctuations. During the cooler month of January, temperatures can drop to a minimum of 11°C (53°F), providing a brief respite from the intense heat.                       </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Separator className="my-4" />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-md">
                          <p className="text-sm text-gray-500">
                            Average Rainfall
                          </p>
                          <p className="text-2xl font-bold">500 mm</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-md">
                          <p className="text-sm text-gray-500">Trend</p>
                          <p className="text-2xl font-bold capitalize">UP</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                {/* Conditionally render cards based on selectedDataType */}
                {selectedDataType === "rainfall" && (
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center">
                          Rainfall Analysis
                        </CardTitle>
                        <Badge>rainfall</Badge>
                      </div>
                      <CardDescription>
                        Monthly rainfall patterns and trends
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 bg-gray-50 rounded-md flex items-center justify-center relative p-4">
                        {/* Rainfall Chart using Progress components */}
                        <div className="absolute inset-x-0 bottom-0 top-8 flex items-end justify-around px-8 pb-8"></div>
                        <div className="absolute bottom-2 left-0 right-0 flex justify-around">
                          {[
                            "Jan",
                            "Feb",
                            "Mar",
                            "Apr",
                            "May",
                            "Jun",
                            "Jul",
                            "Aug",
                            "Sep",
                            "Oct",
                            "Nov",
                            "Dec",
                          ].map((month, index) => (
                            <div
                              key={index}
                              className="text-xs text-gray-500"
                            >
                              {month.charAt(0)}
                            </div>
                          ))}
                        </div>
                        <div className="absolute left-2 top-2 text-sm text-gray-500 flex items-center">
                          Monthly Rainfall (mm)
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-md">
                          <p className="text-sm text-gray-500">
                            Average Rainfall
                          </p>
                          <p className="text-2xl font-bold">500 mm</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-md">
                          <p className="text-sm text-gray-500">Trend</p>
                          <p className="text-2xl font-bold capitalize">UP</p>
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
                          Soil Composition
                        </CardTitle>
                        <Badge>soil quality</Badge>
                      </div>
                      <CardDescription>
                        Soil type distribution and quality metrics
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
                            Soil Composition
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-amber-700 mr-2"></div>
                              <span className="text-sm">Clay - 30%</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-gray-400 mr-2"></div>
                              <span className="text-sm">Silt - 45%</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-yellow-400 mr-2"></div>
                              <span className="text-sm">Sand - 25%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 p-4 rounded-md">
                          <p className="text-sm text-gray-500">Soil pH</p>
                          <p className="text-2xl font-bold">6.5 pH</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-md">
                          <p className="text-sm text-gray-500">Organic Matter</p>
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
                          NDVI Analysis
                        </CardTitle>
                        <Badge>vegetation</Badge>
                      </div>
                      <CardDescription>
                        Normalized Difference Vegetation Index
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 bg-gray-50 rounded-md p-4">
                        <h4 className="text-sm font-medium mb-2">Vegetation Health</h4>
                        <div className="space-y-4">
                          {/* NDVI visualization would go here */}
                          <div className="flex items-center justify-between">
                            <span>Vegetation Density</span>
                            <Progress value={65} className="w-1/2" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Growth Rate</span>
                            <Progress value={42} className="w-1/2" />
                          </div>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 p-4 rounded-md">
                          <p className="text-sm text-gray-500">Average NDVI</p>
                          <p className="text-2xl font-bold">0.68</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-md">
                          <p className="text-sm text-gray-500">Year-over-Year</p>
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