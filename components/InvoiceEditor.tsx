import React, { useState, useEffect } from 'react';
import { InvoiceData, InvoiceLineItem } from '../types';
import { PlusIcon, TrashIcon, DownloadIcon } from './icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface InvoiceEditorProps {
    initialData: InvoiceData;
}

const InvoiceEditor: React.FC<InvoiceEditorProps> = ({ initialData }) => {
    const [invoice, setInvoice] = useState<InvoiceData>(initialData);
    const [isDownloading, setIsDownloading] = useState(false);

    const calculateSubtotal = () => {
        return invoice.lineItems.reduce((acc, item) => acc + ((item.quantity || 0) * (item.unitPrice || 0)), 0);
    };

    const calculateTax = (subtotal: number) => {
        return subtotal * ((invoice.taxRate || 0) / 100);
    };

    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const total = subtotal + tax;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof InvoiceData) => {
        setInvoice({ ...invoice, [field]: e.target.value });
    };

    const handleLineItemChange = (index: number, field: keyof InvoiceLineItem, value: string | number) => {
        const newLineItems = [...invoice.lineItems];
        const currentItem = { ...newLineItems[index] };
        
        if (field === 'quantity' || field === 'unitPrice') {
            (currentItem as any)[field] = parseFloat(value as string) || 0;
        } else {
            (currentItem as any)[field] = value;
        }
        
        newLineItems[index] = currentItem;
        setInvoice({ ...invoice, lineItems: newLineItems });
    };
    
    const addLineItem = () => {
        setInvoice({
            ...invoice,
            lineItems: [...invoice.lineItems, { description: '', quantity: 1, unitPrice: 0 }]
        });
    };

    const removeLineItem = (index: number) => {
        const newLineItems = invoice.lineItems.filter((_, i) => i !== index);
        setInvoice({ ...invoice, lineItems: newLineItems });
    };

    const handleDownloadPdf = async () => {
        const invoiceElement = document.getElementById('invoice-to-download');
        if (!invoiceElement) return;
        setIsDownloading(true);
        try {
            const canvas = await html2canvas(invoiceElement, { scale: 2, backgroundColor: '#1e1a3e', useCORS: true });
            
            const content = document.querySelectorAll('#invoice-to-download *');
            content.forEach(el => {
                const htmlEl = el as HTMLElement;
                htmlEl.style.color = '#000000';
            });
            
            const canvasBlackText = await html2canvas(invoiceElement, { scale: 2, backgroundColor: '#FFFFFF', useCORS: true });

            content.forEach(el => {
                const htmlEl = el as HTMLElement;
                htmlEl.style.color = '';
            });

            const imgData = canvasBlackText.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvasBlackText.height * pdfWidth) / canvasBlackText.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Invoice_${invoice.invoiceNumber || 'draft'}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
        } finally {
            setIsDownloading(false);
        }
    };

    const baseInputClass = "w-full p-2 bg-[var(--sol-bg-end)] text-[var(--sol-text-primary)] rounded-lg border border-[var(--sol-panel-border)] focus:outline-none focus:ring-1 focus:ring-[var(--sol-accent-pink)]";


    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                 <h4 className="text-lg font-semibold text-white">Completed & Editable Invoice</h4>
                 <button
                    onClick={handleDownloadPdf}
                    disabled={isDownloading}
                    className="inline-flex items-center gap-2 bg-[var(--sol-accent-cyan)]/80 hover:bg-[var(--sol-accent-cyan)] disabled:opacity-60 text-black font-semibold py-1 px-3 rounded-md transition-colors text-sm"
                >
                    {isDownloading ? 'Downloading...' : <><DownloadIcon className="h-4 w-4" /> Download PDF</>}
                </button>
            </div>
            <div id="invoice-to-download" className="bg-[var(--sol-bg-start)] p-4 rounded-lg border border-[var(--sol-panel-border)] space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                    <div>
                        <label className="text-sm font-semibold text-[var(--sol-text-secondary)] block mb-1">From</label>
                        <input type="text" value={invoice.businessName} onChange={(e) => handleInputChange(e, 'businessName')} className={`${baseInputClass} mb-2`} placeholder="Your Business Name" />
                        <textarea value={invoice.businessAddress} onChange={(e) => handleInputChange(e, 'businessAddress')} className={baseInputClass} placeholder="Your Address" rows={3} />
                    </div>
                     <div>
                        <label className="text-sm font-semibold text-[var(--sol-text-secondary)] block mb-1">To</label>
                        <input type="text" value={invoice.clientName} onChange={(e) => handleInputChange(e, 'clientName')} className={`${baseInputClass} mb-2`} placeholder="Client Name" />
                        <textarea value={invoice.clientAddress} onChange={(e) => handleInputChange(e, 'clientAddress')} className={baseInputClass} placeholder="Client Address" rows={3} />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                    <input type="text" value={invoice.invoiceNumber} onChange={(e) => handleInputChange(e, 'invoiceNumber')} className={baseInputClass} placeholder="Invoice #" />
                    <input type="date" value={invoice.issueDate} onChange={(e) => handleInputChange(e, 'issueDate')} className={baseInputClass} placeholder="Issue Date" />
                    <input type="date" value={invoice.dueDate} onChange={(e) => handleInputChange(e, 'dueDate')} className={baseInputClass} placeholder="Due Date" />
                </div>

                <div className="overflow-x-auto px-4">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-[var(--sol-text-secondary)] uppercase bg-white/5">
                            <tr>
                                <th className="p-2">Description</th>
                                <th className="p-2 w-24 text-right">Quantity</th>
                                <th className="p-2 w-32 text-right">Unit Price</th>
                                <th className="p-2 w-32 text-right">Total</th>
                                <th className="p-2 w-12"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.lineItems.map((item, index) => (
                                <tr key={index} className="border-b border-[var(--sol-panel-border)]">
                                    <td className="p-1"><input type="text" value={item.description} onChange={e => handleLineItemChange(index, 'description', e.target.value)} className="w-full bg-transparent outline-none p-1" /></td>
                                    <td className="p-1"><input type="number" value={item.quantity} onChange={e => handleLineItemChange(index, 'quantity', e.target.value)} className="w-full bg-transparent outline-none p-1 text-right" /></td>
                                    <td className="p-1"><input type="number" value={item.unitPrice} onChange={e => handleLineItemChange(index, 'unitPrice', e.target.value)} className="w-full bg-transparent outline-none p-1 text-right" /></td>
                                    <td className="p-1 text-right text-white">${((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}</td>
                                    <td className="p-1 text-center"><button onClick={() => removeLineItem(index)} className="text-[var(--sol-text-secondary)] hover:text-red-400"><TrashIcon className="h-4 w-4" /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 <div className="px-4">
                    <button onClick={addLineItem} className="inline-flex items-center gap-1 text-[var(--sol-accent-cyan)] hover:text-white text-sm font-semibold">
                        <PlusIcon className="h-4 w-4" /> Add Line Item
                    </button>
                </div>

                <div className="flex justify-end p-4">
                    <div className="w-full max-w-xs space-y-2 text-[var(--sol-text-secondary)]">
                         <div className="flex justify-between"><span>Subtotal</span><span className="text-white">${subtotal.toFixed(2)}</span></div>
                         <div className="flex justify-between items-center">
                            <span>Tax (%)</span>
                            <input type="number" value={invoice.taxRate} onChange={e => setInvoice({...invoice, taxRate: parseFloat(e.target.value) || 0})} className="w-20 p-1 bg-[var(--sol-bg-end)] border border-[var(--sol-panel-border)] rounded-md text-right" />
                         </div>
                         <div className="flex justify-between"><span>Tax Amount</span><span className="text-white">${tax.toFixed(2)}</span></div>
                         <div className="flex justify-between font-bold text-lg text-white border-t border-[var(--sol-panel-border)] pt-2 mt-2"><span>Total</span><span>${total.toFixed(2)}</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceEditor;