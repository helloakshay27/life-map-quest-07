import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, X } from "lucide-react";

interface Sibling {
  id: string;
  name: string;
  aadhar: string;
  address: string;
  phone: string;
  relation: string;
}

interface Child {
  id: string;
  name: string;
  dob: string;
  aadhar: string;
  address: string;
  phone: string;
  email: string;
}

interface Grandchild {
  id: string;
  name: string;
  dob: string;
  parentName: string;
  address: string;
  phone: string;
}

interface FamilySectionProps {
  husbandSiblings: Sibling[];
  wifeSiblings: Sibling[];
  children: Child[];
  grandchildren: Grandchild[];
  onAddHusbandSibling: () => void;
  onRemoveHusbandSibling: (id: string) => void;
  onUpdateHusbandSibling: (id: string, field: keyof Sibling, value: string) => void;
  onAddWifeSibling: () => void;
  onRemoveWifeSibling: (id: string) => void;
  onUpdateWifeSibling: (id: string, field: keyof Sibling, value: string) => void;
  onAddChild: () => void;
  onRemoveChild: (id: string) => void;
  onUpdateChild: (id: string, field: keyof Child, value: string) => void;
  onAddGrandchild: () => void;
  onRemoveGrandchild: (id: string) => void;
  onUpdateGrandchild: (id: string, field: keyof Grandchild, value: string) => void;
}

export default function FamilySection({
  husbandSiblings,
  wifeSiblings,
  children,
  grandchildren,
  onAddHusbandSibling,
  onRemoveHusbandSibling,
  onUpdateHusbandSibling,
  onAddWifeSibling,
  onRemoveWifeSibling,
  onUpdateWifeSibling,
  onAddChild,
  onRemoveChild,
  onUpdateChild,
  onAddGrandchild,
  onRemoveGrandchild,
  onUpdateGrandchild,
}: FamilySectionProps) {
  return (
    <div className="space-y-6">
      <div className="bg-cyan-50 border border-cyan-200 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Family Information</h3>
              <p className="text-sm text-cyan-50">Family members and relationships</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* Children */}
          <div className="space-y-4">
            <h4 className="font-semibold text-cyan-900">Children</h4>
            {children.map((child, idx) => (
              <div key={child.id} className="bg-white border border-cyan-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-cyan-700">Child #{idx + 1}</span>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveChild(child.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input 
                    placeholder="Name"
                    value={child.name}
                    onChange={(e) => onUpdateChild(child.id, "name", e.target.value)}
                  />
                  <Input 
                    type="date"
                    value={child.dob}
                    onChange={(e) => onUpdateChild(child.id, "dob", e.target.value)}
                  />
                  <Input 
                    placeholder="Aadhar"
                    value={child.aadhar}
                    onChange={(e) => onUpdateChild(child.id, "aadhar", e.target.value)}
                  />
                  <Input 
                    placeholder="Phone"
                    value={child.phone}
                    onChange={(e) => onUpdateChild(child.id, "phone", e.target.value)}
                  />
                  <Input 
                    placeholder="Email"
                    value={child.email}
                    onChange={(e) => onUpdateChild(child.id, "email", e.target.value)}
                  />
                  <Input 
                    placeholder="Address"
                    value={child.address}
                    onChange={(e) => onUpdateChild(child.id, "address", e.target.value)}
                  />
                </div>
              </div>
            ))}
            <Button 
              variant="outline"
              onClick={onAddChild}
              className="w-full border-dashed border-cyan-300 text-cyan-600"
            >
              + Add Child
            </Button>
          </div>

          {/* Grandchildren */}
          <div className="space-y-4">
            <h4 className="font-semibold text-cyan-900">Grandchildren</h4>
            {grandchildren.map((grandchild, idx) => (
              <div key={grandchild.id} className="bg-white border border-cyan-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-cyan-700">Grandchild #{idx + 1}</span>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveGrandchild(grandchild.id)}
                    className="text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input 
                    placeholder="Name"
                    value={grandchild.name}
                    onChange={(e) => onUpdateGrandchild(grandchild.id, "name", e.target.value)}
                  />
                  <Input 
                    type="date"
                    value={grandchild.dob}
                    onChange={(e) => onUpdateGrandchild(grandchild.id, "dob", e.target.value)}
                  />
                  <Input 
                    placeholder="Parent Name"
                    value={grandchild.parentName}
                    onChange={(e) => onUpdateGrandchild(grandchild.id, "parentName", e.target.value)}
                  />
                  <Input 
                    placeholder="Phone"
                    value={grandchild.phone}
                    onChange={(e) => onUpdateGrandchild(grandchild.id, "phone", e.target.value)}
                  />
                  <Input 
                    placeholder="Address"
                    className="col-span-2"
                    value={grandchild.address}
                    onChange={(e) => onUpdateGrandchild(grandchild.id, "address", e.target.value)}
                  />
                </div>
              </div>
            ))}
            <Button 
              variant="outline"
              onClick={onAddGrandchild}
              className="w-full border-dashed border-cyan-300 text-cyan-600"
            >
              + Add Grandchild
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
