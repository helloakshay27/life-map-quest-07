import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, X } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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

interface FinalWish {
  id: string;
  name: string;
  placeOfWorship: string;
  religiousAffiliation: string;
  panditName: string;
  panditPhone: string;
  funeralServicePreference: string;
  serviceLocationAddress: string;
  contactPhone: string;
  preArrangedLastRites: boolean;
  exServicemanBenefits: boolean;
  militaryHonours: boolean;
  obituaryWanted: boolean;
  lastRitesPreference: string;
  cremationGroundChoice: string;
  lotPurchased: boolean;
  pallbearers: string;
  honoraryPallbearers: string;
  musicalSelections: string;
  specialRequests: string;
}

interface FinalWishesSectionProps {
  finalWishes: FinalWish[];
  onAddFinalWish: () => void;
  onRemoveFinalWish: (id: string) => void;
  onUpdateFinalWish: (id: string, field: keyof FinalWish, value: string | boolean) => void;
}

export default function FinalWishesSection({
  finalWishes,
  onAddFinalWish,
  onRemoveFinalWish,
  onUpdateFinalWish,
}: FinalWishesSectionProps) {
  return (
    <div className="space-y-6">
      <div className={ffSectionShell}>
        <div className={ffSectionHeader}>
          <div className="flex items-center gap-3">
            <div className={ffSectionHeaderIconWrap}>
              <Heart className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className={ffSectionHeaderTitle}>Final Wishes</h3>
              <p className={ffSectionHeaderSubtitle}>Funeral preferences and last wishes</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {finalWishes.map((wish, index) => (
            <div key={wish.id} className="bg-card border border-border rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className={ffItemIndex}>Person #{index + 1}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveFinalWish(wish.id)}
                  className={ffRemoveGhost}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  placeholder="Name"
                  value={wish.name}
                  onChange={(e) => onUpdateFinalWish(wish.id, "name", e.target.value)}
                />
                <Input 
                  placeholder="Place of Worship"
                  value={wish.placeOfWorship}
                  onChange={(e) => onUpdateFinalWish(wish.id, "placeOfWorship", e.target.value)}
                />
                <Input 
                  placeholder="Religious Affiliation"
                  value={wish.religiousAffiliation}
                  onChange={(e) => onUpdateFinalWish(wish.id, "religiousAffiliation", e.target.value)}
                />
                <Input 
                  placeholder="Pandit/Priest Name"
                  value={wish.panditName}
                  onChange={(e) => onUpdateFinalWish(wish.id, "panditName", e.target.value)}
                />
                <Input 
                  placeholder="Pandit/Priest Phone"
                  value={wish.panditPhone}
                  onChange={(e) => onUpdateFinalWish(wish.id, "panditPhone", e.target.value)}
                />
                <Input 
                  placeholder="Funeral Service Preference"
                  value={wish.funeralServicePreference}
                  onChange={(e) => onUpdateFinalWish(wish.id, "funeralServicePreference", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={wish.preArrangedLastRites}
                    onChange={(e) => onUpdateFinalWish(wish.id, "preArrangedLastRites", e.target.checked)}
                  />
                  Pre-Arranged
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={wish.exServicemanBenefits}
                    onChange={(e) => onUpdateFinalWish(wish.id, "exServicemanBenefits", e.target.checked)}
                  />
                  Ex-Serviceman
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={wish.militaryHonours}
                    onChange={(e) => onUpdateFinalWish(wish.id, "militaryHonours", e.target.checked)}
                  />
                  Military Honours
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={wish.obituaryWanted}
                    onChange={(e) => onUpdateFinalWish(wish.id, "obituaryWanted", e.target.checked)}
                  />
                  Obituary
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Last Rites Preference</Label>
                  <Select 
                    value={wish.lastRitesPreference}
                    onValueChange={(value) => onUpdateFinalWish(wish.id, "lastRitesPreference", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cremation">Cremation</SelectItem>
                      <SelectItem value="burial">Burial</SelectItem>
                      <SelectItem value="green">Green Burial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input 
                  placeholder="Cremation Ground / Cemetery"
                  value={wish.cremationGroundChoice}
                  onChange={(e) => onUpdateFinalWish(wish.id, "cremationGroundChoice", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  placeholder="Pallbearers"
                  value={wish.pallbearers}
                  onChange={(e) => onUpdateFinalWish(wish.id, "pallbearers", e.target.value)}
                />
                <Input 
                  placeholder="Honorary Pallbearers"
                  value={wish.honoraryPallbearers}
                  onChange={(e) => onUpdateFinalWish(wish.id, "honoraryPallbearers", e.target.value)}
                />
                <Input 
                  placeholder="Musical Selections"
                  value={wish.musicalSelections}
                  onChange={(e) => onUpdateFinalWish(wish.id, "musicalSelections", e.target.value)}
                />
                <Input 
                  placeholder="Special Requests"
                  value={wish.specialRequests}
                  onChange={(e) => onUpdateFinalWish(wish.id, "specialRequests", e.target.value)}
                />
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={onAddFinalWish}
            className={ffAddDashed}
          >
            <span className="mr-2">+</span> Add Final Wishes Entry
          </Button>
        </div>
      </div>
    </div>
  );
}
