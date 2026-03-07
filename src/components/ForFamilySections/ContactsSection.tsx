import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";

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
  onUpdateImportantContact: (field: keyof ImportantContacts, value: string) => void;
}

export default function ContactsSection({
  importantContacts,
  onUpdateImportantContact,
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

        <div className="p-5 space-y-6">
          {/* Employer */}
          <div className="space-y-4">
            <h4 className="font-semibold text-purple-900">Employer / Supervisor</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="Supervisor Name" value={importantContacts.employerSupervisor} onChange={(e) => onUpdateImportantContact("employerSupervisor", e.target.value)} />
              <Input placeholder="Phone" value={importantContacts.employerPhone} onChange={(e) => onUpdateImportantContact("employerPhone", e.target.value)} />
              <Input placeholder="Email" className="col-span-2" value={importantContacts.employerEmail} onChange={(e) => onUpdateImportantContact("employerEmail", e.target.value)} />
            </div>
          </div>

          {/* Physician */}
          <div className="space-y-4">
            <h4 className="font-semibold text-purple-900">Physician</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="Doctor Name" value={importantContacts.physicianName} onChange={(e) => onUpdateImportantContact("physicianName", e.target.value)} />
              <Input placeholder="Phone" value={importantContacts.physicianPhone} onChange={(e) => onUpdateImportantContact("physicianPhone", e.target.value)} />
              <Input placeholder="Address" value={importantContacts.physicianAddress} onChange={(e) => onUpdateImportantContact("physicianAddress", e.target.value)} />
              <Input placeholder="Email" value={importantContacts.physicianEmail} onChange={(e) => onUpdateImportantContact("physicianEmail", e.target.value)} />
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold text-purple-900">Legal Professionals</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="Lawyer Name" value={importantContacts.lawyerName} onChange={(e) => onUpdateImportantContact("lawyerName", e.target.value)} />
              <Input placeholder="Phone" value={importantContacts.lawyerPhone} onChange={(e) => onUpdateImportantContact("lawyerPhone", e.target.value)} />
              <Input placeholder="Attorney Name" value={importantContacts.attorneyName} onChange={(e) => onUpdateImportantContact("attorneyName", e.target.value)} />
              <Input placeholder="Attorney Phone" value={importantContacts.attorneyPhone} onChange={(e) => onUpdateImportantContact("attorneyPhone", e.target.value)} />
            </div>
          </div>

          {/* Financial */}
          <div className="space-y-4">
            <h4 className="font-semibold text-purple-900">Financial Advisors</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="Accountant Name" value={importantContacts.accountantName} onChange={(e) => onUpdateImportantContact("accountantName", e.target.value)} />
              <Input placeholder="Phone" value={importantContacts.accountantPhone} onChange={(e) => onUpdateImportantContact("accountantPhone", e.target.value)} />
              <Input placeholder="Insurance Agent" value={importantContacts.insuranceAgentName} onChange={(e) => onUpdateImportantContact("insuranceAgentName", e.target.value)} />
              <Input placeholder="Insurance Phone" value={importantContacts.insurancePhone} onChange={(e) => onUpdateImportantContact("insurancePhone", e.target.value)} />
              <Input placeholder="Banker Name" value={importantContacts.bankerName} onChange={(e) => onUpdateImportantContact("bankerName", e.target.value)} />
              <Input placeholder="Bank Phone" value={importantContacts.bankPhone} onChange={(e) => onUpdateImportantContact("bankPhone", e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline">Cancel</Button>
            <Button className="bg-purple-600 hover:bg-purple-700">Save</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
