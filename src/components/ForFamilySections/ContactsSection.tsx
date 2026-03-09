import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, ChevronDown } from "lucide-react";

interface ImportantContacts {
  employerSupervisor: string;
  employerPhone: string;
  employerEmail: string;
  physicianName: string;
  physicianPhone: string;
  physicianAddress: string;
  physicianEmail: string;
  lawyerName: string;
  lawyerPhone: string;
  lawyerAddress: string;
  attorneyName: string;
  attorneyPhone: string;
  attorneyAddress: string;
  attorneyEmail: string;
  accountantName: string;
  accountantPhone: string;
  accountantAddress: string;
  insuranceAgentName: string;
  insuranceAgencyName: string;
  insuranceAddress: string;
  insurancePhone: string;
  bankerName: string;
  bankName: string;
  bankAddress: string;
  bankPhone: string;
  brokerName: string;
  investmentCompany: string;
  brokerAddress: string;
  brokerPhone: string;
}

interface ContactsSectionProps {
  importantContacts: ImportantContacts;
  expandedSections: Record<string, boolean>;
  onUpdateImportantContact: (field: keyof ImportantContacts, value: string) => void;
  onToggleSection: (section: string) => void;
}

function SectionHeader({
  title,
  subtitle,
  expanded,
  onClick,
}: {
  title: string;
  subtitle?: string;
  expanded: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 hover:bg-purple-50 font-semibold text-purple-900"
    >
      <div className="text-left">
        <span>{title}</span>
        {subtitle && <p className="text-sm text-gray-600 font-normal inline ml-3">— {subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 font-normal">Click to {expanded ? "collapse" : "expand"}</span>
        <ChevronDown className={`h-5 w-5 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </div>
    </button>
  );
}

export default function ContactsSection({
  importantContacts,
  expandedSections,
  onUpdateImportantContact,
  onToggleSection,
}: ContactsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Important Contacts</h3>
              <p className="text-sm text-purple-50">Professional contacts & advisors</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-white border border-purple-200 rounded-lg overflow-hidden">
            <SectionHeader
              title="Employer / Supervisor"
              expanded={!!expandedSections.employer}
              onClick={() => onToggleSection("employer")}
            />
            {expandedSections.employer && (
              <div className="p-4 border-t border-purple-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>IMMEDIATE SUPERVISOR</Label>
                    <Input
                      placeholder="Immediate Supervisor"
                      value={importantContacts.employerSupervisor}
                      onChange={(e) => onUpdateImportantContact("employerSupervisor", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>OFFICE PHONE</Label>
                    <Input
                      placeholder="Office Phone"
                      value={importantContacts.employerPhone}
                      onChange={(e) => onUpdateImportantContact("employerPhone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>EMAIL</Label>
                    <Input
                      placeholder="Email"
                      value={importantContacts.employerEmail}
                      onChange={(e) => onUpdateImportantContact("employerEmail", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-purple-200 rounded-lg overflow-hidden">
            <SectionHeader
              title="Personal Physician"
              subtitle="Doctor name, phone, address"
              expanded={!!expandedSections.physician}
              onClick={() => onToggleSection("physician")}
            />
            {expandedSections.physician && (
              <div className="p-4 border-t border-purple-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>DOCTOR NAME</Label>
                    <Input
                      placeholder="Doctor Name"
                      value={importantContacts.physicianName}
                      onChange={(e) => onUpdateImportantContact("physicianName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>PHONE</Label>
                    <Input
                      placeholder="Phone"
                      value={importantContacts.physicianPhone}
                      onChange={(e) => onUpdateImportantContact("physicianPhone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ADDRESS</Label>
                    <Input
                      placeholder="Address"
                      value={importantContacts.physicianAddress}
                      onChange={(e) => onUpdateImportantContact("physicianAddress", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>EMAIL</Label>
                    <Input
                      placeholder="Email"
                      value={importantContacts.physicianEmail}
                      onChange={(e) => onUpdateImportantContact("physicianEmail", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-purple-200 rounded-lg overflow-hidden">
            <SectionHeader
              title="Pandit / Priest / Religious Contact"
              subtitle="Name, phone, address"
              expanded={!!expandedSections.pandit}
              onClick={() => onToggleSection("pandit")}
            />
            {expandedSections.pandit && (
              <div className="p-4 border-t border-purple-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>NAME</Label>
                    <Input
                      placeholder="Name"
                      value={importantContacts.lawyerName}
                      onChange={(e) => onUpdateImportantContact("lawyerName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>PHONE</Label>
                    <Input
                      placeholder="Phone"
                      value={importantContacts.lawyerPhone}
                      onChange={(e) => onUpdateImportantContact("lawyerPhone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>ADDRESS</Label>
                    <Input
                      placeholder="Address"
                      value={importantContacts.lawyerAddress}
                      onChange={(e) => onUpdateImportantContact("lawyerAddress", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-purple-200 rounded-lg overflow-hidden">
            <SectionHeader
              title="Attorney"
              subtitle="Name, phone, email"
              expanded={!!expandedSections.attorney}
              onClick={() => onToggleSection("attorney")}
            />
            {expandedSections.attorney && (
              <div className="p-4 border-t border-purple-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>ATTORNEY NAME</Label>
                    <Input
                      placeholder="Attorney Name"
                      value={importantContacts.attorneyName}
                      onChange={(e) => onUpdateImportantContact("attorneyName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>PHONE</Label>
                    <Input
                      placeholder="Phone"
                      value={importantContacts.attorneyPhone}
                      onChange={(e) => onUpdateImportantContact("attorneyPhone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>EMAIL</Label>
                    <Input
                      placeholder="Email"
                      value={importantContacts.attorneyEmail}
                      onChange={(e) => onUpdateImportantContact("attorneyEmail", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-purple-200 rounded-lg overflow-hidden">
            <SectionHeader
              title="Accountant"
              subtitle="Name, phone, address"
              expanded={!!expandedSections.accountant}
              onClick={() => onToggleSection("accountant")}
            />
            {expandedSections.accountant && (
              <div className="p-4 border-t border-purple-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>NAME</Label>
                    <Input
                      placeholder="Accountant Name"
                      value={importantContacts.accountantName}
                      onChange={(e) => onUpdateImportantContact("accountantName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>PHONE</Label>
                    <Input
                      placeholder="Phone"
                      value={importantContacts.accountantPhone}
                      onChange={(e) => onUpdateImportantContact("accountantPhone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>ADDRESS</Label>
                    <Input
                      placeholder="Address"
                      value={importantContacts.accountantAddress}
                      onChange={(e) => onUpdateImportantContact("accountantAddress", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-purple-200 rounded-lg overflow-hidden">
            <SectionHeader
              title="Insurance Agent"
              subtitle="Agent name, agency, phone"
              expanded={!!expandedSections.insurance}
              onClick={() => onToggleSection("insurance")}
            />
            {expandedSections.insurance && (
              <div className="p-4 border-t border-purple-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>AGENT NAME</Label>
                    <Input
                      placeholder="Agent Name"
                      value={importantContacts.insuranceAgentName}
                      onChange={(e) => onUpdateImportantContact("insuranceAgentName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>AGENCY NAME</Label>
                    <Input
                      placeholder="Agency Name"
                      value={importantContacts.insuranceAgencyName}
                      onChange={(e) => onUpdateImportantContact("insuranceAgencyName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>PHONE</Label>
                    <Input
                      placeholder="Phone"
                      value={importantContacts.insurancePhone}
                      onChange={(e) => onUpdateImportantContact("insurancePhone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ADDRESS</Label>
                    <Input
                      placeholder="Address"
                      value={importantContacts.insuranceAddress}
                      onChange={(e) => onUpdateImportantContact("insuranceAddress", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-purple-200 rounded-lg overflow-hidden">
            <SectionHeader
              title="Banker"
              subtitle="Banker name, bank, phone"
              expanded={!!expandedSections.banker}
              onClick={() => onToggleSection("banker")}
            />
            {expandedSections.banker && (
              <div className="p-4 border-t border-purple-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>BANKER NAME</Label>
                    <Input
                      placeholder="Banker Name"
                      value={importantContacts.bankerName}
                      onChange={(e) => onUpdateImportantContact("bankerName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>BANK NAME</Label>
                    <Input
                      placeholder="Bank Name"
                      value={importantContacts.bankName}
                      onChange={(e) => onUpdateImportantContact("bankName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>PHONE</Label>
                    <Input
                      placeholder="Phone"
                      value={importantContacts.bankPhone}
                      onChange={(e) => onUpdateImportantContact("bankPhone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ADDRESS</Label>
                    <Input
                      placeholder="Address"
                      value={importantContacts.bankAddress}
                      onChange={(e) => onUpdateImportantContact("bankAddress", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-purple-200 rounded-lg overflow-hidden">
            <SectionHeader
              title="Broker / Investment"
              subtitle="Broker name, company, phone"
              expanded={!!expandedSections.broker}
              onClick={() => onToggleSection("broker")}
            />
            {expandedSections.broker && (
              <div className="p-4 border-t border-purple-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>BROKER NAME</Label>
                    <Input
                      placeholder="Broker Name"
                      value={importantContacts.brokerName}
                      onChange={(e) => onUpdateImportantContact("brokerName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>COMPANY NAME</Label>
                    <Input
                      placeholder="Company Name"
                      value={importantContacts.investmentCompany}
                      onChange={(e) => onUpdateImportantContact("investmentCompany", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>PHONE</Label>
                    <Input
                      placeholder="Phone"
                      value={importantContacts.brokerPhone}
                      onChange={(e) => onUpdateImportantContact("brokerPhone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ADDRESS</Label>
                    <Input
                      placeholder="Address"
                      value={importantContacts.brokerAddress}
                      onChange={(e) => onUpdateImportantContact("brokerAddress", e.target.value)}
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
