import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";

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
    <div className="space-y-4 font-sans">
      <div className="bg-white border border-[#D6B99D] rounded-2xl overflow-hidden transition-all shadow-sm">
        
        {/* Clean Accordion Button */}
        <button
          onClick={() => onToggleSection("otherInfoDetails")}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#FEF4EE]/30 transition-colors outline-none"
        >
          <div className="flex flex-col items-start text-left">
            <h3 className="text-[16px] font-semibold text-[#2C2C2A]">Other Information</h3>
            <p className="text-[13px] font-medium text-[#888780] mt-0.5">Any additional notes or instructions for your family</p>
          </div>
          <ChevronDown 
            className={`h-5 w-5 text-[#888780] transition-transform duration-200 ${
              expandedSections.otherInfoDetails ? 'rotate-180' : ''
            }`} 
          />
        </button>

        {/* Expanded Content */}
        {expandedSections.otherInfoDetails && (
          <div className="p-5 border-t border-[#D6B99D] bg-white space-y-4">
            <div className="space-y-2">
              <Label className="text-[12px] font-bold text-[#2C2C2A] mb-1.5 block uppercase tracking-wider">
                Additional Notes
              </Label>
              <textarea
                className="w-full bg-white border border-[#D6B99D] rounded-xl px-4 py-3 text-[14px] text-[#2C2C2A] placeholder:text-[#888780] focus:outline-none focus:ring-1 focus:ring-[#DA7756] focus:border-[#DA7756] transition-all resize-y shadow-sm min-h-[200px]"
                placeholder="E.g., Locker key is in the bedroom cupboard. The spare house keys are kept with..."
                value={otherInfo.notes}
                onChange={(e) => onUpdateOtherInfo("notes", e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}