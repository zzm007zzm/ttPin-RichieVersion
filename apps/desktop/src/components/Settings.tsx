/**
 * 设置页面组件
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SettingsProps {
  onClose: () => void;
  onConfigSaved: () => void;
}

type SettingsTab = 'translator' | 'openai';

// Helper functions for storage (Tauri Store with localStorage fallback)
async function loadFromStore<T>(key: string): Promise<T | null> {
  try {
    const { Store } = await import('@tauri-apps/plugin-store');
    const store = await Store.load('settings.json');
    const result = await store.get<T>(key);
    return result ?? null;
  } catch {
    // Fallback to localStorage in browser
    const value = localStorage.getItem(`ttpin.${key}`);
    return value ? JSON.parse(value) : null;
  }
}

async function saveToStore(key: string, value: string): Promise<void> {
  try {
    const { Store } = await import('@tauri-apps/plugin-store');
    const store = await Store.load('settings.json');
    await store.set(key, value);
    await store.save();
  } catch {
    // Fallback to localStorage in browser
    localStorage.setItem(`ttpin.${key}`, JSON.stringify(value));
  }
}

export function Settings({ onClose, onConfigSaved }: SettingsProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SettingsTab>('translator');
  
  // Translator settings
  const [endpoint, setEndpoint] = useState('');
  const [region, setRegion] = useState('');
  const [deploymentName, setDeploymentName] = useState('gpt-4o');
  
  // OpenAI settings
  const [openaiEndpoint, setOpenaiEndpoint] = useState('');
  const [openaiDeploymentName, setOpenaiDeploymentName] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load translator settings
        const savedEndpoint = await loadFromStore<string>('azure.translateEndpoint');
        const savedRegion = await loadFromStore<string>('azure.region');
        const savedDeployment = await loadFromStore<string>('azure.deploymentName');

        if (savedEndpoint) setEndpoint(savedEndpoint);
        if (savedRegion) setRegion(savedRegion);
        if (savedDeployment) setDeploymentName(savedDeployment);
        
        // Load OpenAI settings
        const savedOpenaiEndpoint = await loadFromStore<string>('azureOpenAI.endpoint');
        const savedOpenaiDeployment = await loadFromStore<string>('azureOpenAI.deploymentName');
        
        if (savedOpenaiEndpoint) setOpenaiEndpoint(savedOpenaiEndpoint);
        if (savedOpenaiDeployment) setOpenaiDeploymentName(savedOpenaiDeployment);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    // Validate based on active tab
    if (activeTab === 'translator') {
      if (!endpoint.trim() || !region.trim() || !deploymentName.trim()) {
        setErrorMessage(t('settings.error.requiredFields'));
        return;
      }
    } else if (activeTab === 'openai') {
      if (!openaiEndpoint.trim() || !openaiDeploymentName.trim()) {
        setErrorMessage(t('settings.error.requiredFields'));
        return;
      }
    }

    setSaving(true);

    try {
      if (activeTab === 'translator') {
        await saveToStore('azure.translateEndpoint', endpoint.trim());
        await saveToStore('azure.region', region.trim());
        await saveToStore('azure.deploymentName', deploymentName.trim());
      } else if (activeTab === 'openai') {
        await saveToStore('azureOpenAI.endpoint', openaiEndpoint.trim());
        await saveToStore('azureOpenAI.deploymentName', openaiDeploymentName.trim());
      }

      setSuccessMessage(t('settings.success.saved'));
      onConfigSaved();

      setTimeout(() => {
        setSuccessMessage('');
      }, 2000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ttPinSettings">
      <div className="ttPinSettingsHeader">
        <h2>{t('settings.title')}</h2>
        <button className="ttPinCloseButton" onClick={onClose} aria-label={t('common.close')}>
          ✕
        </button>
      </div>

      <div className="ttPinSettingsTabs">
        <button
          className={`ttPinSettingsTab ${activeTab === 'translator' ? 'ttPinSettingsTab--active' : ''}`}
          onClick={() => setActiveTab('translator')}
        >
          {t('settings.tab.translator')}
        </button>
        <button
          className={`ttPinSettingsTab ${activeTab === 'openai' ? 'ttPinSettingsTab--active' : ''}`}
          onClick={() => setActiveTab('openai')}
        >
          {t('settings.tab.openai')}
        </button>
      </div>

      <div className="ttPinSettingsContent">
        {activeTab === 'translator' && (
          <div className="ttPinSettingsSection">
            <h3>{t('settings.azure.title')}</h3>
            <p className="ttPinSettingsDescription">{t('settings.azure.description')}</p>

            <div className="ttPinFormGroup">
              <label htmlFor="translateEndpoint">{t('settings.azure.translateEndpoint')} *</label>
              <input
                id="translateEndpoint"
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="https://xxxx.services.ai.azure.com/"
                className="ttPinInput"
              />
            </div>

            <div className="ttPinFormGroup">

              <label htmlFor="region">{t('settings.azure.region')} *</label>
              <input
                id="region"
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="eastus / westus2 / ..."
                className="ttPinInput"
              />
            </div>

            <div className="ttPinFormGroup">
              <label htmlFor="deploymentName">{t('settings.azure.deploymentName')} *</label>
              <input
                id="deploymentName"
                type="text"
                value={deploymentName}
                onChange={(e) => setDeploymentName(e.target.value)}
                placeholder="gpt-4o"
                className="ttPinInput"
              />
              <small className="ttPinHelpText">{t('settings.azure.deploymentNameHelp')}</small>
            </div>
          </div>
        )}

        {activeTab === 'openai' && (
          <div className="ttPinSettingsSection">
            <h3>{t('settings.openai.title')}</h3>
            <p className="ttPinSettingsDescription">{t('settings.openai.description')}</p>

            <div className="ttPinFormGroup">
              <label htmlFor="openaiEndpoint">{t('settings.openai.endpoint')} *</label>
              <input
                id="openaiEndpoint"
                type="text"
                value={openaiEndpoint}
                onChange={(e) => setOpenaiEndpoint(e.target.value)}
                placeholder="https://your-resource.openai.azure.com"
                className="ttPinInput"
              />
              <small className="ttPinHelpText">{t('settings.openai.endpointHelp')}</small>
            </div>

            <div className="ttPinFormGroup">
              <label htmlFor="openaiDeploymentName">{t('settings.openai.deploymentName')} *</label>
              <input
                id="openaiDeploymentName"
                type="text"
                value={openaiDeploymentName}
                onChange={(e) => setOpenaiDeploymentName(e.target.value)}
                placeholder="gpt-4o"
                className="ttPinInput"
              />
              <small className="ttPinHelpText">{t('settings.openai.deploymentNameHelp')}</small>
            </div>
          </div>
        )}

        {errorMessage && <div className="ttPinErrorMessage">{errorMessage}</div>}
        {successMessage && <div className="ttPinSuccessMessage">{successMessage}</div>}

        <div className="ttPinSettingsActions">
          <button className="ttPinButton ttPinButtonSecondary" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button className="ttPinButton ttPinButtonPrimary" onClick={handleSave} disabled={saving}>
            {saving ? t('common.saving') : t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
