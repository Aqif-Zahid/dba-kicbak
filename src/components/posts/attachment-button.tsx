import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import { useRef, useState, DragEvent } from "react";

interface AttachmentButtonProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export const AttachmentButton = ({
  onFilesSelected,
  disabled = false,
}: AttachmentButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrop = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
    );
    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={`relative flex items-center justify-center w-12 h-12 rounded-full
                    border border-dashed border-gray-300 text-gray-500 transition-all duration-200
                    hover:bg-gray-100 hover:border-gray-400 hover:text-primary
                    active:scale-95 ${
                      isDragActive ? "bg-gray-200 border-gray-500" : ""
                    }`}
        disabled={disabled}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        title="Upload images or videos"
      >
        <ImageIcon size={24} />
        <span className="sr-only">Upload images or videos</span>
      </Button>

      <input
        type="file"
        accept="image/*,video/*"
        multiple
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) {
            onFilesSelected(files);
            e.target.value = "";
          }
        }}
      />
    </>
  );
};
