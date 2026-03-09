import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, Shield, Info, X, Loader2, ArrowRight, ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// --- Components ---
import PersonalSection from "@/components/ForFamilySections/PersonalSection";
import FamilySection from "@/components/ForFamilySections/FamilySection";
import EmergencySection from "@/components/ForFamilySections/EmergencySection";
import ContactsSection from "@/components/ForFamilySections/ContactsSection";
import AssetsSection from "@/components/ForFamilySections/AssetsSection";
import BenefitsSection from "@/components/ForFamilySections/BenefitsSection";
import LegalSection from "@/components/ForFamilySections/LegalSection";
import FinalWishesSection from "@/components/ForFamilySections/FinalWishesSection";
import OtherInfoSection from "@/components/ForFamilySections/OtherInfoSection"; // <-- Naya Import

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
interface LegalDetails { willLocatedAt: string; attorneyWhoHandledWill: string; lawFirm: string; attorneyPhone: string; willDate: string; executor: string; guardianshipDocumentsLocation: string; hasLivingWill: boolean; willDocumentUploaded: string; organDonationPreference: string; }
interface FinalWish { id: string; name: string; placeOfWorship: string; religiousAffiliation: string; panditName: string; panditPhone: string; funeralServicePreference: string; serviceLocationAddress: string; contactPhone: string; preArrangedLastRites: boolean; exServicemanBenefits: boolean; militaryHonours: boolean; obituaryWanted: boolean; lastRitesPreference: string; cremationGroundChoice: string; lotPurchased: boolean; pallbearers: string; honoraryPallbearers: string; musicalSelections: string; specialRequests: string; }
interface UploadedDocument { id: string; fileName: string; uploadedAt: string; }
interface PersonalInfo { fullName: string; aadharNumber: string; panNumber: string; dateOfBirth: string; placeOfBirth: string; drivingLicenseNumber: string; drivingLicenseValidity: string; currentHomeAddress: string; mobileNumber: string; workPhone: string; nativeAddress: string; maritalStatus: string; marriageDate: string; spouseName: string; spouseMobile: string; spouseAadharNumber: string; spousePanNumber: string; spouseDrivingLicenseNumber: string; spouseDrivingLicenseValidity: string; spouseAddress: string; spouseEmployer: string; spouseWorkPhone: string; spouseEmployerAddress: string; formerSpouseName: string; formerSpouseContact: string; formerSpouseAddress: string; formerSpouseMarriageDate: string; formerSpouseDivorceDate: string; }

