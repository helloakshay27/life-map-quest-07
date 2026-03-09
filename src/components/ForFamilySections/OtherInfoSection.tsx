import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Info, FileText, Plus, Trash2, X } from "lucide-react";

interface OtherInfoDocument {
  id: string;
  fileName: string;
  description: string;
  uploadedAt: string;
}

interface OtherInfoSectionProps {
  notes: string;
  documents: OtherInfoDocument[];
  onUpdateNotes: (notes: string) => void;
  onAddDocument: (file: File, description: string) => void;
  onRemoveDocument: (id: string) => void;
}

export default function OtherInfoSection({
  notes,
  documents,
  onUpdateNotes,
  onAddDocument,
  onRemoveDocument,
}: OtherInfoSectionProps) {
  const [showPrivacyAlert, setShowPrivacyAlert] = useState(true);
  const [showInfoAlert, setShowInfoAlert] = useState(true);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [newDocDescription, setNewDocDescription] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && newDocDescription.trim()) {
      onAddDocument(file, newDocDescription);
      setNewDocDescription("");
      setShowAddDocModal(false);
      e.target.value = ""; // Reset input
    }
  };

  return (
    <div className="space-y-4">
      {/* Privacy Alert */}
      {showPrivacyAlert && (
        <Alert className="border-green-200 bg-green-50">
          <Shield className="h-5 w-5 text-green-600" />
          <AlertDescription className="ml-2">
            <div className="flex items-start justify-between">
              <div>
                <strong className="text-green-800">Your data is completely private & secure.</strong>
                <p className="text-green-700 text-sm mt-1">
                  This information is encrypted and stored securely. Only <strong>you</strong> can access it — no one else, including admins, can view this data. 
                  Use the Download button to share with your family when needed.
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowPrivacyAlert(false)} 
                className="ml-2 h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Info Alert */}
      {showInfoAlert && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Info className="h-5 w-5 text-yellow-600" />
          <AlertDescription className="ml-2">
            <div className="flex items-start justify-between">
              <div>
                <strong className="text-yellow-800">Why fill this out?</strong>
                <p className="text-yellow-700 text-sm mt-1">
                  Most people leave their families without the information they need in a crisis. This guide helps you record your personal, financial, 
                  and legal affairs so your loved ones are never left wondering. Fill it in sections — save as you go!
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowInfoAlert(false)} 
                className="ml-2 h-6 w-6 p-0 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Other Important Information Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-t-lg flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded">
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Other Important Information</h2>
          <p className="text-sm text-orange-100">Any additional notes your family should know</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-b-lg border border-orange-200 p-6 space-y-6">
        {/* Notes Section */}
        <div>
          <Label htmlFor="other-notes" className="text-gray-700 font-semibold text-sm uppercase mb-2 block">
            Notes
          </Label>
          <Textarea
            id="other-notes"
            value={notes}
            onChange={(e) => onUpdateNotes(e.target.value)}
            placeholder="Add any other important information here..."
            className="min-h-[200px] bg-white border-gray-300 focus:border-orange-500 focus:ring-orange-500"
          />
        </div>

        {/* Attached Documents Section */}
        <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
          <div className="mb-4">
            <h3 className="text-orange-800 font-semibold mb-1">Attached Documents</h3>
            <p className="text-sm text-orange-700">
              Upload any important documents with a name and description so your family knows what they are.
            </p>
          </div>

          {/* Documents List */}
          {documents.length > 0 && (
            <div className="space-y-3 mb-4">
              {documents.map((doc) => (
                <div 
                  key={doc.id} 
                  className="bg-white rounded-lg p-4 shadow-sm border border-orange-200 flex items-start justify-between"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <FileText className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{doc.fileName}</p>
                      {doc.description && (
                        <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Uploaded on {doc.uploadedAt}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveDocument(doc.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add Document Button */}
          {!showAddDocModal ? (
            <Button
              onClick={() => setShowAddDocModal(true)}
              variant="outline"
              className="border-orange-400 text-orange-700 hover:bg-orange-50 hover:border-orange-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Document
            </Button>
          ) : (
            <div className="bg-white rounded-lg p-4 border-2 border-orange-300 space-y-3">
              <div>
                <Label htmlFor="doc-description" className="text-sm font-medium text-gray-700">
                  Document Name & Description
                </Label>
                <Textarea
                  id="doc-description"
                  value={newDocDescription}
                  onChange={(e) => setNewDocDescription(e.target.value)}
                  placeholder="e.g., Birth Certificate - Original copy kept in home safe"
                  className="mt-1 min-h-[80px]"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="file"
                    id="other-document-upload"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  />
                  <Button
                    onClick={() => document.getElementById("other-document-upload")?.click()}
                    disabled={!newDocDescription.trim()}
                    className="bg-orange-600 hover:bg-orange-700 text-white w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Choose File & Upload
                  </Button>
                </div>
                <Button
                  onClick={() => {
                    setShowAddDocModal(false);
                    setNewDocDescription("");
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Please add a description before selecting a file
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
