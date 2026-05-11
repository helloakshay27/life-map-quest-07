import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Shield, Info, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  ffBtnPrimary,
  ffBtnSecondary,
} from "@/components/ForFamilySections/forFamilySectionStyles";

// --- Components ---
import PersonalSection from "@/components/ForFamilySections/PersonalSection";
import FamilySection from "@/components/ForFamilySections/FamilySection";
import EmergencySection from "@/components/ForFamilySections/EmergencySection";
import ContactsSection from "@/components/ForFamilySections/ContactsSection";
import AssetsSection from "@/components/ForFamilySections/AssetsSection";
import FinanceSection from "@/components/ForFamilySections/FinanceSection";
import BenefitsSection from "@/components/ForFamilySections/BenefitsSection";
import LegalSection from "@/components/ForFamilySections/LegalSection";
import FinalWishesSection from "@/components/ForFamilySections/FinalWishesSection";
import OtherInfoSection from "@/components/ForFamilySections/OtherInfoSection";

// --- Types ---
interface Sibling { id: string; name: string; aadhar: string; address: string; phone: string; relation: string; }
interface Child { id: string; name: string; dob: string; aadhar: string; address: string; phone: string; email: string; }
interface Grandchild { id: string; name: string; dob: string; parentName: string; address: string; phone: string; }
interface EmergencyContact { id: string; name: string; relationship: string; address: string; homePhone: string; workPhone: string; email: string; }
interface ImportantContacts { employerSupervisor: string; employerPhone: string; employerEmail: string; physicianName: string; physicianPhone: string; physicianAddress: string; physicianEmail: string; lawyerName: string; lawyerPhone: string; lawyerAddress: string; attorneyName: string; attorneyPhone: string; attorneyAddress: string; attorneyEmail: string; accountantName: string; accountantPhone: string; accountantAddress: string; insuranceAgentName: string; insuranceAgencyName: string; insuranceAddress: string; insurancePhone: string; bankerName: string; bankName: string; bankAddress: string; bankPhone: string; brokerName: string; investmentCompany: string; brokerAddress: string; brokerPhone: string; }
interface PropertyAsset { id: string; propertyType: string; address: string; ownershipType: string; documentLocation: string; marketValue: string; }
interface VehicleAsset { id: string; vehicleType: string; model: string; registrationNumber: string; ownerName: string; insurancePolicy: string; insuranceExpiry: string; }
interface LifeInsurancePolicy { id: string; policyName: string; insurer: string; policyNumber: string; nominee: string; sumAssured: string; }
interface BenefitsDetails { coverageType: string; healthPlanName: string; isGovtPlan: boolean; spouseCoverage: boolean; annualLeaveHours: string; sickLeaveHours: string; epfMember: boolean; govtEmployee: boolean; retirementDate: string; spouseAwarePension: boolean; spouseAwareGratuity: boolean; }
interface LegalDetails { willLocatedAt: string; attorneyWhoHandledWill: string; lawFirm: string; attorneyPhone: string; willDate: string; executor: string; guardianshipDocumentsLocation: string; hasLivingWill: boolean; willDocumentUploaded: string; notesForFamily: string; organDonationPreference: string; }
interface BankAccount { id: string; bankName: string; checkingAccountNo: string; checkingJointAccount: boolean; savingsAccountNo: string; savingsJointAccount: boolean; }
interface InvestmentsDocuments { fixedDepositDetails: string; fdBank: string; fdCertificateKeptAt: string; bankLockerNumber: string; lockerBankBranch: string; lockerAccessibleBy: string; lockerKeyLocation: string; dematPortfolioLocation: string; bondsDebenturesLocation: string; ppfAccountLocation: string; npsEpfGratuityDetails: string; goldJewelleryDetails: string; uploadedDocuments: UploadedDocument[]; }
interface CreditCard { id: string; cardName: string; cardNumber: string; bank: string; expiryDate: string; creditLimit: string; }
interface FinalWish { id: string; name: string; placeOfWorship: string; religiousAffiliation: string; panditName: string; panditPhone: string; funeralServicePreference: string; serviceLocationAddress: string; contactPhone: string; preArrangedLastRites: boolean; exServicemanBenefits: boolean; militaryHonours: boolean; obituaryWanted: boolean; lastRitesPreference: string; cremationGroundChoice: string; lotPurchased: boolean; pallbearers: string; honoraryPallbearers: string; musicalSelections: string; specialRequests: string; }
interface UploadedDocument { id: string; fileName: string; uploadedAt: string; dataUrl: string; }

interface ApiDocument {
  id?: number | string;
  name?: string | null;
  url?: string;
  created_at?: string;
}
interface PersonalInfo { fullName: string; aadharNumber: string; panNumber: string; dateOfBirth: string; placeOfBirth: string; drivingLicenseNumber: string; drivingLicenseValidity: string; currentHomeAddress: string; mobileNumber: string; workPhone: string; nativeAddress: string; maritalStatus: string; marriageDate: string; spouseName: string; spouseMobile: string; spouseAadharNumber: string; spousePanNumber: string; spouseDrivingLicenseNumber: string; spouseDrivingLicenseValidity: string; spouseAddress: string; spouseEmployer: string; spouseWorkPhone: string; spouseEmployerAddress: string; formerSpouseName: string; formerSpouseContact: string; formerSpouseAddress: string; formerSpouseMarriageDate: string; formerSpouseDivorceDate: string; }

// Define Steps for Stepper
const FORM_STEPS = [
  { id: "personal", label: "Personal", icon: "👤" },
  { id: "family", label: "Family", icon: "👪" },
  { id: "emergency", label: "Emergency", icon: "🚨" },
  { id: "contacts", label: "Contacts", icon: "📋" },
  { id: "finance", label: "Finances", icon: "💰" },
  { id: "assets", label: "Assets", icon: "🏠" },
  { id: "benefits", label: "Benefits", icon: "🪙" },
  { id: "legal", label: "Legal", icon: "⚖️" },
  { id: "final", label: "Final Wishes", icon: "🕊️" },
  { id: "other", label: "Other Info", icon: "📝" },
];

