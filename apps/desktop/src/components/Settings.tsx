/**
 * 设置页面组件
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Store } from '@tauri-apps/plugin-store';

interface SettingsProps {
  onClose: () => void;
  onConfigSaved: () => void;
}

export function Settings({ onClose, onConfigSaved }: SettingsProps) {
  const { t } = useTranslation();
  const [endpoint, setEndpoint] = useState('');
  const [key, setKey] = useState('');
  const [region, setRegion] = useState('');
  const [deploymentName, setDeploymentName] = useState('gpt-4o');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const store = await Store.load('settings.json');
        const savedEndpoint = await store.get<string>('azure.translateEndpoint');
        const savedKey = await store.get<string>('azure.key');
        const savedRegion = await store.get<string>('azure.region');
        const savedDeployment = await store.get<string>('azure.deploymentName');

        if (savedEndpoint) setEndpoint(savedEndpoint);
        if (savedKey) setKey(savedKey);
        if (savedRegion) setRegion(savedRegion);
        if (savedDeployment) setDeploymentName(savedDeployment);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!endpoint.trim() || !key.trim() || !region.trim() || !deploymentName.trim()) {
      setErrorMessage(t('settings.error.requiredFields'));
      return;
    }

    setSaving(true);

    try {
      const store = await Store.load('settings.json');
      await store.set('azure.translateEndpoint', endpoint.trim());
      await store.set('azure.key', key.trim());
      await store.set('azure.region', region.trim());
      await store.set('azure.deploymentName', deploymentName.trim());
      await store.save();

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

      <div className="ttPinSettingsContent">
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
            <label htmlFor="key">{t('settings.azure.key')} *</label>
            <input
              id="key"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="ocp-apim-subscription-key"
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
