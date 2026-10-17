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
  const hoaShare = 100 - piShare - taxShare - insShare;

  return (
    <section id="calculator" className="py-16 sm:py-24 bg-white border-b border-[#E4E0D7] relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Section Heading */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#C59B63] mb-2">
            <Calculator className="h-3 w-3" />
            <span>Interactive Financial Modeler</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#1A211E]">
            Financing Architecture & Investment Calculator
          </h2>
          <p className="text-sm text-[#5C6661] mt-2 leading-relaxed">
            Project customized carrying costs, debt service, municipal tax reserves, and private
            insurance for luxury residences and commercial acquisitions.
          </p>
        </div>

        {/* ── Calculator Dual-Panel Card ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start rounded-2xl border border-[#E4E0D7] bg-[#F9F8F5] p-6 sm:p-8 lg:p-10 shadow-sm">
          {/* Left Panel: Sliders & Controls */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Property Price Slider */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#123C32]">
                  Acquisition Value (Home Price)
                </label>
                <span className="font-serif text-xl font-bold text-[#123C32]">
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
                className="w-full h-2 bg-[#E4E0D7] rounded-lg appearance-none cursor-pointer accent-[#123C32]"
              />
              <div className="flex justify-between text-[10px] text-[#7C8882] mt-1 font-mono">
                <span>$500,000</span>
                <span>$7,500,000</span>
                <span>$15,000,000</span>
              </div>
            </div>

            {/* 2. Down Payment Percentage */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#123C32]">
                  Down Payment ({downPaymentPercent}%)
                </label>
                <span className="text-xs font-semibold text-[#5C6661]">
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
                className="w-full h-2 bg-[#E4E0D7] rounded-lg appearance-none cursor-pointer accent-[#123C32]"
              />
              <div className="flex justify-between text-[10px] text-[#7C8882] mt-1 font-mono">
                <span>10% ($ {Math.round(homePrice * 0.1).toLocaleString()})</span>
                <span>20% (Standard)</span>
                <span>50%</span>
              </div>
            </div>

            {/* 3. Interest Rate */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#123C32]">
                  Interest Rate (APR)
                </label>
                <span className="font-serif text-base font-bold text-[#123C32]">
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
                className="w-full h-2 bg-[#E4E0D7] rounded-lg appearance-none cursor-pointer accent-[#123C32]"
              />
              <div className="flex justify-between text-[10px] text-[#7C8882] mt-1 font-mono">
                <span>3.50% (Prime Jumbo)</span>
                <span>6.50%</span>
                <span>9.50%</span>
              </div>
            </div>

            {/* 4. Loan Term Selectors */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#123C32] block mb-2">
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
                        ? "bg-[#123C32] text-white shadow-xs"
                        : "border border-[#E4E0D7] bg-white text-[#5C6661] hover:border-[#123C32]/40"
                    }`}
                  >
                    {term} Years Fixed
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Monthly Payment Result Card */}
          <div className="lg:col-span-5 rounded-xl border border-[#E4E0D7] bg-white p-6 sm:p-7 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#7C8882] mb-1">
              Estimated Monthly Carrying Cost
            </div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-[#123C32] mb-4">
              ${Math.round(totalMonthlyPayment).toLocaleString()}
              <span className="text-xs font-normal text-[#5C6661]"> / month</span>
            </div>

            {/* Visual Breakdown Strip */}
            <div className="mb-6">
              <div className="h-3 w-full rounded-full overflow-hidden flex bg-[#E4E0D7]">
                <div style={{ width: `${piShare}%` }} className="bg-[#123C32]" title="Principal & Interest" />
                <div style={{ width: `${taxShare}%` }} className="bg-[#C59B63]" title="Property Tax" />
                <div style={{ width: `${insShare}%` }} className="bg-[#2E6B56]" title="Homeowners Insurance" />
                <div style={{ width: `${hoaShare}%` }} className="bg-[#7C8882]" title="HOA & Reserves" />
              </div>
            </div>

            {/* Breakdown Items List */}
            <div className="space-y-3 text-xs border-b border-[#E4E0D7] pb-5 mb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#123C32]" />
                  <span className="text-[#5C6661]">Principal & Interest</span>
                </div>
                <span className="font-bold text-[#1A211E]">
                  ${Math.round(monthlyPrincipalInterest).toLocaleString()}/mo
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#C59B63]" />
                  <span className="text-[#5C6661]">Property Taxes (est. 1.2%)</span>
                </div>
                <span className="font-bold text-[#1A211E]">
                  ${Math.round(monthlyPropertyTax).toLocaleString()}/mo
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#2E6B56]" />
                  <span className="text-[#5C6661]">Homeowners Insurance</span>
                </div>
                <span className="font-bold text-[#1A211E]">
                  ${Math.round(monthlyHomeInsurance).toLocaleString()}/mo
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#7C8882]" />
                  <span className="text-[#5C6661]">Estimated HOA & Reserves</span>
                </div>
                <span className="font-bold text-[#1A211E]">
                  ${monthlyEstimatedHOA.toLocaleString()}/mo
                </span>
              </div>
            </div>

            {/* Loan Principal Summary */}
            <div className="rounded-xl bg-[#F9F8F5] p-3.5 text-xs space-y-1.5 text-[#5C6661]">
              <div className="flex justify-between">
                <span>Loan Principal Amount:</span>
                <span className="font-semibold text-[#1A211E]">
                  ${Math.round(loanPrincipal).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Interest over {loanTermYears} yrs:</span>
                <span className="font-semibold text-[#1A211E]">
                  ${Math.round(totalInterestPaid).toLocaleString()}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-[#7C8882] mt-4 leading-normal italic">
              Demonstration estimate only. Jumbo terms, private banking rates, and closing costs
              vary by financial institution.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
