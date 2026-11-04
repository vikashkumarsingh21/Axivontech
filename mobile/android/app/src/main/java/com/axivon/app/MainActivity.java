package com.axivon.app;

import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Ensure CookieManager accepts cookies for persistent sessions across app restarts
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
    }

    @Override
    public void onStart() {
        super.onStart();
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();
            CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        // Flush cookies from memory to persistent disk storage immediately
        CookieManager.getInstance().flush();
    }

    @Override
    public void onStop() {
        super.onStop();
        // Ensure disk persistence when activity stops
        CookieManager.getInstance().flush();
    }

    @Override
    public void onDestroy() {
        CookieManager.getInstance().flush();
        super.onDestroy();
    }
}
