import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, Plus, Trash2, Upload } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

// ─── Color Palette (from brand guidelines) ───────────────────────────────────
const C = {
  coral:        "#D5474E",
  coral15:      "rgba(213,71,78,0.15)",
  coral8:       "rgba(213,71,78,0.08)",
  charcoal:     "#2A2A2A",
  cream:        "#F5CECA",
  forest:       "#0B5541",
  forest8:      "rgba(11,85,65,0.08)",
  violet:       "#5534B7",
  sand:         "#C5AB92",
  dune:         "#E8C0A8",
  mist:         "#D1D4A6",
  stone:        "#888765",
  success:      "#44AF90",
  warning:      "#F4A94C",
  crimson:      "#C72540",
  sky:          "#2B6CC5",
};

interface BankAccount {
  id: string;
  bankName: string;
  checkingAccountNo: string;
  checkingJointAccount: boolean;
  savingsAccountNo: string;
  savingsJointAccount: boolean;
}

interface InvestmentsDocuments {
  fixedDepositDetails: string;
  fdBank: string;
  fdCertificateKeptAt: string;
  bankLockerNumber: string;
  lockerBankBranch: string;
  lockerAccessibleBy: string;
  lockerKeyLocation: string;
  dematPortfolioLocation: string;
  bondsDebenturesLocation: string;
  ppfAccountLocation: string;
  npsEpfGratuityDetails: string;
  goldJewelleryDetails: string;
  uploadedDocuments: UploadedDocument[];
}

interface CreditCard {
  id: string;
  cardName: string;
  cardNumber: string;
  bank: string;
  expiryDate: string;
  creditLimit: string;
}

interface UploadedDocument {
  id: string;
  fileName: string;
  uploadedAt: string;
}

interface FinanceSectionProps {
  bankAccounts: BankAccount[];
  investmentsDocuments: InvestmentsDocuments;
  creditCards: CreditCard[];
  onAddBankAccount: () => void;
  onRemoveBankAccount: (id: string) => void;
  onUpdateBankAccount: (id: string, field: keyof BankAccount, value: string | boolean) => void;
  onUpdateInvestmentsDocuments: (field: keyof InvestmentsDocuments, value: string) => void;
  onAddInvestmentDocument: (file: File) => void;
  onRemoveInvestmentDocument: (id: string) => void;
  onAddCreditCard: () => void;
  onRemoveCreditCard: (id: string) => void;
  onUpdateCreditCard: (id: string, field: keyof CreditCard, value: string) => void;
}

