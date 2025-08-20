import React, { useEffect, useState } from 'react';
import Parcel from 'single-spa-react/parcel';
import * as styles from '@/styles/scss/LazyParcelLoader.module.scss';

interface LazyParcelLoaderProps {
  parcelUrl: string;
  parcelProps?: Record<string, any>;
  mountParcel?: any;
  retryKey?: any;
  setRetryKey?: (key: any) => void;
}

const LazyParcelLoader: React.FC<LazyParcelLoaderProps> = ({ retryKey, setRetryKey, parcelUrl, mountParcel, parcelProps = {} }) => {
  const [config, setConfig] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  function resolveImportMapUrl(specifier: string): string | null {
    const importMapScript = document.querySelector<HTMLScriptElement>('script[type="importmap"]');
    if (!importMapScript) return null;

    try {
      const importMap = JSON.parse(importMapScript.textContent || '{}');
      if (importMap.imports && importMap.imports[specifier]) {
        return importMap.imports[specifier];
      }
    } catch {
      // ignore parse errors
    }
    return null;
  }

  useEffect(() => {
    let cancelled = false;

    setConfig(null);
    setError(null);

    const loadModule = async () => {
      try {
        let resolvedUrl = parcelUrl;

        // If it's an import-map specifier, resolve it
        if (!/^https?:\/\//.test(parcelUrl)) {
          const mappedUrl = resolveImportMapUrl(parcelUrl);
          if (!mappedUrl) throw new Error(`Cannot resolve ${parcelUrl} from import map`);
          resolvedUrl = mappedUrl;
        }

        // Add cache-busting param
        const bustUrl = `${resolvedUrl}${resolvedUrl.includes('?') ? '&' : '?'}_t=${retryKey}`;        

        const mod = await import(/* webpackIgnore: true */ bustUrl);
        if (!cancelled) setConfig(mod);
      } catch (err) {
        console.error(`Failed to load parcel: ${parcelUrl}`, err);
        if (!cancelled) setError(err);
      }
    };

    loadModule();

    return () => {
      cancelled = true;
    };
  }, [parcelUrl, retryKey]);


  if (error) {
    return (
      <div className={styles.loaderContainer}>
        <div className={styles.errorBox}>
          <strong>Unable to load module</strong>
          <p style={{ margin: '0.5rem 0' }}>
            We couldn't load the remote parcel from:
            <br />
            <code className={styles.errorCode}>{parcelUrl}</code>
          </p>
          <button
            className={styles.retryButton}
            onClick={() => setRetryKey((prev : number) => prev + 1)}
          >
            🔄 Retry Loading
          </button>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className={styles.loaderContainer}>
        <div className={styles.loadingBox}>
          <strong>Loading module</strong>
          <p className={styles.loadingMessage}>
            Initializing remote parcel from:
            <br />
            <code className={styles.loadingCode}>{parcelUrl}</code>
          </p>
        </div>
      </div>
    );
  }

  return <Parcel config={config} mountParcel={mountParcel} {...parcelProps} />;
};

export default LazyParcelLoader;
