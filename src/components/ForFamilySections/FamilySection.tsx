import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, Trash2, Plus, Users } from "lucide-react";

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
  expandedSections: Record<string, boolean>;
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
  onToggleSection: (section: string) => void;
}

export default function FamilySection({
  husbandSiblings,
  wifeSiblings,
  children,
  grandchildren,
  expandedSections,
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
  onToggleSection,
}: FamilySectionProps) {
  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-xl overflow-hidden">
        {/* Header Block */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Family Registry</h3>
              <p className="text-sm text-green-50">Registry of children, grandchildren, and extended family</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* --- CHILDREN SECTION --- */}
          <div className="bg-white border border-green-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onToggleSection("children")}
              className="w-full flex items-center justify-between p-4 hover:bg-green-50 transition-colors"
            >
              <div className="flex flex-col items-start text-left">
                <h3 className="text-[16px] font-semibold text-green-900">Children</h3>
                <p className="text-[14px] text-gray-500 mt-0.5">List details for all biological and adopted children</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Click to expand</span>
                <ChevronDown className={`h-5 w-5 text-green-700 transition-transform duration-200 ${expandedSections.children ? 'rotate-180' : ''}`} />
              </div>
            </button>
            {expandedSections.children && (
              <div className="p-4 border-t border-green-100 bg-gray-50 space-y-6">
                
                {/* 💡 Quick Tips Box */}
                <div className="bg-[#e9f2eb] p-4 rounded-lg border border-[#cce5d6]">
                  <h4 className="font-semibold text-[#2c5e3d] flex items-center gap-2 text-sm">
                    💡 Quick Tips for Children's Section
                  </h4>
                  <ul className="list-disc pl-5 mt-2 text-[13px] text-[#3d7a52] space-y-1">
                    <li>Record both minor and adult children.</li>
                    <li>Include details for bio and adopted children.</li>
                    <li>List details chronologically by age.</li>
                    <li>Add contact info for grown-up children.</li>
                  </ul>
                </div>

                {children.length > 0 ? (
                  <div className="space-y-4">
                    {children.map((child, idx) => (
                      <div key={child.id} className="bg-white border border-green-200 rounded-lg p-4 relative">
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-semibold text-green-700">Child #{idx + 1}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onRemoveChild(child.id)} 
                            className="text-red-500 hover:text-red-700 h-8 px-2"
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Remove
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs">Full Name</Label>
                            <Input placeholder="Name" value={child.name} onChange={(e) => onUpdateChild(child.id, "name", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Date of Birth</Label>
                            <Input type="date" value={child.dob} onChange={(e) => onUpdateChild(child.id, "dob", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Aadhar</Label>
                            <Input placeholder="Aadhar" value={child.aadhar} onChange={(e) => onUpdateChild(child.id, "aadhar", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Phone</Label>
                            <Input placeholder="Phone" value={child.phone} onChange={(e) => onUpdateChild(child.id, "phone", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Email</Label>
                            <Input placeholder="Email" value={child.email} onChange={(e) => onUpdateChild(child.id, "email", e.target.value)} />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-xs">Address</Label>
                            <Input placeholder="Address" value={child.address} onChange={(e) => onUpdateChild(child.id, "address", e.target.value)} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 text-center py-4">No children added yet</p>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={onAddChild} 
                  className="w-full border-dashed border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Child
                </Button>
              </div>
            )}
          </div>

          {/* --- GRANDCHILDREN SECTION --- */}
          <div className="bg-white border border-green-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onToggleSection("grandchildren")}
              className="w-full flex items-center justify-between p-4 hover:bg-green-50 transition-colors"
            >
              <div className="flex flex-col items-start text-left">
                <h3 className="text-[16px] font-semibold text-green-900">Grandchildren</h3>
                <p className="text-[14px] text-gray-500 mt-0.5">Add grandchildren's details</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Click to expand</span>
                <ChevronDown className={`h-5 w-5 text-green-700 transition-transform duration-200 ${expandedSections.grandchildren ? 'rotate-180' : ''}`} />
              </div>
            </button>
            {expandedSections.grandchildren && (
              <div className="p-4 border-t border-green-100 bg-gray-50 space-y-4">
                {grandchildren.length > 0 ? (
                  <div className="space-y-4">
                    {grandchildren.map((gc, idx) => (
                      <div key={gc.id} className="bg-white border border-green-200 rounded-lg p-4 relative">
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-semibold text-green-700">Grandchild #{idx + 1}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onRemoveGrandchild(gc.id)} 
                            className="text-red-500 hover:text-red-700 h-8 px-2"
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Remove
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs">Name</Label>
                            <Input placeholder="Name" value={gc.name} onChange={(e) => onUpdateGrandchild(gc.id, "name", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Parent's Name</Label>
                            <Input placeholder="Your child's name" value={gc.parentName} onChange={(e) => onUpdateGrandchild(gc.id, "parentName", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Date of Birth</Label>
                            <Input type="date" value={gc.dob} onChange={(e) => onUpdateGrandchild(gc.id, "dob", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Phone</Label>
                            <Input placeholder="Phone" value={gc.phone} onChange={(e) => onUpdateGrandchild(gc.id, "phone", e.target.value)} />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-xs">Address</Label>
                            <Input placeholder="Address" value={gc.address} onChange={(e) => onUpdateGrandchild(gc.id, "address", e.target.value)} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 text-center py-4">No grandchildren added yet</p>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={onAddGrandchild} 
                  className="w-full border-dashed border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Grandchild
                </Button>
              </div>
            )}
          </div>

          {/* --- HUSBAND'S FAMILY SECTION --- */}
          <div className="bg-white border border-green-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onToggleSection("husbandFamily")}
              className="w-full flex items-center justify-between p-4 hover:bg-green-50 transition-colors"
            >
              <div className="flex flex-col items-start text-left">
                <h3 className="text-[16px] font-semibold text-green-900">Husband's Family</h3>
                <p className="text-[14px] text-gray-500 mt-0.5">Father, mother, siblings</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Click to expand</span>
                <ChevronDown className={`h-5 w-5 text-green-700 transition-transform duration-200 ${expandedSections.husbandFamily ? 'rotate-180' : ''}`} />
              </div>
            </button>
            {expandedSections.husbandFamily && (
              <div className="p-4 border-t border-green-100 bg-gray-50 space-y-4">
                {husbandSiblings.length > 0 ? (
                  <div className="space-y-4">
                    {husbandSiblings.map((sibling, idx) => (
                      <div key={sibling.id} className="bg-white border border-green-200 rounded-lg p-4 relative">
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-semibold text-green-700">Member #{idx + 1}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onRemoveHusbandSibling(sibling.id)} 
                            className="text-red-500 hover:text-red-700 h-8 px-2"
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Remove
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs">Name</Label>
                            <Input placeholder="Name" value={sibling.name} onChange={(e) => onUpdateHusbandSibling(sibling.id, "name", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Relation</Label>
                            <Input placeholder="Father/Mother/Brother/Sister" value={sibling.relation} onChange={(e) => onUpdateHusbandSibling(sibling.id, "relation", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Aadhar</Label>
                            <Input placeholder="Aadhar" value={sibling.aadhar} onChange={(e) => onUpdateHusbandSibling(sibling.id, "aadhar", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Phone</Label>
                            <Input placeholder="Phone" value={sibling.phone} onChange={(e) => onUpdateHusbandSibling(sibling.id, "phone", e.target.value)} />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-xs">Address</Label>
                            <Input placeholder="Address" value={sibling.address} onChange={(e) => onUpdateHusbandSibling(sibling.id, "address", e.target.value)} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 text-center py-4">No family members added yet</p>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={onAddHusbandSibling} 
                  className="w-full border-dashed border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Family Member
                </Button>
              </div>
            )}
          </div>

          {/* --- WIFE'S FAMILY SECTION --- */}
          <div className="bg-white border border-green-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onToggleSection("wifeFamily")}
              className="w-full flex items-center justify-between p-4 hover:bg-green-50 transition-colors"
            >
              <div className="flex flex-col items-start text-left">
                <h3 className="text-[16px] font-semibold text-green-900">Wife's Family</h3>
                <p className="text-[14px] text-gray-500 mt-0.5">Father, mother, siblings</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Click to expand</span>
                <ChevronDown className={`h-5 w-5 text-green-700 transition-transform duration-200 ${expandedSections.wifeFamily ? 'rotate-180' : ''}`} />
              </div>
            </button>
            {expandedSections.wifeFamily && (
              <div className="p-4 border-t border-green-100 bg-gray-50 space-y-4">
                {wifeSiblings.length > 0 ? (
                  <div className="space-y-4">
                    {wifeSiblings.map((sibling, idx) => (
                      <div key={sibling.id} className="bg-white border border-green-200 rounded-lg p-4 relative">
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-semibold text-green-700">Member #{idx + 1}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onRemoveWifeSibling(sibling.id)} 
                            className="text-red-500 hover:text-red-700 h-8 px-2"
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Remove
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs">Name</Label>
                            <Input placeholder="Name" value={sibling.name} onChange={(e) => onUpdateWifeSibling(sibling.id, "name", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Relation</Label>
                            <Input placeholder="Father/Mother/Brother/Sister" value={sibling.relation} onChange={(e) => onUpdateWifeSibling(sibling.id, "relation", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Aadhar</Label>
                            <Input placeholder="Aadhar" value={sibling.aadhar} onChange={(e) => onUpdateWifeSibling(sibling.id, "aadhar", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Phone</Label>
                            <Input placeholder="Phone" value={sibling.phone} onChange={(e) => onUpdateWifeSibling(sibling.id, "phone", e.target.value)} />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-xs">Address</Label>
                            <Input placeholder="Address" value={sibling.address} onChange={(e) => onUpdateWifeSibling(sibling.id, "address", e.target.value)} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 text-center py-4">No family members added yet</p>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={onAddWifeSibling} 
                  className="w-full border-dashed border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Family Member
                </Button>
              </div>
            )}
          </div>

          {/* --- OTHER FAMILY MEMBERS SECTION --- */}
          <div className="bg-white border border-green-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onToggleSection("otherFamily")}
              className="w-full flex items-center justify-between p-4 hover:bg-green-50 transition-colors"
            >
              <div className="flex flex-col items-start text-left">
                <h3 className="text-[16px] font-semibold text-green-900">Other Family Members</h3>
                <p className="text-[14px] text-gray-500 mt-0.5">Any other relatives you'd like to record</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Click to expand</span>
                <ChevronDown className={`h-5 w-5 text-green-700 transition-transform duration-200 ${expandedSections.otherFamily ? 'rotate-180' : ''}`} />
              </div>
            </button>
            {expandedSections.otherFamily && (
              <div className="p-4 border-t border-green-100 bg-gray-50 space-y-4">
                <p className="text-sm text-gray-600 text-center py-8">Coming soon...</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}