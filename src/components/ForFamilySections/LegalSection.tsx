import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Upload, CheckCircle2 } from "lucide-react";
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
  ffLabelUpper,
} from "@/components/ForFamilySections/forFamilySectionStyles";
import { cn } from "@/lib/utils";

interface LegalDetails {
  willLocatedAt: string;
  attorneyWhoHandledWill: string;
  lawFirm: string;
  attorneyPhone: string;
  willDate: string;
  executor: string;
  guardianshipDocumentsLocation: string;
  hasLivingWill: boolean;
  willDocumentUploaded: string;
  notesForFamily: string;
  organDonationPreference: string;
}

interface LegalSectionProps {
  legalDetails: LegalDetails;
  onUpdateLegalDetails: (field: keyof LegalDetails, value: string | boolean) => void;
  onHandleWillDocumentUpload: () => void;
}

export default function LegalSection({
  legalDetails,
  onUpdateLegalDetails,
  onHandleWillDocumentUpload,
}: LegalSectionProps) {
  
  const inputClassName =
    "w-full bg-white border border-[#D6B99D] rounded-xl px-4 py-2.5 text-sm text-[#2C2C2A] placeholder:text-[#888780] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DA7756] focus-visible:border-[#DA7756] shadow-sm";

  return (
    <div className="space-y-6 font-sans">
      <div className={ffSectionShell}>
        <div className={ffSectionHeader}>
          <div className="flex items-center gap-3">
            <div className={ffSectionHeaderIconWrap}>
              <Shield className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className={ffSectionHeaderTitle}>Legal Documents</h3>
              <p className={ffSectionHeaderSubtitle}>Will, trusts, power of attorney</p>
            </div>
          </div>
        </div>

        <div className="p-5 md:p-6 space-y-6">
          
          {/* Will & Executor */}
          <div className="space-y-3">
            <h4 className="text-[16px] font-bold text-[#2C2C2A]">Will & Executor</h4>
            <div className="bg-white border border-[#D6B99D] rounded-xl p-5 space-y-5 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label className={cn(ffLabelUpper, "mb-1.5 block")}>Will Located At</Label>
                  <Input 
                    placeholder="e.g., Safe deposit box, Attorney's office"
                    value={legalDetails.willLocatedAt}
                    onChange={(e) => onUpdateLegalDetails("willLocatedAt", e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <Label className={cn(ffLabelUpper, "mb-1.5 block")}>Attorney Who Handled Will</Label>
                  <Input 
                    placeholder="Attorney Name"
                    value={legalDetails.attorneyWhoHandledWill}
                    onChange={(e) => onUpdateLegalDetails("attorneyWhoHandledWill", e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <Label className={cn(ffLabelUpper, "mb-1.5 block")}>Law Firm</Label>
                  <Input 
                    placeholder="Firm Name"
                    value={legalDetails.lawFirm}
                    onChange={(e) => onUpdateLegalDetails("lawFirm", e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <Label className={cn(ffLabelUpper, "mb-1.5 block")}>Attorney Phone</Label>
                  <Input 
                    placeholder="Contact Number"
                    value={legalDetails.attorneyPhone}
                    onChange={(e) => onUpdateLegalDetails("attorneyPhone", e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <Label className={cn(ffLabelUpper, "mb-1.5 block")}>Will Date</Label>
                  <Input 
                    type="date"
                    value={legalDetails.willDate}
                    onChange={(e) => onUpdateLegalDetails("willDate", e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <Label className={cn(ffLabelUpper, "mb-1.5 block")}>Executor Name</Label>
                  <Input 
                    placeholder="Executor Name"
                    value={legalDetails.executor}
                    onChange={(e) => onUpdateLegalDetails("executor", e.target.value)}
                    className={inputClassName}
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <Button 
                  variant="outline"
                  onClick={onHandleWillDocumentUpload}
                  className={cn(
                    "w-full font-bold transition-all shadow-sm rounded-xl py-6",
                    legalDetails.willDocumentUploaded
                      ? "border-[#0B5D41] text-[#0B5D41] bg-[#0B5D41]/[0.05] hover:bg-[#0B5D41]/10"
                      : "border-[#D6B99D] bg-white text-[#2C2C2A] hover:bg-[#FEF4EE] hover:text-[#DA7756] hover:border-[#DA7756]"
                  )}
                >
                  {legalDetails.willDocumentUploaded ? (
                    <><CheckCircle2 className="w-5 h-5 mr-2" /> Document Uploaded</>
                  ) : (
                    <><Upload className="w-4 h-4 mr-2" strokeWidth={2.5}/> Upload Will Document</>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Living Will & Organ Donation */}
          <div className="space-y-3">
            <h4 className="text-[16px] font-bold text-[#2C2C2A]">Living Will & Organ Donation</h4>
            <div className="bg-white border border-[#D6B99D] rounded-xl p-5 space-y-5 shadow-sm">
              <label className="flex items-center gap-3 cursor-pointer group w-fit">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={legalDetails.hasLivingWill}
                    onChange={(e) => onUpdateLegalDetails("hasLivingWill", e.target.checked)}
                    className="peer w-5 h-5 appearance-none rounded-md border-2 border-[#D6B99D] checked:bg-[#DA7756] checked:border-[#DA7756] transition-colors cursor-pointer"
                  />
                  <svg
                    className="absolute w-5 h-5 text-white p-0.5 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[15px] font-semibold text-[#2C2C2A] group-hover:text-[#DA7756] transition-colors">
                  I Have a Living Will
                </span>
              </label>

              <div className="space-y-1.5 md:w-1/2">
                <Label className={cn(ffLabelUpper, "mb-1.5 block")}>Organ Donation Preference</Label>
                <Select 
                  value={legalDetails.organDonationPreference}
                  onValueChange={(value) => onUpdateLegalDetails("organDonationPreference", value)}
                >
                  <SelectTrigger className={inputClassName}>
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent className="border-[#D6B99D] bg-white text-[#2C2C2A] shadow-md rounded-xl">
                    <SelectItem value="yes" className="hover:bg-[#FEF4EE] cursor-pointer font-medium">Yes, I want to donate</SelectItem>
                    <SelectItem value="no" className="hover:bg-[#FEF4EE] cursor-pointer font-medium">No, I don't want to donate</SelectItem>
                    <SelectItem value="family-decide" className="hover:bg-[#FEF4EE] cursor-pointer font-medium">Let family decide</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Guardianship & Notes */}
          <div className="space-y-3">
            <h4 className="text-[16px] font-bold text-[#2C2C2A]">Guardianship & Notes</h4>
            <div className="bg-white border border-[#D6B99D] rounded-xl p-5 space-y-5 shadow-sm">
              <div>
                <Label className={cn(ffLabelUpper, "mb-1.5 block")}>Guardianship Documents Location</Label>
                <Input 
                  placeholder="e.g., Safe deposit box, with attorney"
                  value={legalDetails.guardianshipDocumentsLocation}
                  onChange={(e) => onUpdateLegalDetails("guardianshipDocumentsLocation", e.target.value)}
                  className={inputClassName}
                />
              </div>
              <div>
                <Label className={cn(ffLabelUpper, "mb-1.5 block")}>Notes for Family</Label>
                <textarea 
                  placeholder="Any important legal notes, specific instructions, or messages for your family..."
                  value={legalDetails.notesForFamily}
                  onChange={(e) => onUpdateLegalDetails("notesForFamily", e.target.value)}
                  className="w-full bg-white border border-[#D6B99D] rounded-xl px-4 py-3 text-sm text-[#2C2C2A] placeholder:text-[#888780] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DA7756] focus-visible:border-[#DA7756] transition-all shadow-sm resize-y min-h-[120px]"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}