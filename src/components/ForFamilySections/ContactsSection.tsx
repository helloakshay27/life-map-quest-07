import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, ChevronDown } from "lucide-react";
import {
  ffSectionShell,
  ffSectionHeader,
  ffSectionHeaderIconWrap,
  ffSectionHeaderTitle,
  ffSectionHeaderSubtitle,
  ffSubCard,
  ffChevron,
  ffLabelUpper,
} from "@/components/ForFamilySections/forFamilySectionStyles";
import { cn } from "@/lib/utils";

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
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors border-0",
        expanded ? "bg-[#DA7756]/10" : "bg-transparent hover:bg-[#FEF4EE]"
      )}
    >
      <div>
        <span className="font-semibold text-sm text-foreground">{title}</span>
        {subtitle && <span className="text-xs text-[#888780] ml-2">— {subtitle}</span>}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#888780]">Click to {expanded ? "collapse" : "expand"}</span>
        <ChevronDown className={cn(ffChevron, expanded && "rotate-180")} />
      </div>
    </button>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border p-4">{children}</div>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  fullWidth,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "md:col-span-2" : ""}>
      <div className="space-y-1">
        <Label className={cn(ffLabelUpper, "block")}>{label}</Label>
        <Input placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

export default function ContactsSection({
  importantContacts,
  expandedSections,
  onUpdateImportantContact,
  onToggleSection,
}: ContactsSectionProps) {
  const u = (field: keyof ImportantContacts) => (v: string) => onUpdateImportantContact(field, v);

  return (
    <div className="space-y-6">
      <div className={ffSectionShell}>
        <div className={ffSectionHeader}>
          <div className="flex items-center gap-3">
            <div className={ffSectionHeaderIconWrap}>
              <Users className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className={ffSectionHeaderTitle}>Important Contacts</h3>
              <p className={ffSectionHeaderSubtitle}>Professional contacts and advisors</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className={ffSubCard}>
            <SectionHeader
              title="Employer / Supervisor"
              expanded={!!expandedSections.employer}
              onClick={() => onToggleSection("employer")}
            />
            {expandedSections.employer && (
              <FieldGrid>
                <Field label="Immediate Supervisor" placeholder="Immediate Supervisor" value={importantContacts.employerSupervisor} onChange={u("employerSupervisor")} />
                <Field label="Office Phone" placeholder="Office Phone" value={importantContacts.employerPhone} onChange={u("employerPhone")} />
                <Field label="Email" placeholder="Email" value={importantContacts.employerEmail} onChange={u("employerEmail")} fullWidth />
              </FieldGrid>
            )}
          </div>

          <div className={ffSubCard}>
            <SectionHeader
              title="Personal Physician"
              subtitle="Doctor name, phone, address"
              expanded={!!expandedSections.physician}
              onClick={() => onToggleSection("physician")}
            />
            {expandedSections.physician && (
              <FieldGrid>
                <Field label="Doctor Name" placeholder="Doctor Name" value={importantContacts.physicianName} onChange={u("physicianName")} />
                <Field label="Phone" placeholder="Phone" value={importantContacts.physicianPhone} onChange={u("physicianPhone")} />
                <Field label="Address" placeholder="Address" value={importantContacts.physicianAddress} onChange={u("physicianAddress")} />
                <Field label="Email" placeholder="Email" value={importantContacts.physicianEmail} onChange={u("physicianEmail")} />
              </FieldGrid>
            )}
          </div>

          <div className={ffSubCard}>
            <SectionHeader
              title="Pandit / Priest / Religious Contact"
              subtitle="Name, phone, address"
              expanded={!!expandedSections.pandit}
              onClick={() => onToggleSection("pandit")}
            />
            {expandedSections.pandit && (
              <FieldGrid>
                <Field label="Name" placeholder="Name" value={importantContacts.lawyerName} onChange={u("lawyerName")} />
                <Field label="Phone" placeholder="Phone" value={importantContacts.lawyerPhone} onChange={u("lawyerPhone")} />
                <Field label="Address" placeholder="Address" value={importantContacts.lawyerAddress} onChange={u("lawyerAddress")} fullWidth />
              </FieldGrid>
            )}
          </div>

          <div className={ffSubCard}>
            <SectionHeader
              title="Attorney"
              subtitle="Name, phone, email"
              expanded={!!expandedSections.attorney}
              onClick={() => onToggleSection("attorney")}
            />
            {expandedSections.attorney && (
              <FieldGrid>
                <Field label="Attorney Name" placeholder="Attorney Name" value={importantContacts.attorneyName} onChange={u("attorneyName")} />
                <Field label="Phone" placeholder="Phone" value={importantContacts.attorneyPhone} onChange={u("attorneyPhone")} />
                <Field label="Email" placeholder="Email" value={importantContacts.attorneyEmail} onChange={u("attorneyEmail")} fullWidth />
              </FieldGrid>
            )}
          </div>

          <div className={ffSubCard}>
            <SectionHeader
              title="Accountant"
              subtitle="Name, phone, address"
              expanded={!!expandedSections.accountant}
              onClick={() => onToggleSection("accountant")}
            />
            {expandedSections.accountant && (
              <FieldGrid>
                <Field label="Name" placeholder="Accountant Name" value={importantContacts.accountantName} onChange={u("accountantName")} />
                <Field label="Phone" placeholder="Phone" value={importantContacts.accountantPhone} onChange={u("accountantPhone")} />
                <Field label="Address" placeholder="Address" value={importantContacts.accountantAddress} onChange={u("accountantAddress")} fullWidth />
              </FieldGrid>
            )}
          </div>

          <div className={ffSubCard}>
            <SectionHeader
              title="Insurance Agent"
              subtitle="Agent name, agency, phone"
              expanded={!!expandedSections.insurance}
              onClick={() => onToggleSection("insurance")}
            />
            {expandedSections.insurance && (
              <FieldGrid>
                <Field label="Agent Name" placeholder="Agent Name" value={importantContacts.insuranceAgentName} onChange={u("insuranceAgentName")} />
                <Field label="Agency Name" placeholder="Agency Name" value={importantContacts.insuranceAgencyName} onChange={u("insuranceAgencyName")} />
                <Field label="Phone" placeholder="Phone" value={importantContacts.insurancePhone} onChange={u("insurancePhone")} />
                <Field label="Address" placeholder="Address" value={importantContacts.insuranceAddress} onChange={u("insuranceAddress")} />
              </FieldGrid>
            )}
          </div>

          <div className={ffSubCard}>
            <SectionHeader
              title="Banker"
              subtitle="Banker name, bank, phone"
              expanded={!!expandedSections.banker}
              onClick={() => onToggleSection("banker")}
            />
            {expandedSections.banker && (
              <FieldGrid>
                <Field label="Banker Name" placeholder="Banker Name" value={importantContacts.bankerName} onChange={u("bankerName")} />
                <Field label="Bank Name" placeholder="Bank Name" value={importantContacts.bankName} onChange={u("bankName")} />
                <Field label="Phone" placeholder="Phone" value={importantContacts.bankPhone} onChange={u("bankPhone")} />
                <Field label="Address" placeholder="Address" value={importantContacts.bankAddress} onChange={u("bankAddress")} />
              </FieldGrid>
            )}
          </div>

          <div className={ffSubCard}>
            <SectionHeader
              title="Broker / Investment"
              subtitle="Broker name, company, phone"
              expanded={!!expandedSections.broker}
              onClick={() => onToggleSection("broker")}
            />
            {expandedSections.broker && (
              <FieldGrid>
                <Field label="Broker Name" placeholder="Broker Name" value={importantContacts.brokerName} onChange={u("brokerName")} />
                <Field label="Company Name" placeholder="Company Name" value={importantContacts.investmentCompany} onChange={u("investmentCompany")} />
                <Field label="Phone" placeholder="Phone" value={importantContacts.brokerPhone} onChange={u("brokerPhone")} />
                <Field label="Address" placeholder="Address" value={importantContacts.brokerAddress} onChange={u("brokerAddress")} />
              </FieldGrid>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