export default function ForFamily() {
  const { toast } = useToast();
  
  // --- Loading & Submission States ---
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingProfile, setHasExistingProfile] = useState(false); 
  
  const [completionProgress, setCompletionProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("personal");
  const [showPrivacyAlert, setShowPrivacyAlert] = useState(true);
  const [showInfoAlert, setShowInfoAlert] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basicDetails: true, spouseInfo: true, formerSpouseInfo: true, personalDocuments: true, spouseDocuments: true, otherInfoDetails: true, attachedDocuments: true,
  });

  // --- Form States ---
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({ fullName: "", aadharNumber: "", panNumber: "", dateOfBirth: "", placeOfBirth: "", drivingLicenseNumber: "", drivingLicenseValidity: "", currentHomeAddress: "", mobileNumber: "", workPhone: "", nativeAddress: "", maritalStatus: "", marriageDate: "", spouseName: "", spouseMobile: "", spouseAadharNumber: "", spousePanNumber: "", spouseDrivingLicenseNumber: "", spouseDrivingLicenseValidity: "", spouseAddress: "", spouseEmployer: "", spouseWorkPhone: "", spouseEmployerAddress: "", formerSpouseName: "", formerSpouseContact: "", formerSpouseAddress: "", formerSpouseMarriageDate: "", formerSpouseDivorceDate: "" });
  const [personalDocuments, setPersonalDocuments] = useState<UploadedDocument[]>([]);
  const [spouseDocuments, setSpouseDocuments] = useState<UploadedDocument[]>([]);
  const [husbandSiblings, setHusbandSiblings] = useState<Sibling[]>([]);
  const [wifeSiblings, setWifeSiblings] = useState<Sibling[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [grandchildren, setGrandchildren] = useState<Grandchild[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [importantContacts, setImportantContacts] = useState<ImportantContacts>({ employerSupervisor: "", employerPhone: "", employerEmail: "", physicianName: "", physicianPhone: "", physicianAddress: "", physicianEmail: "", lawyerName: "", lawyerPhone: "", lawyerAddress: "", attorneyName: "", attorneyPhone: "", attorneyAddress: "", attorneyEmail: "", accountantName: "", accountantPhone: "", accountantAddress: "", insuranceAgentName: "", insuranceAgencyName: "", insuranceAddress: "", insurancePhone: "", bankerName: "", bankName: "", bankAddress: "", bankPhone: "", brokerName: "", investmentCompany: "", brokerAddress: "", brokerPhone: "" });
  const [propertyAssets, setPropertyAssets] = useState<PropertyAsset[]>([]);
  const [vehicleAssets, setVehicleAssets] = useState<VehicleAsset[]>([]);
  const [lifeInsurancePolicies, setLifeInsurancePolicies] = useState<LifeInsurancePolicy[]>([]);
  const [benefitsDetails, setBenefitsDetails] = useState<BenefitsDetails>({ coverageType: "", healthPlanName: "", isGovtPlan: false, spouseCoverage: false, annualLeaveHours: "", sickLeaveHours: "", epfMember: false, govtEmployee: false, retirementDate: "", spouseAwarePension: false, spouseAwareGratuity: false });
  const [legalDetails, setLegalDetails] = useState<LegalDetails>({ willLocatedAt: "", attorneyWhoHandledWill: "", lawFirm: "", attorneyPhone: "", willDate: "", executor: "", guardianshipDocumentsLocation: "", hasLivingWill: false, willDocumentUploaded: "", notesForFamily: "", organDonationPreference: "" });
  const [finalWishes, setFinalWishes] = useState<FinalWish[]>([]);
  
  // Finance states
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [investmentsDocuments, setInvestmentsDocuments] = useState<InvestmentsDocuments>({ fixedDepositDetails: "", fdBank: "", fdCertificateKeptAt: "", bankLockerNumber: "", lockerBankBranch: "", lockerAccessibleBy: "", lockerKeyLocation: "", dematPortfolioLocation: "", bondsDebenturesLocation: "", ppfAccountLocation: "", npsEpfGratuityDetails: "", goldJewelleryDetails: "", uploadedDocuments: [] });
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  
  // Other Info
  const [otherInfo, setOtherInfo] = useState({ notes: "" }); 
  const [attachedDocuments, setAttachedDocuments] = useState<UploadedDocument[]>([]); 

  const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const toggleSection = (section: string) => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  const documentValues = (documents: UploadedDocument[]) => documents.map((document) => document.dataUrl).filter((value) => value.startsWith("data:"));
  const getDocumentNameFromUrl = (url = "", fallback = "uploaded-document") => {
    const withoutQuery = url.split("?")[0];
    const lastSegment = withoutQuery.split("/").filter(Boolean).pop();
    return decodeURIComponent(lastSegment || fallback);
  };
  const normalizeApiDocuments = (documents: unknown, fallbackPrefix: string): UploadedDocument[] =>
    Array.isArray(documents)
      ? documents.map((document, index) => {
          const item = document as ApiDocument;
          const url = item.url || "";
          return {
            id: String(item.id ?? `${fallbackPrefix}-${index}`),
            fileName: item.name || getDocumentNameFromUrl(url, `${fallbackPrefix}-${index + 1}`),
            uploadedAt: item.created_at ? new Date(item.created_at).toLocaleDateString() : "",
            dataUrl: url,
          };
        })
      : [];
  const createUploadedDocument = (file: File): Promise<UploadedDocument> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        resolve({
          id: createId(),
          fileName: file.name,
          uploadedAt: new Date().toLocaleDateString(),
          dataUrl: String(reader.result || ""),
        });
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  const isPersistedDocumentId = (id: string) => /^\d+$/.test(id);
  const deletePersistedDocument = async (id: string) => {
    if (!isPersistedDocumentId(id)) return true;

    const token = localStorage.getItem("auth_token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`https://life-api.lockated.com/family_profile/documents/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) throw new Error(`Failed to delete document: ${response.status}`);
    return true;
  };

  // --- Stepper Navigation Handlers ---
  const currentStepIndex = FORM_STEPS.findIndex(step => step.id === activeTab);
  
  const handleNextStep = () => {
    if (currentStepIndex < FORM_STEPS.length - 1) {
      setActiveTab(FORM_STEPS[currentStepIndex + 1].id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setActiveTab(FORM_STEPS[currentStepIndex - 1].id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // --- COMPREHENSIVE PROGRESS CALCULATION ---
  useEffect(() => {
    const checks = [
      !!personalInfo.fullName, !!personalInfo.dateOfBirth, !!personalInfo.currentHomeAddress, !!personalInfo.aadharNumber || !!personalInfo.panNumber,
      !!personalInfo.spouseName || children.length > 0 || husbandSiblings.length > 0 || wifeSiblings.length > 0,
      emergencyContacts.length > 0,
      !!importantContacts.physicianName || !!importantContacts.lawyerName || !!importantContacts.accountantName || !!importantContacts.bankName,
      propertyAssets.length > 0 || vehicleAssets.length > 0,
      lifeInsurancePolicies.length > 0 || !!benefitsDetails.healthPlanName || !!benefitsDetails.retirementDate,
      !!legalDetails.willLocatedAt || legalDetails.hasLivingWill || !!legalDetails.attorneyWhoHandledWill,
      finalWishes.length > 0,
      !!otherInfo.notes || attachedDocuments.length > 0 // Included in progress
    ];
    setCompletionProgress(Math.round((checks.filter(Boolean).length / checks.length) * 100));
  }, [
    personalInfo, children, husbandSiblings, wifeSiblings, emergencyContacts, 
    importantContacts, propertyAssets, vehicleAssets, lifeInsurancePolicies, 
    benefitsDetails, legalDetails, finalWishes, otherInfo, attachedDocuments
  ]);

  // --- API: Fetch Initial Data ---
  useEffect(() => {
    const fetchFamilyProfile = async () => {
      setIsFetching(true);
      try {
        const token = localStorage.getItem("auth_token");
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const response = await fetch("https://life-api.lockated.com/family_profile", { method: "GET", headers });

        if (!response.ok) {
          if (response.status === 404) {
            setHasExistingProfile(false); 
            return;
          }
          throw new Error(`Failed to fetch: ${response.status}`);
        }

        const data = await response.json();
        const profile = data.personal ? data : data.family_profile; 
        
          if (profile && profile.personal) {
          setHasExistingProfile(true); 
          const apiDocuments = data.documents || profile.documents || {};
          setPersonalDocuments(normalizeApiDocuments(apiDocuments.personal, "personal-document"));
          setSpouseDocuments(normalizeApiDocuments(apiDocuments.spouse, "spouse-document"));
          setInvestmentsDocuments(prev => ({
            ...prev,
            uploadedDocuments: normalizeApiDocuments(apiDocuments.investment, "investment-document"),
          }));
          setAttachedDocuments(normalizeApiDocuments(apiDocuments.other, "other-document"));
          const willDocument = normalizeApiDocuments(apiDocuments.will, "will-document")[0];

          if (profile.personal) {
            setPersonalInfo(prev => ({ 
              ...prev, 
              fullName: profile.personal.full_name || "", 
              dateOfBirth: profile.personal.date_of_birth || "", 
              placeOfBirth: profile.personal.place_of_birth || "", 
              maritalStatus: profile.personal.marital_status || "", 
              aadharNumber: profile.personal.aadhaar_number || "", 
              panNumber: profile.personal.pan_number || "", 
              drivingLicenseNumber: profile.personal.driving_license || "",
              spouseName: profile.family?.spouse_name || "", 
              spouseMobile: profile.family?.spouse_phone || "",
              currentHomeAddress: profile.emergency?.home_address || "" 
            }));
            
            setImportantContacts(prev => ({
              ...prev,
              employerSupervisor: profile.personal.occupation || "",
              bankName: profile.personal.employer || ""
            }));
          }

          if (profile.family) {
            if (profile.family.children && Array.isArray(profile.family.children)) {
              setChildren(profile.family.children.map((c: Record<string, string>) => ({ 
                id: createId(), name: c.name || "", dob: c.date_of_birth || "", aadhar: "", address: "", phone: "", email: "" 
              })));
            }
            if (profile.family.parents && Array.isArray(profile.family.parents)) {
              setHusbandSiblings(profile.family.parents.map((p: Record<string, string>) => ({ 
                id: createId(), name: p.name || "", relation: p.relationship || "", aadhar: "", address: "", phone: "" 
              })));
            }
          }

          if (profile.emergency) {
            const eContacts = [];
            if (profile.emergency.primary_contact_name) eContacts.push({ id: createId(), name: profile.emergency.primary_contact_name, homePhone: profile.emergency.primary_contact_phone || "", relationship: "Primary", address: "", workPhone: "", email: "" });
            if (profile.emergency.secondary_contact_name) eContacts.push({ id: createId(), name: profile.emergency.secondary_contact_name, homePhone: profile.emergency.secondary_contact_phone || "", relationship: "Secondary", address: "", workPhone: "", email: "" });
            setEmergencyContacts(eContacts);
            setImportantContacts(prev => ({ ...prev, insuranceAgencyName: profile.emergency.insurance_provider || "" }));
            if (profile.emergency.insurance_policy_number) {
              setLifeInsurancePolicies([{ id: createId(), policyName: "Health/Emergency", insurer: profile.emergency.insurance_provider || "", policyNumber: profile.emergency.insurance_policy_number, nominee: "", sumAssured: "" }]);
            }
          }

          if (profile.contacts && Array.isArray(profile.contacts)) {
             profile.contacts.forEach((c: Record<string, string>) => {
               if(c.relationship === "Family Doctor") setImportantContacts(prev => ({ ...prev, physicianName: c.name || "", physicianPhone: c.phone || "", physicianEmail: c.email || "" }));
               if(c.relationship === "Lawyer") setImportantContacts(prev => ({ ...prev, lawyerName: c.name || "", lawyerPhone: c.phone || "" }));
               if(c.relationship === "Accountant") setImportantContacts(prev => ({ ...prev, accountantName: c.name || "", accountantPhone: c.phone || "" }));
             });
          }

          let parsedPolicies: LifeInsurancePolicy[] = [];
          if (profile.finances && Array.isArray(profile.finances)) {
            parsedPolicies = [...parsedPolicies, ...profile.finances.map((f: Record<string, string>) => ({ id: createId(), policyName: f.account_type || "", insurer: f.bank_name || "", policyNumber: f.account_number || "", nominee: f.nominee || "", sumAssured: "" }))];
          }
          if (profile.benefits && Array.isArray(profile.benefits)) {
            parsedPolicies = [...parsedPolicies, ...profile.benefits.map((b: Record<string, string>) => ({ id: createId(), policyName: b.benefit_type || "", insurer: b.provider_name || "", policyNumber: b.policy_number || "", nominee: "", sumAssured: "" }))];
          }
          if (parsedPolicies.length > 0) {
            setLifeInsurancePolicies(prev => [...prev.filter(p => p.policyName === "Health/Emergency"), ...parsedPolicies]);
          }

          if (profile.assets && Array.isArray(profile.assets)) {
            setPropertyAssets(profile.assets.filter((a: Record<string, string>) => a.asset_type === "Property").map((a: Record<string, string>) => ({ id: createId(), propertyType: a.description || "", address: a.location || "", marketValue: a.estimated_value || "", ownershipType: "", documentLocation: "" })));
            setVehicleAssets(profile.assets.filter((a: Record<string, string>) => a.asset_type === "Vehicle").map((a: Record<string, string>) => {
              const desc = a.description?.split(" - ") || [];
              return { id: createId(), vehicleType: desc[0] || "", model: desc[1] || "", registrationNumber: "", ownerName: "", insurancePolicy: "", insuranceExpiry: "" };
            }));
          }

          if (profile.legal) {
            setLegalDetails(prev => ({
              ...prev,
              hasLivingWill: profile.legal.has_living_will ?? profile.legal.will_exists ?? false,
              willLocatedAt: profile.legal.will_located_at || profile.legal.will_location || "",
              attorneyWhoHandledWill: profile.legal.attorney_who_handled_will || profile.legal.lawyer_name || "",
              attorneyPhone: profile.legal.attorney_phone || profile.legal.lawyer_contact || "",
              lawFirm: profile.legal.law_firm || "",
              willDate: profile.legal.will_date || "",
              executor: profile.legal.executor_name || "",
              guardianshipDocumentsLocation: profile.legal.guardianship_documents_location || "",
              organDonationPreference: profile.legal.organ_donation_preference || "",
              notesForFamily: profile.legal.notes_for_family || "",
              willDocumentUploaded: willDocument?.dataUrl || profile.legal.will_document || "",
            }));
          }

          // Other Info Map
          if (profile.other_info) {
             setOtherInfo({ notes: profile.other_info.additional_notes || profile.other_info.notes || "" });
          }

          if (profile.final_wishes && Array.isArray(profile.final_wishes)) {
             setFinalWishes(profile.final_wishes.map((w: Record<string, string | boolean>) => ({
               id: createId(), name: w.person_name || "", religiousAffiliation: w.religious_affiliation || "", placeOfWorship: w.place_of_worship || "", panditName: w.priest_name || "", panditPhone: w.priest_phone || "", serviceLocationAddress: w.service_location_address || "", contactPhone: w.contact_phone || "", lastRitesPreference: w.last_rites_preference || "", cremationGroundChoice: w.cremation_or_burial_choice || "", pallbearers: w.pallbearers || "", musicalSelections: w.musical_selections || "", specialRequests: w.special_requests || "", funeralServicePreference: "", preArrangedLastRites: false, exServicemanBenefits: false, militaryHonours: false, obituaryWanted: false, lotPurchased: false, honoraryPallbearers: ""
             })));
          }
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchFamilyProfile();
  }, []);

  // --- API: Save/Update Data ---
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("auth_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const payload = {
        family_profile: {
          personal: {
            full_name: personalInfo.fullName,
            date_of_birth: personalInfo.dateOfBirth,
            place_of_birth: personalInfo.placeOfBirth,
            pan_number: personalInfo.panNumber,
            aadhaar_number: personalInfo.aadharNumber,
            driving_license: personalInfo.drivingLicenseNumber,
            license_validity: personalInfo.drivingLicenseValidity,
            mobile_number: personalInfo.mobileNumber,
            work_phone: personalInfo.workPhone,
            current_address: personalInfo.currentHomeAddress,
            permanent_address: personalInfo.nativeAddress,
            documents: documentValues(personalDocuments),
          },
          family: {
            spouse_name: personalInfo.spouseName,
            spouse_aadhaar: personalInfo.spouseAadharNumber,
            spouse_pan: personalInfo.spousePanNumber,
            spouse_mobile: personalInfo.spouseMobile,
            spouse_driving_license: personalInfo.spouseDrivingLicenseNumber,
            spouse_license_validity: personalInfo.spouseDrivingLicenseValidity,
            spouse_address: personalInfo.spouseAddress,
            spouse_employer_name: personalInfo.spouseEmployer,
            spouse_work_phone: personalInfo.spouseWorkPhone,
            spouse_employer_address: personalInfo.spouseEmployerAddress,
            spouse_documents: documentValues(spouseDocuments),
            former_spouse_name: personalInfo.formerSpouseName,
            former_spouse_contact: personalInfo.formerSpouseContact,
            former_spouse_address: personalInfo.formerSpouseAddress,
            marriage_date: personalInfo.marriageDate || personalInfo.formerSpouseMarriageDate,
            divorce_date: personalInfo.formerSpouseDivorceDate,
            children: children.map(c => ({ name: c.name, date_of_birth: c.dob })),
            parents: [
              ...husbandSiblings.map(s => ({ name: s.name, relationship: s.relation, contact: s.phone })),
              ...wifeSiblings.map(s => ({ name: s.name, relationship: s.relation, contact: s.phone }))
            ]
          },
          emergency: {
            primary_contact_name: emergencyContacts[0]?.name || "",
            primary_contact_phone: emergencyContacts[0]?.homePhone || "",
            primary_contact_relationship: emergencyContacts[0]?.relationship || "",
            secondary_contact_name: emergencyContacts[1]?.name || "",
            secondary_contact_phone: emergencyContacts[1]?.homePhone || "",
            secondary_contact_relationship: emergencyContacts[1]?.relationship || "",
            home_address: personalInfo.currentHomeAddress,
            blood_group: "",
            medical_conditions: "",
            allergies: "",
            doctor_name: importantContacts.physicianName,
            doctor_phone: importantContacts.physicianPhone,
            insurance_provider: importantContacts.insuranceAgencyName,
            insurance_policy_number: lifeInsurancePolicies.find(p => p.policyName === "Health/Emergency")?.policyNumber || ""
          },
          contacts: [
            ...(importantContacts.physicianName ? [{ name: importantContacts.physicianName, relationship: "Family Doctor", phone: importantContacts.physicianPhone, email: importantContacts.physicianEmail, address: importantContacts.physicianAddress }] : []),
            ...(importantContacts.lawyerName ? [{ name: importantContacts.lawyerName, relationship: "Lawyer", phone: importantContacts.lawyerPhone, email: "", address: importantContacts.lawyerAddress }] : []),
            ...(importantContacts.attorneyName ? [{ name: importantContacts.attorneyName, relationship: "Attorney", phone: importantContacts.attorneyPhone, email: importantContacts.attorneyEmail, address: importantContacts.attorneyAddress }] : []),
            ...(importantContacts.accountantName ? [{ name: importantContacts.accountantName, relationship: "Accountant", phone: importantContacts.accountantPhone, email: "", address: importantContacts.accountantAddress }] : []),
            ...(importantContacts.insuranceAgentName ? [{ name: importantContacts.insuranceAgentName, relationship: "Insurance Agent", phone: importantContacts.insurancePhone, email: "", address: importantContacts.insuranceAddress }] : []),
            ...(importantContacts.bankerName ? [{ name: importantContacts.bankerName, relationship: "Banker", phone: importantContacts.bankPhone, email: "", address: importantContacts.bankAddress }] : []),
            ...(importantContacts.brokerName ? [{ name: importantContacts.brokerName, relationship: "Broker", phone: importantContacts.brokerPhone, email: "", address: importantContacts.brokerAddress }] : [])
          ],
          finances: bankAccounts.flatMap(account => [
            ...(account.checkingAccountNo ? [{
              bank_name: account.bankName,
              branch: "",
              account_type: "Checking",
              account_number: account.checkingAccountNo,
              ifsc_code: "",
              nominee: "",
            }] : []),
            ...(account.savingsAccountNo ? [{
              bank_name: account.bankName,
              branch: "",
              account_type: "Savings",
              account_number: account.savingsAccountNo,
              ifsc_code: "",
              nominee: "",
            }] : []),
          ]),
          investment_documents: documentValues(investmentsDocuments.uploadedDocuments),
          assets: [
            ...propertyAssets.map(p => ({ asset_type: "Property", description: p.propertyType, location: p.address, estimated_value: p.marketValue, documents_location: p.documentLocation })),
            ...vehicleAssets.map(v => ({ asset_type: "Vehicle", description: `${v.vehicleType} ${v.model}`.trim(), registration_number: v.registrationNumber, estimated_value: "" }))
          ],
          benefits: lifeInsurancePolicies.map(p => ({ benefit_type: p.policyName, provider_name: p.insurer, policy_number: p.policyNumber, sum_assured: p.sumAssured, nominee: p.nominee, premium_due_date: "" })),
          legal: {
            will_located_at: legalDetails.willLocatedAt,
            attorney_who_handled_will: legalDetails.attorneyWhoHandledWill,
            law_firm: legalDetails.lawFirm,
            attorney_phone: legalDetails.attorneyPhone,
            will_date: legalDetails.willDate,
            executor_name: legalDetails.executor,
            will_document: legalDetails.willDocumentUploaded.startsWith("data:") ? legalDetails.willDocumentUploaded : "",
            has_living_will: legalDetails.hasLivingWill,
            organ_donation_preference: legalDetails.organDonationPreference,
            guardianship_documents_location: legalDetails.guardianshipDocumentsLocation,
            notes_for_family: legalDetails.notesForFamily,
          },
          final_wishes: finalWishes.map(w => ({
            person_name: w.name, religious_affiliation: w.religiousAffiliation, place_of_worship: w.placeOfWorship, priest_name: w.panditName, priest_phone: w.panditPhone, service_location_address: w.serviceLocationAddress, contact_phone: w.contactPhone, last_rites_preference: w.lastRitesPreference, cremation_or_burial_choice: w.cremationGroundChoice, pallbearers: w.pallbearers, musical_selections: w.musicalSelections, special_requests: w.specialRequests
          })),
          other_info: {
            additional_notes: otherInfo.notes,
            documents: attachedDocuments.map((document) => ({
              name: document.fileName,
              description: "",
              file: document.dataUrl.startsWith("data:") ? document.dataUrl : "",
            })).filter((document) => document.file),
          } 
        }
      };

      const method = hasExistingProfile ? "PUT" : "POST";
      const response = await fetch("https://life-api.lockated.com/family_profile", {
        method, headers, body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`Failed to save: ${response.status}`);
      toast({ title: "Success!", description: hasExistingProfile ? "Updated successfully" : "Saved successfully", variant: "goalsSuccess" });
      setHasExistingProfile(true); 
    } catch (error) {
      console.error("Save error:", error);
      toast({ title: "Error", description: "Something went wrong while saving.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

 // --- Download Handler (.txt Format) ---
  const handleDownload = () => {
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const separator = "============================================================";

    let txt = `WHAT MY FAMILY SHOULD KNOW\nA Guide to Getting Affairs in Order\n\n`;
    txt += `Prepared by: ${personalInfo.fullName || 'Unknown'}\n`;
    txt += `Date: ${today}\n\n`;

    // 1. PERSONAL INFORMATION
    txt += `${separator}\nPERSONAL INFORMATION\n${separator}\n`;
    txt += `Name: ${personalInfo.fullName || ''}\n`;
    txt += `Aadhaar: ${personalInfo.aadharNumber || ''}\n`;
    txt += `PAN: ${personalInfo.panNumber || ''}\n`;
    txt += `Driving License: ${personalInfo.drivingLicenseNumber || ''}\n`;
    txt += `Address: ${personalInfo.currentHomeAddress || ''}\n`;
    txt += `Home Phone: ${personalInfo.mobileNumber || ''}\n`;
    txt += `Work Phone: ${personalInfo.workPhone || ''}\n\n`;
    txt += `-- Spouse --\n`;
    if (personalInfo.spouseName) {
      txt += `Name: ${personalInfo.spouseName}\n`;
      txt += `Aadhaar: ${personalInfo.spouseAadharNumber || ''}\n`;
      txt += `Phone: ${personalInfo.spouseMobile || ''}\n`;
    }
    txt += `\n`;

    // 2. CHILDREN
    txt += `${separator}\nCHILDREN\n${separator}\n\n`;
    if (children.length === 0) {
      txt += `(None recorded)\n\n`;
    } else {
      children.forEach((c, index) => {
        txt += `--- #${index + 1} ---\n`;
        txt += `Name: ${c.name || ''}\n`;
        txt += `DOB: ${c.dob || ''}\n`;
        txt += `Aadhaar: ${c.aadhar || ''}\n`;
        txt += `Address: ${c.address || ''}\n\n`;
      });
    }

    // 3. GRANDCHILDREN
    txt += `${separator}\nGRANDCHILDREN\n${separator}\n\n`;
    if (grandchildren.length === 0) {
      txt += `(None recorded)\n\n`;
    } else {
      grandchildren.forEach((g, index) => {
        txt += `--- #${index + 1} ---\n`;
        txt += `Name: ${g.name || ''}\n`;
        txt += `DOB: ${g.dob || ''}\n`;
        txt += `Address: ${g.address || ''}\n\n`;
      });
    }

    // 4. EXTENDED FAMILY
    txt += `${separator}\nEXTENDED FAMILY\n${separator}\n`;
    txt += `HUSBAND'S FAMILY\n`;
    if (husbandSiblings.length === 0) txt += `\n`;
    else husbandSiblings.forEach(s => txt += `Name: ${s.name}, Relation: ${s.relation}, Phone: ${s.phone}\n`);
    
    txt += `\nWIFE'S FAMILY\n`;
    if (wifeSiblings.length === 0) txt += `\n`;
    else wifeSiblings.forEach(s => txt += `Name: ${s.name}, Relation: ${s.relation}, Phone: ${s.phone}\n`);
    txt += `\n`;

    // 5. EMERGENCY CONTACTS
    txt += `${separator}\nEMERGENCY CONTACTS\n${separator}\n\n`;
    if (emergencyContacts.length === 0) {
      txt += `(None recorded)\n\n`;
    } else {
      emergencyContacts.forEach((c, index) => {
        txt += `--- #${index + 1} ---\n`;
        txt += `Name: ${c.name || ''}\n`;
        txt += `Relationship: ${c.relationship || ''}\n`;
        txt += `Phone: ${c.homePhone || ''}\n\n`;
      });
    }

    // 6. IMPORTANT CONTACTS
    txt += `${separator}\nIMPORTANT CONTACTS\n${separator}\n`;
    txt += `ATTORNEY\n${importantContacts.attorneyName ? `Name: ${importantContacts.attorneyName}\nPhone: ${importantContacts.attorneyPhone}\n` : '\n'}\n`;
    txt += `PHYSICIAN\n${importantContacts.physicianName ? `Name: ${importantContacts.physicianName}\nPhone: ${importantContacts.physicianPhone}\n` : '\n'}\n`;
    txt += `RELIGIOUS CONTACT\n\n`;
    txt += `ACCOUNTANT\n${importantContacts.accountantName ? `Name: ${importantContacts.accountantName}\nPhone: ${importantContacts.accountantPhone}\n` : '\n'}\n`;
    txt += `INSURANCE AGENT\n${importantContacts.insuranceAgentName ? `Name: ${importantContacts.insuranceAgentName}\nPhone: ${importantContacts.insurancePhone}\n` : '\n'}\n`;
    txt += `BANKER\n${importantContacts.bankerName ? `Name: ${importantContacts.bankerName}\nBank: ${importantContacts.bankName}\n` : '\n'}\n`;
    txt += `BROKER / INVESTMENT\n${importantContacts.brokerName ? `Name: ${importantContacts.brokerName}\nPhone: ${importantContacts.brokerPhone}\n` : '\n'}\n`;

    // 7. FINANCES
    txt += `${separator}\nFINANCES\n${separator}\n`;
    txt += `BANK ACCOUNTS:\n\n`;
    if (bankAccounts.length === 0) txt += `(None recorded)\n\n`;
    else bankAccounts.forEach(b => txt += `Bank: ${b.bankName}\nChecking: ${b.checkingAccountNo}\nSavings: ${b.savingsAccountNo}\n\n`);
    
    txt += `INVESTMENTS & DOCUMENTS:\n\n`;
    
    txt += `LOCKER:\n\n`;
    
    txt += `CREDIT CARDS:\n\n`;
    if (creditCards.length === 0) txt += `(None recorded)\n\n`;
    else creditCards.forEach(c => txt += `Card: ${c.cardName}\nBank: ${c.bank}\n\n`);

    // 8. REAL ESTATE & VEHICLES
    txt += `${separator}\nREAL ESTATE & VEHICLES\n${separator}\n`;
    txt += `PROPERTIES:\n\n`;
    if (propertyAssets.length === 0) txt += `(None recorded)\n\n`;
    else propertyAssets.forEach(p => txt += `Type: ${p.propertyType}\nAddress: ${p.address}\n\n`);
    
    txt += `VEHICLES:\n\n`;
    if (vehicleAssets.length === 0) txt += `(None recorded)\n\n`;
    else vehicleAssets.forEach(v => txt += `Type: ${v.vehicleType}\nModel: ${v.model}\n\n`);

    // 9. BENEFITS & INSURANCE
    txt += `${separator}\nBENEFITS & INSURANCE\n${separator}\n`;
    txt += `INSURANCE POLICIES:\n\n`;
    if (lifeInsurancePolicies.length === 0) txt += `(None recorded)\n\n`;
    else lifeInsurancePolicies.forEach(p => txt += `Policy: ${p.policyName}\nInsurer: ${p.insurer}\nNo: ${p.policyNumber}\n\n`);
    
    txt += `LEAVE & EPF:\n`;
    txt += `EPF/Gratuity Member: ${benefitsDetails.epfMember ? 'Yes' : 'No'}\n\n`;
    
    txt += `RETIREMENT:\n`;
    txt += `Govt/PSU Employee: ${benefitsDetails.govtEmployee ? 'Yes' : 'No'}\n`;
    txt += `Spouse Aware of Family Pension: ${benefitsDetails.spouseAwarePension ? 'Yes' : 'No'}\n`;
    txt += `Spouse Aware of Gratuity: ${benefitsDetails.spouseAwareGratuity ? 'Yes' : 'No'}\n\n`;

    // 10. LEGAL DOCUMENTS
    txt += `${separator}\nLEGAL DOCUMENTS\n${separator}\n`;
    txt += `Living Will Executed: ${legalDetails.hasLivingWill ? 'Yes' : 'No'}\n\n`;

    // 11. FINAL WISHES
    txt += `${separator}\nFINAL WISHES\n${separator}\n\n`;
    if (finalWishes.length === 0) {
      txt += `(None recorded)\n\n`;
    } else {
      finalWishes.forEach((w, index) => {
        txt += `--- #${index + 1} ---\n`;
        txt += `Name: ${w.name || ''}\n`;
        txt += `Preference: ${w.lastRitesPreference || ''}\n\n`;
      });
    }

    txt += `\n${separator}\n`;
    txt += `Document generated on ${today} from CBX Life Compass\n`;

    // --- Generate and Download File ---
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    // Create a safe filename (e.g., ForMyFamily_John_Doe.txt)
    const safeName = personalInfo.fullName ? personalInfo.fullName.replace(/\s+/g, '_') : 'Profile';
    link.download = `ForMyFamily_${safeName}.txt`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: "Success!", description: "Your profile has been downloaded as a text file.", variant: "goalsSuccess" });
  };
  // --- Handlers ---
  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => setPersonalInfo(prev => ({ ...prev, [field]: value }));
  const updateImportantContact = (field: keyof ImportantContacts, value: string) => setImportantContacts(prev => ({ ...prev, [field]: value }));
  const updateBenefitsDetails = (field: keyof BenefitsDetails, value: string | boolean) => setBenefitsDetails(prev => ({ ...prev, [field]: value }));
  const updateLegalDetails = (field: keyof LegalDetails, value: string | boolean) => setLegalDetails(prev => ({ ...prev, [field]: value }));
  const addPersonalDocument = async (file: File) => {
    const document = await createUploadedDocument(file);
    setPersonalDocuments(prev => [...prev, document]);
  };
  const removePersonalDocument = async (id: string) => {
    try {
      await deletePersistedDocument(id);
      setPersonalDocuments(prev => prev.filter(doc => doc.id !== id));
      toast({ title: "Removed", description: "Document removed successfully.", variant: "goalsSuccess" });
    } catch (error) {
      console.error("Delete personal document error:", error);
      toast({ title: "Error", description: "Could not remove document.", variant: "destructive" });
    }
  };
  const addSpouseDocument = async (file: File) => {
    const document = await createUploadedDocument(file);
    setSpouseDocuments(prev => [...prev, document]);
  };
  const removeSpouseDocument = async (id: string) => {
    try {
      await deletePersistedDocument(id);
      setSpouseDocuments(prev => prev.filter(doc => doc.id !== id));
      toast({ title: "Removed", description: "Document removed successfully.", variant: "goalsSuccess" });
    } catch (error) {
      console.error("Delete spouse document error:", error);
      toast({ title: "Error", description: "Could not remove document.", variant: "destructive" });
    }
  };
  const addAttachedDocument = async (file: File) => {
    const document = await createUploadedDocument(file);
    setAttachedDocuments(prev => [...prev, document]);
  };
  const removeAttachedDocument = async (id: string) => {
    try {
      await deletePersistedDocument(id);
      setAttachedDocuments(prev => prev.filter(doc => doc.id !== id));
      toast({ title: "Removed", description: "Document removed successfully.", variant: "goalsSuccess" });
    } catch (error) {
      console.error("Delete attached document error:", error);
      toast({ title: "Error", description: "Could not remove document.", variant: "destructive" });
    }
  };
  const addHusbandSibling = () => setHusbandSiblings(prev => [...prev, { id: createId(), name: "", aadhar: "", address: "", phone: "", relation: "brother" }]);
  const removeHusbandSibling = (id: string) => setHusbandSiblings(prev => prev.filter(s => s.id !== id));
  const updateHusbandSibling = (id: string, field: keyof Sibling, value: string) => setHusbandSiblings(prev => prev.map(s => (s.id === id ? { ...s, [field]: value } : s)));
  const addWifeSibling = () => setWifeSiblings(prev => [...prev, { id: createId(), name: "", aadhar: "", address: "", phone: "", relation: "sister" }]);
  const removeWifeSibling = (id: string) => setWifeSiblings(prev => prev.filter(s => s.id !== id));
  const updateWifeSibling = (id: string, field: keyof Sibling, value: string) => setWifeSiblings(prev => prev.map(s => (s.id === id ? { ...s, [field]: value } : s)));
  const addChild = () => setChildren(prev => [...prev, { id: createId(), name: "", dob: "", aadhar: "", address: "", phone: "", email: "" }]);
  const removeChild = (id: string) => setChildren(prev => prev.filter(c => c.id !== id));
  const updateChild = (id: string, field: keyof Child, value: string) => setChildren(prev => prev.map(c => (c.id === id ? { ...c, [field]: value } : c)));
  const addGrandchild = () => setGrandchildren(prev => [...prev, { id: createId(), name: "", dob: "", parentName: "", address: "", phone: "" }]);
  const removeGrandchild = (id: string) => setGrandchildren(prev => prev.filter(g => g.id !== id));
  const updateGrandchild = (id: string, field: keyof Grandchild, value: string) => setGrandchildren(prev => prev.map(g => (g.id === id ? { ...g, [field]: value } : g)));
  const addEmergencyContact = () => setEmergencyContacts(prev => [...prev, { id: createId(), name: "", relationship: "", address: "", homePhone: "", workPhone: "", email: "" }]);
  const removeEmergencyContact = (id: string) => setEmergencyContacts(prev => prev.filter(c => c.id !== id));
  const updateEmergencyContact = (id: string, field: keyof EmergencyContact, value: string) => setEmergencyContacts(prev => prev.map(c => (c.id === id ? { ...c, [field]: value } : c)));
  const addPropertyAsset = () => setPropertyAssets(prev => [...prev, { id: createId(), propertyType: "", address: "", ownershipType: "", documentLocation: "", marketValue: "" }]);
  const removePropertyAsset = (id: string) => setPropertyAssets(prev => prev.filter(p => p.id !== id));
  const updatePropertyAsset = (id: string, field: keyof PropertyAsset, value: string) => setPropertyAssets(prev => prev.map(p => (p.id === id ? { ...p, [field]: value } : p)));
  const addVehicleAsset = () => setVehicleAssets(prev => [...prev, { id: createId(), vehicleType: "", model: "", registrationNumber: "", ownerName: "", insurancePolicy: "", insuranceExpiry: "" }]);
  const removeVehicleAsset = (id: string) => setVehicleAssets(prev => prev.filter(v => v.id !== id));
  const updateVehicleAsset = (id: string, field: keyof VehicleAsset, value: string) => setVehicleAssets(prev => prev.map(v => (v.id === id ? { ...v, [field]: value } : v)));
  const addLifeInsurancePolicy = () => setLifeInsurancePolicies(prev => [...prev, { id: createId(), policyName: "", insurer: "", policyNumber: "", nominee: "", sumAssured: "" }]);
  const removeLifeInsurancePolicy = (id: string) => setLifeInsurancePolicies(prev => prev.filter(p => p.id !== id));
  const updateLifeInsurancePolicy = (id: string, field: keyof LifeInsurancePolicy, value: string) => setLifeInsurancePolicies(prev => prev.map(p => (p.id === id ? { ...p, [field]: value } : p)));
  
  // Finance handlers
  const addBankAccount = () => setBankAccounts(prev => [...prev, { id: createId(), bankName: "", checkingAccountNo: "", checkingJointAccount: false, savingsAccountNo: "", savingsJointAccount: false }]);
  const removeBankAccount = (id: string) => setBankAccounts(prev => prev.filter(b => b.id !== id));
  const updateBankAccount = (id: string, field: keyof BankAccount, value: string | boolean) => setBankAccounts(prev => prev.map(b => (b.id === id ? { ...b, [field]: value } : b)));
  const updateInvestmentsDocuments = (field: keyof InvestmentsDocuments, value: string) => setInvestmentsDocuments(prev => ({ ...prev, [field]: value }));
  const addInvestmentDocument = async (file: File) => {
    const document = await createUploadedDocument(file);
    setInvestmentsDocuments(prev => ({ ...prev, uploadedDocuments: [...prev.uploadedDocuments, document] }));
  };
  const removeInvestmentDocument = async (id: string) => {
    try {
      await deletePersistedDocument(id);
      setInvestmentsDocuments(prev => ({ ...prev, uploadedDocuments: prev.uploadedDocuments.filter(d => d.id !== id) }));
      toast({ title: "Removed", description: "Document removed successfully.", variant: "goalsSuccess" });
    } catch (error) {
      console.error("Delete investment document error:", error);
      toast({ title: "Error", description: "Could not remove document.", variant: "destructive" });
    }
  };
  const addCreditCard = () => setCreditCards(prev => [...prev, { id: createId(), cardName: "", cardNumber: "", bank: "", expiryDate: "", creditLimit: "" }]);
  const removeCreditCard = (id: string) => setCreditCards(prev => prev.filter(c => c.id !== id));
  const updateCreditCard = (id: string, field: keyof CreditCard, value: string) => setCreditCards(prev => prev.map(c => (c.id === id ? { ...c, [field]: value } : c)));
  
  const handleWillDocumentUpload = async (file: File) => {
    const document = await createUploadedDocument(file);
    updateLegalDetails("willDocumentUploaded", document.dataUrl);
  };
  const addFinalWish = () => setFinalWishes(prev => [...prev, { id: createId(), name: "", placeOfWorship: "", religiousAffiliation: "", panditName: "", panditPhone: "", funeralServicePreference: "", serviceLocationAddress: "", contactPhone: "", preArrangedLastRites: false, exServicemanBenefits: false, militaryHonours: false, obituaryWanted: false, lastRitesPreference: "", cremationGroundChoice: "", lotPurchased: false, pallbearers: "", honoraryPallbearers: "", musicalSelections: "", specialRequests: "" }]);
  const removeFinalWish = (id: string) => setFinalWishes(prev => prev.filter(w => w.id !== id));
  const updateFinalWish = (id: string, field: keyof FinalWish, value: string | boolean) => setFinalWishes(prev => prev.map(w => (w.id === id ? { ...w, [field]: value } : w)));

  return (
    <div className="relative w-full animate-fade-in space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2C2C2A]">For My Family</h1>
          <p className="text-sm font-medium text-[#888780] mt-0.5">A guide to getting your affairs in order</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            className={ffBtnSecondary}
            disabled={isFetching || isSaving}
            onClick={handleDownload}
          >
            Download
          </button>
          <button
            type="button"
            className={ffBtnPrimary}
            onClick={handleSave}
            disabled={isFetching || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {hasExistingProfile ? "Updating..." : "Saving..."}
              </>
            ) : hasExistingProfile ? (
              "Update Profile"
            ) : (
              "Save Profile"
            )}
          </button>
        </div>
      </div>

      {/* Progress Card */}
      <div className="rounded-2xl border border-[#D6B99D] bg-[#FEF4EE] px-5 pt-5 pb-6 shadow-sm">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[15px] font-bold text-[#2C2C2A]">Completion Progress</span>
            <span className="text-sm font-extrabold text-[#DA7756]">{completionProgress}%</span>
          </div>
          <Progress value={completionProgress} className="h-2.5" />
        </div>
      </div>

      {/* Info Banners */}
      <div className="space-y-4">
        {showPrivacyAlert && (
          <div className="rounded-2xl border border-[#0B5D41]/30 bg-[#0B5D41]/[0.05] p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-[#0B5D41]/10 p-3 text-[#0B5D41]">
                <Shield className="h-5 w-5" strokeWidth={2.5}/>
              </div>
              <div className="flex-1">
                <h3 className="text-[16px] font-bold text-[#0B5D41]">Your data is completely private & secure</h3>
                <p className="mt-1 text-sm font-medium text-[#2C2C2A] leading-relaxed">
                  This information is encrypted and stored securely. Only you can access it — no one else, including admins, can view this data. Use the Download button to share with your family when needed.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPrivacyAlert(false)}
                className="rounded-md p-1.5 text-[#0B5D41]/70 transition-colors hover:bg-[#0B5D41]/10 hover:text-[#0B5D41] outline-none"
                aria-label="Dismiss privacy notice"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {showInfoAlert && (
          <div className="rounded-2xl border border-[#BA7517]/30 bg-[#BA7517]/[0.05] p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-[#BA7517]/10 p-3 text-[#BA7517]">
                <Info className="h-5 w-5" strokeWidth={2.5}/>
              </div>
              <div className="flex-1">
                <h3 className="text-[16px] font-bold text-[#BA7517]">Why fill this out?</h3>
                <p className="mt-1 text-sm font-medium text-[#2C2C2A] leading-relaxed">
                  Most people leave their families without the information they need in a crisis. This guide helps you record your personal, financial, and legal affairs so your loved ones are never left wondering. Fill it in sections — save as you go!
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowInfoAlert(false)}
                className="rounded-md p-1.5 text-[#BA7517]/70 transition-colors hover:bg-[#BA7517]/10 hover:text-[#BA7517] outline-none"
                aria-label="Dismiss why fill this out notice"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

        {/* Content */}
        {isFetching ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-white border border-[#D6B99D] shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin text-[#DA7756] mb-4" />
            <p className="text-[#888780] font-medium">Fetching your data...</p>
          </div>
        ) : (
          <div className="w-full min-h-[400px] flex flex-col bg-[#FEF4EE] rounded-2xl border border-[#D6B99D] overflow-hidden shadow-sm">
            {/* Stepper Tabs — same pill style as People “Sort” */}
            <div className="flex flex-wrap items-center gap-2 p-4 border-b border-[#D6B99D] bg-[#FEF4EE]">
              <div className="flex gap-2 overflow-x-auto hide-scrollbar min-w-0">
                {FORM_STEPS.map((tab, index) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm outline-none whitespace-nowrap flex items-center gap-2 ${
                      activeTab === tab.id
                        ? "bg-[#DA7756] text-white border border-[#DA7756]"
                        : index < currentStepIndex
                          ? "bg-white text-[#2C2C2A] border border-[#D6B99D] hover:bg-[#FEF4EE] hover:text-[#DA7756]"
                          : "bg-white text-[#888780] border border-[#D6B99D] hover:bg-[#FEF4EE] hover:text-[#DA7756]"
                    }`}
                  >
                    <span className="text-base leading-none">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="p-4 md:p-6 space-y-6 min-h-[400px] bg-[#FEF4EE]">
              {activeTab === "personal" && <PersonalSection personalInfo={personalInfo} personalDocuments={personalDocuments} spouseDocuments={spouseDocuments} expandedSections={expandedSections} onUpdatePersonalInfo={updatePersonalInfo} onAddPersonalDocument={addPersonalDocument} onRemovePersonalDocument={removePersonalDocument} onAddSpouseDocument={addSpouseDocument} onRemoveSpouseDocument={removeSpouseDocument} onToggleSection={toggleSection} />}
              {activeTab === "family" && <FamilySection husbandSiblings={husbandSiblings} wifeSiblings={wifeSiblings} children={children} grandchildren={grandchildren} expandedSections={expandedSections} onAddHusbandSibling={addHusbandSibling} onRemoveHusbandSibling={removeHusbandSibling} onUpdateHusbandSibling={updateHusbandSibling} onAddWifeSibling={addWifeSibling} onRemoveWifeSibling={removeWifeSibling} onUpdateWifeSibling={updateWifeSibling} onAddChild={addChild} onRemoveChild={removeChild} onUpdateChild={updateChild} onAddGrandchild={addGrandchild} onRemoveGrandchild={removeGrandchild} onUpdateGrandchild={updateGrandchild} onToggleSection={toggleSection} />}
              {activeTab === "emergency" && <EmergencySection emergencyContacts={emergencyContacts} onAddEmergencyContact={addEmergencyContact} onRemoveEmergencyContact={removeEmergencyContact} onUpdateEmergencyContact={updateEmergencyContact} />}
              {activeTab === "contacts" && <ContactsSection importantContacts={importantContacts} expandedSections={expandedSections} onUpdateImportantContact={updateImportantContact} onToggleSection={toggleSection} />}
              {activeTab === "assets" && <AssetsSection propertyAssets={propertyAssets} vehicleAssets={vehicleAssets} onAddPropertyAsset={addPropertyAsset} onRemovePropertyAsset={removePropertyAsset} onUpdatePropertyAsset={updatePropertyAsset} onAddVehicleAsset={addVehicleAsset} onRemoveVehicleAsset={removeVehicleAsset} onUpdateVehicleAsset={updateVehicleAsset} />}
              {activeTab === "finance" && <FinanceSection bankAccounts={bankAccounts} investmentsDocuments={investmentsDocuments} creditCards={creditCards} onAddBankAccount={addBankAccount} onRemoveBankAccount={removeBankAccount} onUpdateBankAccount={updateBankAccount} onUpdateInvestmentsDocuments={updateInvestmentsDocuments} onAddInvestmentDocument={addInvestmentDocument} onRemoveInvestmentDocument={removeInvestmentDocument} onAddCreditCard={addCreditCard} onRemoveCreditCard={removeCreditCard} onUpdateCreditCard={updateCreditCard} />}
              {activeTab === "benefits" && <BenefitsSection lifeInsurancePolicies={lifeInsurancePolicies} benefitsDetails={benefitsDetails} onAddLifeInsurancePolicy={addLifeInsurancePolicy} onRemoveLifeInsurancePolicy={removeLifeInsurancePolicy} onUpdateLifeInsurancePolicy={updateLifeInsurancePolicy} onUpdateBenefitsDetails={updateBenefitsDetails} />}
              {activeTab === "legal" && <LegalSection legalDetails={legalDetails} onUpdateLegalDetails={updateLegalDetails} onHandleWillDocumentUpload={handleWillDocumentUpload} />}
              {activeTab === "final" && <FinalWishesSection finalWishes={finalWishes} onAddFinalWish={addFinalWish} onRemoveFinalWish={removeFinalWish} onUpdateFinalWish={updateFinalWish} />}
              
              {activeTab === "other" && (
                <OtherInfoSection 
                  otherInfo={otherInfo} 
                  attachedDocuments={attachedDocuments}
                  expandedSections={expandedSections} 
                  onUpdateOtherInfo={(field, value) => setOtherInfo(prev => ({ ...prev, [field]: value }))} 
                  onAddAttachedDocument={addAttachedDocument}
                  onRemoveAttachedDocument={removeAttachedDocument}
                  onToggleSection={toggleSection} 
                />
              )}
            </div>
          </div>
        )}
    </div>
  );
}
