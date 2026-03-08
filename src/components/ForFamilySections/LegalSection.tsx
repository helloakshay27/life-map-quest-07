import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

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
  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-300 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Legal Documents</h3>
              <p className="text-sm text-slate-100">Will, trusts, power of attorney</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* Will & Executor */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Will & Executor</h4>
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
              <Input 
                placeholder="Will Located At"
                value={legalDetails.willLocatedAt}
                onChange={(e) => onUpdateLegalDetails("willLocatedAt", e.target.value)}
              />
              <Input 
                placeholder="Attorney Who Handled Will"
                value={legalDetails.attorneyWhoHandledWill}
                onChange={(e) => onUpdateLegalDetails("attorneyWhoHandledWill", e.target.value)}
              />
              <Input 
                placeholder="Law Firm"
                value={legalDetails.lawFirm}
                onChange={(e) => onUpdateLegalDetails("lawFirm", e.target.value)}
              />
              <Input 
                placeholder="Attorney Phone"
                value={legalDetails.attorneyPhone}
                onChange={(e) => onUpdateLegalDetails("attorneyPhone", e.target.value)}
              />
              <Input 
                type="date"
                value={legalDetails.willDate}
                onChange={(e) => onUpdateLegalDetails("willDate", e.target.value)}
              />
              <Input 
                placeholder="Executor Name"
                value={legalDetails.executor}
                onChange={(e) => onUpdateLegalDetails("executor", e.target.value)}
              />
              <Button 
                variant="outline"
                onClick={onHandleWillDocumentUpload}
                className="w-full"
              >
                {legalDetails.willDocumentUploaded ? "✓ Document Uploaded" : "Upload Will Document"}
              </Button>
            </div>
          </div>

          {/* Living Will & Organ Donation */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Living Will & Organ Donation</h4>
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={legalDetails.hasLivingWill}
                  onChange={(e) => onUpdateLegalDetails("hasLivingWill", e.target.checked)}
                />
                <span>I Have a Living Will</span>
              </label>
              <div className="space-y-2">
                <Label>Organ Donation Preference</Label>
                <Select 
                  value={legalDetails.organDonationPreference}
                  onValueChange={(value) => onUpdateLegalDetails("organDonationPreference", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes, I want to donate</SelectItem>
                    <SelectItem value="no">No, I don't want to donate</SelectItem>
                    <SelectItem value="family-decide">Let family decide</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Guardianship & Notes */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Guardianship & Notes</h4>
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
              <Input 
                placeholder="Guardianship Documents Location"
                value={legalDetails.guardianshipDocumentsLocation}
                onChange={(e) => onUpdateLegalDetails("guardianshipDocumentsLocation", e.target.value)}
              />
              <div>
                <Label>Notes for Family</Label>
                <textarea 
                  placeholder="Any important notes or messages for your family"
                  value={legalDetails.notesForFamily}
                  onChange={(e) => onUpdateLegalDetails("notesForFamily", e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded mt-2 h-24"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline">Cancel</Button>
            <Button className="bg-slate-600 hover:bg-slate-700">Save</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
