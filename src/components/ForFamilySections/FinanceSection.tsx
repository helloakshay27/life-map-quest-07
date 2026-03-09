import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, Plus, Trash2, Upload } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

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
    if (file) {
      onAddInvestmentDocument(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-teal-600 text-white p-4 rounded-t-lg flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Personal Finance</h2>
          <p className="text-sm text-teal-100">Bank accounts, investments, and financial documents</p>
        </div>
      </div>

      {/* Bank Accounts Section */}
      <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-lg border border-teal-200">
        <button
          onClick={() => toggleSection("bankAccounts")}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <h3 className="text-lg font-semibold text-teal-700 flex items-center gap-2">
            Bank Accounts
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Click to collapse</span>
            {expandedSections.bankAccounts ? (
              <ChevronUp className="h-5 w-5 text-teal-600" />
            ) : (
              <ChevronDown className="h-5 w-5 text-teal-600" />
            )}
          </div>
        </button>

        {expandedSections.bankAccounts && (
          <div className="p-6 pt-0 space-y-6">
            {bankAccounts.map((account, index) => (
              <div key={account.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-teal-700">Bank #{index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveBankAccount(account.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`bank-name-${account.id}`} className="text-gray-700 font-medium text-xs uppercase">
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
                      <Label htmlFor={`checking-account-${account.id}`} className="text-gray-700 font-medium text-xs uppercase">
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
                      <Label htmlFor={`savings-account-${account.id}`} className="text-gray-700 font-medium text-xs uppercase">
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

            <Button
              onClick={onAddBankAccount}
              variant="outline"
              className="w-full border-dashed border-2 border-teal-300 text-teal-700 hover:bg-teal-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Bank Account
            </Button>
          </div>
        )}
      </div>

      {/* Investments & Documents Section */}
      <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-lg border border-teal-200">
        <button
          onClick={() => toggleSection("investments")}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <h3 className="text-lg font-semibold text-teal-700 flex items-center gap-2">
            Investments & Documents
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Click to collapse</span>
            {expandedSections.investments ? (
              <ChevronUp className="h-5 w-5 text-teal-600" />
            ) : (
              <ChevronDown className="h-5 w-5 text-teal-600" />
            )}
          </div>
        </button>

        {expandedSections.investments && (
          <div className="p-6 pt-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fd-details" className="text-gray-700 font-medium text-xs uppercase">
                  Fixed Deposit (FD) Details
                </Label>
                <Input
                  id="fd-details"
                  value={investmentsDocuments.fixedDepositDetails}
                  onChange={(e) => onUpdateInvestmentsDocuments("fixedDepositDetails", e.target.value)}
                  placeholder="Fixed Deposit (FD) Details"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="fd-bank" className="text-gray-700 font-medium text-xs uppercase">
                  FD Bank
                </Label>
                <Input
                  id="fd-bank"
                  value={investmentsDocuments.fdBank}
                  onChange={(e) => onUpdateInvestmentsDocuments("fdBank", e.target.value)}
                  placeholder="FD Bank"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="fd-certificate" className="text-gray-700 font-medium text-xs uppercase">
                  FD Certificate Kept At
                </Label>
                <Input
                  id="fd-certificate"
                  value={investmentsDocuments.fdCertificateKeptAt}
                  onChange={(e) => onUpdateInvestmentsDocuments("fdCertificateKeptAt", e.target.value)}
                  placeholder="FD Certificate Kept At"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="bank-locker" className="text-gray-700 font-medium text-xs uppercase">
                  Bank Locker Number
                </Label>
                <Input
                  id="bank-locker"
                  value={investmentsDocuments.bankLockerNumber}
                  onChange={(e) => onUpdateInvestmentsDocuments("bankLockerNumber", e.target.value)}
                  placeholder="Bank Locker Number"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="locker-branch" className="text-gray-700 font-medium text-xs uppercase">
                  Locker Bank & Branch
                </Label>
                <Input
                  id="locker-branch"
                  value={investmentsDocuments.lockerBankBranch}
                  onChange={(e) => onUpdateInvestmentsDocuments("lockerBankBranch", e.target.value)}
                  placeholder="Locker Bank & Branch"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="locker-accessible" className="text-gray-700 font-medium text-xs uppercase">
                  Locker Accessible By
                </Label>
                <Input
                  id="locker-accessible"
                  value={investmentsDocuments.lockerAccessibleBy}
                  onChange={(e) => onUpdateInvestmentsDocuments("lockerAccessibleBy", e.target.value)}
                  placeholder="Locker Accessible By"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="locker-key" className="text-gray-700 font-medium text-xs uppercase">
                  Locker Key Location
                </Label>
                <Input
                  id="locker-key"
                  value={investmentsDocuments.lockerKeyLocation}
                  onChange={(e) => onUpdateInvestmentsDocuments("lockerKeyLocation", e.target.value)}
                  placeholder="Locker Key Location"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="demat-portfolio" className="text-gray-700 font-medium text-xs uppercase">
                  Demat / Investment Portfolio Location
                </Label>
                <Input
                  id="demat-portfolio"
                  value={investmentsDocuments.dematPortfolioLocation}
                  onChange={(e) => onUpdateInvestmentsDocuments("dematPortfolioLocation", e.target.value)}
                  placeholder="Demat / Investment Portfolio Location"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="bonds-debentures" className="text-gray-700 font-medium text-xs uppercase">
                  Bonds / Debentures Location
                </Label>
                <Input
                  id="bonds-debentures"
                  value={investmentsDocuments.bondsDebenturesLocation}
                  onChange={(e) => onUpdateInvestmentsDocuments("bondsDebenturesLocation", e.target.value)}
                  placeholder="Bonds / Debentures Location"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="ppf-account" className="text-gray-700 font-medium text-xs uppercase">
                  PPF Account Location
                </Label>
                <Input
                  id="ppf-account"
                  value={investmentsDocuments.ppfAccountLocation}
                  onChange={(e) => onUpdateInvestmentsDocuments("ppfAccountLocation", e.target.value)}
                  placeholder="PPF Account Location"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="nps-epf" className="text-gray-700 font-medium text-xs uppercase">
                  NPS / EPF / Gratuity Details
                </Label>
                <Input
                  id="nps-epf"
                  value={investmentsDocuments.npsEpfGratuityDetails}
                  onChange={(e) => onUpdateInvestmentsDocuments("npsEpfGratuityDetails", e.target.value)}
                  placeholder="NPS / EPF / Gratuity Details"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="gold-jewellery" className="text-gray-700 font-medium text-xs uppercase">
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

            {/* Document Upload */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium text-teal-700">
                  Uploaded Investment Documents <span className="text-gray-500">(up to 15)</span>
                </Label>
              </div>

              {investmentsDocuments.uploadedDocuments.length > 0 && (
                <div className="space-y-2 mb-4">
                  {investmentsDocuments.uploadedDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-3 rounded border">
                      <span className="text-sm text-gray-700">{doc.fileName}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveInvestmentDocument(doc.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative">
                <input
                  type="file"
                  id="investment-document-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <Button
                  variant="outline"
                  className="w-auto border-teal-300 text-teal-700 hover:bg-teal-50"
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

      {/* Credit Card Accounts Section */}
      <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-lg border border-teal-200">
        <button
          onClick={() => toggleSection("creditCards")}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <h3 className="text-lg font-semibold text-teal-700 flex items-center gap-2">
            Credit Card Accounts
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Click to collapse</span>
            {expandedSections.creditCards ? (
              <ChevronUp className="h-5 w-5 text-teal-600" />
            ) : (
              <ChevronDown className="h-5 w-5 text-teal-600" />
            )}
          </div>
        </button>

        {expandedSections.creditCards && (
          <div className="p-6 pt-0 space-y-4">
            {creditCards.map((card, index) => (
              <div key={card.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-teal-700">Credit Card #{index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveCreditCard(card.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`card-name-${card.id}`} className="text-gray-700 font-medium text-xs uppercase">
                      Card Name
                    </Label>
                    <Input
                      id={`card-name-${card.id}`}
                      value={card.cardName}
                      onChange={(e) => onUpdateCreditCard(card.id, "cardName", e.target.value)}
                      placeholder="Card Name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`card-number-${card.id}`} className="text-gray-700 font-medium text-xs uppercase">
                      Card Number
                    </Label>
                    <Input
                      id={`card-number-${card.id}`}
                      value={card.cardNumber}
                      onChange={(e) => onUpdateCreditCard(card.id, "cardNumber", e.target.value)}
                      placeholder="Card Number"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`card-bank-${card.id}`} className="text-gray-700 font-medium text-xs uppercase">
                      Bank
                    </Label>
                    <Input
                      id={`card-bank-${card.id}`}
                      value={card.bank}
                      onChange={(e) => onUpdateCreditCard(card.id, "bank", e.target.value)}
                      placeholder="Bank"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`card-expiry-${card.id}`} className="text-gray-700 font-medium text-xs uppercase">
                      Expiry Date
                    </Label>
                    <Input
                      id={`card-expiry-${card.id}`}
                      value={card.expiryDate}
                      onChange={(e) => onUpdateCreditCard(card.id, "expiryDate", e.target.value)}
                      placeholder="MM/YY"
                      className="mt-1"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor={`card-limit-${card.id}`} className="text-gray-700 font-medium text-xs uppercase">
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

            <Button
              onClick={onAddCreditCard}
              variant="outline"
              className="w-full border-dashed border-2 border-teal-300 text-teal-700 hover:bg-teal-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Credit Card
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
