"use client";

import { useState, useEffect } from "react";
import { MapPin, Navigation, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MapLocationProps {
  address: string;
  businessName: string;
  phone?: string;
}

export default function MapLocation({
  address,
  businessName,
  phone,
}: MapLocationProps) {
  const [mapError, setMapError] = useState(false);

  // Encode address for URL
  const encodedAddress = encodeURIComponent(address);
  const encodedBusinessName = encodeURIComponent(businessName);

  // Simple iframe embed (doesn't require API key)
  const simpleEmbedUrl = `https://www.google.com/maps?q=${encodedAddress}&output=embed&z=15`;

  // Google Maps directions URL
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;

  // Google Maps search URL (fallback)
  const searchUrl = `https://www.google.com/maps/search/${encodedAddress}`;

  const handleNavigate = () => {
    window.open(directionsUrl, "_blank");
  };

  const handleViewOnMaps = () => {
    window.open(searchUrl, "_blank");
  };

  const handleMapError = () => {
    setMapError(true);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Lokalizacja
        </CardTitle>
        <CardDescription>{address}</CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        {!mapError ? (
          <div className="relative">
            <iframe
              src={simpleEmbedUrl}
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Mapa lokalizacji ${businessName}`}
              onError={handleMapError}
              className="w-full"
            />

            {/* Overlay with action buttons */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleNavigate}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                size="sm"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Nawiguj
              </Button>

              <Button
                onClick={handleViewOnMaps}
                variant="secondary"
                className="bg-white/90 hover:bg-white text-gray-900 shadow-lg sm:flex-initial"
                size="sm"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Otwórz w Mapach</span>
                <span className="sm:hidden">Mapy</span>
              </Button>
            </div>
          </div>
        ) : (
          // Fallback when map fails to load
          <div className="p-6 text-center bg-gray-50">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">
              Nie można załadować mapy
            </h3>
            <p className="text-gray-600 mb-4 text-sm">{address}</p>

            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                onClick={handleNavigate}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Nawiguj w Google Maps
              </Button>

              <Button onClick={handleViewOnMaps} variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Zobacz lokalizację
              </Button>
            </div>

            {phone && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Potrzebujesz pomocy z dojazdem? Zadzwoń:{" "}
                  <a
                    href={`tel:${phone}`}
                    className="font-medium text-blue-600 hover:text-blue-700"
                  >
                    {phone}
                  </a>
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
