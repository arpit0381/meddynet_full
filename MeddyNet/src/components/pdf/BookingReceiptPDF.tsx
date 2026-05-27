"use client";

import React from 'react';
import { CheckCircle, Mail, Phone, Globe, Calendar, User, QrCode } from 'lucide-react';

interface Test {
  id: string;
  name: string;
  price: number;
}

interface BookingReceiptPDFProps {
  receiptNumber: string;
  bookingId: string;
  date: string;
  time: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bookingType: string;
  labName: string;
  labAddress: string;
  tests: Test[];
  subtotal: number;
  discount: number;
  total: number;
  transactionId: string;
  id?: string;
}

const BookingReceiptPDF: React.FC<BookingReceiptPDFProps> = ({
  receiptNumber,
  bookingId,
  date,
  time,
  customerName,
  customerEmail,
  customerPhone,
  bookingType,
  labName,
  labAddress,
  tests,
  subtotal,
  discount,
  total,
  transactionId,
  id = "receipt-pdf-template"
}) => {
  const taxes = Math.round(subtotal * 0.18);

  return (
    <div 
      id={id}
      className="bg-white text-dark font-sans"
      style={{ width: '794px', minHeight: '1123px', padding: '0', margin: '0' }}
    >
      {/* Header Bar */}
      <div className="bg-[#003B2A] text-white p-10 flex justify-between items-center w-full relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative w-40 h-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/MeddyNetlogo.png" alt="MeddyNet Logo" className="object-contain brightness-0 invert" />
          </div>
        </div>
        <div className="text-right relative z-10">
          <h1 className="text-sm font-black uppercase tracking-[0.3em] opacity-40 mb-2">Payment Receipt</h1>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1 text-primary-light">Receipt Number</p>
          <p className="text-xl font-black tracking-tighter">{receiptNumber}</p>
        </div>
      </div>

      {/* Success Banner */}
      <div className="px-12 pt-10 pb-6 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-50 border-2 border-emerald-100 rounded-2xl mb-4">
          <CheckCircle className="text-emerald-500 w-6 h-6" />
          <span className="text-emerald-800 font-black uppercase tracking-widest text-sm">Payment Successful & Confirmed</span>
        </div>
        <p className="text-text-muted text-xs font-bold uppercase tracking-[0.3em]">Transaction ID: TXN{transactionId}</p>
      </div>

      <div className="px-12 py-8 grid grid-cols-2 gap-8">
        {/* Booking Details Panel */}
        <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12" />
          <h2 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" /> Booking Info
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Booking ID</p>
              <p className="text-sm font-black text-dark">{bookingId}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Type</p>
              <p className="text-sm font-black text-dark capitalize">{bookingType === 'home' ? 'Home Collection' : 'Lab Visit'}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Schedule</p>
              <p className="text-sm font-black text-dark">{date} at {time}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Laboratory</p>
              <p className="text-sm font-black text-dark">{labName}</p>
              <p className="text-[10px] font-medium text-text-muted mt-0.5">{labAddress}</p>
            </div>
          </div>
        </div>

        {/* Customer Details Panel */}
        <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-8 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full -ml-12 -mb-12" />
          <h2 className="text-[11px] font-black text-accent uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <User className="w-3.5 h-3.5" /> Customer Details
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Full Name</p>
              <p className="text-sm font-black text-dark">{customerName}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Email Address</p>
              <p className="text-sm font-black text-dark lowercase">{customerEmail}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Phone Number</p>
              <p className="text-sm font-black text-dark">{customerPhone}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Payment Method</p>
              <p className="text-sm font-black text-dark underline decoration-accent/30 underline-offset-4">Secure Online Payment</p>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Table */}
      <div className="px-12 py-4">
        <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#003B2A] text-white">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Selected Tests / Services</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tests.map((test, idx) => (
                <tr key={test.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-dark">{test.name}</p>
                    <p className="text-[10px] text-text-muted italic">Professional Lab Analysis</p>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-dark">₹{test.price}.00</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="px-12 py-8 flex justify-end">
        <div className="w-1/2 space-y-4">
          <div className="flex justify-between items-center text-text-muted">
            <span className="text-[10px] font-black uppercase tracking-widest">Subtotal</span>
            <span className="text-sm font-bold tracking-tight">₹{subtotal}.00</span>
          </div>
          <div className="flex justify-between items-center text-text-muted">
            <span className="text-[10px] font-black uppercase tracking-widest">Estimated Taxes (GST 18%)</span>
            <span className="text-sm font-bold tracking-tight">₹{taxes}.00</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between items-center text-emerald-600">
              <span className="text-[10px] font-black uppercase tracking-widest">Discount Applied</span>
              <span className="text-sm font-black tracking-tight">- ₹{discount}.00</span>
            </div>
          )}
          <div className="pt-4 border-t-2 border-dark flex justify-between items-center text-[#003B2A]">
            <span className="text-lg font-black italic">Total Amount Paid</span>
            <span className="text-4xl font-black tracking-tighter">₹{total}.00</span>
          </div>
        </div>
      </div>

      {/* Verification & Footer */}
      <div className="mt-auto px-12 pb-12 pt-8">
        <div className="flex items-start gap-12 bg-slate-50/50 p-6 rounded-[32px] border border-slate-100">
          <div className="shrink-0">
            <p className="text-[9px] font-black text-[#003B2A] uppercase tracking-[0.2em] mb-3">Verification</p>
            <div className="w-24 h-24 bg-white border border-slate-200 rounded-3xl flex items-center justify-center p-2 shadow-sm relative group">
               <div className="w-full h-full bg-slate-50/50 rounded-2xl flex items-center justify-center border border-dashed border-slate-200">
                  <QrCode className="w-10 h-10 text-slate-200" />
               </div>
               {/* Decorative corners */}
               <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl-lg" />
               <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br-lg" />
            </div>
          </div>
          <div className="flex-1 space-y-4 pt-2">
             <h3 className="text-xs font-black text-dark tracking-wide uppercase opacity-70">Important Instructions:</h3>
             <ul className="text-[10px] font-bold text-text-muted space-y-2.5">
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0" /> 
                  <p>Please present this digital or printed receipt at our laboratory partners for priority sample collection.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0" /> 
                  <p>Fasting (8-10 hours) is mandatory for blood glucose and lipid profile tests. Water is allowed.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1 shrink-0" /> 
                  <p>Verified reports will be delivered securely to your registered email and MeddyNet dashboard.</p>
                </li>
             </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-end">
          <div className="space-y-4">
            <p className="text-xs font-black text-dark-light italic">Thank you for choosing MeddyNet — Your Partner in Health.</p>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-bold text-text-muted">support@meddynet.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-bold text-text-muted">+91-1800-MED-NET</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-bold text-text-muted">www.meddynet.com</span>
              </div>
            </div>
          </div>
          <div className="w-32 h-1 bg-primary/20 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default BookingReceiptPDF;
