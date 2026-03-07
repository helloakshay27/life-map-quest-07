import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, Shield, Info, X } from "lucide-react";
import PersonalSection from "@/components/ForFamilySections/PersonalSection";
import FamilySection from "@/components/ForFamilySections/FamilySection";
import EmergencySection from "@/components/ForFamilySections/EmergencySection";
import ContactsSection from "@/components/ForFamilySections/ContactsSection";
import AssetsSection from "@/components/ForFamilySections/AssetsSection";
import BenefitsSection from "@/components/ForFamilySections/BenefitsSection";
import LegalSection from "@/components/ForFamilySections/LegalSection";
import FinalWishesSection from "@/components/ForFamilySections/FinalWishesSection";

// Types
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

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  address: string;
  homePhone: string;
  workPhone: string;
  email: string;
}

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

interface PropertyAsset {
  id: string;
  propertyType: string;
  address: string;
  ownershipType: string;
  documentLocation: string;
  marketValue: string;
}

interface VehicleAsset {
  id: string;
  vehicleType: string;
  model: string;
  registrationNumber: string;
  ownerName: string;
  insurancePolicy: string;
  insuranceExpiry: string;
}

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

interface LegalDetails {
  willLocatedAt: string;
  attorneyWhoHandledWill: string;
  lawFirm: string;
  attorneyPhone: string;
  willDate: string;
  executor: string;
  guardianshipDocumentsLocation: string;
  hasLivingWill: boolean;
  willDocumentUploaded: string;
  notesForFamily: string;
  organDonationPreference: string;
}

interface FinalWish {
  id: string;
  name: string;
  placeOfWorship: string;
  religiousAffiliation: string;
  panditName: string;
  panditPhone: string;
  funeralServicePreference: string;
  serviceLocationAddress: string;
  contactPhone: string;
  preArrangedLastRites: boolean;
  exServicemanBenefits: boolean;
  militaryHonours: boolean;
  obituaryWanted: boolean;
  lastRitesPreference: string;
  cremationGroundChoice: string;
  lotPurchased: boolean;
  pallbearers: string;
  honoraryPallbearers: string;
  musicalSelections: string;
  specialRequests: string;
}

interface UploadedDocument {
  id: string;
  fileName: string;
  uploadedAt: string;
}

interface PersonalInfo {
  fullName: string;
  aadharNumber: string;
  panNumber: string;
  dateOfBirth: string;
  placeOfBirth: string;
  drivingLicenseNumber: string;
  drivingLicenseValidity: string;
  currentHomeAddress: string;
  mobileNumber: string;
  workPhone: string;
  nativeAddress: string;
  maritalStatus: string;
  marriageDate: string;
  spouseName: string;
  spouseMobile: string;
  spouseAadharNumber: string;
  spousePanNumber: string;
  spouseDrivingLicenseNumber: string;
  spouseDrivingLicenseValidity: string;
  spouseAddress: string;
  spouseEmployer: string;
  spouseWorkPhone: string;
  spouseEmployerAddress: string;
  formerSpouseName: string;
  formerSpouseContact: string;
  formerSpouseAddress: string;
  formerSpouseMarriageDate: string;
  formerSpouseDivorceDate: string;
}

