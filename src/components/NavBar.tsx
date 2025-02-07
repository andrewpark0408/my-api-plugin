"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto flex justify-between items-center px-4 py-4">
        {/* Logo */}
        <Link href="/">
          <h1 className="text-2xl font-bold cursor-pointer">QuickBooks Integration</h1>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex space-x-6">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/invoices">Invoices</NavLink>
          <NavLink href="/admin">Admin</NavLink>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="focus:outline-none">
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* User Profile/Session Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {session ? (
            <>
              <span>Welcome, {session.user?.name || "User"}</span>
              <button
                onClick={() => signOut()}
                className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-400"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/auth/login">
              <button className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-400">
                Login
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-blue-500">
          <ul className="flex flex-col space-y-4 px-4 py-6">
            <NavLink href="/" onClick={toggleMenu}>
              Home
            </NavLink>
            <NavLink href="/invoices" onClick={toggleMenu}>
              Invoices
            </NavLink>
            <NavLink href="/admin" onClick={toggleMenu}>
              Admin
            </NavLink>
            {session ? (
              <button
                onClick={() => {
                  signOut();
                  toggleMenu();
                }}
                className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            ) : (
              <Link href="/auth/login" onClick={toggleMenu}>
                <button className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600">
                  Login
                </button>
              </Link>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, children, onClick }) {
  return (
    <Link href={href} onClick={onClick}>
      <h3
        className="hover:underline focus:underline focus:ring-2 focus:ring-blue-400 px-3 py-1 rounded-md"
      >
        {children}
      </h3>
    </Link>
  );
}
