
import React, { useRef } from 'react';
import { FileAttachment } from '../types';
import { MAX_FILE_SIZE } from '../constants';

interface Props {
  onFiles: (files: FileAttachment[]) => void;
  children: React.ReactNode;
}

const FileUploader: React.FC<Props> = ({ onFiles, children }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: FileList) => {
    const validFiles: FileAttachment[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_FILE_SIZE) {
        // Fix: Use the actual MAX_FILE_SIZE from constants for the error message
        alert(`${file.name} exceeds the ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.`);
        continue;
      }

      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      validFiles.push({
        name: file.name,
        type: file.type,
        size: file.size,
        data: fileData
      });
    }

    onFiles(validFiles);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleChange}
        multiple
        className="hidden"
        accept=".pdf,.docx,.txt,image/*"
      />
      <div onClick={() => fileInputRef.current?.click()}>
        {children}
      </div>
    </div>
  );
};

export default FileUploader;