// Define Steps for Stepper (Added Other Info)
const FORM_STEPS = [
  { id: "personal", label: "Personal" },
  { id: "family", label: "Family" },
  { id: "emergency", label: "Emergency" },
  { id: "contacts", label: "Contacts" },
  { id: "assets", label: "Assets" },
  { id: "benefits", label: "Benefits" },
  { id: "legal", label: "Legal" },
  { id: "final", label: "Final" },
  { id: "other", label: "Other Info" }, // <-- Naya Tab Add Hua
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
    basicDetails: true, spouseInfo: true, formerSpouseInfo: true, personalDocuments: true, spouseDocuments: true, otherInfoDetails: true,
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
  const [legalDetails, setLegalDetails] = useState<LegalDetails>({ willLocatedAt: "", attorneyWhoHandledWill: "", lawFirm: "", attorneyPhone: "", willDate: "", executor: "", guardianshipDocumentsLocation: "", hasLivingWill: false, willDocumentUploaded: "", organDonationPreference: "" });
  const [finalWishes, setFinalWishes] = useState<FinalWish[]>([]);
  
  // Naya state Notes ke liye
  const [otherInfo, setOtherInfo] = useState({ notes: "" }); 

  const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const toggleSection = (section: string) => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));

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
      !!otherInfo.notes // Included in progress
    ];
    setCompletionProgress(Math.round((checks.filter(Boolean).length / checks.length) * 100));
  }, [
    personalInfo, children, husbandSiblings, wifeSiblings, emergencyContacts, 
    importantContacts, propertyAssets, vehicleAssets, lifeInsurancePolicies, 
    benefitsDetails, legalDetails, finalWishes, otherInfo
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
              setChildren(profile.family.children.map((c: any) => ({ 
                id: createId(), name: c.name || "", dob: c.date_of_birth || "", aadhar: "", address: "", phone: "", email: "" 
              })));
            }
            if (profile.family.parents && Array.isArray(profile.family.parents)) {
              setHusbandSiblings(profile.family.parents.map((p: any) => ({ 
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
             profile.contacts.forEach((c: any) => {
               if(c.relationship === "Family Doctor") setImportantContacts(prev => ({ ...prev, physicianName: c.name || "", physicianPhone: c.phone || "", physicianEmail: c.email || "" }));
               if(c.relationship === "Lawyer") setImportantContacts(prev => ({ ...prev, lawyerName: c.name || "", lawyerPhone: c.phone || "" }));
               if(c.relationship === "Accountant") setImportantContacts(prev => ({ ...prev, accountantName: c.name || "", accountantPhone: c.phone || "" }));
             });
          }

          let parsedPolicies: LifeInsurancePolicy[] = [];
          if (profile.finances && Array.isArray(profile.finances)) {
            parsedPolicies = [...parsedPolicies, ...profile.finances.map((f: any) => ({ id: createId(), policyName: f.account_type || "", insurer: f.bank_name || "", policyNumber: f.account_number || "", nominee: f.nominee || "", sumAssured: "" }))];
          }
          if (profile.benefits && Array.isArray(profile.benefits)) {
            parsedPolicies = [...parsedPolicies, ...profile.benefits.map((b: any) => ({ id: createId(), policyName: b.benefit_type || "", insurer: b.provider_name || "", policyNumber: b.policy_number || "", nominee: "", sumAssured: "" }))];
          }
          if (parsedPolicies.length > 0) {
            setLifeInsurancePolicies(prev => [...prev.filter(p => p.policyName === "Health/Emergency"), ...parsedPolicies]);
          }

          if (profile.assets && Array.isArray(profile.assets)) {
            setPropertyAssets(profile.assets.filter((a: any) => a.asset_type === "Property").map((a: any) => ({ id: createId(), propertyType: a.description || "", address: a.location || "", marketValue: a.estimated_value || "", ownershipType: "", documentLocation: "" })));
            setVehicleAssets(profile.assets.filter((a: any) => a.asset_type === "Vehicle").map((a: any) => {
              const desc = a.description?.split(" - ") || [];
              return { id: createId(), vehicleType: desc[0] || "", model: desc[1] || "", registrationNumber: "", ownerName: "", insurancePolicy: "", insuranceExpiry: "" };
            }));
          }

          if (profile.legal) {
            setLegalDetails(prev => ({ ...prev, hasLivingWill: profile.legal.will_exists || false, willLocatedAt: profile.legal.will_location || "", attorneyWhoHandledWill: profile.legal.lawyer_name || "", attorneyPhone: profile.legal.lawyer_contact || "" }));
          }

          // Other Info Map
          if (profile.other_info) {
             setOtherInfo({ notes: profile.other_info.notes || "" });
          }

          if (profile.final_wishes && Array.isArray(profile.final_wishes)) {
             setFinalWishes(profile.final_wishes.map((w: any) => ({
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
            nationality: "",
            marital_status: personalInfo.maritalStatus,
            occupation: importantContacts.employerSupervisor,
            employer: importantContacts.bankName,
            aadhaar_number: personalInfo.aadharNumber,
            pan_number: personalInfo.panNumber,
            passport_number: "",
            driving_license: personalInfo.drivingLicenseNumber
          },
          family: {
            spouse_name: personalInfo.spouseName,
            spouse_phone: personalInfo.spouseMobile,
            children: children.map(c => ({ name: c.name, date_of_birth: c.dob })),
            parents: [
              ...husbandSiblings.filter(s => s.relation.toLowerCase() === 'father' || s.relation.toLowerCase() === 'mother').map(s => ({ name: s.name, relationship: s.relation })),
              ...wifeSiblings.filter(s => s.relation.toLowerCase() === 'father' || s.relation.toLowerCase() === 'mother').map(s => ({ name: s.name, relationship: s.relation }))
            ]
          },
          emergency: {
            primary_contact_name: emergencyContacts[0]?.name || "",
            primary_contact_phone: emergencyContacts[0]?.homePhone || "",
            secondary_contact_name: emergencyContacts[1]?.name || "",
            secondary_contact_phone: emergencyContacts[1]?.homePhone || "",
            home_address: personalInfo.currentHomeAddress,
            medical_conditions: "",
            blood_group: "",
            insurance_provider: importantContacts.insuranceAgencyName,
            insurance_policy_number: lifeInsurancePolicies.find(p => p.policyName === "Health/Emergency")?.policyNumber || ""
          },
          contacts: [
            ...(importantContacts.physicianName ? [{ name: importantContacts.physicianName, relationship: "Family Doctor", phone: importantContacts.physicianPhone, email: importantContacts.physicianEmail }] : []),
            ...(importantContacts.lawyerName ? [{ name: importantContacts.lawyerName, relationship: "Lawyer", phone: importantContacts.lawyerPhone, email: "" }] : []),
            ...(importantContacts.accountantName ? [{ name: importantContacts.accountantName, relationship: "Accountant", phone: importantContacts.accountantPhone, email: "" }] : [])
          ],
          finances: lifeInsurancePolicies.filter(p => p.policyName !== "Insurance" && p.policyName !== "Health/Emergency").map(p => ({ bank_name: importantContacts.bankName || "", account_type: p.policyName, account_number: p.policyNumber, nominee: p.nominee })),
          assets: [
            ...propertyAssets.map(p => ({ asset_type: "Property", description: p.propertyType, location: p.address, estimated_value: p.marketValue })),
            ...vehicleAssets.map(v => ({ asset_type: "Vehicle", description: `${v.vehicleType} - ${v.model}`, location: "", estimated_value: "" }))
          ],
          benefits: lifeInsurancePolicies.filter(p => p.policyName === "Insurance").map(p => ({ benefit_type: "Insurance", provider_name: p.insurer, policy_number: p.policyNumber })),
          legal: {
            will_exists: legalDetails.hasLivingWill,
            will_location: legalDetails.willLocatedAt,
            lawyer_name: legalDetails.attorneyWhoHandledWill,
            lawyer_contact: legalDetails.attorneyPhone
          },
          final_wishes: finalWishes.map(w => ({
            person_name: w.name, religious_affiliation: w.religiousAffiliation, place_of_worship: w.placeOfWorship, priest_name: w.panditName, priest_phone: w.panditPhone, service_location_address: w.serviceLocationAddress, contact_phone: w.contactPhone, last_rites_preference: w.lastRitesPreference, cremation_or_burial_choice: w.cremationGroundChoice, pallbearers: w.pallbearers, musical_selections: w.musicalSelections, special_requests: w.specialRequests
          })),
          other_info: { notes: otherInfo.notes } // Notes mapping
        }
      };

      const method = hasExistingProfile ? "PUT" : "POST";
      const response = await fetch("https://life-api.lockated.com/family_profile", {
        method, headers, body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`Failed to save: ${response.status}`);
      toast({ title: "Success!", description: hasExistingProfile ? "Updated successfully" : "Saved successfully" });
      setHasExistingProfile(true); 
    } catch (error) {
      console.error("Save error:", error);
      toast({ title: "Error", description: "Something went wrong while saving.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // --- Handlers ---
  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => setPersonalInfo(prev => ({ ...prev, [field]: value }));
  const updateImportantContact = (field: keyof ImportantContacts, value: string) => setImportantContacts(prev => ({ ...prev, [field]: value }));
  const updateBenefitsDetails = (field: keyof BenefitsDetails, value: string | boolean) => setBenefitsDetails(prev => ({ ...prev, [field]: value }));
  const updateLegalDetails = (field: keyof LegalDetails, value: string | boolean) => setLegalDetails(prev => ({ ...prev, [field]: value }));
  const addPersonalDocument = () => setPersonalDocuments(prev => [...prev, { id: createId(), fileName: `document-${Date.now()}.pdf`, uploadedAt: new Date().toLocaleDateString() }]);
  const removePersonalDocument = (id: string) => setPersonalDocuments(prev => prev.filter(doc => doc.id !== id));
  const addSpouseDocument = () => setSpouseDocuments(prev => [...prev, { id: createId(), fileName: `spouse-document-${Date.now()}.pdf`, uploadedAt: new Date().toLocaleDateString() }]);
  const removeSpouseDocument = (id: string) => setSpouseDocuments(prev => prev.filter(doc => doc.id !== id));
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
  const handleWillDocumentUpload = () => updateLegalDetails("willDocumentUploaded", `will-document-${Date.now()}.pdf`);
  const addFinalWish = () => setFinalWishes(prev => [...prev, { id: createId(), name: "", placeOfWorship: "", religiousAffiliation: "", panditName: "", panditPhone: "", funeralServicePreference: "", serviceLocationAddress: "", contactPhone: "", preArrangedLastRites: false, exServicemanBenefits: false, militaryHonours: false, obituaryWanted: false, lastRitesPreference: "", cremationGroundChoice: "", lotPurchased: false, pallbearers: "", honoraryPallbearers: "", musicalSelections: "", specialRequests: "" }]);
  const removeFinalWish = (id: string) => setFinalWishes(prev => prev.filter(w => w.id !== id));
  const updateFinalWish = (id: string, field: keyof FinalWish, value: string | boolean) => setFinalWishes(prev => prev.map(w => (w.id === id ? { ...w, [field]: value } : w)));

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
              <Button variant="outline" size="sm" disabled={isFetching || isSaving}>Download</Button>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={handleSave} disabled={isFetching || isSaving}>
                {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {hasExistingProfile ? "Updating..." : "Saving..."}</> : hasExistingProfile ? "Update Profile" : "Save Profile"}
              </Button>
            </div>
          </div>

          <div className="space-y-2 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Completion Progress</span>
              <span className="text-sm font-bold text-purple-600">{completionProgress}%</span>
            </div>
            <Progress value={completionProgress} className="h-2" />
          </div>
        </div>

        {/* Content */}
        {isFetching ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-purple-600 mb-4" />
            <p className="text-gray-500 font-medium">Fetching your data...</p>
          </div>
        ) : (
          <>
            {/* Stepper Tabs */}
            <div className="bg-gray-100 p-1 rounded-lg mb-8 overflow-x-auto">
              <div className="flex gap-1 min-w-max">
                {FORM_STEPS.map((tab, index) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                      activeTab === tab.id 
                        ? "bg-white text-purple-700 shadow-sm border border-gray-200" 
                        : index < currentStepIndex 
                          ? "text-purple-600 hover:bg-purple-50" 
                          : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] ${
                      activeTab === tab.id ? "bg-purple-100 text-purple-700" : index < currentStepIndex ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-500"
                    }`}>
                      {index + 1}
                    </span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="space-y-6 min-h-[400px]">
              {activeTab === "personal" && <PersonalSection personalInfo={personalInfo} personalDocuments={personalDocuments} spouseDocuments={spouseDocuments} expandedSections={expandedSections} onUpdatePersonalInfo={updatePersonalInfo} onAddPersonalDocument={addPersonalDocument} onRemovePersonalDocument={removePersonalDocument} onAddSpouseDocument={addSpouseDocument} onRemoveSpouseDocument={removeSpouseDocument} onToggleSection={toggleSection} />}
              {activeTab === "family" && <FamilySection husbandSiblings={husbandSiblings} wifeSiblings={wifeSiblings} children={children} grandchildren={grandchildren} expandedSections={expandedSections} onAddHusbandSibling={addHusbandSibling} onRemoveHusbandSibling={removeHusbandSibling} onUpdateHusbandSibling={updateHusbandSibling} onAddWifeSibling={addWifeSibling} onRemoveWifeSibling={removeWifeSibling} onUpdateWifeSibling={updateWifeSibling} onAddChild={addChild} onRemoveChild={removeChild} onUpdateChild={updateChild} onAddGrandchild={addGrandchild} onRemoveGrandchild={removeGrandchild} onUpdateGrandchild={updateGrandchild} onToggleSection={toggleSection} />}
              {activeTab === "emergency" && <EmergencySection emergencyContacts={emergencyContacts} onAddEmergencyContact={addEmergencyContact} onRemoveEmergencyContact={removeEmergencyContact} onUpdateEmergencyContact={updateEmergencyContact} />}
              {activeTab === "contacts" && <ContactsSection importantContacts={importantContacts} expandedSections={expandedSections} onUpdateImportantContact={updateImportantContact} onToggleSection={toggleSection} />}
              {activeTab === "assets" && <AssetsSection propertyAssets={propertyAssets} vehicleAssets={vehicleAssets} onAddPropertyAsset={addPropertyAsset} onRemovePropertyAsset={removePropertyAsset} onUpdatePropertyAsset={updatePropertyAsset} onAddVehicleAsset={addVehicleAsset} onRemoveVehicleAsset={removeVehicleAsset} onUpdateVehicleAsset={updateVehicleAsset} />}
              {activeTab === "benefits" && <BenefitsSection lifeInsurancePolicies={lifeInsurancePolicies} benefitsDetails={benefitsDetails} onAddLifeInsurancePolicy={addLifeInsurancePolicy} onRemoveLifeInsurancePolicy={removeLifeInsurancePolicy} onUpdateLifeInsurancePolicy={updateLifeInsurancePolicy} onUpdateBenefitsDetails={updateBenefitsDetails} />}
              {activeTab === "legal" && <LegalSection legalDetails={legalDetails} onUpdateLegalDetails={updateLegalDetails} onHandleWillDocumentUpload={handleWillDocumentUpload} />}
              {activeTab === "final" && <FinalWishesSection finalWishes={finalWishes} onAddFinalWish={addFinalWish} onRemoveFinalWish={removeFinalWish} onUpdateFinalWish={updateFinalWish} />}
              
              {/* Naya Render Component */}
              {activeTab === "other" && (
                <OtherInfoSection 
                  otherInfo={otherInfo} 
                  expandedSections={expandedSections} 
                  onUpdateOtherInfo={(field, value) => setOtherInfo(prev => ({ ...prev, [field]: value }))} 
                  onToggleSection={toggleSection} 
                />
              )}
            </div>

            {/* Stepper Footer / Navigation */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-200">
              <Button variant="outline" onClick={handlePrevStep} disabled={currentStepIndex === 0 || isSaving} className="w-32">
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>

              {currentStepIndex === FORM_STEPS.length - 1 ? (
                <Button onClick={handleSave} disabled={isSaving} className="w-48 bg-purple-600 hover:bg-purple-700">
                  {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {hasExistingProfile ? "Updating..." : "Saving..."}</> : <><Save className="mr-2 h-4 w-4" /> {hasExistingProfile ? "Update Profile" : "Save Profile"}</>}
                </Button>
              ) : (
                <Button onClick={handleNextStep} disabled={isSaving} className="w-32 bg-gray-900 hover:bg-gray-800">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}