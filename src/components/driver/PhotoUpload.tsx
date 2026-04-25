"use client";

import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { Camera, X, Loader2 } from "lucide-react";

export interface PhotoFile {
  file: File;
  previewUrl: string;
}

interface PhotoUploadProps {
  photos: PhotoFile[];
  onChange: (photos: PhotoFile[]) => void;
  maxPhotos?: number;
}

export function PhotoUpload({ photos, onChange, maxPhotos = 5 }: PhotoUploadProps) {
  const [compressing, setCompressing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const slots = maxPhotos - photos.length;
    const toProcess = files.slice(0, slots);

    setCompressing(true);
    const results: PhotoFile[] = [];

    for (const file of toProcess) {
      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 0.1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });
        results.push({ file: compressed, previewUrl: URL.createObjectURL(compressed) });
      } catch {
        results.push({ file, previewUrl: URL.createObjectURL(file) });
      }
    }

    onChange([...photos, ...results]);
    setCompressing(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    URL.revokeObjectURL(photos[index].previewUrl);
    onChange(updated);
  };

  const remaining = maxPhotos - photos.length;

  return (
    <div>
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {photos.map((p, i) => (
            <div key={i} className="relative aspect-square bg-gray-100 overflow-hidden">
              <img src={p.previewUrl} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 w-6 h-6 bg-danger text-white flex items-center justify-center"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
              <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1 py-0.5">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {remaining > 0 && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={compressing}
          className="w-full h-12 border-2 border-dashed border-gray-300 flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:border-accent hover:text-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {compressing ? (
            <>
              <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
              Mengkompresi foto...
            </>
          ) : (
            <>
              <Camera size={16} strokeWidth={1.5} />
              {photos.length === 0 ? "Ambil / Pilih Foto" : `Tambah Foto (${remaining} tersisa)`}
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleSelect}
        className="hidden"
      />

      <p className="text-xs text-gray-400 mt-2">
        Foto dikompresi otomatis &lt;100KB · Min 1, maks {maxPhotos} foto
      </p>
    </div>
  );
}
