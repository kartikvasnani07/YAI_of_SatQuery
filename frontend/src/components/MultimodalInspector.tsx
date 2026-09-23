import React from 'react';
import { FileText, Image as ImageIcon, Database } from 'lucide-react';

interface MultimodalInspectorProps {
  attachedFiles?: any[];
}

export const MultimodalInspector: React.FC<MultimodalInspectorProps> = ({ attachedFiles = [] }) => {
  if (attachedFiles.length === 0) {
    return (
      <div className="h-full bg-[#000000] p-8 flex flex-col items-center justify-center text-[#545454] text-xs space-y-3 font-mono select-none">
        <Database className="w-8 h-8 text-[#373737] animate-pulse" />
        <p className="text-white font-medium">No multimodal input files attached yet.</p>
        <p className="text-[11px] text-[#545454] max-w-md text-center">
          Use the paperclip attachment icon in the top central prompt command bar to upload JSON, CSV, PDF, Excel, TXT documents, Map Variations, or Graph images for multimodal context.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#000000] p-6 space-y-6 overflow-y-auto select-none font-sans">
      <div className="flex items-center justify-between border-b border-[#373737] pb-4">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-[#6C6C6C]" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Multimodal Input File & Graph Inspector ({attachedFiles.length})
          </h2>
        </div>
        <span className="text-xs font-mono text-[#545454] bg-[#1E1E1E] border border-[#373737] px-2.5 py-1 rounded">
          Parsed Attachments
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {attachedFiles.map((file, idx) => (
          <div key={idx} className="bg-[#1E1E1E] border border-[#373737] rounded-lg p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#373737] pb-2">
              <div className="flex items-center space-x-2">
                {file.file_type === 'map_image_or_graph' ? (
                  <ImageIcon className="w-4 h-4 text-white" />
                ) : (
                  <FileText className="w-4 h-4 text-[#6C6C6C]" />
                )}
                <span className="text-xs font-bold text-white font-mono">{file.filename}</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-[#000000] px-2 py-0.5 rounded border border-[#373737] text-white">
                {file.extension}
              </span>
            </div>

            {/* Render Image or Graph Preview */}
            {file.file_type === 'map_image_or_graph' && file.preview?.url ? (
              <div className="h-48 bg-[#000000] border border-[#373737] rounded overflow-hidden flex items-center justify-center">
                <img src={file.preview.url} alt={file.filename} className="max-h-full max-w-full object-contain" />
              </div>
            ) : (
              <div className="bg-[#000000] border border-[#373737] rounded p-3 text-xs font-mono text-[#A3A3A3] max-h-40 overflow-y-auto leading-relaxed">
                {file.preview?.snippet || "File processed and ready for LLM/GIS pipeline."}
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-[#545454] font-mono pt-1">
              <span>Status: <span className="text-white font-semibold">Attached to Context</span></span>
              <span>Type: {file.file_type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

