"use client";

import React, { useState } from "react";
import {
  Calculator,
  DollarSign,
  Percent,
  Calendar,
  Sparkles,
  ShieldCheck,
  Building2,
  PieChart,
} from "lucide-react";

export default function EstateVistaMortgageCalculator() {
  const [homePrice, setHomePrice] = useState(4500000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [loanTermYears, setLoanTermYears] = useState(30);
  const [interestRateAnnual, setInterestRateAnnual] = useState(6.5);

  // Calculations
  const downPaymentAmount = homePrice * (downPaymentPercent / 100);
  const loanPrincipal = homePrice - downPaymentAmount;
  const monthlyInterestRate = interestRateAnnual / 100 / 12;
  const numberOfPayments = loanTermYears * 12;

  const monthlyPrincipalInterest =
    monthlyInterestRate === 0
      ? loanPrincipal / numberOfPayments
      : (loanPrincipal *
          (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments))) /
        (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

  const monthlyPropertyTax = (homePrice * 0.012) / 12; // 1.2% tax rate
  const monthlyHomeInsurance = (homePrice * 0.0035) / 12; // 0.35% insurance rate
  const monthlyEstimatedHOA = 850;

  const totalMonthlyPayment =
    monthlyPrincipalInterest + monthlyPropertyTax + monthlyHomeInsurance + monthlyEstimatedHOA;

  const totalInterestPaid = monthlyPrincipalInterest * numberOfPayments - loanPrincipal;

  // Percentage shares for visual bar
  const piShare = Math.round((monthlyPrincipalInterest / totalMonthlyPayment) * 100);
  const taxShare = Math.round((monthlyPropertyTax / totalMonthlyPayment) * 100);
  const insShare = Math.round((monthlyHomeInsurance / totalMonthlyPayment) * 100);
  const hoaShare = Math.max(0, 100 - piShare - taxShare - insShare);

  return (
    <section id="calculator" className="py-16 sm:py-24 bg-[#F0EDE5] border-b border-[#D5CEC1] relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#B89A63] mb-2">
            <Calculator className="h-3 w-3" />
            <span>Interactive Financial Modeler</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#222A25]">
            Financing Architecture & Carrying Cost Modeler
          </h2>
          <p className="text-sm text-[#626B63] mt-2 leading-relaxed">
            Project customized carrying costs, debt service, municipal tax reserves, and private
            insurance for luxury residences and commercial acquisitions.
          </p>
        </div>

        {/* ── Calculator Dual-Panel Card ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start rounded-3xl border border-[#D5CEC1] bg-[#FAF8F2] p-6 sm:p-8 lg:p-10 shadow-sm">
          {/* Left Panel: Sliders & Controls */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Property Price Slider */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#153D32]">
                  Acquisition Value (Home Price)
                </label>
                <span className="font-serif text-2xl font-bold text-[#153D32]">
                  ${homePrice.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={500000}
                max={15000000}
                step={50000}
                value={homePrice}
                onChange={(e) => setHomePrice(Number(e.target.value))}
                className="w-full h-2 bg-[#D5CEC1] rounded-lg appearance-none cursor-pointer accent-[#153D32]"
              />
              <div className="flex justify-between text-[10px] text-[#7B817A] mt-1 font-mono">
                <span>$500,000</span>
                <span>$7,500,000</span>
                <span>$15,000,000</span>
              </div>
            </div>

            {/* 2. Down Payment Percentage */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#153D32]">
                  Down Payment ({downPaymentPercent}%)
                </label>
                <span className="text-xs font-semibold text-[#626B63]">
                  ${Math.round(downPaymentAmount).toLocaleString()} down
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={50}
                step={5}
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                className="w-full h-2 bg-[#D5CEC1] rounded-lg appearance-none cursor-pointer accent-[#153D32]"
              />
              <div className="flex justify-between text-[10px] text-[#7B817A] mt-1 font-mono">
                <span>10% (${Math.round(homePrice * 0.1).toLocaleString()})</span>
                <span>20% (Standard)</span>
                <span>50%</span>
              </div>
            </div>

            {/* 3. Interest Rate */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#153D32]">
                  Interest Rate (APR)
                </label>
                <span className="font-serif text-lg font-bold text-[#153D32]">
                  {interestRateAnnual.toFixed(2)}%
                </span>
              </div>
              <input
                type="range"
                min={3.5}
                max={9.5}
                step={0.1}
                value={interestRateAnnual}
                onChange={(e) => setInterestRateAnnual(Number(e.target.value))}
                className="w-full h-2 bg-[#D5CEC1] rounded-lg appearance-none cursor-pointer accent-[#153D32]"
              />
              <div className="flex justify-between text-[10px] text-[#7B817A] mt-1 font-mono">
                <span>3.50% (Prime Jumbo)</span>
                <span>6.50%</span>
                <span>9.50%</span>
              </div>
            </div>

            {/* 4. Loan Term Selectors */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#153D32] block mb-2">
                Loan Term Structure
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[15, 20, 30].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setLoanTermYears(term)}
                    className={`rounded-xl py-2.5 text-xs font-bold transition-all ${
                      loanTermYears === term
                        ? "bg-[#153D32] text-white shadow-xs"
                        : "border border-[#D5CEC1] bg-white text-[#626B63] hover:border-[#153D32]/40 hover:text-[#222A25]"
                    }`}
                  >
                    {term} Years Fixed
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Monthly Payment Result Card */}
          <div className="lg:col-span-5 rounded-2xl border border-[#D5CEC1] bg-white p-6 sm:p-8 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#7B817A] mb-1">
              Estimated Monthly Carrying Cost
            </div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-[#153D32] mb-4">
              ${Math.round(totalMonthlyPayment).toLocaleString()}
              <span className="text-xs font-normal text-[#626B63]"> / month</span>
            </div>

            {/* Visual Breakdown Strip */}
            <div className="mb-6">
              <div className="h-3.5 w-full rounded-full overflow-hidden flex bg-[#D5CEC1]">
                <div style={{ width: `${piShare}%` }} className="bg-[#153D32]" title="Principal & Interest" />
                <div style={{ width: `${taxShare}%` }} className="bg-[#B89A63]" title="Property Tax" />
                <div style={{ width: `${insShare}%` }} className="bg-[#2E6B56]" title="Homeowners Insurance" />
                <div style={{ width: `${hoaShare}%` }} className="bg-[#7B817A]" title="HOA & Reserves" />
              </div>
            </div>

            {/* Breakdown Items List */}
            <div className="space-y-3 text-xs border-b border-[#D5CEC1] pb-5 mb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#153D32]" />
                  <span className="text-[#626B63]">Principal & Interest</span>
                </div>
                <span className="font-bold text-[#222A25]">
                  ${Math.round(monthlyPrincipalInterest).toLocaleString()}/mo
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#B89A63]" />
                  <span className="text-[#626B63]">Property Taxes (est. 1.2%)</span>
                </div>
                <span className="font-bold text-[#222A25]">
                  ${Math.round(monthlyPropertyTax).toLocaleString()}/mo
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#2E6B56]" />
                  <span className="text-[#626B63]">Homeowners Insurance</span>
                </div>
                <span className="font-bold text-[#222A25]">
                  ${Math.round(monthlyHomeInsurance).toLocaleString()}/mo
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#7B817A]" />
                  <span className="text-[#626B63]">Estimated HOA & Reserves</span>
                </div>
                <span className="font-bold text-[#222A25]">
                  ${monthlyEstimatedHOA.toLocaleString()}/mo
                </span>
              </div>
            </div>

            {/* Loan Principal Summary */}
            <div className="rounded-xl bg-[#F0EDE5] p-4 text-xs space-y-2 text-[#626B63] border border-[#D5CEC1]">
              <div className="flex justify-between">
                <span>Loan Principal Amount:</span>
                <span className="font-semibold text-[#222A25]">
                  ${Math.round(loanPrincipal).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Interest over {loanTermYears} yrs:</span>
                <span className="font-semibold text-[#222A25]">
                  ${Math.round(totalInterestPaid).toLocaleString()}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-[#7B817A] mt-4 leading-normal italic">
              Demonstration estimate only. Jumbo terms, private banking rates, and closing costs
              vary by financial institution.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
