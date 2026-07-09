import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format, parseISO } from "date-fns";

function getTaxLabel(country?: string): string {
  const c = (country || 'ES').toUpperCase();
  if (c === 'GB') return 'VAT';
  if (['US','CA','MX','AU'].includes(c)) return 'Tax';
  return 'IVA';
}

export const generateInvoicePDF = (
  invoice: any, 
  action: 'download' | 'blob' | 'base64' = 'download', 
  orgData?: { name?: string; nif?: string; address?: string; city?: string; email?: string; phone?: string; },
  language: 'es' | 'en' = 'es',
  taxLabel: string = 'IVA'
): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF();
      
      const isPaid = invoice.status === 'pagada';
      const isCancelled = invoice.status === 'cancelada';

      const L = language === 'en' ? {
        title: 'INVOICE',
        invoiceNum: 'Invoice No.',
        issueDate: 'Issue date',
        dueDate: 'Due date',
        paid: 'PAID',
        pending: 'PENDING',
        cancelled: 'CANCELLED',
        billTo: 'Bill to:',
        project: 'Project:',
        concept: 'Concept',
        base: 'Base Amount',
        taxRate: `${taxLabel} (%)`,
        taxAmount: `${taxLabel} Amount`,
        total: 'Total',
        grandTotal: 'INVOICE TOTAL:',
        notes: 'Notes:',
        thanks: 'Thank you for your business.',
        unknownClient: 'Unknown Customer'
      } : {
        title: 'FACTURA',
        invoiceNum: 'Factura Nº',
        issueDate: 'Fecha emisión',
        dueDate: 'Fecha vencimiento',
        paid: 'PAGADA',
        pending: 'PENDIENTE',
        cancelled: 'CANCELADA',
        billTo: 'Facturar a:',
        project: 'Proyecto:',
        concept: 'Concepto',
        base: 'Base Imponible',
        taxRate: `${taxLabel} (%)`,
        taxAmount: `Importe ${taxLabel}`,
        total: 'Total',
        grandTotal: 'TOTAL FACTURA:',
        notes: 'Notas:',
        thanks: 'Gracias por su confianza.',
        unknownClient: 'Cliente Desconocido'
      };

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
        doc.text(L.paid, 160, 25);
      } else if (isCancelled) {
        doc.setTextColor(239, 68, 68); // Red 500
        doc.text(L.cancelled, 140, 25);
      } else {
        doc.setTextColor(15, 23, 42); // slate 900
        doc.text(L.title, 150, 25);
      }

      // Factura Info
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      const invoiceNum = invoice.invoice_number || "SF-XXXX";
      const issueDate = invoice.issue_date || format(new Date(), 'yyyy-MM-dd');
      const dueDate = invoice.due_date || format(new Date(), 'yyyy-MM-dd');

      doc.text(`${L.invoiceNum}: ${invoiceNum}`, 145, 34);
      doc.text(`${L.issueDate}: ${format(parseISO(issueDate), 'dd/MM/yyyy')}`, 145, 39);
      doc.text(`${L.dueDate}: ${format(parseISO(dueDate), 'dd/MM/yyyy')}`, 145, 44);

      // Separator line
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.line(14, 52, 196, 52);

      // Client Data
      doc.setFont("helvetica", "bold");
      doc.text(L.billTo, 14, 62);
      
      doc.setFont("helvetica", "normal");
      doc.text(invoice.clients?.name || L.unknownClient, 14, 68);
      doc.text(invoice.clients?.email || "", 14, 73);
      if (invoice.projects?.name) {
        doc.text(`${L.project} ${invoice.projects.name}`, 14, 78);
      }

      // Items Table
      autoTable(doc, {
        startY: 90,
        head: [[L.concept, L.base, L.taxRate, L.taxAmount, L.total]],
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
      doc.text(L.grandTotal, 120, finalY + 15);
      doc.setFontSize(14);
      doc.text(`${Number(invoice.total || 0).toFixed(2)} €`, 165, finalY + 15);

      // Notes
      if (invoice.notes) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(L.notes, 14, finalY + 30);
        doc.setFont("helvetica", "normal");
        const splitNotes = doc.splitTextToSize(invoice.notes, 180);
        doc.text(splitNotes, 14, finalY + 35);
      }

      // Footer
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184); // Slate 400
      doc.text(L.thanks, 105, 280, { align: "center" });

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
