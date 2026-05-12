import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format, parseISO } from "date-fns";

export const generateInvoicePDF = (invoice: any, action: 'download' | 'blob' | 'base64' = 'download', orgData?: { name?: string; nif?: string; address?: string; city?: string; email?: string; phone?: string; }): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF();
      
      const isPaid = invoice.status === 'pagada';
      const isCancelled = invoice.status === 'cancelada';

      // Header SF
      let yEmisor = 25;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(27, 79, 216);
      doc.text(orgData?.name || "Mi Empresa", 14, yEmisor);
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      
      if (orgData?.nif) {
        yEmisor += 6;
        doc.text(`NIF: ${orgData.nif}`, 14, yEmisor);
      }

      yEmisor += 7;
      if (orgData?.address) { 
        doc.text(orgData.address, 14, yEmisor); 
        yEmisor += 5; 
      }
      if (orgData?.city) { 
        doc.text(orgData.city, 14, yEmisor); 
        yEmisor += 5; 
      }
      if (orgData?.email) { 
        doc.text(orgData.email, 14, yEmisor); 
        yEmisor += 5; 
      }
      if (orgData?.phone) { 
        doc.text(orgData.phone, 14, yEmisor); 
      }

      // Status watermark or general header
      doc.setFontSize(26);
      if (isPaid) {
        doc.setTextColor(34, 197, 94); // Green 500
        doc.text("PAGADA", 160, 25);
      } else if (isCancelled) {
        doc.setTextColor(239, 68, 68); // Red 500
        doc.text("CANCELADA", 140, 25);
      } else {
        doc.setTextColor(15, 23, 42); // slate 900
        doc.text("FACTURA", 150, 25);
      }

      // Factura Info
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      const invoiceNum = invoice.invoice_number || "SF-XXXX";
      const issueDate = invoice.issue_date || format(new Date(), 'yyyy-MM-dd');
      const dueDate = invoice.due_date || format(new Date(), 'yyyy-MM-dd');

      doc.text(`Número: ${invoiceNum}`, 145, 34);
      doc.text(`Fecha Emisión: ${format(parseISO(issueDate), 'dd/MM/yyyy')}`, 145, 39);
      doc.text(`Vencimiento: ${format(parseISO(dueDate), 'dd/MM/yyyy')}`, 145, 44);

      // Separator line
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.line(14, 52, 196, 52);

      // Client Data
      doc.setFont("helvetica", "bold");
      doc.text("Facturar a:", 14, 62);
      
      doc.setFont("helvetica", "normal");
      doc.text(invoice.clients?.name || "Cliente Desconocido", 14, 68);
      doc.text(invoice.clients?.email || "", 14, 73);
      if (invoice.projects?.name) {
        doc.text(`Proyecto: ${invoice.projects.name}`, 14, 78);
      }

      // Items Table
      autoTable(doc, {
        startY: 90,
        head: [['Concepto', 'Base Imponible', 'IVA (%)', 'Importe IVA', 'Total']],
        body: [
          [
            invoice.concept || 'Servicio',
            `${Number(invoice.amount || 0).toFixed(2)} €`,
            `${invoice.tax_rate || 0}%`,
            `${Number(invoice.tax_amount || 0).toFixed(2)} €`,
            `${Number(invoice.total || 0).toFixed(2)} €`
          ]
        ],
        theme: 'striped',
        headStyles: { fillColor: [27, 79, 216], textColor: [255, 255, 255] },
        styles: { fontSize: 10, cellPadding: 6 },
        columnStyles: {
          1: { halign: 'right' },
          2: { halign: 'right' },
          3: { halign: 'right' },
          4: { halign: 'right', fontStyle: 'bold' }
        }
      });

      // Totals logic (summary)
      // @ts-ignore
      const finalY = doc.lastAutoTable.finalY || 120;
      doc.setFont("helvetica", "bold");
      doc.text("TOTAL FACTURA:", 120, finalY + 15);
      doc.setFontSize(14);
      doc.text(`${Number(invoice.total || 0).toFixed(2)} €`, 165, finalY + 15);

      // Notes
      if (invoice.notes) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Notas:", 14, finalY + 30);
        doc.setFont("helvetica", "normal");
        const splitNotes = doc.splitTextToSize(invoice.notes, 180);
        doc.text(splitNotes, 14, finalY + 35);
      }

      // Footer
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184); // Slate 400
      doc.text("Gracias por su confianza.", 105, 280, { align: "center" });

      if (action === 'download') {
        doc.save(`Factura_${invoiceNum}.pdf`);
        resolve(true);
      } else if (action === 'blob') {
        const blob = doc.output('blob');
        resolve(blob);
      } else if (action === 'base64') {
        const base64 = doc.output('datauristring');
        resolve(base64);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      reject(error);
    }
  });
};
