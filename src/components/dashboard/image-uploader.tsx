"use client";

import { useState, useCallback, ReactNode } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { UploadCloud, X } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  onFileSelect: (file: File, dataUri: string) => void;
  children?: ReactNode;
}

export function ImageUploader({ onFileSelect, children }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    fileRejections.forEach(({ errors }) => {
      errors.forEach(err => {
        toast({
          variant: 'destructive',
          title: 'Upload Error',
          description: err.message,
        });
      });
    });

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const dataUri = e.target?.result as string;
        setPreview(dataUri);
        onFileSelect(file, dataUri);
      };
      reader.readAsDataURL(file);
    }
  }, [onFileSelect, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const clearPreview = () => {
    setPreview(null);
  };

  return (
    <div className="w-full">
      {preview ? (
        <div className="relative w-full max-w-lg mx-auto">
          <Image src={preview} alt="Plant preview" width={500} height={500} className="rounded-lg object-contain w-full" />
          <button
            onClick={clearPreview}
            className="absolute top-2 right-2 bg-background/50 text-foreground rounded-full p-1 hover:bg-background/80 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            'w-full cursor-pointer rounded-lg border-2 border-dashed border-muted-foreground/50 bg-card hover:border-primary hover:bg-secondary transition-colors',
            'flex flex-col items-center justify-center p-12 text-center',
            isDragActive && 'border-primary bg-secondary'
          )}
        >
          <input {...getInputProps()} />
          <UploadCloud className="w-12 h-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">
            {isDragActive ? 'Drop the image here' : 'Click or drag an image to upload'}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">PNG, JPG, or WEBP (max 5MB)</p>
        </div>
      )}
       {children}
    </div>
  );
}
