/**
 * 设置页面组件
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { translatorService, type AuthMode } from '../services/azureTranslator';

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
  const [authMode, setAuthMode] = useState<AuthMode>('key');
  const [endpoint, setEndpoint] = useState('');
  const [key, setKey] = useState('');
  const [region, setRegion] = useState('');
  const [deploymentName, setDeploymentName] = useState('gpt-4o');
  // Entra fields
  const [tenantId, setTenantId] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [resourceId, setResourceId] = useState('');
  // Azure CLI login state
  const [azCliLoggedIn, setAzCliLoggedIn] = useState(false);
  const [azCliChecking, setAzCliChecking] = useState(false);
  
  // OpenAI settings
  const [openaiAuthMode, setOpenaiAuthMode] = useState<AuthMode>('key');
  const [openaiEndpoint, setOpenaiEndpoint] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [openaiDeploymentName, setOpenaiDeploymentName] = useState('');
  const [openaiTenantId, setOpenaiTenantId] = useState('');
  const [openaiClientId, setOpenaiClientId] = useState('');
  const [openaiClientSecret, setOpenaiClientSecret] = useState('');
  const [openaiAzCliLoggedIn, setOpenaiAzCliLoggedIn] = useState(false);
  const [openaiAzCliChecking, setOpenaiAzCliChecking] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load translator settings
        const savedAuthMode = await loadFromStore<AuthMode>('azure.authMode');
        const savedEndpoint = await loadFromStore<string>('azure.translateEndpoint');
        const savedKey = await loadFromStore<string>('azure.key');
        const savedRegion = await loadFromStore<string>('azure.region');
        const savedDeployment = await loadFromStore<string>('azure.deploymentName');
        const savedTenantId = await loadFromStore<string>('azure.tenantId');
        const savedClientId = await loadFromStore<string>('azure.clientId');
        const savedClientSecret = await loadFromStore<string>('azure.clientSecret');
        const savedResourceId = await loadFromStore<string>('azure.resourceId');

        if (savedAuthMode) setAuthMode(savedAuthMode);
        if (savedEndpoint) setEndpoint(savedEndpoint);
        if (savedKey) setKey(savedKey);
        if (savedRegion) setRegion(savedRegion);
        if (savedDeployment) setDeploymentName(savedDeployment);
        if (savedTenantId) setTenantId(savedTenantId);
        if (savedClientId) setClientId(savedClientId);
        if (savedClientSecret) setClientSecret(savedClientSecret);
        if (savedResourceId) setResourceId(savedResourceId);

        // Check if az-cli is logged in
        if (savedAuthMode === 'entra-az-cli') {
          try {
            await translatorService.azCliCheckLogin();
            setAzCliLoggedIn(true);
          } catch {
            setAzCliLoggedIn(false);
          }
        }
        // Check if client-credentials token is valid
        if (savedAuthMode === 'entra-client-credentials') {
          const hasToken = await translatorService.entraTokenStatus();
          setAzCliLoggedIn(hasToken);
        }
        
        // Load OpenAI settings
        const savedOpenaiAuthMode = await loadFromStore<AuthMode>('azureOpenAI.authMode');
        const savedOpenaiEndpoint = await loadFromStore<string>('azureOpenAI.endpoint');
        const savedOpenaiKey = await loadFromStore<string>('azureOpenAI.key');
        const savedOpenaiDeployment = await loadFromStore<string>('azureOpenAI.deploymentName');
        const savedOpenaiTenantId = await loadFromStore<string>('azureOpenAI.tenantId');
        const savedOpenaiClientId = await loadFromStore<string>('azureOpenAI.clientId');
        const savedOpenaiClientSecret = await loadFromStore<string>('azureOpenAI.clientSecret');
        
        if (savedOpenaiAuthMode) setOpenaiAuthMode(savedOpenaiAuthMode);
        if (savedOpenaiEndpoint) setOpenaiEndpoint(savedOpenaiEndpoint);
        if (savedOpenaiKey) setOpenaiKey(savedOpenaiKey);
        if (savedOpenaiDeployment) setOpenaiDeploymentName(savedOpenaiDeployment);
        if (savedOpenaiTenantId) setOpenaiTenantId(savedOpenaiTenantId);
        if (savedOpenaiClientId) setOpenaiClientId(savedOpenaiClientId);
        if (savedOpenaiClientSecret) setOpenaiClientSecret(savedOpenaiClientSecret);

        if (savedOpenaiAuthMode === 'entra-az-cli') {
          try {
            await translatorService.azCliCheckLogin();
            setOpenaiAzCliLoggedIn(true);
          } catch {
            setOpenaiAzCliLoggedIn(false);
          }
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  const isEntra = authMode.startsWith('entra');
  const isAzCli = authMode === 'entra-az-cli';
  const isClientCredentials = authMode === 'entra-client-credentials';
  const isOpenAIEntra = openaiAuthMode.startsWith('entra');
  const isOpenAIAzCli = openaiAuthMode === 'entra-az-cli';
  const isOpenAIClientCredentials = openaiAuthMode === 'entra-client-credentials';

  const handleSave = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (activeTab === 'translator') {
      // Validate required fields based on auth mode
      if (!endpoint.trim() || !deploymentName.trim()) {
        setErrorMessage(t('settings.error.requiredFields'));
        return;
      }

      if (authMode === 'key') {
        if (!key.trim() || !region.trim()) {
          setErrorMessage(t('settings.error.requiredFields'));
          return;
        }
      } else if (isAzCli) {
        if (!region.trim()) {
          setErrorMessage(t('settings.error.requiredFields'));
          return;
        }
      } else if (isClientCredentials) {
        if (!tenantId.trim() || !clientId.trim() || !clientSecret.trim()) {
          setErrorMessage(t('settings.error.requiredFields'));
          return;
        }
      }
    } else if (activeTab === 'openai') {
      if (!openaiEndpoint.trim() || !openaiDeploymentName.trim()) {
        setErrorMessage(t('settings.error.requiredFields'));
        return;
      }

      if (openaiAuthMode === 'key') {
        if (!openaiKey.trim()) {
          setErrorMessage(t('settings.error.requiredFields'));
          return;
        }
      } else if (isOpenAIClientCredentials) {
        if (!openaiTenantId.trim() || !openaiClientId.trim() || !openaiClientSecret.trim()) {
          setErrorMessage(t('settings.error.requiredFields'));
          return;
        }
      }
    }

    setSaving(true);

    try {
      if (activeTab === 'translator') {
        // For client-credentials, acquire token before saving
        if (isClientCredentials) {
          await translatorService.entraAcquireClientCredentials(
            tenantId.trim(),
            clientId.trim(),
            clientSecret.trim(),
          );
          setAzCliLoggedIn(true);
        }

        await saveToStore('azure.authMode', authMode);
        await saveToStore('azure.translateEndpoint', endpoint.trim());
        await saveToStore('azure.key', key.trim());
        await saveToStore('azure.region', region.trim());
        await saveToStore('azure.deploymentName', deploymentName.trim());
        await saveToStore('azure.tenantId', tenantId.trim());
        await saveToStore('azure.clientId', clientId.trim());
        await saveToStore('azure.clientSecret', clientSecret.trim());
        await saveToStore('azure.resourceId', resourceId.trim());
      } else if (activeTab === 'openai') {
        await saveToStore('azureOpenAI.authMode', openaiAuthMode);
        await saveToStore('azureOpenAI.endpoint', openaiEndpoint.trim());
        await saveToStore('azureOpenAI.key', openaiKey.trim());
        await saveToStore('azureOpenAI.deploymentName', openaiDeploymentName.trim());
        await saveToStore('azureOpenAI.tenantId', openaiTenantId.trim());
        await saveToStore('azureOpenAI.clientId', openaiClientId.trim());
        await saveToStore('azureOpenAI.clientSecret', openaiClientSecret.trim());
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

  const handleAzCliCheck = async () => {
    setErrorMessage('');
    setAzCliChecking(true);
    try {
      await translatorService.azCliCheckLogin();
      setAzCliLoggedIn(true);
    } catch (error) {
      setAzCliLoggedIn(false);
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setAzCliChecking(false);
    }
  };

  const handleAuthModeChange = async (mode: AuthMode) => {
    setAuthMode(mode);
    setErrorMessage('');
    setSuccessMessage('');
    // Clear token when switching modes
    if (mode !== authMode) {
      await translatorService.entraClearToken();
      setAzCliLoggedIn(false);
      setAzCliChecking(false);
    }
  };

  const handleOpenAIAzCliCheck = async () => {
    setErrorMessage('');
    setOpenaiAzCliChecking(true);
    try {
      await translatorService.azCliCheckLogin();
      setOpenaiAzCliLoggedIn(true);
    } catch (error) {
      setOpenaiAzCliLoggedIn(false);
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setOpenaiAzCliChecking(false);
    }
  };

  const handleOpenAIAuthModeChange = (mode: AuthMode) => {
    setOpenaiAuthMode(mode);
    setErrorMessage('');
    setSuccessMessage('');
    if (mode !== 'entra-az-cli') {
      setOpenaiAzCliLoggedIn(false);
      setOpenaiAzCliChecking(false);
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

            {/* Auth Mode Selector */}
            <div className="ttPinFormGroup">
              <label>{t('settings.azure.authMode')}</label>
              <div className="ttPinRadioGroup">
                <label className="ttPinRadioLabel">
                  <input
                    type="radio"
                    name="authMode"
                    value="key"
                    checked={authMode === 'key'}
                    onChange={() => handleAuthModeChange('key')}
                  />
                  {t('settings.azure.authModeKey')}
                </label>
                <label className="ttPinRadioLabel">
                  <input
                    type="radio"
                    name="authMode"
                    value="entra-az-cli"
                    checked={authMode === 'entra-az-cli'}
                    onChange={() => handleAuthModeChange('entra-az-cli')}
                  />
                  {t('settings.azure.authModeAzCli')}
                </label>
                <label className="ttPinRadioLabel">
                  <input
                    type="radio"
                    name="authMode"
                    value="entra-client-credentials"
                    checked={authMode === 'entra-client-credentials'}
                    onChange={() => handleAuthModeChange('entra-client-credentials')}
                  />
                  {t('settings.azure.authModeClientCredentials')}
                </label>
              </div>
            </div>

            {/* Shared: Endpoint */}
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

            {/* API Key mode fields */}
            {authMode === 'key' && (
              <>
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
              </>
            )}

            {/* Entra ID shared fields (client credentials) */}
            {isEntra && !isAzCli && (
              <>
                <div className="ttPinFormGroup">
                  <label htmlFor="tenantId">{t('settings.azure.tenantId')} *</label>
                  <input
                    id="tenantId"
                    type="text"
                    value={tenantId}
                    onChange={(e) => setTenantId(e.target.value)}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="ttPinInput"
                  />
                </div>

                <div className="ttPinFormGroup">
                  <label htmlFor="clientId">{t('settings.azure.clientId')} *</label>
                  <input
                    id="clientId"
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="ttPinInput"
                  />
                </div>

                {isClientCredentials && (
                  <div className="ttPinFormGroup">
                    <label htmlFor="clientSecret">{t('settings.azure.clientSecret')} *</label>
                    <input
                      id="clientSecret"
                      type="password"
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      placeholder="client secret value"
                      className="ttPinInput"
                    />
                  </div>
                )}
              </>
            )}

            {/* Azure CLI mode: region + check button */}
            {isAzCli && (
              <>
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
                  <small className="ttPinHelpText">{t('settings.azure.regionHelpEntra')}</small>
                </div>

                <div className="ttPinFormGroup">
                  <small className="ttPinHelpText">{t('settings.azure.azCliHelp')}</small>
                  {azCliLoggedIn ? (
                    <div className="ttPinSuccessMessage">{t('settings.azure.azCliLoggedIn')}</div>
                  ) : (
                    <button
                      className="ttPinButton ttPinButtonSecondary"
                      onClick={handleAzCliCheck}
                      disabled={azCliChecking}
                    >
                      {azCliChecking ? t('common.loading') : t('settings.azure.azCliCheck')}
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Client-credentials mode: region + resource ID */}
            {isClientCredentials && (
              <>
                <div className="ttPinFormGroup">
                  <label htmlFor="region">{t('settings.azure.region')}</label>
                  <input
                    id="region"
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="eastus / westus2 / ..."
                    className="ttPinInput"
                  />
                  <small className="ttPinHelpText">{t('settings.azure.regionHelpEntra')}</small>
                </div>

                <div className="ttPinFormGroup">
                  <label htmlFor="resourceId">{t('settings.azure.resourceId')}</label>
                  <input
                    id="resourceId"
                    type="text"
                    value={resourceId}
                    onChange={(e) => setResourceId(e.target.value)}
                    placeholder="/subscriptions/.../providers/Microsoft.CognitiveServices/accounts/..."
                    className="ttPinInput"
                  />
                  <small className="ttPinHelpText">{t('settings.azure.resourceIdHelp')}</small>
                </div>
              </>
            )}

            {/* Shared: Deployment Name */}
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
              <label>{t('settings.openai.authMode')}</label>
              <div className="ttPinRadioGroup">
                <label className="ttPinRadioLabel">
                  <input
                    type="radio"
                    name="openaiAuthMode"
                    value="key"
                    checked={openaiAuthMode === 'key'}
                    onChange={() => handleOpenAIAuthModeChange('key')}
                  />
                  {t('settings.openai.authModeKey')}
                </label>
                <label className="ttPinRadioLabel">
                  <input
                    type="radio"
                    name="openaiAuthMode"
                    value="entra-az-cli"
                    checked={openaiAuthMode === 'entra-az-cli'}
                    onChange={() => handleOpenAIAuthModeChange('entra-az-cli')}
                  />
                  {t('settings.openai.authModeAzCli')}
                </label>
                <label className="ttPinRadioLabel">
                  <input
                    type="radio"
                    name="openaiAuthMode"
                    value="entra-client-credentials"
                    checked={openaiAuthMode === 'entra-client-credentials'}
                    onChange={() => handleOpenAIAuthModeChange('entra-client-credentials')}
                  />
                  {t('settings.openai.authModeClientCredentials')}
                </label>
              </div>
            </div>

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

            {openaiAuthMode === 'key' && (
              <div className="ttPinFormGroup">
                <label htmlFor="openaiKey">{t('settings.openai.key')} *</label>
                <input
                  id="openaiKey"
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="api-key"
                  className="ttPinInput"
                />
              </div>
            )}

            {isOpenAIEntra && !isOpenAIAzCli && (
              <>
                <div className="ttPinFormGroup">
                  <label htmlFor="openaiTenantId">{t('settings.openai.tenantId')} *</label>
                  <input
                    id="openaiTenantId"
                    type="text"
                    value={openaiTenantId}
                    onChange={(e) => setOpenaiTenantId(e.target.value)}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="ttPinInput"
                  />
                </div>

                <div className="ttPinFormGroup">
                  <label htmlFor="openaiClientId">{t('settings.openai.clientId')} *</label>
                  <input
                    id="openaiClientId"
                    type="text"
                    value={openaiClientId}
                    onChange={(e) => setOpenaiClientId(e.target.value)}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="ttPinInput"
                  />
                </div>

                {isOpenAIClientCredentials && (
                  <div className="ttPinFormGroup">
                    <label htmlFor="openaiClientSecret">{t('settings.openai.clientSecret')} *</label>
                    <input
                      id="openaiClientSecret"
                      type="password"
                      value={openaiClientSecret}
                      onChange={(e) => setOpenaiClientSecret(e.target.value)}
                      placeholder="client secret value"
                      className="ttPinInput"
                    />
                  </div>
                )}
              </>
            )}

            {isOpenAIAzCli && (
              <div className="ttPinFormGroup">
                <small className="ttPinHelpText">{t('settings.openai.azCliHelp')}</small>
                {openaiAzCliLoggedIn ? (
                  <div className="ttPinSuccessMessage">{t('settings.openai.azCliLoggedIn')}</div>
                ) : (
                  <button
                    className="ttPinButton ttPinButtonSecondary"
                    onClick={handleOpenAIAzCliCheck}
                    disabled={openaiAzCliChecking}
                  >
                    {openaiAzCliChecking ? t('common.loading') : t('settings.openai.azCliCheck')}
                  </button>
                )}
              </div>
            )}

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
