import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, FileEdit, Plus } from "lucide-react";
import {
  ffSectionShell,
  ffSectionHeader,
  ffSectionHeaderIconWrap,
  ffSectionHeaderTitle,
  ffSectionHeaderSubtitle,
  ffSubCard,
  ffAccordionTrigger,
  ffAccordionTitle,
  ffAccordionHint,
  ffChevron,
  ffNestedPanel,
  ffAddDashed,
  ffRemoveGhost,
  ffDocRow,
} from "@/components/ForFamilySections/forFamilySectionStyles";

interface UploadedDocument {
  id: string;
  fileName: string;
  uploadedAt: string;
}

interface OtherInfoSectionProps {
  otherInfo: { notes: string };
  attachedDocuments: UploadedDocument[];
  expandedSections: Record<string, boolean>;
  onUpdateOtherInfo: (field: string, value: string) => void;
  onAddAttachedDocument: () => void;
  onRemoveAttachedDocument: (id: string) => void;
  onToggleSection: (section: string) => void;
}

export default function OtherInfoSection({
  otherInfo,
  attachedDocuments,
  expandedSections,
  onUpdateOtherInfo,
  onAddAttachedDocument,
  onRemoveAttachedDocument,
  onToggleSection,
}: OtherInfoSectionProps) {
  return (
    <div className="space-y-6">
      <div className={ffSectionShell}>
        <div className={ffSectionHeader}>
          <div className="flex items-center gap-3">
            <div className={ffSectionHeaderIconWrap}>
              <FileEdit className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className={ffSectionHeaderTitle}>Other Information</h3>
              <p className={ffSectionHeaderSubtitle}>Any additional notes or instructions for your family</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className={ffSubCard}>
            <button
              onClick={() => onToggleSection("otherInfoDetails")}
              className={ffAccordionTrigger}
            >
              <div className="flex flex-col items-start text-left">
                <h3 className={ffAccordionTitle}>Notes & Details</h3>
                <p className={ffAccordionHint}>Locker details, important locations, etc.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#888780]">Click to expand</span>
                <ChevronDown 
                  className={`${ffChevron} ${expandedSections.otherInfoDetails ? 'rotate-180' : ''}`} 
                />
              </div>
            </button>

            {expandedSections.otherInfoDetails && (
              <div className={ffNestedPanel}>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Additional Notes
                  </Label>
                  <textarea
                    className="flex min-h-[200px] w-full rounded-xl border border-[#D6B99D] bg-white px-4 py-3 text-sm text-[#2C2C2A] placeholder:text-[#888780] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#DA7756] focus-visible:border-[#DA7756] transition-shadow resize-y shadow-sm"
                    placeholder="E.g., Locker key is in the bedroom cupboard. The spare house keys are kept with..."
                    value={otherInfo.notes}
                    onChange={(e) => onUpdateOtherInfo("notes", e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className={ffSubCard}>
            <button
              onClick={() => onToggleSection("attachedDocuments")}
              className={ffAccordionTrigger}
            >
              <div className="flex flex-col items-start text-left">
                <h3 className={ffAccordionTitle}>Attached Documents</h3>
                <p className={ffAccordionHint}>Upload any important documents with a name and description so your family knows what they are.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#888780]">Click to expand</span>
                <ChevronDown 
                  className={`${ffChevron} ${expandedSections.attachedDocuments ? 'rotate-180' : ''}`} 
                />
              </div>
            </button>

            {expandedSections.attachedDocuments && (
              <div className={ffNestedPanel}>
                <div className="space-y-2">
                  {attachedDocuments.map((doc) => (
                    <div key={doc.id} className={ffDocRow}>
                      <span className="text-sm">{doc.fileName}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onRemoveAttachedDocument(doc.id)}
                        className={ffRemoveGhost}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button 
                    variant="outline"
                    onClick={onAddAttachedDocument}
                    className={ffAddDashed}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Document
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}