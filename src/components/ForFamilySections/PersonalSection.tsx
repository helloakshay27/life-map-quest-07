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
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col items-start text-left">
                <h3 className="text-[16px] font-semibold text-blue-900">Basic Details</h3>
              </div>
              <ChevronDown className={`h-5 w-5 text-blue-700 transition-transform duration-200 ${expandedSections.basicDetails ? "rotate-180" : ""}`} />
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

          {/* Current Home Address */}
          <div className="bg-white border border-blue-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onToggleSection("currentAddress")}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col items-start text-left">
                <h3 className="text-[16px] font-semibold text-blue-900">Address Details</h3>
              </div>
              <ChevronDown className={`h-5 w-5 text-blue-700 transition-transform duration-200 ${expandedSections.currentAddress ? "rotate-180" : ""}`} />
            </button>
            {expandedSections.currentAddress && (
              <div className="p-4 border-t border-blue-200 space-y-4">
                <div className="space-y-2">
                  <Label>CURRENT HOME ADDRESS</Label>
                  <Input 
                    placeholder="Current Home Address" 
                    value={personalInfo.currentHomeAddress}
                    onChange={(e) => onUpdatePersonalInfo("currentHomeAddress", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>NATIVE / PERMANENT ADDRESS</Label>
                  <Input 
                    placeholder="Native / Permanent Address" 
                    value={personalInfo.nativeAddress}
                    onChange={(e) => onUpdatePersonalInfo("nativeAddress", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>MARITAL STATUS</Label>
                  <Select value={personalInfo.maritalStatus} onValueChange={(value) => onUpdatePersonalInfo("maritalStatus", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Marital Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>DATE & PLACE OF MARRIAGE</Label>
                  <Input 
                    placeholder="Date & Place of Marriage" 
                    value={personalInfo.marriageDate}
                    onChange={(e) => onUpdatePersonalInfo("marriageDate", e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Personal Documents */}
          <div className="bg-white border border-blue-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onToggleSection("personalDocuments")}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col items-start text-left">
                <h3 className="text-[16px] font-semibold text-blue-900">Personal Documents (Up to 5)</h3>
              </div>
              <ChevronDown className={`h-5 w-5 text-blue-700 transition-transform duration-200 ${expandedSections.personalDocuments ? "rotate-180" : ""}`} />
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
                  + Attach Document
                </Button>
              </div>
            )}
          </div>

          {/* Spouse Information */}
          <div className="bg-white border border-blue-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onToggleSection("spouseInfo")}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col items-start text-left">
                <h3 className="text-[16px] font-semibold text-blue-900">Spouse Information</h3>
                <p className="text-[14px] text-gray-500 mt-0.5">Spouse name, Aadhar, PAN, employer</p>
              </div>
              <ChevronDown className={`h-5 w-5 text-blue-700 transition-transform duration-200 ${expandedSections.spouseInfo ? "rotate-180" : ""}`} />
            </button>
            {expandedSections.spouseInfo && (
              <div className="p-4 border-t border-blue-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SPOUSE NAME</Label>
                    <Input 
                      placeholder="Spouse Name" 
                      value={personalInfo.spouseName}
                      onChange={(e) => onUpdatePersonalInfo("spouseName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>AADHAR NUMBER</Label>
                    <Input 
                      placeholder="XXXX XXXX XXXX" 
                      value={personalInfo.spouseAadharNumber}
                      onChange={(e) => onUpdatePersonalInfo("spouseAadharNumber", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>PAN NUMBER</Label>
                    <Input 
                      placeholder="PAN Number" 
                      value={personalInfo.spousePanNumber}
                      onChange={(e) => onUpdatePersonalInfo("spousePanNumber", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>MOBILE NUMBER</Label>
                    <Input 
                      placeholder="+91 XXXXX XXXXX" 
                      value={personalInfo.spouseMobile}
                      onChange={(e) => onUpdatePersonalInfo("spouseMobile", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>DRIVING LICENSE NUMBER</Label>
                    <Input 
                      placeholder="License Number" 
                      value={personalInfo.spouseDrivingLicenseNumber}
                      onChange={(e) => onUpdatePersonalInfo("spouseDrivingLicenseNumber", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>LICENSE VALIDITY</Label>
                    <Input 
                      type="date"
                      value={personalInfo.spouseDrivingLicenseValidity}
                      onChange={(e) => onUpdatePersonalInfo("spouseDrivingLicenseValidity", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>ADDRESS</Label>
                    <Input 
                      placeholder="Address" 
                      value={personalInfo.spouseAddress}
                      onChange={(e) => onUpdatePersonalInfo("spouseAddress", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>EMPLOYER NAME</Label>
                    <Input 
                      placeholder="Employer Name" 
                      value={personalInfo.spouseEmployer}
                      onChange={(e) => onUpdatePersonalInfo("spouseEmployer", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>WORK PHONE</Label>
                    <Input 
                      placeholder="Work Phone" 
                      value={personalInfo.spouseWorkPhone}
                      onChange={(e) => onUpdatePersonalInfo("spouseWorkPhone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>EMPLOYER ADDRESS</Label>
                    <Input 
                      placeholder="Employer Address" 
                      value={personalInfo.spouseEmployerAddress}
                      onChange={(e) => onUpdatePersonalInfo("spouseEmployerAddress", e.target.value)}
                    />
                  </div>
                </div>

                {/* Spouse Documents */}
                <div className="mt-6 pt-6 border-t border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-4">Uploaded Documents (up to 5)</h4>
                  <div className="space-y-2 mb-4">
                    {spouseDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between bg-blue-50 p-3 rounded">
                        <span className="text-sm">{doc.fileName}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onRemoveSpouseDocument(doc.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant="outline"
                    onClick={onAddSpouseDocument}
                    className="w-full"
                  >
                    + Attach Document
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Former Spouse Information */}
          <div className="bg-white border border-blue-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onToggleSection("formerSpouseInfo")}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col items-start text-left">
                <h3 className="text-[16px] font-semibold text-blue-900">Former Spouse (if any)</h3>
                <p className="text-[14px] text-gray-500 mt-0.5">Fill only if applicable</p>
              </div>
              <ChevronDown className={`h-5 w-5 text-blue-700 transition-transform duration-200 ${expandedSections.formerSpouseInfo ? "rotate-180" : ""}`} />
            </button>
            {expandedSections.formerSpouseInfo && (
              <div className="p-4 border-t border-blue-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>FORMER SPOUSE NAME</Label>
                    <Input 
                      placeholder="Former Spouse Name" 
                      value={personalInfo.formerSpouseName}
                      onChange={(e) => onUpdatePersonalInfo("formerSpouseName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CONTACT NUMBER</Label>
                    <Input 
                      placeholder="+91 XXXXX XXXXX" 
                      value={personalInfo.formerSpouseContact}
                      onChange={(e) => onUpdatePersonalInfo("formerSpouseContact", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>ADDRESS</Label>
                    <Input 
                      placeholder="Address" 
                      value={personalInfo.formerSpouseAddress}
                      onChange={(e) => onUpdatePersonalInfo("formerSpouseAddress", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>MARRIAGE DATE</Label>
                    <Input 
                      type="date"
                      value={personalInfo.formerSpouseMarriageDate}
                      onChange={(e) => onUpdatePersonalInfo("formerSpouseMarriageDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>DIVORCE DATE</Label>
                    <Input 
                      type="date"
                      value={personalInfo.formerSpouseDivorceDate}
                      onChange={(e) => onUpdatePersonalInfo("formerSpouseDivorceDate", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}