export default function FinanceSection({
  bankAccounts,
  investmentsDocuments,
  creditCards,
  onAddBankAccount,
  onRemoveBankAccount,
  onUpdateBankAccount,
  onUpdateInvestmentsDocuments,
  onAddInvestmentDocument,
  onRemoveInvestmentDocument,
  onAddCreditCard,
  onRemoveCreditCard,
  onUpdateCreditCard,
}: FinanceSectionProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    bankAccounts: true,
    investments: true,
    creditCards: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onAddInvestmentDocument(file);
  };

  // ── Shared sub-styles ────────────────────────────────────────────────────
  const sectionWrapper: React.CSSProperties = {
    borderRadius: 10,
    border: `1px solid ${C.sand}`,
    background: `linear-gradient(135deg, ${C.coral8} 0%, ${C.forest8} 100%)`,
    overflow: "hidden",
  };

  const sectionToggleBtn: React.CSSProperties = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
  };

  const cardStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: 8,
    padding: 24,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    border: `1px solid ${C.mist}`,
  };

  const labelStyle: React.CSSProperties = {
    color: C.stone,
    fontWeight: 600,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const addBtnStyle: React.CSSProperties = {
    width: "100%",
    border: `2px dashed ${C.sand}`,
    color: C.coral,
    background: "transparent",
    borderRadius: 8,
    padding: "10px 0",
    cursor: "pointer",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "background 0.15s",
  };

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        style={{ background: C.charcoal, borderRadius: "10px 10px 0 0" }}
        className="text-white p-4 flex items-center gap-3"
      >
        <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 6, padding: 8 }}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
            <path
              fillRule="evenodd"
              d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Personal Finance</h2>
          <p style={{ color: C.cream, fontSize: 13 }}>
            Bank accounts, investments, and financial documents
          </p>
        </div>
      </div>

      {/* ── Bank Accounts ──────────────────────────────────────────────────── */}
      <div style={sectionWrapper}>
        <button style={sectionToggleBtn} onClick={() => toggleSection("bankAccounts")}>
          <h3 style={{ color: C.charcoal, fontWeight: 700, fontSize: 16 }}>Bank Accounts</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: C.stone, fontSize: 12 }}>Click to collapse</span>
            {expandedSections.bankAccounts
              ? <ChevronUp style={{ color: C.coral }} className="h-5 w-5" />
              : <ChevronDown style={{ color: C.coral }} className="h-5 w-5" />}
          </div>
        </button>

        {expandedSections.bankAccounts && (
          <div className="p-6 pt-0 space-y-6">
            {bankAccounts.map((account, index) => (
              <div key={account.id} style={cardStyle}>
                <div className="flex items-center justify-between mb-4">
                  <h4 style={{ color: C.coral, fontWeight: 600 }}>Bank #{index + 1}</h4>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => onRemoveBankAccount(account.id)}
                    style={{ color: C.crimson }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`bank-name-${account.id}`} style={labelStyle}>Bank Name</Label>
                    <Input
                      id={`bank-name-${account.id}`}
                      value={account.bankName}
                      onChange={e => onUpdateBankAccount(account.id, "bankName", e.target.value)}
                      placeholder="Bank Name"
                      className="mt-1"
                      style={{ borderColor: C.mist, outline: "none" }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Checking */}
                    <div>
                      <Label htmlFor={`checking-account-${account.id}`} style={labelStyle}>
                        Checking Account No.
                      </Label>
                      <div className="flex gap-2 items-center mt-1">
                        <Input
                          id={`checking-account-${account.id}`}
                          value={account.checkingAccountNo}
                          onChange={e => onUpdateBankAccount(account.id, "checkingAccountNo", e.target.value)}
                          placeholder="Checking Account No."
                          className="flex-1"
                          style={{ borderColor: C.mist }}
                        />
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`checking-joint-${account.id}`}
                            checked={account.checkingJointAccount}
                            onCheckedChange={checked =>
                              onUpdateBankAccount(account.id, "checkingJointAccount", checked as boolean)
                            }
                          />
                          <Label htmlFor={`checking-joint-${account.id}`} className="text-sm whitespace-nowrap">
                            Joint Account
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* Savings */}
                    <div>
                      <Label htmlFor={`savings-account-${account.id}`} style={labelStyle}>
                        Savings Account No.
                      </Label>
                      <div className="flex gap-2 items-center mt-1">
                        <Input
                          id={`savings-account-${account.id}`}
                          value={account.savingsAccountNo}
                          onChange={e => onUpdateBankAccount(account.id, "savingsAccountNo", e.target.value)}
                          placeholder="Savings Account No."
                          className="flex-1"
                          style={{ borderColor: C.mist }}
                        />
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`savings-joint-${account.id}`}
                            checked={account.savingsJointAccount}
                            onCheckedChange={checked =>
                              onUpdateBankAccount(account.id, "savingsJointAccount", checked as boolean)
                            }
                          />
                          <Label htmlFor={`savings-joint-${account.id}`} className="text-sm whitespace-nowrap">
                            Joint Account
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button style={addBtnStyle} onClick={onAddBankAccount}
              onMouseEnter={e => (e.currentTarget.style.background = C.coral8)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <Plus className="h-4 w-4" /> Add Bank Account
            </button>
          </div>
        )}
      </div>

      {/* ── Investments & Documents ────────────────────────────────────────── */}
      <div style={sectionWrapper}>
        <button style={sectionToggleBtn} onClick={() => toggleSection("investments")}>
          <h3 style={{ color: C.charcoal, fontWeight: 700, fontSize: 16 }}>Investments & Documents</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: C.stone, fontSize: 12 }}>Click to collapse</span>
            {expandedSections.investments
              ? <ChevronUp style={{ color: C.coral }} className="h-5 w-5" />
              : <ChevronDown style={{ color: C.coral }} className="h-5 w-5" />}
          </div>
        </button>

        {expandedSections.investments && (
          <div className="p-6 pt-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: "fd-details",        field: "fixedDepositDetails",    label: "Fixed Deposit (FD) Details",          ph: "Fixed Deposit (FD) Details" },
                { id: "fd-bank",           field: "fdBank",                 label: "FD Bank",                             ph: "FD Bank" },
                { id: "fd-certificate",    field: "fdCertificateKeptAt",    label: "FD Certificate Kept At",              ph: "FD Certificate Kept At" },
                { id: "bank-locker",       field: "bankLockerNumber",       label: "Bank Locker Number",                  ph: "Bank Locker Number" },
                { id: "locker-branch",     field: "lockerBankBranch",       label: "Locker Bank & Branch",                ph: "Locker Bank & Branch" },
                { id: "locker-accessible", field: "lockerAccessibleBy",     label: "Locker Accessible By",                ph: "Locker Accessible By" },
                { id: "locker-key",        field: "lockerKeyLocation",      label: "Locker Key Location",                 ph: "Locker Key Location" },
                { id: "demat-portfolio",   field: "dematPortfolioLocation", label: "Demat / Investment Portfolio Location", ph: "Demat / Investment Portfolio Location" },
                { id: "bonds-debentures",  field: "bondsDebenturesLocation",label: "Bonds / Debentures Location",         ph: "Bonds / Debentures Location" },
                { id: "ppf-account",       field: "ppfAccountLocation",     label: "PPF Account Location",                ph: "PPF Account Location" },
                { id: "nps-epf",           field: "npsEpfGratuityDetails",  label: "NPS / EPF / Gratuity Details",        ph: "NPS / EPF / Gratuity Details" },
              ].map(({ id, field, label, ph }) => (
                <div key={id}>
                  <Label htmlFor={id} style={labelStyle}>{label}</Label>
                  <Input
                    id={id}
                    value={(investmentsDocuments as any)[field]}
                    onChange={e => onUpdateInvestmentsDocuments(field as keyof InvestmentsDocuments, e.target.value)}
                    placeholder={ph}
                    className="mt-1"
                    style={{ borderColor: C.mist }}
                  />
                </div>
              ))}
            </div>

            <div>
              <Label htmlFor="gold-jewellery" style={labelStyle}>Gold / Jewellery Location & Details</Label>
              <Input
                id="gold-jewellery"
                value={investmentsDocuments.goldJewelleryDetails}
                onChange={e => onUpdateInvestmentsDocuments("goldJewelleryDetails", e.target.value)}
                placeholder="Gold / Jewellery Location & Details"
                className="mt-1"
                style={{ borderColor: C.mist }}
              />
            </div>

            {/* Document Upload */}
            <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${C.sand}` }}>
              <div className="flex items-center justify-between mb-3">
                <Label style={{ fontSize: 13, fontWeight: 600, color: C.forest }}>
                  Uploaded Investment Documents{" "}
                  <span style={{ color: C.stone }}>(up to 15)</span>
                </Label>
              </div>

              {investmentsDocuments.uploadedDocuments.length > 0 && (
                <div className="space-y-2 mb-4">
                  {investmentsDocuments.uploadedDocuments.map(doc => (
                    <div
                      key={doc.id}
                      style={{ background: C.coral8, border: `1px solid ${C.sand}`, borderRadius: 6, padding: "10px 12px" }}
                      className="flex items-center justify-between"
                    >
                      <span style={{ fontSize: 13, color: C.charcoal }}>{doc.fileName}</span>
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => onRemoveInvestmentDocument(doc.id)}
                        style={{ color: C.crimson }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative">
                <input
                  type="file" id="investment-document-upload" className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <Button
                  variant="outline"
                  style={{ borderColor: C.coral, color: C.coral, background: "transparent" }}
                  onClick={() => document.getElementById("investment-document-upload")?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Attach Document
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Credit Card Accounts ───────────────────────────────────────────── */}
      <div style={sectionWrapper}>
        <button style={sectionToggleBtn} onClick={() => toggleSection("creditCards")}>
          <h3 style={{ color: C.charcoal, fontWeight: 700, fontSize: 16 }}>Credit Card Accounts</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: C.stone, fontSize: 12 }}>Click to collapse</span>
            {expandedSections.creditCards
              ? <ChevronUp style={{ color: C.coral }} className="h-5 w-5" />
              : <ChevronDown style={{ color: C.coral }} className="h-5 w-5" />}
          </div>
        </button>

        {expandedSections.creditCards && (
          <div className="p-6 pt-0 space-y-4">
            {creditCards.map((card, index) => (
              <div key={card.id} style={cardStyle}>
                <div className="flex items-center justify-between mb-4">
                  <h4 style={{ color: C.coral, fontWeight: 600 }}>Credit Card #{index + 1}</h4>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => onRemoveCreditCard(card.id)}
                    style={{ color: C.crimson }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: `card-name-${card.id}`,   field: "cardName",    label: "Card Name",    ph: "Card Name" },
                    { id: `card-number-${card.id}`, field: "cardNumber",  label: "Card Number",  ph: "Card Number" },
                    { id: `card-bank-${card.id}`,   field: "bank",        label: "Bank",         ph: "Bank" },
                    { id: `card-expiry-${card.id}`, field: "expiryDate",  label: "Expiry Date",  ph: "MM/YY" },
                  ].map(({ id, field, label, ph }) => (
                    <div key={id}>
                      <Label htmlFor={id} style={labelStyle}>{label}</Label>
                      <Input
                        id={id}
                        value={(card as any)[field]}
                        onChange={e => onUpdateCreditCard(card.id, field as keyof CreditCard, e.target.value)}
                        placeholder={ph}
                        className="mt-1"
                        style={{ borderColor: C.mist }}
                      />
                    </div>
                  ))}

                  <div className="md:col-span-2">
                    <Label htmlFor={`card-limit-${card.id}`} style={labelStyle}>Credit Limit</Label>
                    <Input
                      id={`card-limit-${card.id}`}
                      value={card.creditLimit}
                      onChange={e => onUpdateCreditCard(card.id, "creditLimit", e.target.value)}
                      placeholder="Credit Limit"
                      className="mt-1"
                      style={{ borderColor: C.mist }}
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              style={addBtnStyle} onClick={onAddCreditCard}
              onMouseEnter={e => (e.currentTarget.style.background = C.coral8)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <Plus className="h-4 w-4" /> Add Credit Card
            </button>
          </div>
        )}
      </div>
    </div>
  );
}