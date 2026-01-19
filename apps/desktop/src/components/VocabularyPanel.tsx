/**
 * 生词本面板组件
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { vocabularyService, type VocabularyWord } from '../services/vocabularyService';

interface VocabularyPanelProps {
  onClose: () => void;
}

export function VocabularyPanel({ onClose }: VocabularyPanelProps) {
  const { t } = useTranslation();
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [wordCount, setWordCount] = useState(0);

  const loadWords = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const list = searchQuery.trim()
        ? await vocabularyService.searchWords(searchQuery.trim())
        : await vocabularyService.listWords(100, 0);
      setWords(list);

      const count = await vocabularyService.getWordCount();
      setWordCount(count);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadWords();
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleDelete = async (id: number) => {
    if (!confirm(t('vocabulary.confirmDelete'))) return;

    try {
      await vocabularyService.deleteWord(id);
      await loadWords();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="ttPinVocabulary">
      <div className="ttPinVocabularyHeader">
        <h2>{t('vocabulary.title')}</h2>
        <button className="ttPinCloseButton" onClick={onClose} aria-label={t('common.close')}>
          ✕
        </button>
      </div>

      <div className="ttPinVocabularySearch">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('vocabulary.searchPlaceholder')}
          className="ttPinInput"
        />
        <div className="ttPinVocabularyCount">
          {t('vocabulary.totalWords', { count: wordCount })}
        </div>
      </div>

      <div className="ttPinVocabularyContent">
        {loading && <div className="ttPinLoading">{t('common.loading')}</div>}
        {errorMessage && <div className="ttPinErrorMessage">{errorMessage}</div>}

        {!loading && words.length === 0 && (
          <div className="ttPinEmptyState">
            {searchQuery ? t('vocabulary.noSearchResults') : t('vocabulary.empty')}
          </div>
        )}

        {!loading && words.length > 0 && (
          <div className="ttPinVocabularyList">
            {words.map((word) => (
              <div key={word.id} className="ttPinVocabularyItem">
                <div className="ttPinVocabularyItemHeader">
                  <span className="ttPinVocabularyWord">{word.word}</span>
                  <button
                    className="ttPinDeleteButton"
                    onClick={() => handleDelete(word.id)}
                    aria-label={t('common.delete')}
                  >
                    🗑️
                  </button>
                </div>
                <div className="ttPinVocabularyTranslation">{word.translation}</div>
                {word.example && <div className="ttPinVocabularyExample">{word.example}</div>}
                <div className="ttPinVocabularyMeta">
                  <span className="ttPinVocabularyLang">
                    {word.sourceLang} → {word.targetLang}
                  </span>
                  <span className="ttPinVocabularyDate">{formatDate(word.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
