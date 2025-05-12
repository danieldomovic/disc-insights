const fs = require('fs');

// Read the original file
const filePath = 'client/src/pages/Results.tsx';
const content = fs.readFileSync(filePath, 'utf8');

// Find the end of generatePDF function
const funcStart = content.indexOf('const generatePDF = async () => {');
const funcEnd = content.indexOf('};', funcStart) + 2;

// Extract the part before and after the function
const beforeFunc = content.substring(0, funcStart);
const afterFunc = content.substring(funcEnd);

// Fix the after part by removing any trailing code until the next proper function or component
const nextFunctionStart = afterFunc.search(/\s+const\s+\w+\s*=/);
const cleanAfterFunc = nextFunctionStart > 0 ? afterFunc.substring(nextFunctionStart) : afterFunc;

// Rewrite the function
const fixedFunction = `const generatePDF = async () => {
    if (isPdfGenerating) return;
    setIsPdfGenerating(true);

    try {
      // Create a new jsPDF instance with A4 dimensions in mm
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Page dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 20; // Wider margins for better readability
      const contentWidth = pdfWidth - (margin * 2);
      
      // Add basic content
      pdf.setFontSize(18);
      pdf.text("Insights Discovery Profile", pdfWidth/2, 20, { align: 'center' });
      
      // Add profile type
      pdf.setFontSize(16);
      pdf.text(\`Your Type: \${profile.name}\`, pdfWidth/2, 40, { align: 'center' });
      
      // Add color energies
      pdf.setFontSize(14);
      pdf.text(\`Dominant Colors: \${colorProfiles[result.dominantColor].name} + \${colorProfiles[result.secondaryColor].name}\`, pdfWidth/2, 50, { align: 'center' });
      
      // Explanation text
      pdf.setFontSize(12);
      pdf.text("This report includes your conscious personality preferences and tendencies", margin, 70);
      pdf.text("along with detailed information about your communication style and work preferences.", margin, 80);
      
      // Generate the PDF and trigger download
      const pdfOutput = pdf.output('datauristring');
      const downloadLink = document.createElement('a');
      downloadLink.href = pdfOutput;
      downloadLink.download = \`\${profile.name}_Profile_\${new Date().toISOString().split('T')[0]}.pdf\`;
      downloadLink.click();
      
      toast({
        title: "PDF Generated",
        description: "Your profile report has been downloaded",
      });
      
      setIsPdfGenerating(false);
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error creating your PDF report",
        variant: "destructive"
      });
      setIsPdfGenerating(false);
    }
  };`;

// Combine all parts
const fixedContent = beforeFunc + fixedFunction + cleanAfterFunc;

// Write the fixed content back to the file
fs.writeFileSync(filePath, fixedContent, 'utf8');
console.log('Results.tsx file has been fixed!');
