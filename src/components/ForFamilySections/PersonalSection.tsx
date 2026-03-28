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
      <div className={ffSectionShell}>
        <div className={ffSectionHeader}>
          <div className="flex items-center gap-3">
            <div className={ffSectionHeaderIconWrap}>
              <Shield className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className={ffSectionHeaderTitle}>Personal Information</h3>
              <p className={ffSectionHeaderSubtitle}>Your identity and contact details</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          
          {/* Basic Details */}
          <div className={ffSubCard}>
            <button
              onClick={() => onToggleSection("basicDetails")}
              className={ffAccordionTrigger}
            >
              <div className="flex flex-col items-start text-left">
                <h3 className={ffAccordionTitle}>Basic Details</h3>
              </div>
              <ChevronDown className={`${ffChevron} ${expandedSections.basicDetails ? "rotate-180" : ""}`} />
            </button>
            {expandedSections.basicDetails && (
              <div className={ffNestedPanel}>
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
          <div className={ffSubCard}>
            <button
              onClick={() => onToggleSection("currentAddress")}
              className={ffAccordionTrigger}
            >
              <div className="flex flex-col items-start text-left">
                <h3 className={ffAccordionTitle}>Address Details</h3>
              </div>
              <ChevronDown className={`${ffChevron} ${expandedSections.currentAddress ? "rotate-180" : ""}`} />
            </button>
            {expandedSections.currentAddress && (
              <div className={ffNestedPanel}>
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
          <div className={ffSubCard}>
            <button
              onClick={() => onToggleSection("personalDocuments")}
              className={ffAccordionTrigger}
            >
              <div className="flex flex-col items-start text-left">
                <h3 className={ffAccordionTitle}>Personal Documents (Up to 5)</h3>
              </div>
              <ChevronDown className={`${ffChevron} ${expandedSections.personalDocuments ? "rotate-180" : ""}`} />
            </button>
            {expandedSections.personalDocuments && (
              <div className={ffNestedPanel}>
                <div className="space-y-2">
                  {personalDocuments.map((doc) => (
                    <div key={doc.id} className={ffDocRow}>
                      <span className="text-sm">{doc.fileName}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onRemovePersonalDocument(doc.id)}
                        className={ffRemoveGhost}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline"
                  onClick={onAddPersonalDocument}
                  className={ffAddDashed}
                >
                  + Attach Document
                </Button>
              </div>
            )}
          </div>

          {/* Spouse Information */}
          <div className={ffSubCard}>
            <button
              onClick={() => onToggleSection("spouseInfo")}
              className={ffAccordionTrigger}
            >
              <div className="flex flex-col items-start text-left">
                <h3 className={ffAccordionTitle}>Spouse Information</h3>
                <p className={ffAccordionHint}>Spouse name, Aadhar, PAN, employer</p>
              </div>
              <ChevronDown className={`${ffChevron} ${expandedSections.spouseInfo ? "rotate-180" : ""}`} />
            </button>
            {expandedSections.spouseInfo && (
              <div className={ffNestedPanel}>
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
                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="font-semibold text-foreground mb-4">Uploaded Documents (up to 5)</h4>
                  <div className="space-y-2 mb-4">
                    {spouseDocuments.map((doc) => (
                      <div key={doc.id} className={ffDocRow}>
                        <span className="text-sm">{doc.fileName}</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onRemoveSpouseDocument(doc.id)}
                          className={ffRemoveGhost}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant="outline"
                    onClick={onAddSpouseDocument}
                    className={ffAddDashed}
                  >
                    + Attach Document
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Former Spouse Information */}
          <div className={ffSubCard}>
            <button
              onClick={() => onToggleSection("formerSpouseInfo")}
              className={ffAccordionTrigger}
            >
              <div className="flex flex-col items-start text-left">
                <h3 className={ffAccordionTitle}>Former Spouse (if any)</h3>
                <p className={ffAccordionHint}>Fill only if applicable</p>
              </div>
              <ChevronDown className={`${ffChevron} ${expandedSections.formerSpouseInfo ? "rotate-180" : ""}`} />
            </button>
            {expandedSections.formerSpouseInfo && (
              <div className={ffNestedPanel}>
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