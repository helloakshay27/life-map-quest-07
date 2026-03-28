import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, X } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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

interface LifeInsurancePolicy {
  id: string;
  policyName: string;
  insurer: string;
  policyNumber: string;
  nominee: string;
  sumAssured: string;
}

interface BenefitsDetails {
  coverageType: string;
  healthPlanName: string;
  isGovtPlan: boolean;
  spouseCoverage: boolean;
  annualLeaveHours: string;
  sickLeaveHours: string;
  epfMember: boolean;
  govtEmployee: boolean;
  retirementDate: string;
  spouseAwarePension: boolean;
  spouseAwareGratuity: boolean;
}

interface BenefitsSectionProps {
  lifeInsurancePolicies: LifeInsurancePolicy[];
  benefitsDetails: BenefitsDetails;
  onAddLifeInsurancePolicy: () => void;
  onRemoveLifeInsurancePolicy: (id: string) => void;
  onUpdateLifeInsurancePolicy: (id: string, field: keyof LifeInsurancePolicy, value: string) => void;
  onUpdateBenefitsDetails: (field: keyof BenefitsDetails, value: string | boolean) => void;
}

export default function BenefitsSection({
  lifeInsurancePolicies,
  benefitsDetails,
  onAddLifeInsurancePolicy,
  onRemoveLifeInsurancePolicy,
  onUpdateLifeInsurancePolicy,
  onUpdateBenefitsDetails,
}: BenefitsSectionProps) {
  return (
    <div className="space-y-6">
      <div className={ffSectionShell}>
        <div className={ffSectionHeader}>
          <div className="flex items-center gap-3">
            <div className={ffSectionHeaderIconWrap}>
              <Shield className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className={ffSectionHeaderTitle}>Benefits & Retirement</h3>
              <p className={ffSectionHeaderSubtitle}>Insurance, leave, and retirement</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* Health Insurance */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Health Insurance</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                placeholder="Coverage Type"
                value={benefitsDetails.coverageType}
                onChange={(e) => onUpdateBenefitsDetails("coverageType", e.target.value)}
              />
              <Input 
                placeholder="Health Plan Name"
                value={benefitsDetails.healthPlanName}
                onChange={(e) => onUpdateBenefitsDetails("healthPlanName", e.target.value)}
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={benefitsDetails.isGovtPlan}
                  onChange={(e) => onUpdateBenefitsDetails("isGovtPlan", e.target.checked)}
                />
                <span>Government Plan</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={benefitsDetails.spouseCoverage}
                  onChange={(e) => onUpdateBenefitsDetails("spouseCoverage", e.target.checked)}
                />
                <span>Spouse Coverage</span>
              </label>
            </div>
          </div>

          {/* Life Insurance Policies */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Life Insurance Policies</h4>
            {lifeInsurancePolicies.map((policy, idx) => (
              <div key={policy.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={ffItemIndex}>Policy #{idx + 1}</span>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveLifeInsurancePolicy(policy.id)}
                    className={ffRemoveGhost}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input 
                    placeholder="Policy Name"
                    value={policy.policyName}
                    onChange={(e) => onUpdateLifeInsurancePolicy(policy.id, "policyName", e.target.value)}
                  />
                  <Input 
                    placeholder="Insurer"
                    value={policy.insurer}
                    onChange={(e) => onUpdateLifeInsurancePolicy(policy.id, "insurer", e.target.value)}
                  />
                  <Input 
                    placeholder="Policy Number"
                    value={policy.policyNumber}
                    onChange={(e) => onUpdateLifeInsurancePolicy(policy.id, "policyNumber", e.target.value)}
                  />
                  <Input 
                    placeholder="Nominee"
                    value={policy.nominee}
                    onChange={(e) => onUpdateLifeInsurancePolicy(policy.id, "nominee", e.target.value)}
                  />
                  <Input 
                    placeholder="Sum Assured"
                    value={policy.sumAssured}
                    onChange={(e) => onUpdateLifeInsurancePolicy(policy.id, "sumAssured", e.target.value)}
                  />
                </div>
              </div>
            ))}
            <Button 
              variant="outline"
              onClick={onAddLifeInsurancePolicy}
              className={ffAddDashed}
            >
              + Add Policy
            </Button>
          </div>

          {/* Employment Benefits */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Employment Benefits</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                placeholder="Annual Leave Hours"
                value={benefitsDetails.annualLeaveHours}
                onChange={(e) => onUpdateBenefitsDetails("annualLeaveHours", e.target.value)}
              />
              <Input 
                placeholder="Sick Leave Hours"
                value={benefitsDetails.sickLeaveHours}
                onChange={(e) => onUpdateBenefitsDetails("sickLeaveHours", e.target.value)}
              />
              <Input 
                type="date"
                placeholder="Retirement Date"
                value={benefitsDetails.retirementDate}
                onChange={(e) => onUpdateBenefitsDetails("retirementDate", e.target.value)}
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={benefitsDetails.epfMember}
                  onChange={(e) => onUpdateBenefitsDetails("epfMember", e.target.checked)}
                />
                <span>EPF Member</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={benefitsDetails.govtEmployee}
                  onChange={(e) => onUpdateBenefitsDetails("govtEmployee", e.target.checked)}
                />
                <span>Government Employee</span>
              </label>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
