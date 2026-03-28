import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, Plus, Trash2, Upload, Wallet } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ffSectionShell,
  ffSectionHeader,
  ffSectionHeaderIconWrap,
  ffSectionHeaderTitle,
  ffSectionHeaderSubtitle,
  ffSubCard,
  ffAccordionTrigger,
  ffAccordionTitle,
  ffChevron,
  ffAddDashed,
  ffRemoveGhost,
  ffDocRow,
  ffLabelUpper,
  ffBtnSecondary,
} from "@/components/ForFamilySections/forFamilySectionStyles";
import { cn } from "@/lib/utils";

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

const fieldLabelClass = cn(ffLabelUpper, "mb-1 block");

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
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onAddInvestmentDocument(file);
  };

  const innerCard = "bg-card border border-border rounded-xl p-6 shadow-sm";

  return (
    <div className={ffSectionShell}>
      <div className={ffSectionHeader}>
        <div className="flex items-center gap-3">
          <div className={ffSectionHeaderIconWrap}>
            <Wallet className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className={ffSectionHeaderTitle}>Personal Finance</h2>
            <p className={ffSectionHeaderSubtitle}>Bank accounts, investments, and financial documents</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Bank Accounts */}
        <div className={ffSubCard}>
          <button type="button" className={ffAccordionTrigger} onClick={() => toggleSection("bankAccounts")}>
            <h3 className={ffAccordionTitle}>Bank Accounts</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#888780]">Click to {expandedSections.bankAccounts ? "collapse" : "expand"}</span>
              {expandedSections.bankAccounts ? (
                <ChevronUp className={cn(ffChevron)} />
              ) : (
                <ChevronDown className={cn(ffChevron)} />
              )}
            </div>
          </button>

          {expandedSections.bankAccounts && (
            <div className="border-t border-border bg-muted/10 p-6 space-y-6">
              {bankAccounts.map((account, index) => (
                <div key={account.id} className={innerCard}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-primary">Bank #{index + 1}</h4>
                    <Button variant="ghost" size="sm" onClick={() => onRemoveBankAccount(account.id)} className={ffRemoveGhost}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`bank-name-${account.id}`} className={fieldLabelClass}>
                        Bank Name
                      </Label>
                      <Input
                        id={`bank-name-${account.id}`}
                        value={account.bankName}
                        onChange={(e) => onUpdateBankAccount(account.id, "bankName", e.target.value)}
                        placeholder="Bank Name"
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`checking-account-${account.id}`} className={fieldLabelClass}>
                          Checking Account No.
                        </Label>
                        <div className="flex gap-2 items-center mt-1">
                          <Input
                            id={`checking-account-${account.id}`}
                            value={account.checkingAccountNo}
                            onChange={(e) => onUpdateBankAccount(account.id, "checkingAccountNo", e.target.value)}
                            placeholder="Checking Account No."
                            className="flex-1"
                          />
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`checking-joint-${account.id}`}
                              checked={account.checkingJointAccount}
                              onCheckedChange={(checked) =>
                                onUpdateBankAccount(account.id, "checkingJointAccount", checked as boolean)
                              }
                            />
                            <Label htmlFor={`checking-joint-${account.id}`} className="text-sm whitespace-nowrap">
                              Joint Account
                            </Label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`savings-account-${account.id}`} className={fieldLabelClass}>
                          Savings Account No.
                        </Label>
                        <div className="flex gap-2 items-center mt-1">
                          <Input
                            id={`savings-account-${account.id}`}
                            value={account.savingsAccountNo}
                            onChange={(e) => onUpdateBankAccount(account.id, "savingsAccountNo", e.target.value)}
                            placeholder="Savings Account No."
                            className="flex-1"
                          />
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`savings-joint-${account.id}`}
                              checked={account.savingsJointAccount}
                              onCheckedChange={(checked) =>
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

              <Button variant="outline" onClick={onAddBankAccount} className={ffAddDashed}>
                <Plus className="h-4 w-4" /> Add Bank Account
              </Button>
            </div>
          )}
        </div>

        {/* Investments & Documents */}
        <div className={ffSubCard}>
          <button type="button" className={ffAccordionTrigger} onClick={() => toggleSection("investments")}>
            <h3 className={ffAccordionTitle}>Investments & Documents</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#888780]">Click to {expandedSections.investments ? "collapse" : "expand"}</span>
              {expandedSections.investments ? (
                <ChevronUp className={ffChevron} />
              ) : (
                <ChevronDown className={ffChevron} />
              )}
            </div>
          </button>

          {expandedSections.investments && (
            <div className="border-t border-border bg-muted/10 p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "fd-details", field: "fixedDepositDetails", label: "Fixed Deposit (FD) Details", ph: "Fixed Deposit (FD) Details" },
                  { id: "fd-bank", field: "fdBank", label: "FD Bank", ph: "FD Bank" },
                  { id: "fd-certificate", field: "fdCertificateKeptAt", label: "FD Certificate Kept At", ph: "FD Certificate Kept At" },
                  { id: "bank-locker", field: "bankLockerNumber", label: "Bank Locker Number", ph: "Bank Locker Number" },
                  { id: "locker-branch", field: "lockerBankBranch", label: "Locker Bank & Branch", ph: "Locker Bank & Branch" },
                  { id: "locker-accessible", field: "lockerAccessibleBy", label: "Locker Accessible By", ph: "Locker Accessible By" },
                  { id: "locker-key", field: "lockerKeyLocation", label: "Locker Key Location", ph: "Locker Key Location" },
                  { id: "demat-portfolio", field: "dematPortfolioLocation", label: "Demat / Investment Portfolio Location", ph: "Demat / Investment Portfolio Location" },
                  { id: "bonds-debentures", field: "bondsDebenturesLocation", label: "Bonds / Debentures Location", ph: "Bonds / Debentures Location" },
                  { id: "ppf-account", field: "ppfAccountLocation", label: "PPF Account Location", ph: "PPF Account Location" },
                  { id: "nps-epf", field: "npsEpfGratuityDetails", label: "NPS / EPF / Gratuity Details", ph: "NPS / EPF / Gratuity Details" },
                ].map(({ id, field, label, ph }) => (
                  <div key={id}>
                    <Label htmlFor={id} className={fieldLabelClass}>
                      {label}
                    </Label>
                    <Input
                      id={id}
                      value={(investmentsDocuments as Record<string, string>)[field]}
                      onChange={(e) => onUpdateInvestmentsDocuments(field as keyof InvestmentsDocuments, e.target.value)}
                      placeholder={ph}
                      className="mt-1"
                    />
                  </div>
                ))}
              </div>

              <div>
                <Label htmlFor="gold-jewellery" className={fieldLabelClass}>
                  Gold / Jewellery Location & Details
                </Label>
                <Input
                  id="gold-jewellery"
                  value={investmentsDocuments.goldJewelleryDetails}
                  onChange={(e) => onUpdateInvestmentsDocuments("goldJewelleryDetails", e.target.value)}
                  placeholder="Gold / Jewellery Location & Details"
                  className="mt-1"
                />
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <Label className="text-sm font-semibold text-foreground">
                  Uploaded Investment Documents <span className="text-[#888780] font-normal">(up to 15)</span>
                </Label>

                {investmentsDocuments.uploadedDocuments.length > 0 && (
                  <div className="space-y-2 mb-4 mt-3">
                    {investmentsDocuments.uploadedDocuments.map((doc) => (
                      <div key={doc.id} className={ffDocRow}>
                        <span className="text-sm">{doc.fileName}</span>
                        <Button variant="ghost" size="sm" onClick={() => onRemoveInvestmentDocument(doc.id)} className={ffRemoveGhost}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="relative mt-3">
                  <input
                    type="file"
                    id="investment-document-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <Button variant="outline" className={ffBtnSecondary} onClick={() => document.getElementById("investment-document-upload")?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Attach Document
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Credit Cards */}
        <div className={ffSubCard}>
          <button type="button" className={ffAccordionTrigger} onClick={() => toggleSection("creditCards")}>
            <h3 className={ffAccordionTitle}>Credit Card Accounts</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#888780]">Click to {expandedSections.creditCards ? "collapse" : "expand"}</span>
              {expandedSections.creditCards ? (
                <ChevronUp className={ffChevron} />
              ) : (
                <ChevronDown className={ffChevron} />
              )}
            </div>
          </button>

          {expandedSections.creditCards && (
            <div className="border-t border-border bg-muted/10 p-6 space-y-4">
              {creditCards.map((card, index) => (
                <div key={card.id} className={innerCard}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-primary">Credit Card #{index + 1}</h4>
                    <Button variant="ghost" size="sm" onClick={() => onRemoveCreditCard(card.id)} className={ffRemoveGhost}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: `card-name-${card.id}`, field: "cardName", label: "Card Name", ph: "Card Name" },
                      { id: `card-number-${card.id}`, field: "cardNumber", label: "Card Number", ph: "Card Number" },
                      { id: `card-bank-${card.id}`, field: "bank", label: "Bank", ph: "Bank" },
                      { id: `card-expiry-${card.id}`, field: "expiryDate", label: "Expiry Date", ph: "MM/YY" },
                    ].map(({ id, field, label, ph }) => (
                      <div key={id}>
                        <Label htmlFor={id} className={fieldLabelClass}>
                          {label}
                        </Label>
                        <Input
                          id={id}
                          value={(card as Record<string, string>)[field]}
                          onChange={(e) => onUpdateCreditCard(card.id, field as keyof CreditCard, e.target.value)}
                          placeholder={ph}
                          className="mt-1"
                        />
                      </div>
                    ))}

                    <div className="md:col-span-2">
                      <Label htmlFor={`card-limit-${card.id}`} className={fieldLabelClass}>
                        Credit Limit
                      </Label>
                      <Input
                        id={`card-limit-${card.id}`}
                        value={card.creditLimit}
                        onChange={(e) => onUpdateCreditCard(card.id, "creditLimit", e.target.value)}
                        placeholder="Credit Limit"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={onAddCreditCard} className={ffAddDashed}>
                <Plus className="h-4 w-4" /> Add Credit Card
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
