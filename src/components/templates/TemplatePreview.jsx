
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Printer } from 'lucide-react';

const downloadCSV = (template, customization, editableData) => {
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += `"${template.title}"\n`;
  if (customization.personalInfo.name) {
    csvContent += `"Prepared for:","${customization.personalInfo.name}"\n`;
  }
  if (customization.personalInfo.primaryGoal) {
    csvContent += `"Primary Goal:","${customization.personalInfo.primaryGoal}"\n`;
  }
  csvContent += `"Date:","${new Date().toLocaleDateString()}"\n\n`;

  const allSections = [...template.sections, ...customization.customSections];

  allSections.forEach(section => {
    csvContent += `"${section}"\n`;
    csvContent += `"Item / Description","Amount / Value","Notes"\n`;
    
    const sectionData = editableData[section] || {};
    const rowCount = Object.keys(sectionData).length > 0 ? Math.max(...Object.keys(sectionData).map(Number)) + 1 : 20;

    for (let i = 0; i < rowCount; i++) {
        const row = sectionData[i] || {};
        const item = (row['item'] || '').replace(/"/g, '""');
        const amount = (row['amount'] || '').replace(/"/g, '""');
        const notes = (row['notes'] || '').replace(/"/g, '""');
        if (item || amount || notes) {
            csvContent += `"${item}","${amount}","${notes}"\n`;
        }
    }
    csvContent += `\n`;
  });


  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${template.id}-template.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const printTemplate = () => {
  window.print();
};

export default function TemplatePreview({ content, onClose }) {
  const [editableData, setEditableData] = useState({});

  if (!content) return null;

  const { template, customization } = content;

  const handleCellChange = (sectionTitle, rowIndex, colKey, value) => {
    setEditableData(prev => ({
      ...prev,
      [sectionTitle]: {
        ...(prev[sectionTitle] || {}),
        [rowIndex]: {
          ...((prev[sectionTitle] || {})[rowIndex] || {}),
          [colKey]: value
        }
      }
    }));
  };
  
  const handleTextareaInput = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = (e.target.scrollHeight) + 'px';
  };

  const renderTableRows = (sectionTitle) => {
    return Array.from({ length: 20 }).map((_, rowIndex) => (
      <tr key={rowIndex}>
        <td className="border border-gray-300 p-0">
          <textarea
            value={(editableData[sectionTitle]?.[rowIndex]?.['item']) || ''}
            onChange={(e) => handleCellChange(sectionTitle, rowIndex, 'item', e.target.value)}
            onInput={handleTextareaInput}
            className="editable-cell"
            rows="1"
            placeholder="Enter details..."
          />
        </td>
        <td className="border border-gray-300 p-0 w-1/4">
          <textarea
            value={(editableData[sectionTitle]?.[rowIndex]?.['amount']) || ''}
            onChange={(e) => handleCellChange(sectionTitle, rowIndex, 'amount', e.target.value)}
            onInput={handleTextareaInput}
            className="editable-cell"
            rows="1"
            placeholder="Value..."
          />
        </td>
        <td className="border border-gray-300 p-0 w-5/12">
          <textarea
            value={(editableData[sectionTitle]?.[rowIndex]?.['notes']) || ''}
            onChange={(e) => handleCellChange(sectionTitle, rowIndex, 'notes', e.target.value)}
            onInput={handleTextareaInput}
            className="editable-cell"
            rows="1"
            placeholder="Notes..."
          />
        </td>
      </tr>
    ));
  };


  return (
    <div className="space-y-4">
      {/* Print and Editor Styles */}
      <style jsx>{`
        .editable-cell {
          width: 100%;
          border: none;
          padding: 12px;
          background-color: transparent;
          resize: none;
          overflow: hidden;
          min-height: 48px;
          font-size: 14px;
        }
        .editable-cell:focus {
          outline: 2px solid #4f46e5;
          background-color: #f0f3ff;
          border-radius: 4px;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
          .print-section {
            page-break-inside: avoid;
            margin-bottom: 30px;
          }
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .print-table th,
          .print-table td {
            border: 1px solid #ccc;
            padding: 12px;
            text-align: left;
          }
          .print-table th {
            background-color: #f3f4f6 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            font-weight: 600;
          }
          .print-header {
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 2px solid #000;
          }
          .print-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .print-info {
            font-size: 14px;
            color: #666;
          }
          .editable-cell {
            all: unset; /* Reset all styles for printing */
            display: block;
            padding: 12px;
            white-space: pre-wrap;
            word-wrap: break-word;
            min-height: 48px;
          }
        }
      `}</style>

      {/* Action Buttons - Hidden when printing */}
      <div className="no-print flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Edit & Print</h3>
      </div>

      {/* Print Area */}
      <div className="print-area bg-white rounded-lg p-8 border-2 border-gray-200">
        {/* Header */}
        <div className="print-header">
          <h1 className="print-title">{template.title}</h1>
          <div className="print-info">
            {customization.personalInfo.name && (
              <p>Prepared for: <strong>{customization.personalInfo.name}</strong></p>
            )}
            {customization.personalInfo.primaryGoal && (
              <p>Primary Goal: <strong>{customization.personalInfo.primaryGoal}</strong></p>
            )}
            <p>Date: <strong>{new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</strong></p>
          </div>
        </div>

        {/* Template Sections */}
        <div className="space-y-8">
          {template.sections.map((section, index) => (
            <div key={index} className="print-section">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300">
                {section}
              </h2>
              <table className="print-table w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-3 text-left">Item / Description</th>
                    <th className="border border-gray-300 p-3 text-left w-1/4">Amount / Value</th>
                    <th className="border border-gray-300 p-3 text-left w-5/12">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {renderTableRows(section)}
                </tbody>
              </table>
            </div>
          ))}

          {/* Custom Sections */}
          {customization.customSections.map((section, index) => (
            <div key={`custom-${index}`} className="print-section">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-300">
                {section} <Badge variant="outline" className="no-print ml-2">Custom</Badge>
              </h2>
              <table className="print-table w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                     <th className="border border-gray-300 p-3 text-left">Item / Description</th>
                    <th className="border border-gray-300 p-3 text-left w-1/4">Amount / Value</th>
                    <th className="border border-gray-300 p-3 text-left w-5/12">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {renderTableRows(section)}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-300 text-sm text-gray-600">
          <p>Generated by DobryLife Templates | {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Action Buttons - Hidden when printing */}
      <div className="no-print flex gap-3">
        <Button
          onClick={printTemplate}
          className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 gap-2"
        >
          <Printer className="w-4 h-4" />
          Print Template
        </Button>
        <Button
          onClick={() => downloadCSV(template, customization, editableData)}
          variant="outline"
          className="flex-1 gap-2"
        >
          <Download className="w-4 h-4" />
          Download CSV
        </Button>
      </div>

      {/* Instructions - Hidden when printing */}
      <Card className="no-print bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Instructions
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Click any cell to start typing and personalizing your template.</li>
            <li>• Click "Print Template" or use Ctrl+P (Cmd+P on Mac) to print or save as PDF.</li>
            <li>• Use "Download CSV" to export your data for use in spreadsheet applications.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
