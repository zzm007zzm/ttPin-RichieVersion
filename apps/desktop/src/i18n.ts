import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      sourceLanguage: 'Source Language',
      targetLanguage: 'Target Language',
      translate: 'Translate',
      addToVocabulary: 'Add to Vocabulary',
      settings: 'Settings',

      uiTitle: 'ttPin',
      uiSubtitle: 'High-quality translation widget',
      uiLoadingLanguages: 'Loading languages…',
      uiNoLanguages: 'No languages available',
      uiSwapLanguages: 'Swap languages',
      uiClear: 'Clear',
      uiCopy: 'Copy',
      uiCopied: 'Copied',
      uiSourcePlaceholder: 'Type text to translate',
      uiTargetPlaceholder: 'Translation will appear here',
      uiTranslating: 'Translating…',
      uiShortcutHint: 'Ctrl/⌘ + Enter to translate',
      uiPin: 'Pin on top',
      uiUnpin: 'Unpin',

      // Common
      'common.close': 'Close',
      'common.cancel': 'Cancel',
      'common.save': 'Save',
      'common.saving': 'Saving...',
      'common.delete': 'Delete',
      'common.loading': 'Loading...',

      // Settings
      'settings.title': 'Settings',
      'settings.azure.title': 'Azure Translator Configuration',
      'settings.azure.description': 'Configure your Azure AI Foundry Translator credentials',
      'settings.azure.translateEndpoint': 'Translate Endpoint',
      'settings.azure.key': 'Subscription Key',
      'settings.azure.region': 'Region',
      'settings.azure.deploymentName': 'AOAI Deployment Name',
      'settings.azure.deploymentNameHelp': 'Your Azure OpenAI deployment name. The deployed model must be gpt-4o or gpt-4o-mini.',
      'settings.azure.languagesEndpoint': 'Languages Endpoint (Optional)',
      'settings.azure.languagesEndpointHelp': 'Leave empty to use default Microsoft Translator endpoint',
      'settings.success.saved': 'Settings saved successfully',
      'settings.error.requiredFields': 'Please fill in all required fields',

      // Vocabulary
      'vocabulary.title': 'Vocabulary',
      'vocabulary.addToVocabulary': 'Add to Vocabulary',
      'vocabulary.searchPlaceholder': 'Search words...',
      'vocabulary.totalWords': '{{count}} words total',
      'vocabulary.empty': 'No words saved yet',
      'vocabulary.noSearchResults': 'No matching words found',
      'vocabulary.confirmDelete': 'Are you sure you want to delete this word?',
      'vocabulary.wordSaved': 'Word saved successfully',
      'vocabulary.duplicateWord': 'This word already exists in your vocabulary',
    },
  },
  zh: {
    translation: {
      sourceLanguage: '源语言',
      targetLanguage: '目标语言',
      translate: '翻译',
      addToVocabulary: '添加到生词本',
      settings: '设置',

      uiTitle: 'ttPin',
      uiSubtitle: '高质量翻译小窗',
      uiLoadingLanguages: '正在加载语言…',
      uiNoLanguages: '暂无语言列表',
      uiSwapLanguages: '交换语言',
      uiClear: '清空',
      uiCopy: '复制',
      uiCopied: '已复制',
      uiSourcePlaceholder: '输入要翻译的文字',
      uiTargetPlaceholder: '翻译结果会显示在这里',
      uiTranslating: '翻译中…',
      uiShortcutHint: 'Ctrl/⌘ + Enter 翻译',
      uiPin: '置顶',
      uiUnpin: '取消置顶',

      // Common
      'common.close': '关闭',
      'common.cancel': '取消',
      'common.save': '保存',
      'common.saving': '保存中...',
      'common.delete': '删除',
      'common.loading': '加载中...',

      // Settings
      'settings.title': '设置',
      'settings.azure.title': 'Azure 翻译配置',
      'settings.azure.description': '配置您的 Azure AI Foundry Translator 凭据',
      'settings.azure.translateEndpoint': '翻译端点',
      'settings.azure.key': '订阅密钥',
      'settings.azure.region': '区域',
      'settings.azure.deploymentName': 'AOAI 部署名称',
      'settings.azure.deploymentNameHelp': '该功能仅支持 gpt-4o 或 gpt-4o-mini 模型。',
      'settings.azure.languagesEndpoint': '语言列表端点（可选）',
      'settings.azure.languagesEndpointHelp': '留空则使用默认 Microsoft Translator 端点',
      'settings.success.saved': '设置保存成功',
      'settings.error.requiredFields': '请填写所有必填项',

      // Vocabulary
      'vocabulary.title': '生词本',
      'vocabulary.addToVocabulary': '添加到生词本',
      'vocabulary.searchPlaceholder': '搜索生词...',
      'vocabulary.totalWords': '共 {{count}} 个生词',
      'vocabulary.empty': '暂无保存的生词',
      'vocabulary.noSearchResults': '未找到匹配的生词',
      'vocabulary.confirmDelete': '确定要删除这个生词吗？',
      'vocabulary.wordSaved': '生词保存成功',
      'vocabulary.duplicateWord': '这个生词已存在于生词本中',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'zh',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
