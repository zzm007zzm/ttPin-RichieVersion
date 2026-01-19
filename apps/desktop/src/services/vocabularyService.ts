/**
 * 生词本服务 - 基于 Tauri SQL 插件
 */

import Database from '@tauri-apps/plugin-sql';

export interface VocabularyWord {
  id: number;
  word: string;
  translation: string;
  example?: string;
  sourceLang: string;
  targetLang: string;
  createdAt: string;
}

export interface AddWordParams {
  word: string;
  translation: string;
  example?: string;
  sourceLang: string;
  targetLang: string;
}

class VocabularyService {
  private db: Database | null = null;
  private initPromise: Promise<void> | null = null;

  private async ensureInitialized(): Promise<void> {
    if (this.db) return;

    if (this.initPromise) {
      await this.initPromise;
      return;
    }

    this.initPromise = (async () => {
      try {
        this.db = await Database.load('sqlite:vocabulary.db');

        await this.db.execute(`
          CREATE TABLE IF NOT EXISTS vocabulary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            word TEXT NOT NULL,
            translation TEXT NOT NULL,
            example TEXT,
            source_lang TEXT NOT NULL,
            target_lang TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `);

        await this.db.execute(`
          CREATE INDEX IF NOT EXISTS idx_word ON vocabulary(word);
        `);

        await this.db.execute(`
          CREATE INDEX IF NOT EXISTS idx_created_at ON vocabulary(created_at DESC);
        `);
      } catch (error) {
        this.db = null;
        throw new Error(`Failed to initialize vocabulary database: ${error}`);
      }
    })();

    await this.initPromise;
  }

  async addWord(params: AddWordParams): Promise<number> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.execute(
      `INSERT INTO vocabulary (word, translation, example, source_lang, target_lang) 
       VALUES (?, ?, ?, ?, ?)`,
      [params.word, params.translation, params.example || null, params.sourceLang, params.targetLang]
    );

    return result.lastInsertId ?? 0;
  }

  async listWords(limit = 100, offset = 0): Promise<VocabularyWord[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    const rows = await this.db.select<Array<{
      id: number;
      word: string;
      translation: string;
      example: string | null;
      source_lang: string;
      target_lang: string;
      created_at: string;
    }>>(
      `SELECT id, word, translation, example, source_lang, target_lang, created_at 
       FROM vocabulary 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    return rows.map((row) => ({
      id: row.id,
      word: row.word,
      translation: row.translation,
      example: row.example || undefined,
      sourceLang: row.source_lang,
      targetLang: row.target_lang,
      createdAt: row.created_at,
    }));
  }

  async searchWords(query: string, limit = 50): Promise<VocabularyWord[]> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    const searchPattern = `%${query}%`;
    const rows = await this.db.select<Array<{
      id: number;
      word: string;
      translation: string;
      example: string | null;
      source_lang: string;
      target_lang: string;
      created_at: string;
    }>>(
      `SELECT id, word, translation, example, source_lang, target_lang, created_at 
       FROM vocabulary 
       WHERE word LIKE ? OR translation LIKE ? 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [searchPattern, searchPattern, limit]
    );

    return rows.map((row) => ({
      id: row.id,
      word: row.word,
      translation: row.translation,
      example: row.example || undefined,
      sourceLang: row.source_lang,
      targetLang: row.target_lang,
      createdAt: row.created_at,
    }));
  }

  async deleteWord(id: number): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.execute('DELETE FROM vocabulary WHERE id = ?', [id]);
  }

  async getWordCount(): Promise<number> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.select<Array<{ count: number }>>(
      'SELECT COUNT(*) as count FROM vocabulary'
    );
    return result[0]?.count || 0;
  }

  async checkDuplicate(word: string, sourceLang: string, targetLang: string): Promise<boolean> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.select<Array<{ count: number }>>(
      `SELECT COUNT(*) as count FROM vocabulary 
       WHERE word = ? AND source_lang = ? AND target_lang = ?`,
      [word, sourceLang, targetLang]
    );

    return (result[0]?.count || 0) > 0;
  }
}

export const vocabularyService = new VocabularyService();
