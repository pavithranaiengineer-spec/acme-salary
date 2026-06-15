import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ACME Salary Management",
  description: "HR salary management for 10,000 employees",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold text-blue-600">ACME</span>
            <span className="text-gray-400">|</span>
            <span className="text-sm text-gray-600">Salary Management</span>
          </div>
          <div className="flex gap-6 text-sm font-medium">
            <Link
              href="/"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Employees
            </Link>
            <Link
              href="/analytics"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Analytics
            </Link>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}