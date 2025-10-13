import React from 'react';
import { useAndroidAdaptation } from '../hooks/useAndroidAdaptation';
import { isAndroid, isIOS, isTelegramWebApp } from '../utils/platform';

const AndroidTestPanel = () => {
  const { isAndroidDevice, isWebApp, isAndroidWebApp, styles, classes } = useAndroidAdaptation();
  const isIOSDevice = isIOS();
  
  const platformInfo = {
    isAndroid: isAndroid(),
    isIOS: isIOS(),
    isTelegramWebApp: isTelegramWebApp(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'
  };

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50 max-w-xs">
      <div className="font-bold mb-2">🔧 Android Test Panel</div>
      
      <div className="space-y-1">
        <div><strong>Platform:</strong></div>
        <div>• Android: {platformInfo.isAndroid ? '✅' : '❌'}</div>
        <div>• iOS: {platformInfo.isIOS ? '✅' : '❌'}</div>
        <div>• Telegram WebApp: {platformInfo.isTelegramWebApp ? '✅' : '❌'}</div>
        
        <div className="mt-2"><strong>Adaptation:</strong></div>
        <div>• Android Device: {isAndroidDevice ? '✅' : '❌'}</div>
        <div>• iOS Device: {isIOSDevice ? '✅' : '❌'}</div>
        <div>• Web App: {isWebApp ? '✅' : '❌'}</div>
        <div>• Android WebApp: {isAndroidWebApp ? '✅' : '❌'}</div>
        
        <div className="mt-2"><strong>Styles:</strong></div>
        <div>• Container: {JSON.stringify(styles.container, null, 0)}</div>
        <div>• Header: {JSON.stringify(styles.header, null, 0)}</div>
        <div>• Bottom: {JSON.stringify(styles.bottomNav, null, 0)}</div>
        
        <div className="mt-2"><strong>Classes:</strong></div>
        <div>• Container: {classes.container}</div>
        <div>• Header: {classes.header}</div>
        <div>• Bottom: {classes.bottomNav}</div>
      </div>
    </div>
  );
};

export default AndroidTestPanel;
