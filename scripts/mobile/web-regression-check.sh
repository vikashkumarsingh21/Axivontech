#!/usr/bin/env bash
set -e

echo "================================================================================"
echo "                  AXIVON WEB REGRESSION GATE (BASH WRAPPER)                     "
echo "================================================================================"

echo ""
echo "Step 1: Running UI Error System Guardrails..."
npm run check:errors

echo ""
echo "Step 2: Executing Two-Pass Web Regression Runner (Flag OFF & Flag ON)..."
node scripts/mobile/web-regression-check.mjs

echo ""
echo "✅ WEB REGRESSION GATE PASSED! Safe to merge."
