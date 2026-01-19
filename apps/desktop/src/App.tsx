import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Store } from '@tauri-apps/plugin-store';
import { translatorService, type AzureConfig, type SupportedLanguage } from './services/azureTranslator';
import { vocabularyService } from './services/vocabularyService';
import { Settings } from './components/Settings';
import { VocabularyPanel } from './components/VocabularyPanel';
import logoUrl from './assets/logo.png';

async function loadTranslatorConfigFromStore(): Promise<AzureConfig | null> {
  try {
    const store = await Store.load('settings.json');
    const endpoint = await store.get<string>('azure.translateEndpoint');
    const key = await store.get<string>('azure.key');
    const region = await store.get<string>('azure.region');
    const deploymentName = await store.get<string>('azure.deploymentName');

    if (!endpoint || !key || !region) return null;
    return {
      translateEndpoint: endpoint,
      key,
      region,
      deploymentName: deploymentName || 'gpt-4o',
    };
  } catch {
    return null;
  }
}

function App() {
  const { t, i18n } = useTranslation();
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [sourceLang, setSourceLang] = useState<string>('en');
  const [targetLang, setTargetLang] = useState<string>('zh-Hans');
  const [languages, setLanguages] = useState<SupportedLanguage[]>([]);
  const [loadingLanguages, setLoadingLanguages] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [pinned, setPinned] = useState<boolean>(() => {
    const raw = window.localStorage.getItem('ttPinAlwaysOnTop');
    if (raw === null) return true;
    return raw === 'true';
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [savingWord, setSavingWord] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const sourceRef = useRef<HTMLTextAreaElement | null>(null);
  const targetOutputRef = useRef<HTMLDivElement | null>(null);
  const targetTextRef = useRef<HTMLDivElement | null>(null);

  const setAlwaysOnTop = async (enabled: boolean) => {
    try {
      const mod = await import('@tauri-apps/api/core');
      await mod.invoke('set_always_on_top', { enabled });
    } catch {
      // Ignore when not running in Tauri.
    }
  };

  const minimizeWindow = async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().minimize();
    } catch (e) {
      console.error('Failed to minimize:', e);
    }
  };

  const toggleMaximize = async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const appWindow = getCurrentWindow();
      const maximized = await appWindow.isMaximized();
      if (maximized) {
        await appWindow.unmaximize();
      } else {
        await appWindow.maximize();
      }
      setIsMaximized(!maximized);
    } catch (e) {
      console.error('Failed to toggle maximize:', e);
    }
  };

  const closeWindow = async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().hide();
    } catch (e) {
      console.error('Failed to close:', e);
    }
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'zh' ? 'en' : 'zh');
  };

  useEffect(() => {
    const loadConfig = async () => {
      // 只从 Tauri Store 加载：避免把开发机的 .env.local 配置打进发布包里
      const config = await loadTranslatorConfigFromStore();
      if (config) {
        translatorService.setConfig(config);
      }
    };
    void loadConfig();
  }, []);

  const handleConfigSaved = async () => {
    // 重新加载配置和语言列表
    const config = await loadTranslatorConfigFromStore();
    if (config) {
      translatorService.setConfig(config);
      setErrorMessage('');
      // 重新获取语言列表
      try {
        setLoadingLanguages(true);
        const list = await translatorService.fetchSupportedLanguages({ forceRefresh: true });
        setLanguages(list);
      } catch (e) {
        setErrorMessage(e instanceof Error ? e.message : String(e));
      } finally {
        setLoadingLanguages(false);
      }
    }
  };

  useEffect(() => {
    void setAlwaysOnTop(pinned);
    window.localStorage.setItem('ttPinAlwaysOnTop', String(pinned));
  }, [pinned]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoadingLanguages(true);
      setErrorMessage('');
      try {
        const list = await translatorService.fetchSupportedLanguages();
        if (cancelled) return;
        setLanguages(list);

        if (list.length > 0) {
          if (!list.some((l) => l.code === sourceLang)) setSourceLang(list[0].code);
          if (!list.some((l) => l.code === targetLang)) setTargetLang(list[0].code);
        }
      } catch (e) {
        if (cancelled) return;
        setErrorMessage(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoadingLanguages(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onTranslate = async () => {
    setErrorMessage('');
    setTargetText('');
    const text = sourceText.trim();
    if (!text) return;

    if (!translatorService.isConfigured()) {
      setErrorMessage(
        '未检测到翻译配置，请先在【设置】中填写 Azure 翻译配置。'
      );
      return;
    }

    setTranslating(true);
    try {
      const result = await translatorService.translate({
        text,
        from: sourceLang,
        to: targetLang,
      });
      setTargetText(result.translatedText);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : String(e));
    } finally {
      setTranslating(false);
    }
  };

  const onSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);

    // Keep the user's flow: swap texts too.
    setSourceText(targetText);
    setTargetText(sourceText);
    setErrorMessage('');
  };

  const onClearSource = () => {
    setSourceText('');
    setTargetText('');
    setErrorMessage('');
    setTimeout(() => sourceRef.current?.focus(), 0);
  };

  const onCopyTarget = async () => {
    const text = targetText.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for environments without clipboard permission.
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const onSaveToVocabulary = async () => {
    const word = sourceText.trim();
    const translation = targetText.trim();
    if (!word || !translation) return;

    setSavingWord(true);
    setErrorMessage('');

    try {
      const isDuplicate = await vocabularyService.checkDuplicate(word, sourceLang, targetLang);
      if (isDuplicate) {
        setErrorMessage(t('vocabulary.duplicateWord'));
        setSavingWord(false);
        return;
      }

      await vocabularyService.addWord({
        word,
        translation,
        sourceLang,
        targetLang,
      });

      // 短暂显示成功消息
      const successMsg = t('vocabulary.wordSaved');
      setErrorMessage('');
      setCopied(true); // 复用复制成功的提示样式
      window.setTimeout(() => setCopied(false), 1200);
      console.log(successMsg);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : String(e));
    } finally {
      setSavingWord(false);
    }
  };

  const onSourceKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      void onTranslate();
    }
  };

  const fitSourceText = () => {
    const el = sourceRef.current;
    if (!el) return;

    // Let CSS define the base size (fluid with window). Only shrink on overflow.
    el.style.fontSize = '';
    const base = Number.parseFloat(window.getComputedStyle(el).fontSize) || 18;
    const MAX = Math.round(base);
    const MIN = 12;
    const EPS = 1;

    let size = MAX;

    // If content overflows, shrink until it fits (or hits min).
    el.style.fontSize = `${size}px`;

    while (size > MIN && (el.scrollHeight > el.clientHeight + EPS || el.scrollWidth > el.clientWidth + EPS)) {
      size -= 1;
      el.style.fontSize = `${size}px`;
    }

  };

  const fitTargetText = () => {
    const container = targetOutputRef.current;
    const textEl = targetTextRef.current;
    if (!container || !textEl) return;

    // Let CSS define the base size (fluid with window). Only shrink on overflow.
    textEl.style.fontSize = '';
    const base = Number.parseFloat(window.getComputedStyle(textEl).fontSize) || 20;
    const MAX = Math.round(base);
    const MIN = 12;
    const EPS = 1;

    // Start from base each time so resizing larger restores readability.
    let size = MAX;
    textEl.style.fontSize = `${size}px`;

    // If content overflows, shrink until it fits (or hits min).
    while (
      size > MIN &&
      (container.scrollHeight > container.clientHeight + EPS || container.scrollWidth > container.clientWidth + EPS)
    ) {
      size -= 1;
      textEl.style.fontSize = `${size}px`;
    }

  };

  useEffect(() => {
    if (!targetText) {
      const el = targetTextRef.current;
      if (el) el.style.fontSize = '';
      return;
    }

    const raf = window.requestAnimationFrame(() => fitTargetText());

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => fitTargetText());
      if (targetOutputRef.current) ro.observe(targetOutputRef.current);
    }

    return () => {
      window.cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
    };
  }, [targetText]);

  useEffect(() => {
    if (!sourceText) {
      const el = sourceRef.current;
      if (el) el.style.fontSize = '';
      return;
    }

    const raf = window.requestAnimationFrame(() => fitSourceText());

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => fitSourceText());
      if (sourceRef.current) ro.observe(sourceRef.current);
    }

    return () => {
      window.cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
    };
  }, [sourceText]);

  return (
    <div className="ttPinApp">
      <div className="ttPinTitleBar" data-tauri-drag-region>
        <div className="ttPinTitleBarLeft" data-tauri-drag-region>
          <span className="ttPinTitleBarTitle" data-tauri-drag-region>ttPin</span>
        </div>
        <div className="ttPinTitleBarControls">
          <button
            className="ttPinTitleBarButton"
            onClick={minimizeWindow}
            aria-label="Minimize"
            type="button"
          >
            <span className="ttPinTitleBarIcon ttPinTitleBarIcon--min" aria-hidden="true">⛶</span>
          </button>
          <button
            className="ttPinTitleBarButton"
            onClick={toggleMaximize}
            aria-label={isMaximized ? 'Restore' : 'Maximize'}
            type="button"
          >
            {isMaximized ? (
              <span className="ttPinTitleBarIcon ttPinTitleBarIcon--restore" aria-hidden="true">
                <svg viewBox="0 0 18 18" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Lower half inset corners, mirrored to the upper half */}
                  <g stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none">
                    {/* bottom */}
                    <path d="M4.2 11.0 A2.8 2.8 0 0 1 7.0 13.8" />
                    <path d="M13.8 11.0 A2.8 2.8 0 0 0 11.0 13.8" />
                    {/* top = vertical mirror of bottom */}
                    <g transform="translate(0 18) scale(1 -1)">
                      <path d="M4.2 11.0 A2.8 2.8 0 0 1 7.0 13.8" />
                      <path d="M13.8 11.0 A2.8 2.8 0 0 0 11.0 13.8" />
                    </g>
                  </g>
                </svg>
              </span>
            ) : (
              <span className="ttPinTitleBarIcon" aria-hidden="true">⛶</span>
            )}
          </button>
          <button
            className="ttPinTitleBarButton ttPinTitleBarButton--close"
            onClick={closeWindow}
            aria-label="Close"
            type="button"
          >
            <span className="ttPinTitleBarIcon ttPinTitleBarIcon--close" aria-hidden="true">⛶</span>
          </button>
        </div>
      </div>
      <header className="ttPinHeader">
        <div className="ttPinBrand">
          <div className="ttPinBrandRow">
            <img className="ttPinLogo" src={logoUrl} alt="ttPin" />
            <div>
              <div className="ttPinBrandTitle">ttPin</div>
              <div className="ttPinBrandSub">{t('uiSubtitle')}</div>
            </div>
          </div>
        </div>

        <div className="ttPinHeaderActions">
          <button
            className="ttPinIconBtn"
            onClick={() => setShowVocabulary(true)}
            aria-label={t('vocabulary.title')}
            title={t('vocabulary.title')}
            type="button"
          >
            <span aria-hidden="true">📖</span>
          </button>

          <button
            className="ttPinIconBtn"
            onClick={() => setShowSettings(true)}
            aria-label={t('settings.title')}
            title={t('settings.title')}
            type="button"
          >
            <span aria-hidden="true">⚙️</span>
          </button>

          <button
            className="ttPinPinToggle"
            onClick={() => setPinned((v) => !v)}
            aria-label={pinned ? t('uiUnpin') : t('uiPin')}
            title={pinned ? t('uiUnpin') : t('uiPin')}
            type="button"
          >
            <span aria-hidden="true">{pinned ? '📌' : '📍'}</span>
          </button>

          <button className="ttPinLangToggle" onClick={toggleLanguage} aria-label="Toggle UI language" type="button">
            {i18n.language === 'zh' ? 'EN' : '中'}
          </button>
        </div>
      </header>
      <div className="ttPinScroll">
        <section className="ttPinLanguageBar" aria-label="Language selection">
          <div className="ttPinSelectWrap">
            <select
              className="ttPinSelect"
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              disabled={loadingLanguages}
              aria-label={t('sourceLanguage')}
            >
              {languages.length === 0 ? (
                <option value="">{loadingLanguages ? t('uiLoadingLanguages') : t('uiNoLanguages')}</option>
              ) : (
                languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.displayName}
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            className="ttPinSwap"
            type="button"
            onClick={onSwapLanguages}
            aria-label={t('uiSwapLanguages')}
            title={t('uiSwapLanguages')}
            disabled={loadingLanguages}
          >
            <span aria-hidden="true">⇄</span>
          </button>

          <div className="ttPinSelectWrap">
            <select
              className="ttPinSelect"
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              disabled={loadingLanguages}
              aria-label={t('targetLanguage')}
            >
              {languages.length === 0 ? (
                <option value="">{loadingLanguages ? t('uiLoadingLanguages') : t('uiNoLanguages')}</option>
              ) : (
                languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.displayName}
                  </option>
                ))
              )}
            </select>
          </div>
        </section>

        <main className="ttPinPanels" aria-label="Translate panels">
          <section className="ttPinPanel ttPinPanel--source" aria-label={t('sourceLanguage')}>
            <textarea
              ref={sourceRef}
              className="ttPinTextarea"
              placeholder={t('uiSourcePlaceholder')}
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              onKeyDown={onSourceKeyDown}
            />

            <div className="ttPinPanelFooter">
              <div className="ttPinFooterLeft">
                <button
                  className="ttPinPrimaryBtn"
                  type="button"
                  onClick={() => void onTranslate()}
                  disabled={translating || !sourceText.trim()}
                >
                  {translating ? t('uiTranslating') : t('translate')}
                </button>
              </div>
              <div className="ttPinFooterRight">
                <div className="ttPinHint">{t('uiShortcutHint')}</div>
                {sourceText.trim() ? (
                  <button
                    className="ttPinIconBtn ttPinIconBtn--small"
                    type="button"
                    onClick={onClearSource}
                    aria-label={t('uiClear')}
                    title={t('uiClear')}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                ) : (
                  <div />
                )}
              </div>
            </div>
          </section>

          <section className="ttPinPanel ttPinPanel--target" aria-label={t('targetLanguage')}>
            <div className="ttPinOutput" ref={targetOutputRef} role="textbox" aria-readonly="true">
              {targetText ? (
                <div
                  ref={targetTextRef}
                  className="ttPinOutputText"
                >
                  {targetText}
                </div>
              ) : (
                <div className="ttPinOutputPlaceholder">{t('uiTargetPlaceholder')}</div>
              )}
            </div>

            <div className="ttPinPanelFooter">
              <div className="ttPinFooterLeft">
                {copied ? <div className="ttPinToast">{t('uiCopied')}</div> : (
                  <button
                    className="ttPinSecondaryBtn ttPinSecondaryBtn--small"
                    type="button"
                    onClick={() => void onSaveToVocabulary()}
                    disabled={!targetText.trim() || savingWord}
                    title={t('vocabulary.addToVocabulary')}
                  >
                    {savingWord ? t('common.saving') : '📖 ' + t('vocabulary.addToVocabulary')}
                  </button>
                )}
              </div>
              <div className="ttPinFooterRight">
                <button
                  className="ttPinIconBtn ttPinIconBtn--small"
                  type="button"
                  onClick={() => void onCopyTarget()}
                  aria-label={t('uiCopy')}
                  title={t('uiCopy')}
                  disabled={!targetText.trim()}
                >
                  <span aria-hidden="true">⧉</span>
                </button>
              </div>
            </div>
          </section>
        </main>

        {errorMessage ? (
          <div className="ttPinError" role="alert">
            {errorMessage}
          </div>
        ) : null}
      </div>

      {showSettings && (
        <div className="ttPinOverlay">
          <Settings onClose={() => setShowSettings(false)} onConfigSaved={handleConfigSaved} />
        </div>
      )}

      {showVocabulary && (
        <div className="ttPinOverlay">
          <VocabularyPanel onClose={() => setShowVocabulary(false)} />
        </div>
      )}
    </div>
  );
}

export default App;
