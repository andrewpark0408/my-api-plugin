"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import axios from "axios";
import Pagination from "../../components/Pagination";

export default function InvoicesPage() {
  const { data: session } = useSession();
  const [invoices, setInvoices] = useState([]);
  const [quickBooksInvoices, setQuickBooksInvoices] = useState([]);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [manualInvoicesPage, setManualInvoicesPage] = useState(1);
  const [quickBooksInvoicesPage, setQuickBooksInvoicesPage] = useState(1);
  const [manualSortOption, setManualSortOption] = useState("");
  const [quickBooksSortOption, setQuickBooksSortOption] = useState("");

  const itemsPerPage = 10;

  const fetchLocalInvoices = async () => {
    try {
      console.log("🔍 Fetching stored local invoices...");
      const res = await axios.get("/api/invoices");
      if (res.data.length === 0) {
        console.log("⚠️ No local invoices found.");
      }
      setInvoices(res.data);
    } catch (error) {
      console.error("❌ Error fetching local invoices:", error);
    }
  };

  const fetchQuickBooksInvoices = async () => {
    try {
      console.log("🔍 Fetching stored QuickBooks invoices from DB...");
      const storedRes = await axios.get("/api/quickbooks/get");

      if (storedRes.data.length > 0) {
        console.log("✅ Using stored QuickBooks invoices:", storedRes.data.length);
        setQuickBooksInvoices(storedRes.data);
        return;
      }

      if (!session?.user?.realmId) {
        console.error("❌ No `realmId` found in session, retrying in 2 seconds...");
        setTimeout(fetchQuickBooksInvoices, 2000);
        return;
      }

      const realmId = session.user.realmId;
      console.log(`✅ Using realmId from session: ${realmId}`);

      console.log("📥 Fetching fresh invoices from QuickBooks API...");
      const res = await axios.get(`/api/quickbooks/invoices?realmId=${realmId}`);

      console.log("✅ Full QuickBooks Response:", res.data);

      if (!res.data || !res.data.QueryResponse || !res.data.QueryResponse.Invoice) {
        console.error("❌ No invoices returned from QuickBooks API");
        return;
      }

      const quickBooksInvoices = res.data.QueryResponse.Invoice;
      console.log("✅ Extracted Invoices:", quickBooksInvoices);
      setQuickBooksInvoices(quickBooksInvoices);

      console.log("💾 Storing invoices in DB...");
      await axios.post("/api/quickbooks/store", { invoices: quickBooksInvoices });

      console.log("✅ Successfully stored QuickBooks invoices in DB.");
    } catch (error) {
      console.error("❌ Error fetching QuickBooks invoices:", error);
    }
  };


  const connectToQuickBooks = async () => {
    try {
      console.log("🔗 Redirecting to QuickBooks OAuth...");
      window.location.href = "/api/quickbooks/auth";
    } catch (error) {
      console.error("❌ Error connecting to QuickBooks:", error);
    }
  };

  const fetchStoredQuickBooksInvoices = async () => {
    try {
      console.log("🔍 Fetching stored QuickBooks invoices from DB...");
      const res = await axios.get("/api/quickbooks/get");

      if (res.data.length > 0) {
        console.log("✅ Loaded stored QuickBooks invoices:", res.data.length);
        setQuickBooksInvoices(res.data);
      } else {
        console.warn("⚠️ No stored QuickBooks invoices found.");
      }
    } catch (error) {
      console.error("❌ Error fetching stored QuickBooks invoices:", error);
    }
  };

  useEffect(() => {
    console.log("✅ Session data:", session);
    console.log("🔹 User role:", session?.user?.role);
    fetchLocalInvoices();
    fetchStoredQuickBooksInvoices();

    if (!session?.user?.realmId) {
      console.error("❌ No `realmId` found in session, forcing session update...");
    }

  }, [session]);


  const sortManualInvoices = (sortOption) => {
    const sorted = [...invoices].sort((a, b) => {
      if (sortOption === "amount") return a.totalAmount - b.totalAmount;
      if (sortOption === "status") return a.status.localeCompare(b.status);
      if (sortOption === "company") return a.companyName.localeCompare(b.companyName);
      return 0;
    });
    setInvoices(sorted);
    setManualSortOption(sortOption);
  };

  const sortQuickBooksInvoices = (sortOption) => {
    let sorted = [...quickBooksInvoices];
    switch (sortOption) {
      case "amountAsc":
        sorted.sort((a, b) => a.totalAmount - b.totalAmount);
        break;
      case "amountDesc":
        sorted.sort((a, b) => b.totalAmount - a.totalAmount);
        break;
      case "balanceAsc":
        sorted.sort((a, b) => a.balance - b.balance);
        break;
      case "balanceDesc":
        sorted.sort((a, b) => b.balance - a.balance);
        break;
      case "companyAsc":
        sorted.sort((a, b) => a.companyName.localeCompare(b.companyName));
        break;
      case "companyDesc":
        sorted.sort((a, b) => b.companyName.localeCompare(a.companyName));
        break;
      default:
        break;
    }
    setQuickBooksInvoices(sorted);
    setQuickBooksSortOption(sortOption);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toISOString().split("T")[0];
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-6">Invoices</h1>
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
          Fetch & Store QuickBooks Invoices
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border p-4 rounded shadow-md">
          <h2 className="text-lg font-bold mb-4">Local Invoices</h2>
          <div className="mb-4">
            <label className="font-medium mr-2">Sort by:</label>
            <select
              value={manualSortOption}
              onChange={(e) => sortManualInvoices(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="">Select</option>
              <option value="company">Company Name</option>
              <option value="amount">Total Amount</option>
              <option value="status">Status</option>
            </select>
          </div>
          <Pagination currentPage={manualInvoicesPage} totalItems={totalInvoices} onPageChange={setManualInvoicesPage} />
          <ul>
            {(invoices || []).map((invoice) => (
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
        <div className="border p-4 rounded shadow-md">
          <h2 className="text-lg font-bold mb-4">QuickBooks Invoices</h2>

          {/* Sorting Dropdown */}
          <div className="mb-4 flex justify-between items-center">
            <label className="font-medium">Sort by:</label>
            <select
              value={quickBooksSortOption}
              onChange={(e) => sortQuickBooksInvoices(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="">Select</option>
              <option value="amountAsc">Amount (Low → High)</option>
              <option value="amountDesc">Amount (High → Low)</option>
              <option value="balanceAsc">Balance Due (Low → High)</option>
              <option value="balanceDesc">Balance Due (High → Low)</option>
              <option value="companyAsc">Company Name (A → Z)</option>
              <option value="companyDesc">Company Name (Z → A)</option>
            </select>
          </div>
          <div className="space-y-4">
            {quickBooksInvoices?.length > 0 ? (
              quickBooksInvoices
                .slice((quickBooksInvoicesPage - 1) * itemsPerPage, quickBooksInvoicesPage * itemsPerPage)
                .map((invoice) => (
                  <div key={invoice.quickbooksId || `invoice-${index}`} className="border rounded-md p-4 shadow bg-white flex flex-col">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h2 className="font-bold text-lg">📄 Invoice #{invoice.docNumber || "N/A"}</h2>
                      <span className="text-sm text-gray-500">{invoice.emailStatus || "N/A"}</span>
                    </div>

                    <p className="text-sm text-gray-700">
                      <strong>🏢 {invoice.customerName || "N/A"}</strong>
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <p><strong>📅 Date:</strong> {invoice.txnDate ? formatDate(invoice.txnDate) : "N/A"}</p>
                      <p><strong>⏳ Due:</strong> {invoice.dueDate ? formatDate(invoice.dueDate) : "N/A"}</p>
                      <p><strong>💰 Total:</strong> ${invoice.totalAmount ? invoice.totalAmount.toFixed(2) : "0.00"}</p>
                      <p><strong>🔻 Balance:</strong> ${invoice.balance ? invoice.balance.toFixed(2) : "0.00"}</p>
                    </div>

                    <div className="mt-3 text-xs text-gray-600">
                      {invoice.lineItems ? (
                        <p><strong>🛒 Items:</strong> {JSON.parse(invoice.lineItems).map(i => i.Description).join(", ")}</p>
                      ) : <p><strong>🛒 Items:</strong> N/A</p>}
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-gray-500 text-sm">No invoices available.</p>
            )}
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-between mt-4">
            <button
              onClick={() => setQuickBooksInvoicesPage((prev) => Math.max(prev - 1, 1))}
              disabled={quickBooksInvoicesPage === 1}
              className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
            >
              ← Previous
            </button>
            <span className="text-sm">Page {quickBooksInvoicesPage}</span>
            <button
              onClick={() =>
                setQuickBooksInvoicesPage((prev) =>
                  prev < Math.ceil(quickBooksInvoices.length / itemsPerPage) ? prev + 1 : prev
                )
              }
              disabled={
                quickBooksInvoicesPage >= Math.ceil(quickBooksInvoices.length / itemsPerPage)
              }
              className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
