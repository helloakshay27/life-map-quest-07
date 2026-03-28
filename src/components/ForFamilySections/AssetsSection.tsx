import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, X } from "lucide-react";
import {
  ffSectionShell,
  ffSectionHeader,
  ffSectionHeaderIconWrap,
  ffSectionHeaderTitle,
  ffSectionHeaderSubtitle,
  ffAddDashed,
  ffRemoveGhost,
  ffItemIndex,
} from "@/components/ForFamilySections/forFamilySectionStyles";

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
      <div className={ffSectionShell}>
        <div className={ffSectionHeader}>
          <div className="flex items-center gap-3">
            <div className={ffSectionHeaderIconWrap}>
              <Shield className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className={ffSectionHeaderTitle}>Real Estate & Vehicles</h3>
              <p className={ffSectionHeaderSubtitle}>Properties and motor vehicles</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* Properties */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Properties</h4>
            {propertyAssets.map((property, idx) => (
              <div key={property.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={ffItemIndex}>Property #{idx + 1}</span>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemovePropertyAsset(property.id)}
                    className={ffRemoveGhost}
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
              className={ffAddDashed}
            >
              + Add Property
            </Button>
          </div>

          {/* Vehicles */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Vehicles</h4>
            {vehicleAssets.map((vehicle, idx) => (
              <div key={vehicle.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={ffItemIndex}>Vehicle #{idx + 1}</span>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveVehicleAsset(vehicle.id)}
                    className={ffRemoveGhost}
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
              className={ffAddDashed}
            >
              + Add Vehicle
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
