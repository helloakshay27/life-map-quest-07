import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, X } from "lucide-react";

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
      <div className="bg-red-50 border border-red-200 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Emergency Contacts</h3>
              <p className="text-sm text-red-50">People to notify in emergencies</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {emergencyContacts.map((contact, idx) => (
            <div key={contact.id} className="bg-white border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-red-700">Contact #{idx + 1}</span>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveEmergencyContact(contact.id)}
                  className="text-red-500"
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
            className="w-full border-dashed border-red-300 text-red-600"
          >
            + Add Emergency Contact
          </Button>
        </div>
      </div>
    </div>
  );
}
