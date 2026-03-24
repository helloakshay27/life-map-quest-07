import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, ChevronDown } from "lucide-react";

// ─── Brand Palette ────────────────────────────────────────────────────────────
const C = {
  coral:     "#D5474E",
  coral8:    "rgba(213,71,78,0.08)",
  coral15:   "rgba(213,71,78,0.15)",
  charcoal:  "#2A2A2A",
  cream:     "#F5CECA",
  forest:    "#0B5541",
  forest8:   "rgba(11,85,65,0.08)",
  violet:    "#5534B7",
  violet8:   "rgba(85,52,183,0.08)",
  sand:      "#C5AB92",
  dune:      "#E8C0A8",
  mist:      "#D1D4A6",
  stone:     "#888765",
  success:   "#44AF90",
  warning:   "#F4A94C",
  crimson:   "#C72540",
  sky:       "#2B6CC5",
};

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

// ─── Shared styles ────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  color: C.stone,
  fontWeight: 600,
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: `1px solid ${C.sand}`,
  borderRadius: 8,
  overflow: "hidden",
};

const dividerStyle: React.CSSProperties = {
  borderTop: `1px solid ${C.mist}`,
};

// ─── Section toggle header ────────────────────────────────────────────────────
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
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 16px",
        background: expanded ? C.coral8 : "transparent",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        transition: "background 0.15s",
      }}
      onMouseEnter={e => {
        if (!expanded) e.currentTarget.style.background = C.forest8;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = expanded ? C.coral8 : "transparent";
      }}
    >
      <div>
        <span style={{ fontWeight: 600, color: C.charcoal, fontSize: 14 }}>{title}</span>
        {subtitle && (
          <span style={{ fontSize: 12, color: C.stone, marginLeft: 8 }}>— {subtitle}</span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, color: C.stone }}>
          Click to {expanded ? "collapse" : "expand"}
        </span>
        <ChevronDown
          className="h-5 w-5"
          style={{
            color: C.coral,
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </div>
    </button>
  );
}

