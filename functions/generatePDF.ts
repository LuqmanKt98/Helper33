import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { jsPDF } from 'npm:jspdf@2.5.1';
import 'npm:jspdf-autotable@3.8.2';
import { encode } from "https://deno.land/std@0.208.0/encoding/base64.ts";

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content_type, data, title, options } = await req.json();
        
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: options?.paperSize || 'a4'
        });
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 25.4; // 1 inch

        // --- PDF Generation based on Python Script ---
        if (content_type === 'heart_shift_journal') {
            
            // --- Cover Page with Image ---
            // The image is assumed to be at the project root.
            const imagePath = './HEARTSHIFT_JOURNAL_COVER.png';
            const imageData = await Deno.readFile(imagePath);
            const imageBase64 = encode(imageData);
            
            // Add the image to fill the page
            doc.addImage(imageBase64, 'PNG', 0, 0, pageWidth, pageHeight);

            // --- Daily Pages ---
            for (let day = 1; day <= 66; day++) {
                doc.addPage();
                let y = margin;

                // Day Title
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(22);
                doc.text(`Day ${day}`, pageWidth / 2, y, { align: 'center' });
                y += 20;

                // Reflection Prompt
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(14); // h3 equivalent
                doc.text("Today's Reflection Prompt:", margin, y);
                y += 8;

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(12);
                const promptText = "Write about how you feel today and what’s been hardest or most healing to face.";
                const promptLines = doc.splitTextToSize(promptText, pageWidth - margin * 2);
                doc.text(promptLines, margin, y);
                y += promptLines.length * 7 + 5;

                // Your Response
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(14);
                doc.text("Your Response:", margin, y);
                y += 8;

                doc.setDrawColor(220, 220, 220);
                for (let i = 0; i < 5; i++) {
                    doc.line(margin, y, pageWidth - margin, y);
                    y += 8;
                }
                y += 5;

                // Today's Mantra
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(14);
                doc.text("Today's Mantra:", margin, y);
                y += 8;
                doc.line(margin, y, pageWidth - margin, y);
                y += 12;

                // Mood Tracker
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(12);
                doc.text("Mood Tracker:   😢   😔   😐   🙂   🌸", margin, y);
                y += 15;
                
                // Notes or Doodles
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(14);
                doc.text("Notes or Doodles:", margin, y);
                y += 8;
                for (let i = 0; i < 5; i++) {
                    doc.line(margin, y, pageWidth - margin, y);
                    y += 8;
                }
                
                // Footer Quote
                const currentPageHeight = doc.internal.pageSize.getHeight();
                doc.setFont('times', 'italic');
                doc.setFontSize(13);
                doc.setTextColor(102, 102, 102);
                doc.text("“Healing is not linear — keep showing up.”", pageWidth / 2, currentPageHeight - margin + 10, { align: 'center' });
                doc.setTextColor(0);
            }

            const pdfBytes = doc.output('arraybuffer');
            return new Response(pdfBytes, {
                status: 200,
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="HeartShift_66_Day_Journal.pdf"`
                }
            });

        } else {
             // Fallback for other content types
            doc.setFontSize(24);
            doc.text(title || 'Content Export', 20, 20);
            doc.setFontSize(10);
            doc.text(`Created by DobryLife | ${new Date().toLocaleDateString()}`, 20, 30);
            doc.line(20, 35, 190, 35);
            
            // Generic text rendering for other types
            let y = 45;
            doc.setFontSize(12);
            const textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
            const textLines = doc.splitTextToSize(textContent, pageWidth - 40);
            doc.text(textLines, 20, y);
        }

        const pdfBytes = doc.output('arraybuffer');

        return new Response(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${(title || 'export').replace(/ /g, '_')}.pdf"`
            }
        });

    } catch (error) {
        console.error('PDF Generation Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});