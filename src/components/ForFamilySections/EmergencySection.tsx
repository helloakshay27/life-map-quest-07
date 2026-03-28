import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, X } from "lucide-react";
import {
  ffSectionShell,
  ffSectionHeader,
  ffSectionHeaderIconWrap,
  ffSectionHeaderTitle,
  ffSectionHeaderSubtitle,
  ffAddDashed,
  ffRemoveGhost,
  ffItemIndex,
} from "@/components/ForFamilySections/forFamilySectionStyles";

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  address: string;
  homePhone: string;
  workPhone: string;
  email: string;
}

interface EmergencySectionProps {
  emergencyContacts: EmergencyContact[];
  onAddEmergencyContact: () => void;
  onRemoveEmergencyContact: (id: string) => void;
  onUpdateEmergencyContact: (id: string, field: keyof EmergencyContact, value: string) => void;
}

export default function EmergencySection({
  emergencyContacts,
  onAddEmergencyContact,
  onRemoveEmergencyContact,
  onUpdateEmergencyContact,
}: EmergencySectionProps) {
  return (
    <div className="space-y-6">
      <div className={ffSectionShell}>
        <div className={ffSectionHeader}>
          <div className="flex items-center gap-3">
            <div className={ffSectionHeaderIconWrap}>
              <AlertCircle className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className={ffSectionHeaderTitle}>Emergency Contacts</h3>
              <p className={ffSectionHeaderSubtitle}>People to notify in emergencies</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {emergencyContacts.map((contact, idx) => (
            <div key={contact.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className={ffItemIndex}>Contact #{idx + 1}</span>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveEmergencyContact(contact.id)}
                  className={ffRemoveGhost}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input 
                  placeholder="Name"
                  value={contact.name}
                  onChange={(e) => onUpdateEmergencyContact(contact.id, "name", e.target.value)}
                />
                <Input 
                  placeholder="Relationship"
                  value={contact.relationship}
                  onChange={(e) => onUpdateEmergencyContact(contact.id, "relationship", e.target.value)}
                />
                <Input 
                  placeholder="Home Phone"
                  value={contact.homePhone}
                  onChange={(e) => onUpdateEmergencyContact(contact.id, "homePhone", e.target.value)}
                />
                <Input 
                  placeholder="Work Phone"
                  value={contact.workPhone}
                  onChange={(e) => onUpdateEmergencyContact(contact.id, "workPhone", e.target.value)}
                />
                <Input 
                  placeholder="Email"
                  value={contact.email}
                  onChange={(e) => onUpdateEmergencyContact(contact.id, "email", e.target.value)}
                />
                <Input 
                  placeholder="Address"
                  value={contact.address}
                  onChange={(e) => onUpdateEmergencyContact(contact.id, "address", e.target.value)}
                />
              </div>
            </div>
          ))}
          <Button 
            variant="outline"
            onClick={onAddEmergencyContact}
            className={ffAddDashed}
          >
            + Add Emergency Contact
          </Button>
        </div>
      </div>
    </div>
  );
}
