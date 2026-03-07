import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, X } from "lucide-react";

interface PropertyAsset {
  id: string;
  propertyType: string;
  address: string;
  ownershipType: string;
  documentLocation: string;
  marketValue: string;
}

interface VehicleAsset {
  id: string;
  vehicleType: string;
  model: string;
  registrationNumber: string;
  ownerName: string;
  insurancePolicy: string;
  insuranceExpiry: string;
}

interface AssetsSectionProps {
  propertyAssets: PropertyAsset[];
  vehicleAssets: VehicleAsset[];
  onAddPropertyAsset: () => void;
  onRemovePropertyAsset: (id: string) => void;
  onUpdatePropertyAsset: (id: string, field: keyof PropertyAsset, value: string) => void;
  onAddVehicleAsset: () => void;
  onRemoveVehicleAsset: (id: string) => void;
  onUpdateVehicleAsset: (id: string, field: keyof VehicleAsset, value: string) => void;
}

export default function AssetsSection({
  propertyAssets,
  vehicleAssets,
  onAddPropertyAsset,
  onRemovePropertyAsset,
  onUpdatePropertyAsset,
  onAddVehicleAsset,
  onRemoveVehicleAsset,
  onUpdateVehicleAsset,
}: AssetsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Real Estate & Vehicles</h3>
              <p className="text-sm text-amber-50">Properties and motor vehicles</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* Properties */}
          <div className="space-y-4">
            <h4 className="font-semibold text-amber-900">Properties</h4>
            {propertyAssets.map((property, idx) => (
              <div key={property.id} className="bg-white border border-amber-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-amber-700">Property #{idx + 1}</span>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemovePropertyAsset(property.id)}
                    className="text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input 
                    placeholder="Property Type"
                    value={property.propertyType}
                    onChange={(e) => onUpdatePropertyAsset(property.id, "propertyType", e.target.value)}
                  />
                  <Input 
                    placeholder="Ownership Type"
                    value={property.ownershipType}
                    onChange={(e) => onUpdatePropertyAsset(property.id, "ownershipType", e.target.value)}
                  />
                  <Input 
                    placeholder="Address"
                    className="col-span-2"
                    value={property.address}
                    onChange={(e) => onUpdatePropertyAsset(property.id, "address", e.target.value)}
                  />
                  <Input 
                    placeholder="Document Location"
                    value={property.documentLocation}
                    onChange={(e) => onUpdatePropertyAsset(property.id, "documentLocation", e.target.value)}
                  />
                  <Input 
                    placeholder="Market Value"
                    value={property.marketValue}
                    onChange={(e) => onUpdatePropertyAsset(property.id, "marketValue", e.target.value)}
                  />
                </div>
              </div>
            ))}
            <Button 
              variant="outline"
              onClick={onAddPropertyAsset}
              className="w-full border-dashed border-amber-300 text-amber-600"
            >
              + Add Property
            </Button>
          </div>

          {/* Vehicles */}
          <div className="space-y-4">
            <h4 className="font-semibold text-amber-900">Vehicles</h4>
            {vehicleAssets.map((vehicle, idx) => (
              <div key={vehicle.id} className="bg-white border border-amber-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-amber-700">Vehicle #{idx + 1}</span>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveVehicleAsset(vehicle.id)}
                    className="text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input 
                    placeholder="Vehicle Type"
                    value={vehicle.vehicleType}
                    onChange={(e) => onUpdateVehicleAsset(vehicle.id, "vehicleType", e.target.value)}
                  />
                  <Input 
                    placeholder="Model"
                    value={vehicle.model}
                    onChange={(e) => onUpdateVehicleAsset(vehicle.id, "model", e.target.value)}
                  />
                  <Input 
                    placeholder="Registration Number"
                    value={vehicle.registrationNumber}
                    onChange={(e) => onUpdateVehicleAsset(vehicle.id, "registrationNumber", e.target.value)}
                  />
                  <Input 
                    placeholder="Owner Name"
                    value={vehicle.ownerName}
                    onChange={(e) => onUpdateVehicleAsset(vehicle.id, "ownerName", e.target.value)}
                  />
                  <Input 
                    placeholder="Insurance Policy"
                    value={vehicle.insurancePolicy}
                    onChange={(e) => onUpdateVehicleAsset(vehicle.id, "insurancePolicy", e.target.value)}
                  />
                  <Input 
                    type="date"
                    placeholder="Insurance Expiry"
                    value={vehicle.insuranceExpiry}
                    onChange={(e) => onUpdateVehicleAsset(vehicle.id, "insuranceExpiry", e.target.value)}
                  />
                </div>
              </div>
            ))}
            <Button 
              variant="outline"
              onClick={onAddVehicleAsset}
              className="w-full border-dashed border-amber-300 text-amber-600"
            >
              + Add Vehicle
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
