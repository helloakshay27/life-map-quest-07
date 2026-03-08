import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ChevronDown, X } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface PersonalInfo {
  fullName: string;
  aadharNumber: string;
  panNumber: string;
  dateOfBirth: string;
  placeOfBirth: string;
  drivingLicenseNumber: string;
  drivingLicenseValidity: string;
  currentHomeAddress: string;
  mobileNumber: string;
  workPhone: string;
  nativeAddress: string;
  maritalStatus: string;
  marriageDate: string;
  spouseName: string;
  spouseMobile: string;
  spouseAadharNumber: string;
  spousePanNumber: string;
  spouseDrivingLicenseNumber: string;
  spouseDrivingLicenseValidity: string;
  spouseAddress: string;
  spouseEmployer: string;
  spouseWorkPhone: string;
  spouseEmployerAddress: string;
  formerSpouseName: string;
  formerSpouseContact: string;
  formerSpouseAddress: string;
  formerSpouseMarriageDate: string;
  formerSpouseDivorceDate: string;
}

interface UploadedDocument {
  id: string;
  fileName: string;
  uploadedAt: string;
}

interface PersonalSectionProps {
  personalInfo: PersonalInfo;
  personalDocuments: UploadedDocument[];
  spouseDocuments: UploadedDocument[];
  expandedSections: Record<string, boolean>;
  onUpdatePersonalInfo: (field: keyof PersonalInfo, value: string) => void;
  onAddPersonalDocument: () => void;
  onRemovePersonalDocument: (id: string) => void;
  onAddSpouseDocument: () => void;
  onRemoveSpouseDocument: (id: string) => void;
  onToggleSection: (section: string) => void;
}

export default function PersonalSection({
  personalInfo,
  personalDocuments,
  spouseDocuments,
  expandedSections,
  onUpdatePersonalInfo,
  onAddPersonalDocument,
  onRemovePersonalDocument,
  onAddSpouseDocument,
  onRemoveSpouseDocument,
  onToggleSection,
}: PersonalSectionProps) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Personal Information</h3>
              <p className="text-sm text-blue-50">Your identity and contact details</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Basic Details */}
          <div className="bg-white border border-blue-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onToggleSection("basicDetails")}
              className="w-full flex items-center justify-between p-4 hover:bg-blue-50 font-semibold text-blue-900"
            >
              Basic Details
              <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.basicDetails ? "rotate-180" : ""}`} />
            </button>
            {expandedSections.basicDetails && (
              <div className="p-4 border-t border-blue-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>FULL NAME</Label>
                    <Input 
                      placeholder="Full Name" 
                      value={personalInfo.fullName}
                      onChange={(e) => onUpdatePersonalInfo("fullName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>AADHAR NUMBER</Label>
                    <Input 
                      placeholder="XXXX XXXX XXXX XXXX" 
                      value={personalInfo.aadharNumber}
                      onChange={(e) => onUpdatePersonalInfo("aadharNumber", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>PAN NUMBER</Label>
                    <Input 
                      placeholder="PAN Number" 
                      value={personalInfo.panNumber}
                      onChange={(e) => onUpdatePersonalInfo("panNumber", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>DATE OF BIRTH</Label>
                    <Input 
                      type="date"
                      value={personalInfo.dateOfBirth}
                      onChange={(e) => onUpdatePersonalInfo("dateOfBirth", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>PLACE OF BIRTH</Label>
                    <Input 
                      placeholder="City/Town" 
                      value={personalInfo.placeOfBirth}
                      onChange={(e) => onUpdatePersonalInfo("placeOfBirth", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>DRIVING LICENSE NUMBER</Label>
                    <Input 
                      placeholder="License Number" 
                      value={personalInfo.drivingLicenseNumber}
                      onChange={(e) => onUpdatePersonalInfo("drivingLicenseNumber", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>LICENSE VALIDITY</Label>
                    <Input 
                      type="date"
                      value={personalInfo.drivingLicenseValidity}
                      onChange={(e) => onUpdatePersonalInfo("drivingLicenseValidity", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>MOBILE NUMBER</Label>
                    <Input 
                      placeholder="+91 XXXXX XXXXX" 
                      value={personalInfo.mobileNumber}
                      onChange={(e) => onUpdatePersonalInfo("mobileNumber", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>WORK PHONE</Label>
                    <Input 
                      placeholder="Work Phone" 
                      value={personalInfo.workPhone}
                      onChange={(e) => onUpdatePersonalInfo("workPhone", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Personal Documents */}
          <div className="bg-white border border-blue-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onToggleSection("personalDocuments")}
              className="w-full flex items-center justify-between p-4 hover:bg-blue-50 font-semibold text-blue-900"
            >
              Personal Documents
              <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.personalDocuments ? "rotate-180" : ""}`} />
            </button>
            {expandedSections.personalDocuments && (
              <div className="p-4 border-t border-blue-200 space-y-4">
                <div className="space-y-2">
                  {personalDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between bg-blue-50 p-3 rounded">
                      <span className="text-sm">{doc.fileName}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onRemovePersonalDocument(doc.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline"
                  onClick={onAddPersonalDocument}
                  className="w-full"
                >
                  + Add Document
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
