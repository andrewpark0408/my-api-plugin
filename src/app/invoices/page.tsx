"use client";

import { useEffect, useState } from "react";
import Pagination from "../../components/Pagination";
import { useSession } from "next-auth/react";
import axios from "axios";

export default function InvoicesPage() {
  const { data: session } = useSession();
  const [invoices, setInvoices] = useState([]);
  const [quickBooksInvoices, setQuickBooksInvoices] = useState([]);
  const [manualInvoicesPage, setManualInvoicesPage] = useState(1);
  const [quickBooksInvoicesPage, setQuickBooksInvoicesPage] = useState(1);
  const [manualSortOption, setManualSortOption] = useState("");
  const [quickBooksSortOption, setQuickBooksSortOption] = useState("");

  const itemsPerPage = 10;

  // ✅ Fetch Local Invoices
  const fetchLocalInvoices = async () => {
    try {
      const res = await axios.get("/api/invoices");
      setInvoices(res.data);
    } catch (error) {
      console.error("❌ Error fetching local invoices:", error);
    }
  };

  // ✅ Fetch QuickBooks Invoices
  const fetchQuickBooksInvoices = async () => {
    try {
      const res = await axios.get("/api/quickbooks/get");
      setQuickBooksInvoices(res.data);
    } catch (error) {
      console.error("❌ Error fetching QuickBooks invoices:", error);
    }
  };

  // ✅ Connect to QuickBooks (OAuth Redirect)
  const connectToQuickBooks = async () => {
    try {
      console.log("🔗 Redirecting to QuickBooks...");
      window.location.href = "/api/quickbooks/auth"; // Redirects to OAuth flow
    } catch (error) {
      console.error("❌ Error connecting to QuickBooks:", error);
    }
  };

  useEffect(() => {
    fetchLocalInvoices();
    fetchQuickBooksInvoices();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toISOString().split("T")[0];
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-6">Invoices</h1>

      {/* ✅ QuickBooks Buttons */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={connectToQuickBooks}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Connect to QuickBooks
        </button>
        <button
          onClick={fetchQuickBooksInvoices}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Fetch QuickBooks Invoices
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ✅ Local Invoices Section */}
        <div className="border p-4 rounded shadow-md">
          <h2 className="text-lg font-bold mb-4">Local Invoices</h2>
          <Pagination
            currentPage={manualInvoicesPage}
            totalItems={invoices.length}
            onPageChange={setManualInvoicesPage}
          />
          <ul>
            {invoices.map((invoice) => (
              <li key={invoice.id} className="mb-4 border-b pb-2 p-4 rounded-md shadow-sm bg-white">
                <h2 className="text-lg font-bold mb-2">Local Invoice #{invoice.id}</h2>
                <p><strong>Company Name:</strong> {invoice.companyName || "N/A"}</p>
                <p><strong>Transaction Date:</strong> {formatDate(invoice.txnDate)}</p>
                <p><strong>Due Date:</strong> {invoice.dueDate ? formatDate(invoice.dueDate) : "No Due Date"}</p>
                <p><strong>Total Amount:</strong> ${invoice.totalAmount.toFixed(2)}</p>
                <p><strong>Balance Due:</strong> ${invoice.balance.toFixed(2)}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* ✅ QuickBooks Invoices Section */}
        <div className="border p-4 rounded shadow-md">
          <h2 className="text-lg font-bold mb-4">QuickBooks Invoices</h2>
          <Pagination
            currentPage={quickBooksInvoicesPage}
            totalItems={quickBooksInvoices.length}
            onPageChange={setQuickBooksInvoicesPage}
          />
          <ul>
            {quickBooksInvoices.map((invoice) => (
              <li key={invoice.id} className="mb-4 border-b pb-2 p-4 rounded-md shadow-sm bg-white">
                <h2 className="text-lg font-bold mb-2">Invoice #{invoice.docNumber}</h2>
                <p><strong>Company Name:</strong> {invoice.companyName || "N/A"}</p>
                <p><strong>Transaction Date:</strong> {formatDate(invoice.txnDate)}</p>
                <p><strong>Due Date:</strong> {invoice.dueDate ? formatDate(invoice.dueDate) : "No Due Date"}</p>
                <p><strong>Total Amount:</strong> ${invoice.totalAmount.toFixed(2)}</p>
                <p><strong>Balance Due:</strong> ${invoice.balance.toFixed(2)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
