import { File, FileImage, FileText } from "lucide-react";

interface DocumentNameProps {
  fileName: string;
}

export const getDocumentType = (fileName: string) => {
  if (fileName.startsWith("data:")) {
    if (fileName.startsWith("data:application/pdf")) return "PDF";
    if (
      fileName.startsWith("data:application/msword") ||
      fileName.startsWith("data:application/vnd.openxmlformats-officedocument")
    ) return "DOC";
    if (fileName.startsWith("data:image/")) return "Image";
    return "File";
  }
  const extension = fileName.split(".").pop()?.toLowerCase() || "";
  if (extension === "pdf") return "PDF";
  if (["doc", "docx"].includes(extension)) return "DOC";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) return "Image";
  return extension ? extension.toUpperCase() : "File";
};

const getDocumentIcon = (fileName: string) => {
  const type = getDocumentType(fileName);
  if (type === "Image") return FileImage;
  if (type === "PDF" || type === "DOC") return FileText;
  return File;
};

export const DocumentName = ({ fileName }: DocumentNameProps) => {
  const Icon = getDocumentIcon(fileName);
  const type = getDocumentType(fileName);
  const displayName = fileName.startsWith("data:") ? `Uploaded ${type}` : fileName;

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-[#DA7756]" />
      <span className="truncate text-sm font-medium text-[#2C2C2A]" title={displayName}>
        {displayName}
      </span>
      <span className="shrink-0 rounded-md border border-[#D6B99D] bg-[#FEF4EE] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#DA7756]">
        {type}
      </span>
    </div>
  );
};
