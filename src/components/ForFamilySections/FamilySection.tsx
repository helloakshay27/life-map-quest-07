import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, X, ChevronDown } from "lucide-react";
import { useState } from "react";

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
          {/* Children */}
          <div className="bg-white border border-green-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onToggleSection("children")}
              className="w-full flex items-center justify-between p-4 hover:bg-green-50 font-semibold text-green-900"
            >
              <span>Children</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-normal">Click to {expandedSections.children ? "collapse" : "expand"}</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.children ? "rotate-180" : ""}`} />
              </div>
            </button>
            {expandedSections.children && (
              <div className="p-4 border-t border-green-200 space-y-4">
                {children.length > 0 ? (
                  <>
                    {children.map((child, idx) => (
                      <div key={child.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-green-700">Child #{idx + 1}</span>
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
                          <div className="space-y-2">
                            <Label className="text-xs">Name</Label>
                            <Input 
                              placeholder="Name"
                              value={child.name}
                              onChange={(e) => onUpdateChild(child.id, "name", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Date of Birth</Label>
                            <Input 
                              type="date"
                              value={child.dob}
                              onChange={(e) => onUpdateChild(child.id, "dob", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Aadhar</Label>
                            <Input 
                              placeholder="Aadhar"
                              value={child.aadhar}
                              onChange={(e) => onUpdateChild(child.id, "aadhar", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Phone</Label>
                            <Input 
                              placeholder="Phone"
                              value={child.phone}
                              onChange={(e) => onUpdateChild(child.id, "phone", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Email</Label>
                            <Input 
                              placeholder="Email"
                              value={child.email}
                              onChange={(e) => onUpdateChild(child.id, "email", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Address</Label>
                            <Input 
                              placeholder="Address"
                              value={child.address}
                              onChange={(e) => onUpdateChild(child.id, "address", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-sm text-gray-600 text-center py-8">No children added yet</p>
                )}
                <Button 
                  variant="outline"
                  onClick={onAddChild}
                  className="w-full border-green-300 text-green-700 hover:bg-green-50"
                >
                  + Add Child
                </Button>
              </div>
            )}
          </div>

          {/* Grandchildren */}
          <div className="bg-white border border-green-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onToggleSection("grandchildren")}
              className="w-full flex items-center justify-between p-4 hover:bg-green-50 font-semibold text-green-900"
            >
              <div>
                <span>Grandchildren</span>
                <p className="text-sm text-gray-600 font-normal">Add grandchildren's details</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-normal">Click to {expandedSections.grandchildren ? "collapse" : "expand"}</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.grandchildren ? "rotate-180" : ""}`} />
              </div>
            </button>
            {expandedSections.grandchildren && (
              <div className="p-4 border-t border-green-200 space-y-4">
                {grandchildren.length > 0 ? (
                  <>
                    {grandchildren.map((grandchild, idx) => (
                      <div key={grandchild.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-green-700">Grandchild #{idx + 1}</span>
                          <Button 
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveGrandchild(grandchild.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs">Name</Label>
                            <Input 
                              placeholder="Name"
                              value={grandchild.name}
                              onChange={(e) => onUpdateGrandchild(grandchild.id, "name", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Date of Birth</Label>
                            <Input 
                              type="date"
                              value={grandchild.dob}
                              onChange={(e) => onUpdateGrandchild(grandchild.id, "dob", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Parent Name</Label>
                            <Input 
                              placeholder="Parent Name"
                              value={grandchild.parentName}
                              onChange={(e) => onUpdateGrandchild(grandchild.id, "parentName", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Phone</Label>
                            <Input 
                              placeholder="Phone"
                              value={grandchild.phone}
                              onChange={(e) => onUpdateGrandchild(grandchild.id, "phone", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-xs">Address</Label>
                            <Input 
                              placeholder="Address"
                              value={grandchild.address}
                              onChange={(e) => onUpdateGrandchild(grandchild.id, "address", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-sm text-gray-600 text-center py-8">No grandchildren added yet</p>
                )}
                <Button 
                  variant="outline"
                  onClick={onAddGrandchild}
                  className="w-full border-green-300 text-green-700 hover:bg-green-50"
                >
                  + Add Grandchild
                </Button>
              </div>
            )}
          </div>

          {/* Husband's Family */}
          <div className="bg-white border border-green-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onToggleSection("husbandFamily")}
              className="w-full flex items-center justify-between p-4 hover:bg-green-50 font-semibold text-green-900"
            >
              <div>
                <span>Husband's Family</span>
                <p className="text-sm text-gray-600 font-normal">Father, mother, siblings</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-normal">Click to {expandedSections.husbandFamily ? "collapse" : "expand"}</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.husbandFamily ? "rotate-180" : ""}`} />
              </div>
            </button>
            {expandedSections.husbandFamily && (
              <div className="p-4 border-t border-green-200 space-y-4">
                {husbandSiblings.length > 0 ? (
                  <>
                    {husbandSiblings.map((sibling, idx) => (
                      <div key={sibling.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-green-700">Member #{idx + 1}</span>
                          <Button 
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveHusbandSibling(sibling.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs">Name</Label>
                            <Input 
                              placeholder="Name"
                              value={sibling.name}
                              onChange={(e) => onUpdateHusbandSibling(sibling.id, "name", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Relation</Label>
                            <Input 
                              placeholder="Father/Mother/Brother/Sister"
                              value={sibling.relation}
                              onChange={(e) => onUpdateHusbandSibling(sibling.id, "relation", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Aadhar</Label>
                            <Input 
                              placeholder="Aadhar"
                              value={sibling.aadhar}
                              onChange={(e) => onUpdateHusbandSibling(sibling.id, "aadhar", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Phone</Label>
                            <Input 
                              placeholder="Phone"
                              value={sibling.phone}
                              onChange={(e) => onUpdateHusbandSibling(sibling.id, "phone", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-xs">Address</Label>
                            <Input 
                              placeholder="Address"
                              value={sibling.address}
                              onChange={(e) => onUpdateHusbandSibling(sibling.id, "address", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-sm text-gray-600 text-center py-8">No family members added yet</p>
                )}
                <Button 
                  variant="outline"
                  onClick={onAddHusbandSibling}
                  className="w-full border-green-300 text-green-700 hover:bg-green-50"
                >
                  + Add Family Member
                </Button>
              </div>
            )}
          </div>

          {/* Wife's Family */}
          <div className="bg-white border border-green-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onToggleSection("wifeFamily")}
              className="w-full flex items-center justify-between p-4 hover:bg-green-50 font-semibold text-green-900"
            >
              <div>
                <span>Wife's Family</span>
                <p className="text-sm text-gray-600 font-normal">Father, mother, siblings</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-normal">Click to {expandedSections.wifeFamily ? "collapse" : "expand"}</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.wifeFamily ? "rotate-180" : ""}`} />
              </div>
            </button>
            {expandedSections.wifeFamily && (
              <div className="p-4 border-t border-green-200 space-y-4">
                {wifeSiblings.length > 0 ? (
                  <>
                    {wifeSiblings.map((sibling, idx) => (
                      <div key={sibling.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-green-700">Member #{idx + 1}</span>
                          <Button 
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveWifeSibling(sibling.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label className="text-xs">Name</Label>
                            <Input 
                              placeholder="Name"
                              value={sibling.name}
                              onChange={(e) => onUpdateWifeSibling(sibling.id, "name", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Relation</Label>
                            <Input 
                              placeholder="Father/Mother/Brother/Sister"
                              value={sibling.relation}
                              onChange={(e) => onUpdateWifeSibling(sibling.id, "relation", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Aadhar</Label>
                            <Input 
                              placeholder="Aadhar"
                              value={sibling.aadhar}
                              onChange={(e) => onUpdateWifeSibling(sibling.id, "aadhar", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Phone</Label>
                            <Input 
                              placeholder="Phone"
                              value={sibling.phone}
                              onChange={(e) => onUpdateWifeSibling(sibling.id, "phone", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-xs">Address</Label>
                            <Input 
                              placeholder="Address"
                              value={sibling.address}
                              onChange={(e) => onUpdateWifeSibling(sibling.id, "address", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-sm text-gray-600 text-center py-8">No family members added yet</p>
                )}
                <Button 
                  variant="outline"
                  onClick={onAddWifeSibling}
                  className="w-full border-green-300 text-green-700 hover:bg-green-50"
                >
                  + Add Family Member
                </Button>
              </div>
            )}
          </div>

          {/* Other Family Members */}
          <div className="bg-white border border-green-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onToggleSection("otherFamily")}
              className="w-full flex items-center justify-between p-4 hover:bg-green-50 font-semibold text-green-900"
            >
              <div>
                <span>Other Family Members</span>
                <p className="text-sm text-gray-600 font-normal">Any other relatives you'd like to record</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-normal">Click to {expandedSections.otherFamily ? "collapse" : "expand"}</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.otherFamily ? "rotate-180" : ""}`} />
              </div>
            </button>
            {expandedSections.otherFamily && (
              <div className="p-4 border-t border-green-200 space-y-4">
                <p className="text-sm text-gray-600 text-center py-8">Coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