// ─── Reusable field grid ──────────────────────────────────────────────────────
function FieldGrid({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{ ...dividerStyle, padding: 16 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {children}
    </div>
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
        <Label style={labelStyle}>{label}</Label>
        <Input
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ borderColor: C.mist }}
        />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ContactsSection({
  importantContacts,
  expandedSections,
  onUpdateImportantContact,
  onToggleSection,
}: ContactsSectionProps) {
  const u = (field: keyof ImportantContacts) =>
    (v: string) => onUpdateImportantContact(field, v);

  return (
    <div className="space-y-6">
      <div
        style={{
          background: `linear-gradient(135deg, ${C.coral8}, ${C.forest8})`,
          border: `1px solid ${C.sand}`,
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div
          style={{
            background: C.charcoal,
            padding: "16px 20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                background: "rgba(255,255,255,0.12)",
                padding: 8,
                borderRadius: 8,
              }}
            >
              <Users className="h-5 w-5" style={{ color: "#fff" }} />
            </div>
            <div>
              <h3 style={{ fontWeight: 600, fontSize: 18, color: "#fff" }}>
                Important Contacts
              </h3>
              <p style={{ fontSize: 13, color: C.cream }}>
                Professional contacts &amp; advisors
              </p>
            </div>
          </div>
        </div>

        {/* ── Contact cards ───────────────────────────────────────────────── */}
        <div style={{ padding: 20 }} className="space-y-4">

          {/* Employer / Supervisor */}
          <div style={cardStyle}>
            <SectionHeader
              title="Employer / Supervisor"
              expanded={!!expandedSections.employer}
              onClick={() => onToggleSection("employer")}
            />
            {expandedSections.employer && (
              <FieldGrid>
                <Field label="Immediate Supervisor" placeholder="Immediate Supervisor"
                  value={importantContacts.employerSupervisor} onChange={u("employerSupervisor")} />
                <Field label="Office Phone" placeholder="Office Phone"
                  value={importantContacts.employerPhone} onChange={u("employerPhone")} />
                <Field label="Email" placeholder="Email"
                  value={importantContacts.employerEmail} onChange={u("employerEmail")} fullWidth />
              </FieldGrid>
            )}
          </div>

          {/* Personal Physician */}
          <div style={cardStyle}>
            <SectionHeader
              title="Personal Physician"
              subtitle="Doctor name, phone, address"
              expanded={!!expandedSections.physician}
              onClick={() => onToggleSection("physician")}
            />
            {expandedSections.physician && (
              <FieldGrid>
                <Field label="Doctor Name" placeholder="Doctor Name"
                  value={importantContacts.physicianName} onChange={u("physicianName")} />
                <Field label="Phone" placeholder="Phone"
                  value={importantContacts.physicianPhone} onChange={u("physicianPhone")} />
                <Field label="Address" placeholder="Address"
                  value={importantContacts.physicianAddress} onChange={u("physicianAddress")} />
                <Field label="Email" placeholder="Email"
                  value={importantContacts.physicianEmail} onChange={u("physicianEmail")} />
              </FieldGrid>
            )}
          </div>

          {/* Pandit / Priest */}
          <div style={cardStyle}>
            <SectionHeader
              title="Pandit / Priest / Religious Contact"
              subtitle="Name, phone, address"
              expanded={!!expandedSections.pandit}
              onClick={() => onToggleSection("pandit")}
            />
            {expandedSections.pandit && (
              <FieldGrid>
                <Field label="Name" placeholder="Name"
                  value={importantContacts.lawyerName} onChange={u("lawyerName")} />
                <Field label="Phone" placeholder="Phone"
                  value={importantContacts.lawyerPhone} onChange={u("lawyerPhone")} />
                <Field label="Address" placeholder="Address"
                  value={importantContacts.lawyerAddress} onChange={u("lawyerAddress")} fullWidth />
              </FieldGrid>
            )}
          </div>

          {/* Attorney */}
          <div style={cardStyle}>
            <SectionHeader
              title="Attorney"
              subtitle="Name, phone, email"
              expanded={!!expandedSections.attorney}
              onClick={() => onToggleSection("attorney")}
            />
            {expandedSections.attorney && (
              <FieldGrid>
                <Field label="Attorney Name" placeholder="Attorney Name"
                  value={importantContacts.attorneyName} onChange={u("attorneyName")} />
                <Field label="Phone" placeholder="Phone"
                  value={importantContacts.attorneyPhone} onChange={u("attorneyPhone")} />
                <Field label="Email" placeholder="Email"
                  value={importantContacts.attorneyEmail} onChange={u("attorneyEmail")} fullWidth />
              </FieldGrid>
            )}
          </div>

          {/* Accountant */}
          <div style={cardStyle}>
            <SectionHeader
              title="Accountant"
              subtitle="Name, phone, address"
              expanded={!!expandedSections.accountant}
              onClick={() => onToggleSection("accountant")}
            />
            {expandedSections.accountant && (
              <FieldGrid>
                <Field label="Name" placeholder="Accountant Name"
                  value={importantContacts.accountantName} onChange={u("accountantName")} />
                <Field label="Phone" placeholder="Phone"
                  value={importantContacts.accountantPhone} onChange={u("accountantPhone")} />
                <Field label="Address" placeholder="Address"
                  value={importantContacts.accountantAddress} onChange={u("accountantAddress")} fullWidth />
              </FieldGrid>
            )}
          </div>

          {/* Insurance Agent */}
          <div style={cardStyle}>
            <SectionHeader
              title="Insurance Agent"
              subtitle="Agent name, agency, phone"
              expanded={!!expandedSections.insurance}
              onClick={() => onToggleSection("insurance")}
            />
            {expandedSections.insurance && (
              <FieldGrid>
                <Field label="Agent Name" placeholder="Agent Name"
                  value={importantContacts.insuranceAgentName} onChange={u("insuranceAgentName")} />
                <Field label="Agency Name" placeholder="Agency Name"
                  value={importantContacts.insuranceAgencyName} onChange={u("insuranceAgencyName")} />
                <Field label="Phone" placeholder="Phone"
                  value={importantContacts.insurancePhone} onChange={u("insurancePhone")} />
                <Field label="Address" placeholder="Address"
                  value={importantContacts.insuranceAddress} onChange={u("insuranceAddress")} />
              </FieldGrid>
            )}
          </div>

          {/* Banker */}
          <div style={cardStyle}>
            <SectionHeader
              title="Banker"
              subtitle="Banker name, bank, phone"
              expanded={!!expandedSections.banker}
              onClick={() => onToggleSection("banker")}
            />
            {expandedSections.banker && (
              <FieldGrid>
                <Field label="Banker Name" placeholder="Banker Name"
                  value={importantContacts.bankerName} onChange={u("bankerName")} />
                <Field label="Bank Name" placeholder="Bank Name"
                  value={importantContacts.bankName} onChange={u("bankName")} />
                <Field label="Phone" placeholder="Phone"
                  value={importantContacts.bankPhone} onChange={u("bankPhone")} />
                <Field label="Address" placeholder="Address"
                  value={importantContacts.bankAddress} onChange={u("bankAddress")} />
              </FieldGrid>
            )}
          </div>

          {/* Broker / Investment */}
          <div style={cardStyle}>
            <SectionHeader
              title="Broker / Investment"
              subtitle="Broker name, company, phone"
              expanded={!!expandedSections.broker}
              onClick={() => onToggleSection("broker")}
            />
            {expandedSections.broker && (
              <FieldGrid>
                <Field label="Broker Name" placeholder="Broker Name"
                  value={importantContacts.brokerName} onChange={u("brokerName")} />
                <Field label="Company Name" placeholder="Company Name"
                  value={importantContacts.investmentCompany} onChange={u("investmentCompany")} />
                <Field label="Phone" placeholder="Phone"
                  value={importantContacts.brokerPhone} onChange={u("brokerPhone")} />
                <Field label="Address" placeholder="Address"
                  value={importantContacts.brokerAddress} onChange={u("brokerAddress")} />
              </FieldGrid>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}