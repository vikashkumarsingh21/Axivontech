"use client";

import React, { useState } from "react";
import {
  Download,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Globe,
  Clock,
  Calendar,
  CheckSquare,
  FileText,
  Lock,
  Wifi,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { QrCodeSvg } from "@/features/app-mode/components/QrCodeSvg";

interface DownloadClientProps {
  latestVersion: string;
  sizeMb: number;
  apkUrl: string;
  notes: string;
}

const DOWNLOAD_PAGE_URL = "https://axivontech.in/download";

export function DownloadClient({
  latestVersion = "1.0.0",
  sizeMb = 5.8,
  apkUrl = "/download/axivon-app",
  notes,
}: DownloadClientProps) {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(DOWNLOAD_PAGE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const content = {
    en: {
      badge: `Official Android Release • v${latestVersion}`,
      title: "Download the Official Axivon Mobile App",
      subtitle:
        "Manage attendance, track project tasks, submit daily work reports, and apply for leave on your Android smartphone. Engineered for speed and ultra-low data usage.",
      downloadBtn: `Download APK (${sizeMb} MB)`,
      directInfo: `Version ${latestVersion} • Android 8.0+ • Universal APK Package`,
      qrTitle: "Scan with your Android phone",
      qrDesc: "Point your phone camera to download directly on your device:",
      copyBtn: "Copy Link",
      copiedBtn: "Link Copied!",
      installHeading: "How to Install the APK in 3 Steps",
      step1Title: "1. Download APK",
      step1Desc: "Tap the download button. The APK file will start downloading to your phone's Downloads folder.",
      step2Title: "2. Allow Installation",
      step2Desc: "If Android displays 'File might be harmful' or asks for permission, tap 'Download anyway' and enable 'Install unknown apps' in browser settings.",
      step3Title: "3. Install & Sign In",
      step3Desc: "Open the downloaded axivon-app.apk file, tap 'Install', and sign in with your Axivon email and password.",
      featuresHeading: "Built for Mobile Productivity",
      featuresSub: "Everything you need from your Axivon role portal, reimagined for your smartphone.",
      feature1Title: "Smart Attendance",
      feature1Desc: "1-tap check-in, break tracking, and check-out with office geofencing.",
      feature2Title: "Task Management",
      feature2Desc: "Review assigned tasks, update completion status, and never miss a deadline.",
      feature3Title: "Leave Requests",
      feature3Desc: "Apply for leaves, track remaining balance, and view manager approvals.",
      feature4Title: "Daily Work Reports",
      feature4Desc: "Submit comprehensive daily accomplishment summaries in seconds.",
      feature5Title: "Ultra-Low Mobile Data",
      feature5Desc: "Lightweight WebView shell transferring less than 250 KB per session.",
      feature6Title: "Enterprise Security",
      feature6Desc: "JWT authenticated sessions with automated session clearing on sign out.",
      specsHeading: "System Requirements & Package Info",
    },
    hi: {
      badge: `आधिकारिक एंड्रॉयड ऐप • v${latestVersion}`,
      title: "आधिकारिक Axivon मोबाइल ऐप डाउनलोड करें",
      subtitle:
        "अपने एंड्रॉयड फोन से अटेंडेंस लगाएं, टास्क देखें, दैनिक वर्क रिपोर्ट सबमिट करें और छुट्टी के लिए अप्लाई करें। तेज, सुरक्षित और कम डेटा उपयोग के लिए विशेष रूप से तैयार।",
      downloadBtn: `APK डाउनलोड करें (${sizeMb} MB)`,
      directInfo: `वर्जन ${latestVersion} • एंड्रॉयड 8.0+ • सत्यापित पैकेज`,
      qrTitle: "अपने फोन से स्कैन करें",
      qrDesc: "सीधे फोन पर डाउनलोड करने के लिए कैमरे से QR कोड स्कैन करें:",
      copyBtn: "लिंक कॉपी करें",
      copiedBtn: "कॉपी हो गया!",
      installHeading: "3 आसान स्टेप्स में APK इंस्टॉल करें",
      step1Title: "1. APK डाउनलोड करें",
      step1Desc: "डाउनलोड बटन पर टैप करें। APK फाइल आपके फोन में डाउनलोड होना शुरू हो जाएगी।",
      step2Title: "2. अनुमति दें",
      step2Desc: "यदि फोन 'Install unknown apps' की अनुमति मांगे, तो सेटिंग्स में जाकर क्रोम/ब्राउज़र को अनुमति दें।",
      step3Title: "3. इंस्टॉल करें और लॉगिन करें",
      step3Desc: "डाउनलोड की गई axivon-app.apk फाइल खोलें, 'Install' पर टैप करें और अपने Axivon अकाउंट से लॉगिन करें।",
      featuresHeading: "मोबाइल उत्पादकता के लिए विशेष रूप से निर्मित",
      featuresSub: "Axivon पोर्टल के सभी जरूरी फीचर्स, अब सीधे आपके स्मार्टफोन पर।",
      feature1Title: "स्मार्ट अटेंडेंस",
      feature1Desc: "1-टैप चेक-इन, ब्रेक टाइमर और ऑफिस जियोफेंसिंग के साथ अटेंडेंस लगाएं।",
      feature2Title: "टास्क ट्रैकिंग",
      feature2Desc: "दैनिक टास्क देखें, प्रोग्रेस अपडेट करें और समय पर काम पूरा करें।",
      feature3Title: "लीव मैनेजमेंट",
      feature3Desc: "छुट्टी के लिए अप्लाई करें, बैलेंस चेक करें और अप्रूवल स्थिति देखें।",
      feature4Title: "वर्क रिपोर्ट्स",
      feature4Desc: "दिनभर के काम की रिपोर्ट सीधे फोन से कुछ ही सेकंड में भेजें।",
      feature5Title: "अल्ट्रा-लो मोबाइल डेटा",
      feature5Desc: "प्रति सेशन 250 KB से भी कम डेटा की खपत।",
      feature6Title: "सुरक्षित लॉगिन",
      feature6Desc: "एंटरप्राइज-ग्रेड सिक्योरिटी और सुरक्षित सेशन प्रबंधन।",
      specsHeading: "सिस्टम आवश्यकताएं और पैकेज विवरण",
    },
  }[lang];

  return (
    <div className="relative min-h-screen bg-[#0B0D10] text-[#F3F5F7] overflow-hidden pt-28 pb-20">
      {/* Background ambient glowing orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-2/3 right-10 w-[450px] h-[450px] bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Top bar with language switcher */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-neutral-300 transition-colors shadow-sm"
          >
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>{lang === "en" ? "हिन्दी में देखें" : "View in English"}</span>
          </button>
        </div>

        {/* HERO SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{content.badge}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {content.title}
            </h1>

            <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {content.subtitle}
            </p>

            {/* Direct Download Call-to-Action */}
            <div className="pt-2 space-y-3 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a
                href="/download/axivon-app"
                download="axivon-app.apk"
                className="w-full sm:w-auto min-h-[52px] px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-[#04130E] font-bold text-base inline-flex items-center justify-center gap-3 transition-all duration-200 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/35 hover:-translate-y-0.5 cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>{content.downloadBtn}</span>
              </a>

              <a
                href="#how-to-install"
                className="w-full sm:w-auto min-h-[52px] px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white font-medium text-sm inline-flex items-center justify-center gap-2 transition-colors"
              >
                <span>{lang === "en" ? "Installation Guide" : "इंस्टॉल करने की विधि"}</span>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </a>
            </div>

            <div className="pt-2 flex items-center justify-center lg:justify-start gap-3 text-xs text-neutral-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{content.directInfo}</span>
            </div>
          </div>

          {/* QR Code & Phone Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm rounded-2xl bg-[#0E1116] border border-white/10 p-6 sm:p-7 shadow-2xl relative overflow-hidden space-y-5 text-center">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 inline-flex items-center justify-center mx-auto">
                <Smartphone className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">{content.qrTitle}</h3>
                <p className="mt-1 text-xs text-neutral-400 leading-relaxed">{content.qrDesc}</p>
              </div>

              <div className="flex justify-center p-3 bg-white rounded-xl shadow-inner w-fit mx-auto">
                <QrCodeSvg value={DOWNLOAD_PAGE_URL} size={160} />
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="text"
                    readOnly
                    value={DOWNLOAD_PAGE_URL}
                    className="flex-1 min-h-[40px] px-3 text-xs bg-black/40 border border-white/10 rounded-lg text-neutral-300 focus:outline-none select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="min-h-[40px] px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white inline-flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? content.copiedBtn : content.copyBtn}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3-STEP INSTALLATION GUIDE */}
        <div id="how-to-install" className="pt-8 border-t border-white/10 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {content.installHeading}
            </h2>
            <p className="text-sm text-neutral-400">
              {lang === "en"
                ? "Since this is a dedicated enterprise APK, follow these quick steps to get started."
                : "क्योंकि यह आधिकारिक एंटरप्राइज APK है, इन आसान स्टेप्स को फॉलो करें।"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl bg-[#0E1116] border border-white/10 p-6 space-y-3 relative">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-base font-semibold text-white">{content.step1Title}</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">{content.step1Desc}</p>
            </div>

            <div className="rounded-xl bg-[#0E1116] border border-white/10 p-6 space-y-3 relative">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-base font-semibold text-white">{content.step2Title}</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">{content.step2Desc}</p>
            </div>

            <div className="rounded-xl bg-[#0E1116] border border-white/10 p-6 space-y-3 relative">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-base font-semibold text-white">{content.step3Title}</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">{content.step3Desc}</p>
            </div>
          </div>
        </div>

        {/* KEY FEATURES GRID */}
        <div className="pt-8 border-t border-white/10 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {content.featuresHeading}
            </h2>
            <p className="text-sm text-neutral-400">{content.featuresSub}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-[#0E1116] border border-white/10 space-y-3">
              <Clock className="w-6 h-6 text-emerald-400" />
              <h3 className="text-base font-semibold text-white">{content.feature1Title}</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">{content.feature1Desc}</p>
            </div>

            <div className="p-6 rounded-xl bg-[#0E1116] border border-white/10 space-y-3">
              <CheckSquare className="w-6 h-6 text-emerald-400" />
              <h3 className="text-base font-semibold text-white">{content.feature2Title}</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">{content.feature2Desc}</p>
            </div>

            <div className="p-6 rounded-xl bg-[#0E1116] border border-white/10 space-y-3">
              <Calendar className="w-6 h-6 text-emerald-400" />
              <h3 className="text-base font-semibold text-white">{content.feature3Title}</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">{content.feature3Desc}</p>
            </div>

            <div className="p-6 rounded-xl bg-[#0E1116] border border-white/10 space-y-3">
              <FileText className="w-6 h-6 text-emerald-400" />
              <h3 className="text-base font-semibold text-white">{content.feature4Title}</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">{content.feature4Desc}</p>
            </div>

            <div className="p-6 rounded-xl bg-[#0E1116] border border-white/10 space-y-3">
              <Wifi className="w-6 h-6 text-emerald-400" />
              <h3 className="text-base font-semibold text-white">{content.feature5Title}</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">{content.feature5Desc}</p>
            </div>

            <div className="p-6 rounded-xl bg-[#0E1116] border border-white/10 space-y-3">
              <Lock className="w-6 h-6 text-emerald-400" />
              <h3 className="text-base font-semibold text-white">{content.feature6Title}</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">{content.feature6Desc}</p>
            </div>
          </div>
        </div>

        {/* SPECS & SYSTEM REQUIREMENTS TABLE */}
        <div className="pt-8 border-t border-white/10 space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white text-center">
            {content.specsHeading}
          </h2>

          <div className="max-w-2xl mx-auto rounded-xl bg-[#0E1116] border border-white/10 overflow-hidden divide-y divide-white/10 text-xs sm:text-sm">
            <div className="flex justify-between p-4">
              <span className="text-neutral-400">Application Name</span>
              <span className="text-white font-medium">Axivon Mobile</span>
            </div>
            <div className="flex justify-between p-4">
              <span className="text-neutral-400">Package Identifier</span>
              <span className="text-white font-mono text-xs">com.axivon.app</span>
            </div>
            <div className="flex justify-between p-4">
              <span className="text-neutral-400">Version</span>
              <span className="text-emerald-400 font-medium">{latestVersion}</span>
            </div>
            <div className="flex justify-between p-4">
              <span className="text-neutral-400">File Size</span>
              <span className="text-white font-medium">{sizeMb} MB</span>
            </div>
            <div className="flex justify-between p-4">
              <span className="text-neutral-400">Supported OS</span>
              <span className="text-white font-medium">Android 8.0 (Oreo) and above</span>
            </div>
            <div className="flex justify-between p-4">
              <span className="text-neutral-400">Release Channel</span>
              <span className="text-white font-medium">Direct APK Release</span>
            </div>
          </div>

          <div className="text-center pt-4">
            <a
              href="/download/axivon-app"
              download="axivon-app.apk"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-[#04130E] font-bold text-sm transition-all shadow-lg shadow-emerald-500/20"
            >
              <Download className="w-4 h-4" />
              <span>{content.downloadBtn}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
