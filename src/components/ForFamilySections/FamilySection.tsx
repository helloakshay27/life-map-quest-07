import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, Trash2, Plus, Users } from "lucide-react";
import {
  ffSectionShell,
  ffSectionHeader,
  ffSectionHeaderIconWrap,
  ffSectionHeaderTitle,
  ffSectionHeaderSubtitle,
  ffSubCard,
  ffAccordionTrigger,
  ffAccordionTitle,
  ffAccordionHint,
  ffChevron,
  ffNestedPanel,
  ffTipBox,
  ffTipTitle,
  ffTipList,
  ffAddDashed,
  ffRemoveGhost,
  ffItemIndex,
  ffEmptyState,
} from "@/components/ForFamilySections/forFamilySectionStyles";

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
      <div className={ffSectionShell}>
        <div className={ffSectionHeader}>
          <div className="flex items-center gap-3">
            <div className={ffSectionHeaderIconWrap}>
              <Users className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className={ffSectionHeaderTitle}>Family Registry</h3>
              <p className={ffSectionHeaderSubtitle}>Registry of children, grandchildren, and extended family</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* --- CHILDREN SECTION --- */}
          <div className={ffSubCard}>
            <button
              onClick={() => onToggleSection("children")}
              className={ffAccordionTrigger}
            >
              <div className="flex flex-col items-start text-left">
                <h3 className={ffAccordionTitle}>Children</h3>
                <p className={ffAccordionHint}>List details for all biological and adopted children</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#888780]">Click to expand</span>
                <ChevronDown className={`${ffChevron} ${expandedSections.children ? 'rotate-180' : ''}`} />
              </div>
            </button>
            {expandedSections.children && (
              <div className="p-4 border-t border-border bg-muted/20 space-y-6">
                
                <div className={ffTipBox}>
                  <h4 className={`${ffTipTitle} flex items-center gap-2`}>
                    Quick tips for children
                  </h4>
                  <ul className={ffTipList}>
                    <li>Record both minor and adult children.</li>
                    <li>Include details for bio and adopted children.</li>
                    <li>List details chronologically by age.</li>
                    <li>Add contact info for grown-up children.</li>
                  </ul>
                </div>

                {children.length > 0 ? (
                  <div className="space-y-4">
                    {children.map((child, idx) => (
                      <div key={child.id} className="bg-card border border-border rounded-lg p-4 relative">
                        <div className="flex items-center justify-between mb-4">
                          <span className={ffItemIndex}>Child #{idx + 1}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onRemoveChild(child.id)} 
                            className={`${ffRemoveGhost} h-8 px-2`}
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
                  <p className={ffEmptyState}>No children added yet</p>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={onAddChild} 
                  className={ffAddDashed}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Child
                </Button>
              </div>
            )}
          </div>

          {/* --- GRANDCHILDREN SECTION --- */}
          <div className={ffSubCard}>
            <button
              onClick={() => onToggleSection("grandchildren")}
              className={ffAccordionTrigger}
            >
              <div className="flex flex-col items-start text-left">
                <h3 className={ffAccordionTitle}>Grandchildren</h3>
                <p className={ffAccordionHint}>Add grandchildren's details</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#888780]">Click to expand</span>
                <ChevronDown className={`${ffChevron} ${expandedSections.grandchildren ? 'rotate-180' : ''}`} />
              </div>
            </button>
            {expandedSections.grandchildren && (
              <div className={ffNestedPanel}>
                {grandchildren.length > 0 ? (
                  <div className="space-y-4">
                    {grandchildren.map((gc, idx) => (
                      <div key={gc.id} className="bg-card border border-border rounded-lg p-4 relative">
                        <div className="flex items-center justify-between mb-4">
                          <span className={ffItemIndex}>Grandchild #{idx + 1}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onRemoveGrandchild(gc.id)} 
                            className={`${ffRemoveGhost} h-8 px-2`}
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
                  <p className={ffEmptyState}>No grandchildren added yet</p>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={onAddGrandchild} 
                  className={ffAddDashed}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Grandchild
                </Button>
              </div>
            )}
          </div>

          {/* --- HUSBAND'S FAMILY SECTION --- */}
          <div className={ffSubCard}>
            <button
              onClick={() => onToggleSection("husbandFamily")}
              className={ffAccordionTrigger}
            >
              <div className="flex flex-col items-start text-left">
                <h3 className={ffAccordionTitle}>Husband's Family</h3>
                <p className={ffAccordionHint}>Father, mother, siblings</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#888780]">Click to expand</span>
                <ChevronDown className={`${ffChevron} ${expandedSections.husbandFamily ? 'rotate-180' : ''}`} />
              </div>
            </button>
            {expandedSections.husbandFamily && (
              <div className={ffNestedPanel}>
                {husbandSiblings.length > 0 ? (
                  <div className="space-y-4">
                    {husbandSiblings.map((sibling, idx) => (
                      <div key={sibling.id} className="bg-card border border-border rounded-lg p-4 relative">
                        <div className="flex items-center justify-between mb-4">
                          <span className={ffItemIndex}>Member #{idx + 1}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onRemoveHusbandSibling(sibling.id)} 
                            className={`${ffRemoveGhost} h-8 px-2`}
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
                  <p className={ffEmptyState}>No family members added yet</p>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={onAddHusbandSibling} 
                  className={ffAddDashed}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Family Member
                </Button>
              </div>
            )}
          </div>

          {/* --- WIFE'S FAMILY SECTION --- */}
          <div className={ffSubCard}>
            <button
              onClick={() => onToggleSection("wifeFamily")}
              className={ffAccordionTrigger}
            >
              <div className="flex flex-col items-start text-left">
                <h3 className={ffAccordionTitle}>Wife's Family</h3>
                <p className={ffAccordionHint}>Father, mother, siblings</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#888780]">Click to expand</span>
                <ChevronDown className={`${ffChevron} ${expandedSections.wifeFamily ? 'rotate-180' : ''}`} />
              </div>
            </button>
            {expandedSections.wifeFamily && (
              <div className={ffNestedPanel}>
                {wifeSiblings.length > 0 ? (
                  <div className="space-y-4">
                    {wifeSiblings.map((sibling, idx) => (
                      <div key={sibling.id} className="bg-card border border-border rounded-lg p-4 relative">
                        <div className="flex items-center justify-between mb-4">
                          <span className={ffItemIndex}>Member #{idx + 1}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onRemoveWifeSibling(sibling.id)} 
                            className={`${ffRemoveGhost} h-8 px-2`}
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
                  <p className={ffEmptyState}>No family members added yet</p>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={onAddWifeSibling} 
                  className={ffAddDashed}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Family Member
                </Button>
              </div>
            )}
          </div>

          {/* --- OTHER FAMILY MEMBERS SECTION --- */}
          <div className={ffSubCard}>
            <button
              onClick={() => onToggleSection("otherFamily")}
              className={ffAccordionTrigger}
            >
              <div className="flex flex-col items-start text-left">
                <h3 className={ffAccordionTitle}>Other Family Members</h3>
                <p className={ffAccordionHint}>Any other relatives you'd like to record</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#888780]">Click to expand</span>
                <ChevronDown className={`${ffChevron} ${expandedSections.otherFamily ? 'rotate-180' : ''}`} />
              </div>
            </button>
            {expandedSections.otherFamily && (
              <div className={ffNestedPanel}>
                <p className={`${ffEmptyState} py-8`}>Coming soon...</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}