export default function ForFamily() {
  const [completionProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("personal");
  const [showPrivacyAlert, setShowPrivacyAlert] = useState(true);
  const [showInfoAlert, setShowInfoAlert] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basicDetails: true,
    spouseInfo: true,
    formerSpouseInfo: true,
    personalDocuments: true,
    spouseDocuments: true,
  });

  // Personal Info State
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: "",
    aadharNumber: "",
    panNumber: "",
    dateOfBirth: "",
    placeOfBirth: "",
    drivingLicenseNumber: "",
    drivingLicenseValidity: "",
    currentHomeAddress: "",
    mobileNumber: "",
    workPhone: "",
    nativeAddress: "",
    maritalStatus: "",
    marriageDate: "",
    spouseName: "",
    spouseMobile: "",
    spouseAadharNumber: "",
    spousePanNumber: "",
    spouseDrivingLicenseNumber: "",
    spouseDrivingLicenseValidity: "",
    spouseAddress: "",
    spouseEmployer: "",
    spouseWorkPhone: "",
    spouseEmployerAddress: "",
    formerSpouseName: "",
    formerSpouseContact: "",
    formerSpouseAddress: "",
    formerSpouseMarriageDate: "",
    formerSpouseDivorceDate: "",
  });
  const [personalDocuments, setPersonalDocuments] = useState<UploadedDocument[]>([]);
  const [spouseDocuments, setSpouseDocuments] = useState<UploadedDocument[]>([]);

  // Family Info State
  const [husbandSiblings, setHusbandSiblings] = useState<Sibling[]>([]);
  const [wifeSiblings, setWifeSiblings] = useState<Sibling[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [grandchildren, setGrandchildren] = useState<Grandchild[]>([]);

  // Contacts State
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [importantContacts, setImportantContacts] = useState<ImportantContacts>({
    employerSupervisor: "",
    employerPhone: "",
    employerEmail: "",
    physicianName: "",
    physicianPhone: "",
    physicianAddress: "",
    physicianEmail: "",
    lawyerName: "",
    lawyerPhone: "",
    lawyerAddress: "",
    attorneyName: "",
    attorneyPhone: "",
    attorneyAddress: "",
    attorneyEmail: "",
    accountantName: "",
    accountantPhone: "",
    accountantAddress: "",
    insuranceAgentName: "",
    insuranceAgencyName: "",
    insuranceAddress: "",
    insurancePhone: "",
    bankerName: "",
    bankName: "",
    bankAddress: "",
    bankPhone: "",
    brokerName: "",
    investmentCompany: "",
    brokerAddress: "",
    brokerPhone: "",
  });

  // Assets State
  const [propertyAssets, setPropertyAssets] = useState<PropertyAsset[]>([]);
  const [vehicleAssets, setVehicleAssets] = useState<VehicleAsset[]>([]);
  const [lifeInsurancePolicies, setLifeInsurancePolicies] = useState<LifeInsurancePolicy[]>([]);

  // Benefits & Legal State
  const [benefitsDetails, setBenefitsDetails] = useState<BenefitsDetails>({
    coverageType: "",
    healthPlanName: "",
    isGovtPlan: false,
    spouseCoverage: false,
    annualLeaveHours: "",
    sickLeaveHours: "",
    epfMember: false,
    govtEmployee: false,
    retirementDate: "",
    spouseAwarePension: false,
    spouseAwareGratuity: false,
  });

  const [legalDetails, setLegalDetails] = useState<LegalDetails>({
    willLocatedAt: "",
    attorneyWhoHandledWill: "",
    lawFirm: "",
    attorneyPhone: "",
    willDate: "",
    executor: "",
    guardianshipDocumentsLocation: "",
    hasLivingWill: false,
    willDocumentUploaded: "",
    notesForFamily: "",
    organDonationPreference: "",
  });

  const [finalWishes, setFinalWishes] = useState<FinalWish[]>([]);

  // Utility function
  const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const toggleSection = (section: string) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  // Personal Handlers
  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    setPersonalInfo({ ...personalInfo, [field]: value });
  };

  const addPersonalDocument = () => {
    const fileName = `document-${Date.now()}.pdf`;
    setPersonalDocuments([...personalDocuments, { id: createId(), fileName, uploadedAt: new Date().toLocaleDateString() }]);
  };

  const removePersonalDocument = (id: string) => {
    setPersonalDocuments(personalDocuments.filter(doc => doc.id !== id));
  };

  const addSpouseDocument = () => {
    const fileName = `spouse-document-${Date.now()}.pdf`;
    setSpouseDocuments([...spouseDocuments, { id: createId(), fileName, uploadedAt: new Date().toLocaleDateString() }]);
  };

  const removeSpouseDocument = (id: string) => {
    setSpouseDocuments(spouseDocuments.filter(doc => doc.id !== id));
  };

  // Family Handlers
  const addHusbandSibling = () => {
    const newSibling: Sibling = { id: createId(), name: "", aadhar: "", address: "", phone: "", relation: "brother" };
    setHusbandSiblings([...husbandSiblings, newSibling]);
  };

  const removeHusbandSibling = (id: string) => {
    setHusbandSiblings(husbandSiblings.filter(s => s.id !== id));
  };

  const updateHusbandSibling = (id: string, field: keyof Sibling, value: string) => {
    setHusbandSiblings(husbandSiblings.map(s => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const addWifeSibling = () => {
    const newSibling: Sibling = { id: createId(), name: "", aadhar: "", address: "", phone: "", relation: "sister" };
    setWifeSiblings([...wifeSiblings, newSibling]);
  };

  const removeWifeSibling = (id: string) => {
    setWifeSiblings(wifeSiblings.filter(s => s.id !== id));
  };

  const updateWifeSibling = (id: string, field: keyof Sibling, value: string) => {
    setWifeSiblings(wifeSiblings.map(s => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const addChild = () => {
    const newChild: Child = { id: createId(), name: "", dob: "", aadhar: "", address: "", phone: "", email: "" };
    setChildren([...children, newChild]);
  };

  const removeChild = (id: string) => {
    setChildren(children.filter(c => c.id !== id));
  };

  const updateChild = (id: string, field: keyof Child, value: string) => {
    setChildren(children.map(c => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const addGrandchild = () => {
    const newGrandchild: Grandchild = { id: createId(), name: "", dob: "", parentName: "", address: "", phone: "" };
    setGrandchildren([...grandchildren, newGrandchild]);
  };

  const removeGrandchild = (id: string) => {
    setGrandchildren(grandchildren.filter(g => g.id !== id));
  };

  const updateGrandchild = (id: string, field: keyof Grandchild, value: string) => {
    setGrandchildren(grandchildren.map(g => (g.id === id ? { ...g, [field]: value } : g)));
  };

  // Emergency Handlers
  const addEmergencyContact = () => {
    const newContact: EmergencyContact = { id: createId(), name: "", relationship: "", address: "", homePhone: "", workPhone: "", email: "" };
    setEmergencyContacts([...emergencyContacts, newContact]);
  };

  const removeEmergencyContact = (id: string) => {
    setEmergencyContacts(emergencyContacts.filter(c => c.id !== id));
  };

  const updateEmergencyContact = (id: string, field: keyof EmergencyContact, value: string) => {
    setEmergencyContacts(emergencyContacts.map(c => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const updateImportantContact = (field: keyof ImportantContacts, value: string) => {
    setImportantContacts({ ...importantContacts, [field]: value });
  };

  // Assets Handlers
  const addPropertyAsset = () => {
    const newProperty: PropertyAsset = { id: createId(), propertyType: "", address: "", ownershipType: "", documentLocation: "", marketValue: "" };
    setPropertyAssets([...propertyAssets, newProperty]);
  };

  const removePropertyAsset = (id: string) => {
    setPropertyAssets(propertyAssets.filter(p => p.id !== id));
  };

  const updatePropertyAsset = (id: string, field: keyof PropertyAsset, value: string) => {
    setPropertyAssets(propertyAssets.map(p => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const addVehicleAsset = () => {
    const newVehicle: VehicleAsset = { id: createId(), vehicleType: "", model: "", registrationNumber: "", ownerName: "", insurancePolicy: "", insuranceExpiry: "" };
    setVehicleAssets([...vehicleAssets, newVehicle]);
  };

  const removeVehicleAsset = (id: string) => {
    setVehicleAssets(vehicleAssets.filter(v => v.id !== id));
  };

  const updateVehicleAsset = (id: string, field: keyof VehicleAsset, value: string) => {
    setVehicleAssets(vehicleAssets.map(v => (v.id === id ? { ...v, [field]: value } : v)));
  };

  // Benefits Handlers
  const addLifeInsurancePolicy = () => {
    const newPolicy: LifeInsurancePolicy = { id: createId(), policyName: "", insurer: "", policyNumber: "", nominee: "", sumAssured: "" };
    setLifeInsurancePolicies([...lifeInsurancePolicies, newPolicy]);
  };

  const removeLifeInsurancePolicy = (id: string) => {
    setLifeInsurancePolicies(lifeInsurancePolicies.filter(p => p.id !== id));
  };

  const updateLifeInsurancePolicy = (id: string, field: keyof LifeInsurancePolicy, value: string) => {
    setLifeInsurancePolicies(lifeInsurancePolicies.map(p => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const updateBenefitsDetails = (field: keyof BenefitsDetails, value: string | boolean) => {
    setBenefitsDetails({ ...benefitsDetails, [field]: value });
  };

  // Legal Handlers
  const updateLegalDetails = (field: keyof LegalDetails, value: string | boolean) => {
    setLegalDetails({ ...legalDetails, [field]: value });
  };

  const handleWillDocumentUpload = () => {
    const fileName = `will-document-${Date.now()}.pdf`;
    updateLegalDetails("willDocumentUploaded", fileName);
  };

  // Final Wishes Handlers
  const addFinalWish = () => {
    const newWish: FinalWish = {
      id: createId(),
      name: "",
      placeOfWorship: "",
      religiousAffiliation: "",
      panditName: "",
      panditPhone: "",
      funeralServicePreference: "",
      serviceLocationAddress: "",
      contactPhone: "",
      preArrangedLastRites: false,
      exServicemanBenefits: false,
      militaryHonours: false,
      obituaryWanted: false,
      lastRitesPreference: "",
      cremationGroundChoice: "",
      lotPurchased: false,
      pallbearers: "",
      honoraryPallbearers: "",
      musicalSelections: "",
      specialRequests: "",
    };
    setFinalWishes([...finalWishes, newWish]);
  };

  const removeFinalWish = (id: string) => {
    setFinalWishes(finalWishes.filter(w => w.id !== id));
  };

  const updateFinalWish = (id: string, field: keyof FinalWish, value: string | boolean) => {
    setFinalWishes(finalWishes.map(w => (w.id === id ? { ...w, [field]: value } : w)));
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 md:p-8 bg-white rounded-xl shadow-lg">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-3 rounded-xl">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">For My Family</h1>
                <p className="text-gray-500 mt-1 text-sm">A guide to getting your affairs in order</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Download</Button>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">Save</Button>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Completion Progress</span>
              <span className="text-sm font-bold text-purple-600">{completionProgress}%</span>
            </div>
            <Progress value={completionProgress} className="h-2" />
          </div>
        </div>

        {/* Alerts */}
        {showPrivacyAlert && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <Shield className="h-4 w-4 text-green-600" />
            <AlertDescription className="ml-2 text-sm">
              <div className="flex items-start justify-between">
                <div>
                  <strong className="text-green-800">Your data is completely private & secure.</strong>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowPrivacyAlert(false)} className="ml-2 h-6 w-6 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {showInfoAlert && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <Info className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="ml-2 text-sm">
              <div className="flex items-start justify-between">
                <div>
                  <strong className="text-yellow-800">Why fill this out?</strong>
                  <p className="text-yellow-700 mt-1">Most people leave their families without the information they need.</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowInfoAlert(false)} className="ml-2 h-6 w-6 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <div className="bg-gray-100 p-1 rounded-lg mb-8 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {[
              { id: "personal", label: "Personal" },
              { id: "family", label: "Family" },
              { id: "emergency", label: "Emergency" },
              { id: "contacts", label: "Contacts" },
              { id: "assets", label: "Assets" },
              { id: "benefits", label: "Benefits" },
              { id: "legal", label: "Legal" },
              { id: "final", label: "Final" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === "personal" && (
            <PersonalSection
              personalInfo={personalInfo}
              personalDocuments={personalDocuments}
              spouseDocuments={spouseDocuments}
              expandedSections={expandedSections}
              onUpdatePersonalInfo={updatePersonalInfo}
              onAddPersonalDocument={addPersonalDocument}
              onRemovePersonalDocument={removePersonalDocument}
              onAddSpouseDocument={addSpouseDocument}
              onRemoveSpouseDocument={removeSpouseDocument}
              onToggleSection={toggleSection}
            />
          )}

          {activeTab === "family" && (
            <FamilySection
              husbandSiblings={husbandSiblings}
              wifeSiblings={wifeSiblings}
              children={children}
              grandchildren={grandchildren}
              onAddHusbandSibling={addHusbandSibling}
              onRemoveHusbandSibling={removeHusbandSibling}
              onUpdateHusbandSibling={updateHusbandSibling}
              onAddWifeSibling={addWifeSibling}
              onRemoveWifeSibling={removeWifeSibling}
              onUpdateWifeSibling={updateWifeSibling}
              onAddChild={addChild}
              onRemoveChild={removeChild}
              onUpdateChild={updateChild}
              onAddGrandchild={addGrandchild}
              onRemoveGrandchild={removeGrandchild}
              onUpdateGrandchild={updateGrandchild}
            />
          )}

          {activeTab === "emergency" && (
            <EmergencySection
              emergencyContacts={emergencyContacts}
              onAddEmergencyContact={addEmergencyContact}
              onRemoveEmergencyContact={removeEmergencyContact}
              onUpdateEmergencyContact={updateEmergencyContact}
            />
          )}

          {activeTab === "contacts" && (
            <ContactsSection
              importantContacts={importantContacts}
              onUpdateImportantContact={updateImportantContact}
            />
          )}

          {activeTab === "assets" && (
            <AssetsSection
              propertyAssets={propertyAssets}
              vehicleAssets={vehicleAssets}
              onAddPropertyAsset={addPropertyAsset}
              onRemovePropertyAsset={removePropertyAsset}
              onUpdatePropertyAsset={updatePropertyAsset}
              onAddVehicleAsset={addVehicleAsset}
              onRemoveVehicleAsset={removeVehicleAsset}
              onUpdateVehicleAsset={updateVehicleAsset}
            />
          )}

          {activeTab === "benefits" && (
            <BenefitsSection
              lifeInsurancePolicies={lifeInsurancePolicies}
              benefitsDetails={benefitsDetails}
              onAddLifeInsurancePolicy={addLifeInsurancePolicy}
              onRemoveLifeInsurancePolicy={removeLifeInsurancePolicy}
              onUpdateLifeInsurancePolicy={updateLifeInsurancePolicy}
              onUpdateBenefitsDetails={updateBenefitsDetails}
            />
          )}

          {activeTab === "legal" && (
            <LegalSection
              legalDetails={legalDetails}
              onUpdateLegalDetails={updateLegalDetails}
              onHandleWillDocumentUpload={handleWillDocumentUpload}
            />
          )}

          {activeTab === "final" && (
            <FinalWishesSection
              finalWishes={finalWishes}
              onAddFinalWish={addFinalWish}
              onRemoveFinalWish={removeFinalWish}
              onUpdateFinalWish={updateFinalWish}
            />
          )}
        </div>
      </div>
    </div>
  );
}
