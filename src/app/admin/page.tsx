"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import axios from "axios";

interface Invoice {
  id: string;
  quickbooksId?: string;
  docNumber?: string;
  companyName: string;
  taxable: boolean;
  totalAmount: number;
  balance: number;
  txnDate: string;
  dueDate?: string;
  emailStatus?: string;
  printStatus?: string;
  totalTax?: number;
  applyTaxAfterDiscount?: boolean;
  lineItems?: string; // Stored as JSON string
}

// ✅ SWR Fetcher Function
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const AdminPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showForm, setShowForm] = useState<boolean>(false);
  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({});
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editInvoiceId, setEditInvoiceId] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<string>("");

  // ✅ Fetch invoices & QuickBooks invoices
  const { data: invoices, mutate: mutateInvoices } = useSWR("/api/invoices", fetcher);
  const { data: quickBooksInvoices } = useSWR("/api/quickbooks/get", fetcher);

  // ✅ Redirect non-admin users
  if (status === "loading") return <h1>Loading...</h1>;
  if (!session || session.user.role !== "admin") {
    setTimeout(() => router.push("/"), 2000);
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-700 mt-2">Redirecting you to the home page...</p>
      </div>
    );
  }

  // ✅ Handle Selecting a QuickBooks Invoice
  const handleSelectQuickBooksInvoice = (id: string) => {
    const invoice = quickBooksInvoices?.find((inv) => inv.quickbooksId === id);
    if (invoice) {
      setNewInvoice({
        quickbooksId: invoice.quickbooksId,
        docNumber: invoice.docNumber,
        companyName: invoice.companyName,
        taxable: invoice.taxable,
        totalAmount: invoice.totalAmount || 0,
        balance: invoice.balance || 0,
        txnDate: invoice.txnDate ? invoice.txnDate.split("T")[0] : new Date().toISOString().split("T")[0],
        dueDate: invoice.dueDate ? invoice.dueDate.split("T")[0] : "",
        emailStatus: invoice.emailStatus || "N/A",
        printStatus: invoice.printStatus || "N/A",
        totalTax: invoice.totalTax || 0,
        applyTaxAfterDiscount: invoice.applyTaxAfterDiscount || false,
        lineItems: invoice.lineItems ? JSON.stringify(JSON.parse(invoice.lineItems), null, 2) : "[]",
      });
    }
    setSelectedInvoice(id);
  };

  // ✅ Handle Editing an Invoice
  const handleEdit = (invoice: Invoice) => {
    setNewInvoice({ ...invoice });
    setEditInvoiceId(invoice.id);
    setIsEditing(true);
    setShowForm(true);
  };

  // ✅ Handle Cancel Editing
  const handleCancel = () => {
    setShowForm(false);
    setNewInvoice({});
    setIsEditing(false);
    setEditInvoiceId(null);
    setSelectedInvoice("");
  };

  // ✅ Handle Deleting an Invoice
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await axios.delete(`/api/invoices/${id}`);
      mutateInvoices();
    } catch (error) {
      console.error("❌ Error deleting invoice:", error);
    }
  };

  // ✅ Handle Saving New Invoice
  const handleSaveInvoice = async () => {
    try {
      const formattedInvoice = {
        docNumber: newInvoice.docNumber,
        companyName: newInvoice.companyName,
        taxable: newInvoice.taxable || false,
        totalAmount: newInvoice.totalAmount || 0,
        balance: newInvoice.balance || 0,
        txnDate: newInvoice.txnDate ? new Date(newInvoice.txnDate).toISOString() : new Date().toISOString(),
        dueDate: newInvoice.dueDate ? new Date(newInvoice.dueDate).toISOString() : null,
        emailStatus: newInvoice.emailStatus || "NotSet",
        printStatus: newInvoice.printStatus || "NotSet",
        totalTax: newInvoice.totalTax || 0,
        applyTaxAfterDiscount: newInvoice.applyTaxAfterDiscount || false,
        lineItems: newInvoice.lineItems ? JSON.stringify(JSON.parse(newInvoice.lineItems)) : "[]",
      };

      if (isEditing && editInvoiceId) {
        await axios.put(`/api/invoices/${editInvoiceId}`, formattedInvoice);
      } else {
        await axios.post("/api/invoices", formattedInvoice);
      }

      mutateInvoices();
      handleCancel();
    } catch (error) {
      console.error("❌ Error saving invoice:", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Admin - Invoice Management</h1>
      <button
        onClick={() => {
          setShowForm(true);
          setIsEditing(false);
          setNewInvoice({});
          setSelectedInvoice("");
        }}
        className="bg-blue-500 text-white px-4 py-2 my-4 rounded"
      >
        + New Invoice
      </button>

      {showForm && (
        <div className="p-4 border border-gray-300 rounded">
          <h2 className="text-xl">{isEditing ? "Edit Invoice" : "Create Invoice"}</h2>

          {!isEditing && (
            <select
              onChange={(e) => handleSelectQuickBooksInvoice(e.target.value)}
              value={selectedInvoice}
              className="border p-2 w-full mt-2"
            >
              <option value="">Select QuickBooks Invoice</option>
              {quickBooksInvoices?.map((invoice) => (
                <option key={invoice.quickbooksId} value={invoice.quickbooksId}>
                  {invoice.companyName} - {invoice.docNumber}
                </option>
              ))}
            </select>
          )}

          <input type="text" placeholder="Invoice Number" value={newInvoice.docNumber || ""} onChange={(e) => setNewInvoice({ ...newInvoice, docNumber: e.target.value })} className="border p-2 w-full mt-2" required />
          <input type="text" placeholder="Company Name" value={newInvoice.companyName || ""} onChange={(e) => setNewInvoice({ ...newInvoice, companyName: e.target.value })} className="border p-2 w-full mt-2" required />

          <input type="text" placeholder="Print Status" value={newInvoice.printStatus || ""} onChange={(e) => setNewInvoice({ ...newInvoice, printStatus: e.target.value })} className="border p-2 w-full mt-2" />
          <input type="text" placeholder="Email Status" value={newInvoice.emailStatus || ""} onChange={(e) => setNewInvoice({ ...newInvoice, emailStatus: e.target.value })} className="border p-2 w-full mt-2" />

          <label className="block mt-2">Total Amount ($)
            <input type="number" value={newInvoice.totalAmount || ""} onChange={(e) => setNewInvoice({ ...newInvoice, totalAmount: Number(e.target.value) })} className="border p-2 w-full" />
          </label>

          <label className="block mt-2">Balance Due ($)
            <input type="number" value={newInvoice.balance || ""} onChange={(e) => setNewInvoice({ ...newInvoice, balance: Number(e.target.value) })} className="border p-2 w-full" />
          </label>

          <label className="block mt-2">Transaction Date
            <input type="date" value={newInvoice.txnDate || ""} onChange={(e) => setNewInvoice({ ...newInvoice, txnDate: e.target.value })} className="border p-2 w-full" />
          </label>

          <label className="block mt-2">Due Date
            <input type="date" value={newInvoice.dueDate || ""} onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })} className="border p-2 w-full" />
          </label>

          <label className="block mt-2">Total Tax ($)
            <input type="number" value={newInvoice.totalTax || ""} onChange={(e) => setNewInvoice({ ...newInvoice, totalTax: Number(e.target.value) })} className="border p-2 w-full" />
          </label>

          <label className="block mt-2">
            Apply Tax After Discount:
            <input type="checkbox" checked={newInvoice.applyTaxAfterDiscount ?? false} onChange={(e) => setNewInvoice({ ...newInvoice, applyTaxAfterDiscount: e.target.checked })} className="ml-2" />
          </label>

          <textarea
            placeholder="Line Items (JSON Format)"
            value={newInvoice.lineItems || ""}
            onChange={(e) => setNewInvoice({ ...newInvoice, lineItems: e.target.value })}
            className="border p-2 w-full mt-2 h-24"
          />

          <div className="flex gap-2 mt-4">
            <button onClick={handleSaveInvoice} className="bg-green-500 text-white px-4 py-2 rounded">
              {isEditing ? "Save Changes" : "Create Invoice"}
            </button>
            <button onClick={handleCancel} className="bg-gray-500 text-white px-4 py-2 rounded">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ✅ Display Invoice Table with Edit & Delete buttons */}
      {invoices?.length > 0 ? (
        <table className="w-full border mt-4">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Invoice #</th>
              <th className="border p-2">Company Name</th>
              <th className="border p-2">Total</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="border p-2">{invoice.docNumber}</td>
                <td className="border p-2">{invoice.companyName}</td>
                <td className="border p-2">${invoice.totalAmount.toFixed(2)}</td>
                <td className="border p-2">
                  <button onClick={() => handleEdit(invoice)} className="bg-yellow-500 text-white px-3 py-1 rounded mr-2">Edit</button>
                  <button onClick={() => handleDelete(invoice.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : <p>No invoices found.</p>}
    </div>
  );
};

export default AdminPage;
