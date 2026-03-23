import { Label } from "@/components/ui/label";
import { FileEdit, ChevronDown } from "lucide-react";

interface OtherInfoSectionProps {
  otherInfo: { notes: string };
  expandedSections: Record<string, boolean>;
  onUpdateOtherInfo: (field: string, value: string) => void;
  onToggleSection: (section: string) => void;
}

export default function OtherInfoSection({
  otherInfo,
  expandedSections,
  onUpdateOtherInfo,
  onToggleSection,
}: OtherInfoSectionProps) {
  return (
    <div className="space-y-6">
      <div className="bg-orange-50 border border-orange-200 rounded-xl overflow-hidden">
        
        {/* Header Block */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <FileEdit className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Other Information</h3>
              <p className="text-sm text-orange-50">Any additional notes or instructions for your family</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-white border border-orange-200 rounded-lg overflow-hidden">
            
            {/* Expandable Accordion Button */}
            <button
              onClick={() => onToggleSection("otherInfoDetails")}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col items-start text-left">
                <h3 className="text-[16px] font-semibold text-black">Notes & Details</h3>
                <p className="text-[14px] text-gray-500 mt-0.5">Locker details, important locations, etc.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Click to expand</span>
                <ChevronDown 
                  className={`h-5 w-5 text-orange-700 transition-transform duration-200 ${
                    expandedSections.otherInfoDetails ? 'rotate-180' : ''
                  }`} 
                />
              </div>
            </button>

            {/* Expanded Content */}
            {expandedSections.otherInfoDetails && (
              <div className="p-4 border-t border-orange-100 bg-gray-50 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-black uppercase tracking-wider">
                    Additional Notes
                  </Label>
                  <textarea
                    className="flex min-h-[200px] w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow resize-y shadow-sm"
                    placeholder="E.g., Locker key is in the bedroom cupboard. The spare house keys are kept with..."
                    value={otherInfo.notes}
                    onChange={(e) => onUpdateOtherInfo("notes", e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}